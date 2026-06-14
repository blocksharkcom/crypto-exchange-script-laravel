<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Transaction;
use App\Observers\TransactionObserver;
use App\Support\Settings;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Force HTTPS scheme only when APP_URL itself is HTTPS — avoids breaking
        // local Docker/dev setups that still have APP_ENV=production.
        if (str_starts_with((string) config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }

        $this->registerRateLimiters();
        $this->applyMailSettings();

        Transaction::observe(TransactionObserver::class);
    }

    /**
     * Push the admin-configured SMTP credentials into runtime config so every
     * Mail::send() call uses them. Wrapped in try/catch so the boot phase is
     * never killed by a missing settings table during the installer.
     */
    private function applyMailSettings(): void
    {
        try {
            $host = (string) Settings::get('mail.host', '');
            if ($host === '') {
                return;
            }

            $transport = (string) Settings::get('mail.transport', 'smtp');
            $port = (int) Settings::get('mail.port', 587);
            $username = (string) Settings::get('mail.username', '');
            $password = (string) Settings::get('mail.password', '');
            $encryption = (string) Settings::get('mail.encryption', 'tls');

            config([
                'mail.default' => in_array($transport, ['smtp', 'log'], true) ? $transport : 'smtp',
                'mail.mailers.smtp.host' => $host,
                'mail.mailers.smtp.port' => $port > 0 ? $port : 587,
                'mail.mailers.smtp.username' => $username !== '' ? $username : null,
                'mail.mailers.smtp.password' => $password !== '' ? $password : null,
                'mail.mailers.smtp.scheme' => $encryption === 'none' ? null : $encryption,
            ]);

            $fromAddress = (string) Settings::get('mail.from_address', '');
            $fromName = (string) Settings::get('mail.from_name', '');
            if ($fromAddress !== '') {
                config(['mail.from.address' => $fromAddress]);
            }
            if ($fromName !== '') {
                config(['mail.from.name' => $fromName]);
            }
        } catch (\Throwable $e) {
            // Settings unavailable (likely pre-install) — leave defaults intact.
        }
    }

    private function registerRateLimiters(): void
    {
        RateLimiter::for('api', function (Request $request): Limit {
            $key = $request->user()?->getAuthIdentifier() ?: $request->ip();

            return Limit::perMinute(60)->by((string) $key);
        });
    }
}
