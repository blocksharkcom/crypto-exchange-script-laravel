{{--
    Shared shell for CrossSwap error pages.

    These run when the app may be broken or Vite assets are unavailable,
    so we intentionally inline every brand token instead of loading app.css.

    Slots:
        $code     int   — large gradient status number (e.g. 404)
        $title    string
        $body     string
        $cta_href string — defaults to /
        $cta_label string
--}}
@php
    /** @var string $brand */
    $brand = \App\Support\Settings::brand();
    /** @var int $code */
    $code = $code ?? 500;
    /** @var string $title */
    $title = $title ?? __('site.errors.500.title');
    /** @var string $body */
    $body = $body ?? __('site.errors.500.body');
    /** @var string $cta_href */
    $cta_href = $cta_href ?? '/';
    /** @var string $cta_label */
    $cta_label = $cta_label ?? __('site.errors.back_home');
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0a0c10">
    <title>{{ $code }} — {{ $title }} · {{ $brand }}</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
    <style>
        :root {
            color-scheme: dark;
            --surface-page:   #0a0c10;
            --surface-card:   #14171c;
            --surface-card-2: #1a1d23;
            --text-1: #ebeef3;
            --text-2: #a8afbd;
            --text-3: #6b7281;
            --line-1: rgba(255, 255, 255, 0.04);
            --line-2: rgba(255, 255, 255, 0.07);
            --line-3: rgba(255, 255, 255, 0.13);
            --brand-300: #bff15a;
            --brand-200: #d3f483;
            --brand-ink: #0a0a0c;
            --cy-300: #6ce7d2;
            --shadow-card: 0 30px 80px -40px rgba(0,0,0,.75),
                           0 12px 30px -16px rgba(0,0,0,.55),
                           inset 0 1px 0 rgba(255,255,255,.03);
        }
        * { box-sizing: border-box; }
        html, body { height: 100%; }
        body {
            margin: 0;
            background: var(--surface-page);
            color: var(--text-1);
            font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
            overflow-x: hidden;
        }
        .err-glow {
            position: fixed;
            inset: -10vh -10vw -10vh -10vw;
            z-index: 0;
            pointer-events: none;
            background:
                radial-gradient(40rem 26rem at 50% 38%, rgba(140, 220, 130, .12), transparent 70%),
                radial-gradient(28rem 22rem at 20% 80%, rgba(120, 200, 220, .06), transparent 75%),
                radial-gradient(24rem 18rem at 88% 18%, rgba(150, 220, 110, .07), transparent 75%);
            filter: blur(8px);
        }
        .err-page {
            position: relative;
            z-index: 1;
            min-height: 100%;
            display: flex;
            flex-direction: column;
            padding: 32px 24px;
        }
        .err-brand {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-weight: 700;
            color: var(--text-1);
            text-decoration: none;
            letter-spacing: -0.01em;
            font-size: 16px;
        }
        .err-mark { width: 32px; height: 32px; display: block; }
        .err-body {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 48px 0;
        }
        .err-inner {
            width: 100%;
            max-width: 560px;
            margin: 0 auto;
        }
        .err-code {
            font-weight: 800;
            font-size: clamp(96px, 22vw, 200px);
            line-height: 1;
            letter-spacing: -0.04em;
            margin: 0;
            background: linear-gradient(95deg, #bff15a 0%, #82e7a5 38%, #6ce7d2 70%, #5acdd6 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .err-title {
            margin: 16px 0 0;
            font-weight: 700;
            font-size: clamp(22px, 3.4vw, 30px);
            letter-spacing: -0.02em;
        }
        .err-text {
            margin: 14px auto 0;
            max-width: 44ch;
            color: var(--text-2);
            font-size: 15px;
            line-height: 1.6;
        }
        .err-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 32px;
            padding: 14px 22px;
            border-radius: 999px;
            background: var(--brand-300);
            color: var(--brand-ink);
            font-weight: 600;
            font-size: 15px;
            text-decoration: none;
            box-shadow: 0 12px 36px -16px rgba(191, 241, 90, 0.55);
            transition: background 120ms ease-out;
        }
        .err-cta:hover { background: var(--brand-200); }
        .err-cta svg { width: 16px; height: 16px; }
        .err-foot {
            text-align: center;
            color: var(--text-3);
            font-size: 12px;
            padding-top: 16px;
        }
    </style>
</head>
<body>
    <span class="err-glow" aria-hidden="true"></span>
    <div class="err-page">
        <a href="/" class="err-brand" aria-label="{{ $brand }}">
            <span class="err-mark" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
                    <rect x="2" y="2" width="28" height="28" rx="9" fill="url(#errg)"/>
                    <path d="M11 11h7a3 3 0 0 1 3 3 3 3 0 0 1-3 3h-7l3 3M21 21h-7a3 3 0 0 1-3-3 3 3 0 0 1 3-3h7l-3-3"
                          stroke="#0a0a0c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    <defs>
                        <linearGradient id="errg" x1="0" y1="0" x2="32" y2="32">
                            <stop offset="0" stop-color="#bff15a"/>
                            <stop offset="1" stop-color="#7be09a"/>
                        </linearGradient>
                    </defs>
                </svg>
            </span>
            <span>{{ $brand }}</span>
        </a>

        <main class="err-body">
            <div class="err-inner">
                <h1 class="err-code" aria-label="{{ $code }}">{{ $code }}</h1>
                <p class="err-title">{{ $title }}</p>
                <p class="err-text">{{ $body }}</p>
                <a href="{{ $cta_href }}" class="err-cta">
                    {{ $cta_label }}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M5 12h14m-6-6l6 6-6 6"/>
                    </svg>
                </a>
            </div>
        </main>

        <footer class="err-foot">
            &copy; {{ date('Y') }} {{ $brand }}
        </footer>
    </div>
</body>
</html>
