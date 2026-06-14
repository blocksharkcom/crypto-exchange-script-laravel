<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SettingsUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = $this->user('admin');
        if ($admin === null) {
            return false;
        }

        return method_exists($admin, 'can') ? (bool) $admin->can('settings.update') : true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'brand' => ['nullable', 'string', 'max:64'],
            'tagline' => ['nullable', 'string', 'max:160'],
            'logo' => ['nullable', 'string', 'max:512'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'theme' => ['nullable', 'in:dark,light,auto'],
            'webgl_hero' => ['nullable', 'boolean'],
            'fixed_rate' => ['nullable', 'boolean'],
            'show_promo' => ['nullable', 'boolean'],
            'collect_email' => ['nullable', 'boolean'],
            'featured_currencies' => ['nullable', 'string', 'max:1024'],
            'blacklist_currencies' => ['nullable', 'string', 'max:1024'],
            'terms_url' => ['nullable', 'url', 'max:255'],
            'privacy_url' => ['nullable', 'url', 'max:255'],
            'aml_url' => ['nullable', 'url', 'max:255'],
            'social' => ['nullable', 'array'],
            'social.twitter' => ['nullable', 'string', 'max:255'],
            'social.telegram' => ['nullable', 'string', 'max:255'],
            'social.discord' => ['nullable', 'string', 'max:255'],
            'social.reddit' => ['nullable', 'string', 'max:255'],
            'chat' => ['nullable', 'array'],
            'chat.enabled' => ['nullable', 'boolean'],
            'chat.provider' => ['nullable', 'in:none,openai,anthropic'],
            'chat.api_key' => ['nullable', 'string', 'max:255'],
            'chat.model' => ['nullable', 'string', 'max:128'],
            'chat.assistant_name' => ['nullable', 'string', 'max:64'],
            'chat.system_prompt' => ['nullable', 'string', 'max:4000'],

            'mail' => ['nullable', 'array'],
            'mail.transport' => ['nullable', 'in:smtp,log'],
            'mail.host' => ['nullable', 'string', 'max:255'],
            'mail.port' => ['nullable', 'string', 'max:8'],
            'mail.username' => ['nullable', 'string', 'max:255'],
            'mail.password' => ['nullable', 'string', 'max:255'],
            'mail.encryption' => ['nullable', 'in:tls,ssl,none'],
            'mail.from_address' => ['nullable', 'email', 'max:255'],
            'mail.from_name' => ['nullable', 'string', 'max:128'],
        ];
    }
}
