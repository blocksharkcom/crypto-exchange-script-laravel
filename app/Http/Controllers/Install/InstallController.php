<?php

declare(strict_types=1);

namespace App\Http\Controllers\Install;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Services\ChangeNow\ChangeNowClient;
use App\Services\ChangeNow\Exceptions\ChangeNowException;
use App\Support\Settings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use PDO;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpFoundation\Response;

final class InstallController extends Controller
{
    /**
     * Render the wizard shell. The Inertia page is a single-component wizard
     * that handles step transitions client-side.
     */
    public function show(Request $request): InertiaResponse|RedirectResponse
    {
        $alreadyInstalled = file_exists(storage_path('app/installed.lock'));

        $detected = $this->detectInitialStep();
        $initialStep = (int) ($request->session()->get('install.step') ?? $detected);

        // Capture-mode override — only honoured when SHOW_PREVIEW=true so that
        // the docs screenshot script can jump straight to a specific step
        // without walking the whole wizard. NEVER respected in production.
        if (config('swapforge.show_preview') && $request->filled('step')) {
            $forced = max(1, min(7, (int) $request->query('step')));
            $initialStep = $forced;
            $alreadyInstalled = false;
        }

        return Inertia::render('Install/Wizard', [
            'initialStep' => $alreadyInstalled ? 7 : $initialStep,
            'alreadyInstalled' => $alreadyInstalled,
            'phpVersion' => PHP_VERSION,
            'appName' => (string) config('app.name', 'CrossSwap'),
            'adminUrl' => route('admin.dashboard'),
            'defaultDriver' => (string) (env('DB_CONNECTION') ?: 'sqlite'),
        ]);
    }

    /**
     * Server-side requirements check. Returns a structured JSON payload so the
     * client can render a checklist.
     */
    public function requirements(): JsonResponse
    {
        $checks = [];

        $checks[] = $this->makeCheck(
            name: 'PHP >= 8.2',
            passed: version_compare(PHP_VERSION, '8.2.0', '>='),
            hint: 'Upgrade your PHP version to 8.2 or higher.',
        );

        foreach (['pdo', 'curl', 'openssl', 'mbstring', 'fileinfo'] as $ext) {
            $checks[] = $this->makeCheck(
                name: 'ext-'.$ext,
                passed: extension_loaded($ext),
                hint: 'Install and enable the '.$ext.' PHP extension.',
            );
        }

        $checks[] = $this->makeCheck(
            name: 'PDO drivers (sqlite or mysql or pgsql)',
            passed: extension_loaded('pdo_sqlite') || extension_loaded('pdo_mysql') || extension_loaded('pdo_pgsql'),
            hint: 'Enable at least one PDO driver (pdo_sqlite, pdo_mysql, pdo_pgsql).',
        );

        $checks[] = $this->makeCheck(
            name: 'ext-gd or ext-imagick',
            passed: extension_loaded('gd') || extension_loaded('imagick'),
            hint: 'Install either gd or imagick for image processing.',
        );

        $checks[] = $this->makeCheck(
            name: 'storage/ writable',
            passed: is_writable(storage_path()),
            hint: 'Make the storage/ directory writable by the web server.',
        );

        $checks[] = $this->makeCheck(
            name: 'bootstrap/cache/ writable',
            passed: is_writable(base_path('bootstrap/cache')),
            hint: 'Make the bootstrap/cache/ directory writable by the web server.',
        );

        $checks[] = $this->makeCheck(
            name: 'installed.lock not present',
            passed: ! file_exists(storage_path('app/installed.lock')),
            hint: 'The application is already installed.',
        );

        $ok = ! in_array(false, array_column($checks, 'passed'), true);

        return response()->json([
            'ok' => $ok,
            'checks' => $checks,
        ]);
    }

