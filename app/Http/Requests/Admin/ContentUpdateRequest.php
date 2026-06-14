<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Support\Content;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ContentUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $key = (string) $this->route('key');

        $base = [
            'locale' => ['required', 'string', Rule::in(Content::LOCALES)],
        ];

        return [...$base, ...$this->rulesForKey($key)];
    }

    /** @return array<string, mixed> */
    private function rulesForKey(string $key): array
    {
        return match ($key) {
            'highlights' => [
                'data' => ['required', 'array'],
                'data.since' => ['required', 'integer', 'between:2000,2100'],
                'data.items' => ['required', 'array', 'size:4'],
                'data.items.*.title' => ['required', 'string', 'max:200'],
                'data.items.*.desc' => ['required', 'string', 'max:500'],
            ],
            'reviews' => [
                'data' => ['required', 'array'],
                'data.items' => ['required', 'array', 'max:12'],
                'data.items.*.name' => ['required', 'string', 'max:80'],
                'data.items.*.rating' => ['required', 'integer', 'between:1,5'],
                'data.items.*.body' => ['required', 'string', 'max:600'],
            ],
            'stats' => [
                'data' => ['required', 'array', 'max:8'],
                'data.*.value' => ['required', 'numeric'],
                'data.*.suffix' => ['present', 'string', 'max:6'],
                'data.*.label' => ['required', 'string', 'max:60'],
            ],
            'how_it_works' => [
                'data' => ['required', 'array'],
                'data.items' => ['required', 'array', 'size:4'],
                'data.items.*.title' => ['required', 'string', 'max:200'],
                'data.items.*.desc' => ['required', 'string', 'max:500'],
            ],
            default => [
                'data' => ['required', 'array'],
            ],
        };
    }
}
