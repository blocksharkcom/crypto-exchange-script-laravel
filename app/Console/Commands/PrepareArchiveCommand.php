<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Admin;
use App\Models\Setting;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

/**
 * Strip all sensitive data and operator-specific state ahead of zipping a CodeCanyon archive.
 *
 *   php artisan crossswap:prepare-archive
 *
 * Run AFTER `npm run build` and BEFORE `bin/package-codecanyon.sh`.
 */
final class PrepareArchiveCommand extends Command
{
    protected $signature = 'crossswap:prepare-archive
        {--keep-database : Do not delete the SQLite database file}
        {--force : Skip the confirmation prompt}';

    protected $description = 'Wipe install lock, sensitive settings, sessions, caches and logs ahead of archiving for CodeCanyon.';

    public function handle(): int
    {
        if (! $this->option('force') && ! $this->confirm(
            'This will WIPE the install lock, settings, sessions, caches, logs and (by default) the SQLite DB. Continue?',
            false,
        )) {
            $this->warn('Aborted.');

            return self::FAILURE;
        }

        $this->wipeInstallLock();
        $this->wipeDemoData();
        $this->wipeSensitiveSettings();
        $this->wipeSessionsCachesLogs();
        if (! $this->option('keep-database')) {
            $this->wipeSqlite();
        }

        $this->info('Archive prep complete. You may now run bin/package-codecanyon.sh.');

        return self::SUCCESS;
    }

    private function wipeInstallLock(): void
    {
        $path = storage_path('app/installed.lock');
        if (is_file($path)) {
            File::delete($path);
            $this->line('  ✓ removed install lock');
        }
    }

    private function wipeDemoData(): void
    {
        try {
            TicketMessage::query()->delete();
            Ticket::query()->delete();
            Transaction::query()->where('source', 'demo')->delete();
            Admin::query()->where('email', 'admin@demo.com')->delete();
            User::query()->where('email', 'user@demo.com')->delete();
            $this->line('  ✓ removed demo seed data');
        } catch (\Throwable $e) {
            $this->warn('  ! could not wipe demo data: '.$e->getMessage());
        }
    }

    private function wipeSensitiveSettings(): void
    {
        $sensitiveKeys = [
            'changenow_api_key',
            'changenow_referral',
            'chat.api_key',
        ];
        try {
            Setting::query()->whereIn('key', $sensitiveKeys)->delete();
            $this->line('  ✓ removed sensitive settings rows');
        } catch (\Throwable $e) {
            $this->warn('  ! could not reach settings table: '.$e->getMessage());
        }
    }

    private function wipeSessionsCachesLogs(): void
    {
        foreach (['framework/sessions', 'framework/cache/data', 'framework/views'] as $dir) {
            $full = storage_path($dir);
            if (is_dir($full)) {
                File::cleanDirectory($full);
            }
        }
        foreach (glob(storage_path('logs/*.log')) ?: [] as $log) {
            File::delete($log);
        }
        $this->line('  ✓ cleaned sessions/caches/views/logs');
    }

    private function wipeSqlite(): void
    {
        $path = database_path('database.sqlite');
        if (is_file($path)) {
            File::delete($path);
            // Recreate as an empty file so the buyer's `php artisan migrate` works out of the box.
            File::put($path, '');
            $this->line('  ✓ replaced SQLite DB with an empty placeholder');
        }
    }
}