    /**
     * Apply database credentials, write .env, and run migrations.
     */
    public function database(Request $request): JsonResponse
    {
        $data = Validator::make($request->all(), [
            'driver' => ['required', 'in:sqlite,mysql,pgsql'],
            'host' => ['nullable', 'string', 'max:255'],
            'port' => ['nullable', 'string', 'max:10'],
            'database' => ['required', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
        ])->validate();

        $driver = (string) $data['driver'];

        // For sqlite, create the database file if missing.
        if ($driver === 'sqlite') {
            $dbPath = $data['database'] === 'database/database.sqlite' || $data['database'] === ''
                ? base_path('database/database.sqlite')
                : (str_starts_with((string) $data['database'], '/') ? (string) $data['database'] : base_path((string) $data['database']));

            if (! file_exists($dbPath)) {
                @touch($dbPath);
            }
            if (! file_exists($dbPath) || ! is_writable($dbPath)) {
                return response()->json([
                    'ok' => false,
                    'error' => 'Unable to create or write SQLite database at '.$dbPath,
                ], 422);
            }
            $data['database'] = $dbPath;
        }

        // Try the connection live before persisting to .env.
        try {
            $this->testDatabaseConnection($driver, (array) $data);
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'error' => 'Database connection failed: '.$e->getMessage(),
            ], 422);
        }

        // Persist .env values (preserving any other lines).
        $this->writeEnvValues([
            'DB_CONNECTION' => $driver,
            'DB_HOST' => $driver === 'sqlite' ? '' : (string) ($data['host'] ?? '127.0.0.1'),
            'DB_PORT' => $driver === 'sqlite' ? '' : (string) ($data['port'] ?? ($driver === 'pgsql' ? '5432' : '3306')),
            'DB_DATABASE' => (string) $data['database'],
            'DB_USERNAME' => $driver === 'sqlite' ? '' : (string) ($data['username'] ?? ''),
            'DB_PASSWORD' => $driver === 'sqlite' ? '' : (string) ($data['password'] ?? ''),
        ]);

        // Reconfigure runtime so migrations use the new credentials.
        $this->applyRuntimeDbConfig($driver, (array) $data);

        try {
            Artisan::call('migrate', ['--force' => true]);
            $output = (string) Artisan::output();
        } catch (\Throwable $e) {
            Log::error('Installer migrate failed', ['error' => $e->getMessage()]);

            return response()->json([
                'ok' => false,
                'error' => 'Migration failed: '.$e->getMessage(),
            ], 422);
        }

        $request->session()->put('install.step', 3);

