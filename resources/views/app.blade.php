@php
    $brand    = \App\Support\Settings::brand();
    $tagline  = \App\Support\Settings::get('tagline', config('swapforge.tagline'));
    $theme    = \App\Support\Settings::get('theme', 'light');
    $themeHex = $theme === 'dark' ? '#0a0b0d' : '#fbfbf7';
    $appUrl   = rtrim((string) config('app.url'), '/');
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="{{ $theme }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="{{ $themeHex }}">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="robots" content="index,follow">

    <title inertia>{{ $brand }}</title>
    <meta name="description" content="{{ $tagline }}">

    {{-- Open Graph + Twitter card --}}
    <meta property="og:title" content="{{ $brand }}">
    <meta property="og:description" content="{{ $tagline }}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:image" content="{{ $appUrl }}/og-image.svg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="{{ $brand }}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $brand }}">
    <meta name="twitter:description" content="{{ $tagline }}">
    <meta name="twitter:image" content="{{ $appUrl }}/og-image.svg">

    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
    <link rel="apple-touch-icon" href="{{ asset('favicon.svg') }}">
    <link rel="manifest" href="{{ asset('manifest.webmanifest') }}">
    <link rel="canonical" href="{{ url()->current() }}">

    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="antialiased">
    @inertia
</body>
</html>
