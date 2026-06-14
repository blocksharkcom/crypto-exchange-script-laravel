<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\ContentSection;

/**
 * Per-locale marketing content with sensible defaults.
 *
 * Reads from `content_sections`, falls back to the English locale,
 * then falls back to compile-time defaults so the storefront always
 * shows real text — even on a clean install with no rows yet.
 */
final class Content
{
    public const KEYS = ['highlights', 'reviews', 'stats', 'how_it_works'];

    public const LOCALES = ['en', 'es', 'de', 'fr'];

    /** @var array<string, array<string, array<string, mixed>>> */
    private static array $cache = [];

    /**
     * @param  array<string, mixed>  $default
     * @return array<string, mixed>
     */
    public static function get(string $key, string $locale, array $default = []): array
    {
        if (isset(self::$cache[$key][$locale])) {
            return self::$cache[$key][$locale];
        }

        $row = ContentSection::query()
            ->where('key', $key)
            ->where('locale', $locale)
            ->first();

        $value = is_array($row?->data) ? $row->data : $default;

        self::$cache[$key][$locale] = $value;

        return $value;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function set(string $key, string $locale, array $data): void
    {
        ContentSection::query()->updateOrCreate(
            ['key' => $key, 'locale' => $locale],
            ['data' => $data, 'updated_by' => auth('admin')->id()],
        );

        unset(self::$cache[$key][$locale]);
    }

    /**
     * @param  array<string, mixed>  $default
     * @return array<string, mixed>
     */
    public static function getLocalised(string $key, array $default = []): array
    {
        $locale = (string) app()->getLocale();

        $row = self::get($key, $locale, []);
        if ($row !== []) {
            return $row;
        }

        if ($locale !== 'en') {
            $en = self::get($key, 'en', []);
            if ($en !== []) {
                return $en;
            }
        }

        return $default;
    }

    /**
     * Compile-time defaults — copied from the original hardcoded React/lang values
     * so a buyer who never opens the admin panel still sees real content.
     *
     * @return array<string, mixed>
     */
    public static function defaults(string $key): array
    {
        return match ($key) {
            'highlights' => [
                'since' => 2024,
                'items' => [
                    ['title' => '24/7 live support',     'desc' => 'Our dedicated team is available around the clock to offer personalised assistance.'],
                    ['title' => 'Best market rates',     'desc' => 'Through partnerships with leading liquidity venues, we surface the most competitive rates for every pair.'],
                    ['title' => 'Speedy transactions',   'desc' => 'Average swap completes in 5–40 minutes, so you can act on opportunities while they last.'],
                    ['title' => 'Secure funds handling', 'desc' => 'We never custody your assets — funds move directly between blockchains and your wallet.'],
                ],
            ],
            'reviews' => [
                'items' => [
                    ['name' => 'Daniel Cinta', 'rating' => 5, 'body' => 'It is the best I have used. I have been in the crypto world for a while and used several exchanges — this has been by far the one I liked most.'],
                    ['name' => 'Ron Cave',     'rating' => 5, 'body' => 'Superb, super easy to use from sign-up to exchanging crypto. Would recommend to anyone. Well done team.'],
                    ['name' => 'Peter Vell',   'rating' => 5, 'body' => 'First time I found the customer service team this helpful. Whatever problem comes up, 5 stars guys — keep up the good work.'],
                    ['name' => 'Marta Olsson', 'rating' => 5, 'body' => 'Settled in minutes, no account required. Rate I was quoted was the rate I got. Will use again.'],
                    ['name' => 'Hideo Kimura', 'rating' => 5, 'body' => 'Cleanest UX of any swap service I have tried. The address verification step saved me from a costly mistake.'],
                ],
            ],
            'stats' => [
                ['value' => 900, 'suffix' => '+',  'label' => 'supported assets'],
                ['value' => 12,  'suffix' => 'M+', 'label' => 'swaps completed'],
                ['value' => 180, 'suffix' => '+',  'label' => 'countries served'],
                ['value' => 5,   'suffix' => 'B+', 'label' => 'in lifetime volume (USD)'],
            ],
            'how_it_works' => [
                'items' => [
                    ['title' => 'Pick a pair',        'desc' => "Choose what to send and what to receive. We'll fetch the live rate."],
                    ['title' => 'Enter your address', 'desc' => 'Give us the wallet where you want to receive the new asset.'],
                    ['title' => 'Send your deposit',  'desc' => 'Send the exact amount to the one-time address we generate.'],
                    ['title' => 'Done',               'desc' => 'We exchange and forward funds to your destination wallet automatically.'],
                ],
            ],
            default => [],
        };
    }

    public static function flush(): void
    {
        self::$cache = [];
    }
}
