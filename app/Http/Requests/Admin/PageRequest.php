<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class PageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $pageId = $this->route('page')?->id;

        return [
            'slug' => ['required', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('pages', 'slug')->ignore($pageId)],
            'title' => ['required', 'string', 'max:200'],
            'excerpt' => ['nullable', 'string', 'max:300'],
            'body' => ['required', 'string', 'max:200000'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'show_in_header' => ['boolean'],
            'show_in_footer' => ['boolean'],
            'sort_order' => ['integer', 'min:0', 'max:9999'],
            'translations' => ['nullable', 'array'],
            'translations.*.title' => ['nullable', 'string', 'max:200'],
            'translations.*.excerpt' => ['nullable', 'string', 'max:300'],
            'translations.*.body' => ['nullable', 'string', 'max:200000'],
        ];
    }
}