        return response()->json([
            'ok' => true,
            'output' => $output,
            'applied' => substr_count($output, 'DONE'),
        ]);
    }

    /**
     * Create the first admin account.
     */
    public function admin(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
        ]);

        // Make sure roles exist before we assign one.
        try {
            if (! Schema::hasTable('roles') || Role::query()->where('guard_name', 'admin')->count() === 0) {
                Artisan::call('db:seed', ['--class' => 'AdminRolesSeeder', '--force' => true]);
            }
        } catch (\Throwable $e) {
            Log::warning('AdminRolesSeeder unavailable', ['error' => $e->getMessage()]);
        }

        /** @var Admin $admin */
        $admin = Admin::query()->updateOrCreate(
            ['email' => $data['email']],
            [
                'name' => $data['name'],
                'password' => Hash::make((string) $data['password']),
            ],
        );

        // Assign superadmin if the role exists; otherwise this is a no-op the seeder will fix.
        try {
            $hasRole = Role::query()->where('name', 'superadmin')->where('guard_name', 'admin')->exists();
            if ($hasRole) {
                $admin->syncRoles(['superadmin']);
            }
        } catch (\Throwable $e) {
            Log::warning('Could not assign superadmin role', ['error' => $e->getMessage()]);
        }

        $request->session()->put('install.admin_id', $admin->id);
        $request->session()->put('install.step', 4);

        return back();
    }

    /**
     * Persist brand identity settings.
     */
    public function branding(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'brand' => ['required', 'string', 'max:60'],
            'tagline' => ['nullable', 'string', 'max:160'],
            'support_email' => ['required', 'email', 'max:255'],
            'theme' => ['required', 'in:dark,light,auto'],
        ]);

        Settings::setMany([
            'brand' => $data['brand'],
            'tagline' => $data['tagline'] ?? '',
            'support_email' => $data['support_email'],
            'theme' => $data['theme'],
        ]);

        $request->session()->put('install.step', 5);

        return back();
    }

    /**
     * Validate and save the ChangeNOW API key. Supports a `test_only` mode for
     * the "Test connection" button.
     */
    public function api(Request $request, ChangeNowClient $client): JsonResponse
    {
        $data = $request->validate([
            'changenow_api_key' => ['required', 'string', 'max:255'],
            'changenow_referral' => ['nullable', 'string', 'max:255'],
            'changenow_default_flow' => ['required', 'in:standard,fixed-rate'],
            'test_only' => ['nullable', 'boolean'],
        ]);

        // Probe the supplied key against the live API before persisting anything.
        $previousKey = (string) (Settings::get('changenow_api_key') ?? '');
        Settings::set('changenow_api_key', (string) $data['changenow_api_key']);

        try {
            $probe = app(ChangeNowClient::class);
            $rows = $probe->currencies();
            if (! is_array($rows) || $rows === []) {
                throw new ChangeNowException('Empty response from upstream.', 502);
            }
        } catch (\Throwable $e) {
            // Restore the previous key on failure so we don't leave a broken value behind.
            Settings::set('changenow_api_key', $previousKey);

            return response()->json([
                'ok' => false,
                'error' => 'API key check failed: '.$e->getMessage(),
            ], 422);
        }

        if ((bool) ($data['test_only'] ?? false)) {
            // Successful test: keep the key in settings so a subsequent save call also succeeds.
            return response()->json(['ok' => true, 'tested' => true]);
        }

        Settings::setMany([
            'changenow_api_key' => (string) $data['changenow_api_key'],
            'changenow_referral' => (string) ($data['changenow_referral'] ?? ''),
            'changenow_default_flow' => (string) $data['changenow_default_flow'],
        ]);

        $request->session()->put('install.step', 6);

        return response()->json(['ok' => true]);
    }

    /**
     * Write the lock file, log the admin in, and bounce to the admin panel.
     * Per CodeCanyon rules the installer must NOT redirect to the public site.
     */
    public function finalize(Request $request): Response
    {
        $lockPath = storage_path('app/installed.lock');
        if (! file_exists($lockPath)) {
            @file_put_contents($lockPath, sprintf("installed_at=%s\nversion=%s\n", now()->toIso8601String(), '1.0.0'));
        }

        $adminId = $request->session()->pull('install.admin_id');
        if (is_int($adminId) || (is_string($adminId) && ctype_digit($adminId))) {
            try {
                Auth::guard('admin')->loginUsingId((int) $adminId, remember: true);
            } catch (\Throwable $e) {
                Log::warning('Installer admin auto-login failed', ['error' => $e->getMessage()]);
            }
        }

        $request->session()->forget('install.step');

        return Inertia::location(route('admin.dashboard'));
    }

    // ---------- helpers ----------

    /**
     * Best-effort detection of which step the wizard should resume on.
     */
    private function detectInitialStep(): int
    {
        // Step 1: Welcome (always available)
        // Step 2: Requirements
        // Step 3: Database (test connection + run migrations)
        // Step 4: Admin
        // Step 5: Branding
        // Step 6: API
        // Step 7: Done / finalize

        try {
            DB::connection()->getPdo();
            $dbOk = true;
        } catch (\Throwable) {
            $dbOk = false;
        }

        if (! $dbOk) {
            return 1;
        }

        try {
            $hasAdmin = Schema::hasTable('admins') && Admin::query()->exists();
        } catch (\Throwable) {
            $hasAdmin = false;
        }
        if (! $hasAdmin) {
            return 4;
        }

        $hasBrand = Settings::get('brand') !== null;
        if (! $hasBrand) {
            return 5;
        }

        $hasApi = (string) (Settings::get('changenow_api_key') ?? '') !== '';
        if (! $hasApi) {
            return 6;
        }

        return 7;
    }

    /** @return array{name:string,passed:bool,hint:string} */
    private function makeCheck(string $name, bool $passed, string $hint): array
    {
        return ['name' => $name, 'passed' => $passed, 'hint' => $passed ? '' : $hint];
    }

    /**
     * Open a temporary PDO connection with the supplied credentials.
     *
     * @param  array<string, mixed>  $data
     */
    private function testDatabaseConnection(string $driver, array $data): void
    {
        switch ($driver) {
            case 'sqlite':
                new \PDO('sqlite:'.$data['database']);

                return;

            case 'mysql':
                $dsn = sprintf(
                    'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                    $data['host'] ?? '127.0.0.1',
                    $data['port'] ?? '3306',
                    $data['database'] ?? '',
                );
                new \PDO($dsn, (string) ($data['username'] ?? ''), (string) ($data['password'] ?? ''), [
                    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                    \PDO::ATTR_TIMEOUT => 5,
                ]);

                return;

            case 'pgsql':
                $dsn = sprintf(
                    'pgsql:host=%s;port=%s;dbname=%s',
                    $data['host'] ?? '127.0.0.1',
                    $data['port'] ?? '5432',
                    $data['database'] ?? '',
                );
                new \PDO($dsn, (string) ($data['username'] ?? ''), (string) ($data['password'] ?? ''), [
                    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                    \PDO::ATTR_TIMEOUT => 5,
                ]);

                return;

            default:
                throw new \PDOException('Unsupported driver: '.$driver);
        }
    }

    /**
     * Reconfigure the current request's database connection so the migrator
     * uses the new credentials without requiring a process restart.
     *
     * @param  array<string, mixed>  $data
     */
    private function applyRuntimeDbConfig(string $driver, array $data): void
    {
        $config = match ($driver) {
            'sqlite' => [
                'driver' => 'sqlite',
                'database' => (string) $data['database'],
                'prefix' => '',
                'foreign_key_constraints' => true,
            ],
            'mysql' => [
                'driver' => 'mysql',
                'host' => (string) ($data['host'] ?? '127.0.0.1'),
                'port' => (string) ($data['port'] ?? '3306'),
                'database' => (string) $data['database'],
                'username' => (string) ($data['username'] ?? ''),
                'password' => (string) ($data['password'] ?? ''),
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
                'prefix' => '',
                'strict' => true,
                'engine' => null,
            ],
            'pgsql' => [
                'driver' => 'pgsql',
                'host' => (string) ($data['host'] ?? '127.0.0.1'),
                'port' => (string) ($data['port'] ?? '5432'),
                'database' => (string) $data['database'],
                'username' => (string) ($data['username'] ?? ''),
                'password' => (string) ($data['password'] ?? ''),
                'charset' => 'utf8',
                'prefix' => '',
                'schema' => 'public',
                'sslmode' => 'prefer',
            ],
            default => [],
        };

        Config::set('database.default', $driver);
        Config::set('database.connections.'.$driver, $config);
        DB::purge($driver);
        DB::reconnect($driver);
    }

    /**
     * Update or insert each KEY=VALUE pair into the .env file, preserving
     * all other lines and comments exactly as they were.
     *
     * @param  array<string, string>  $values
     */
    private function writeEnvValues(array $values): void
    {
        $path = base_path('.env');
        $contents = file_exists($path) ? (string) file_get_contents($path) : '';
        $eol = str_contains($contents, "\r\n") ? "\r\n" : "\n";

        foreach ($values as $key => $value) {
            $quoted = $this->escapeEnvValue((string) $value);
            $line = $key.'='.$quoted;

            $patternActive = '/^\s*'.preg_quote($key, '/').'\s*=.*$/m';
            $patternComment = '/^\s*#\s*'.preg_quote($key, '/').'\s*=.*$/m';

            if (preg_match($patternActive, $contents) === 1) {
                $contents = (string) preg_replace($patternActive, $line, $contents, 1);
            } elseif (preg_match($patternComment, $contents) === 1) {
                $contents = (string) preg_replace($patternComment, $line, $contents, 1);
            } else {
                if ($contents !== '' && ! str_ends_with($contents, $eol)) {
                    $contents .= $eol;
                }
                $contents .= $line.$eol;
            }
        }

        file_put_contents($path, $contents, LOCK_EX);
    }

    private function escapeEnvValue(string $value): string
    {
        if ($value === '') {
            return '';
        }
        // Quote when value contains whitespace or special characters.
        if (preg_match('/[\s"\'#=]/', $value) === 1) {
            return '"'.str_replace(['\\', '"'], ['\\\\', '\\"'], $value).'"';
        }

        return $value;
    }
}
