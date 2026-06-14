<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Page;
use App\Services\Chat\ChatService;
use App\Support\Content;
use App\Support\Settings;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $locale = app()->getLocale();
        $admin = $request->user('admin');
        $user = $request->user('web');

        return [
            ...parent::share($request),
            'appName' => Settings::brand(),
            'brand' => [
                'name' => Settings::brand(),
                'tagline' => Settings::get('tagline', config('swapforge.tagline')),
                'logo' => Settings::get('logo'),
                'support_email' => Settings::get('support_email', config('swapforge.support_email')),
                'social' => Settings::get('social', config('swapforge.social', [])),
            ],
            'features' => [
                'webgl_hero' => (bool) Settings::get('webgl_hero', true),
                'fixed_rate' => (bool) Settings::get('fixed_rate', true),
                'show_promo' => (bool) Settings::get('show_promo', true),
                'collect_email' => (bool) Settings::get('collect_email', true),
            ],
            'theme' => Settings::get('theme', 'dark'),
            'chat' => [
                'enabled' => (bool) Settings::get('chat.enabled', false)
                    && (string) Settings::get('chat.provider', ChatService::PROVIDER_NONE) !== ChatService::PROVIDER_NONE,
                'assistant_name' => (string) Settings::get('chat.assistant_name', ChatService::DEFAULT_ASSISTANT_NAME) ?: ChatService::DEFAULT_ASSISTANT_NAME,
            ],
            'legal' => [
                'terms' => Settings::get('terms_url'),
                'privacy' => Settings::get('privacy_url'),
                'aml' => Settings::get('aml_url'),
            ],
            'nav' => [
                'header' => Page::query()
                    ->with('translations')
                    ->where('status', 'published')
                    ->where('show_in_header', true)
                    ->orderBy('sort_order')
                    ->orderBy('title')
                    ->get()
                    ->map(fn (Page $p) => ['label' => (string) $p->translated($locale)->title, 'href' => '/p/'.$p->slug])
                    ->all(),
                'footer' => Page::query()
                    ->with('translations')
                    ->where('status', 'published')
                    ->where('show_in_footer', true)
                    ->orderBy('sort_order')
                    ->orderBy('title')
                    ->get()
                    ->map(fn (Page $p) => ['label' => (string) $p->translated($locale)->title, 'href' => '/p/'.$p->slug])
                    ->all(),
            ],
            'content' => [
                'highlights' => Content::getLocalised('highlights', Content::defaults('highlights')),
                'reviews' => Content::getLocalised('reviews', Content::defaults('reviews')),
                'stats' => Content::getLocalised('stats', Content::defaults('stats')),
                'how_it_works' => Content::getLocalised('how_it_works', Content::defaults('how_it_works')),
            ],
            'i18n' => [
                'locale' => $locale,
                'available' => config('swapforge.languages', ['en']),
                // Merge current-locale messages on top of the English fallback so any
                // untranslated key still shows real text instead of "key.path".
                'messages' => array_replace_recursive(
                    (array) trans('site', [], 'en'),
                    (array) trans('site'),
                ),
            ],
            'auth' => [
                'admin' => $admin ? [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'roles' => $admin->getRoleNames(),
                ] : null,
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'locale' => $user->locale,
                    'created_at' => $user->created_at?->toIso8601String(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'ziggy' => function () use ($request) {
                return [
                    ...(new Ziggy)->toArray(),
                    'location' => $request->url(),
                ];
            },
        ];
    }
}
