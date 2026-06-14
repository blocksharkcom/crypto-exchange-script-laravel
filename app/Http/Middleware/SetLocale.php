<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply the user's locale preference *after* cookies are decrypted.
 *
 * Detection priority:
 *   1. ?lang=xx query string (and persists it as a cookie for next time)
 *   2. swapforge_lang cookie
 *   3. Accept-Language header
 *   4. Fallback to the configured default locale
 */
final class SetLocale
{
    public function handle(Request $request, \Closure $next): Response
    {
        $supported = (array) config('swapforge.languages', ['en']);
        $default = (string) config('app.locale', 'en');

        $candidate = null;

        $query = (string) $request->query('lang', '');
        if ($query !== '' && in_array($query, $supported, true)) {
            $candidate = $query;
            cookie()->queue(cookie()->forever('swapforge_lang', $candidate));
        }

        if ($candidate === null) {
            $cookie = $request->cookie('swapforge_lang');
            if (is_string($cookie) && in_array($cookie, $supported, true)) {
                $candidate = $cookie;
            }
        }

        if ($candidate === null) {
            $preferred = $request->getPreferredLanguage($supported);
            if (is_string($preferred) && in_array($preferred, $supported, true)) {
                $candidate = $preferred;
            }
        }

        app()->setLocale($candidate ?? $default);

        return $next($request);
    }
}
