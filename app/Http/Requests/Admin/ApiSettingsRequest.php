<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ApiSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = $this->user('admin');
        if ($admin === null) {
            return false;
        }

        return method_exists($admin, 'can') ? (bool) $admin->can('api.manage') : true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'api_key' => ['nullable', 'string', 'max:255'],
            'referral' => ['nullable', 'string', 'max:128'],
            'base_url' => ['nullable', 'url', 'max:255'],
            'default_flow' => ['nullable', 'in:standard,fixed-rate'],
        ];
    }
}
