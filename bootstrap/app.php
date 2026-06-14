<?php

declare(strict_types=1);

use App\Http\Middleware\EnsureInstalled;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Spatie\Csp\AddCspHeaders;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            EnsureInstalled::class,
            SetLocale::class,
            HandleInertiaRequests::class,
            SecurityHeaders::class,
            AddCspHeaders::class,
        ]);

        $middleware->throttleApi();

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'webhooks/*',
        ]);

        $middleware->redirectGuestsTo(function ($request) {
            if ($request->is('admin') || $request->is('admin/*')) {
                return route('admin.login');
            }

            return route('auth.login.show');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
