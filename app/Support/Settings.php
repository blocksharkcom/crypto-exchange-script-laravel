<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

/**
 * Light wrapper around the `settings` table with a request-local cache.
 * Falls back to config('swapforge.*') when a key is not set in the DB.
 */
final class Settings
{
    private const CACHE_KEY = 'swapforge.settings';

    private const TTL = 600;

    /** @var array<string, mixed>|null */
    private static ?array $cache = null;

    public static function brand(): string
    {
        return self::get('brand', config('swapforge.brand', 'CrossSwap'));
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $all = self::all();

        return $all[$key] ?? $default;
    }

    public static function set(string $key, mixed $value): void
    {
        Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        self::flush();
    }

    /** @param array<string, mixed> $values */
    public static function setMany(array $values): void
    {
        foreach ($values as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        self::flush();
    }

    public static function flush(): void
    {
        self::$cache = null;
        Cache::forget(self::CACHE_KEY);
    }

    /** @return array<string, mixed> */
    public static function all(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }

        self::$cache = Cache::remember(self::CACHE_KEY, self::TTL, function (): array {
            return Setting::all()
                ->pluck('value', 'key')
                ->toArray();
        });

        return self::$cache;
    }
}
