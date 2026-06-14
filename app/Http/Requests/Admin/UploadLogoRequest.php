<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

final class UploadLogoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'logo' => [
                'required',
                'file',
                'image',
                'mimes:svg,png,jpg,jpeg,webp',
                'max:2048', // 2 MB
                'dimensions:min_width=24,min_height=24,max_width=2000,max_height=2000',
            ],
        ];
    }
}
