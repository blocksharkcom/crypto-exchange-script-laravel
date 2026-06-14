<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureInstalled
{
    public function handle(Request $request, \Closure $next): Response
    {
        if ($request->is('install*') || $request->is('build/*') || $request->is('up') || $request->is('vendor/*')) {
            return $next($request);
        }

        if (! file_exists(storage_path('app/installed.lock'))) {
            return redirect()->to('/install');
        }

        return $next($request);
    }
}
