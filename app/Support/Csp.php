<?php

declare(strict_types=1);

namespace App\Support;

use Spatie\Csp\Directive;
use Spatie\Csp\Keyword;
use Spatie\Csp\Policies\Policy;
use Spatie\Csp\Scheme;

/**
 * Content-Security-Policy profile tuned for CrossSwap.
 *
 * Lets through the assets the live app actually needs:
 *   - self-hosted Vite bundles
 *   - upstream coin images served by ChangeNOW's CDN
 *   - inline JSON injected by Inertia (via nonces)
 *   - data: and blob: image URIs (QR codes, generated SVGs)
 *
 * Blocks everything else.
 */
final class Csp extends Policy
{
    public function configure(): void
    {
        $this
            ->addDirective(Directive::BASE, Keyword::SELF)
            ->addDirective(Directive::DEFAULT, Keyword::SELF)
            ->addDirective(Directive::CONNECT, [
                Keyword::SELF,
                // Vite HMR dev server (only effective when serving the dev build).
                'ws://127.0.0.1:5173',
                'http://127.0.0.1:5173',
            ])
            ->addDirective(Directive::FONT, [Keyword::SELF, Scheme::DATA])
            ->addDirective(Directive::FORM_ACTION, Keyword::SELF)
            ->addDirective(Directive::FRAME_ANCESTORS, Keyword::NONE)
            ->addDirective(Directive::IMG, [
                Keyword::SELF,
                Scheme::DATA,
                Scheme::BLOB,
                'https://content-api.changenow.io',
            ])
            ->addDirective(Directive::MANIFEST, Keyword::SELF)
            ->addDirective(Directive::MEDIA, Keyword::SELF)
            ->addDirective(Directive::OBJECT, Keyword::NONE)
            ->addDirective(Directive::SCRIPT, [
                Keyword::SELF,
                // Some bundled libraries (e.g. Three.js / qrcode helpers) construct
                // tiny worker functions via `new Function`; without unsafe-eval the
                // CSP blocks them and the page never hydrates.
                Keyword::UNSAFE_EVAL,
                // Vite dev server (no-op in production builds).
                'http://127.0.0.1:5173',
            ])
            ->addDirective(Directive::STYLE, [Keyword::SELF, Keyword::UNSAFE_INLINE])
            ->addDirective(Directive::WORKER, [Keyword::SELF, Scheme::BLOB])
            ->addNonceForDirective(Directive::SCRIPT);
    }
}
