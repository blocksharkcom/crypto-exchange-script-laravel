<?php

declare(strict_types=1);

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CreateLimitOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('web') !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'from' => ['required', 'string', 'max:16'],
            'to' => ['required', 'string', 'max:16'],
            'amount' => ['required', 'numeric', 'min:0.00000001'],
            'target_rate' => ['required', 'numeric', 'gt:0'],
            'address' => ['required', 'string', 'max:200'],
            'refund_address' => ['nullable', 'string', 'max:200'],
            'extra_id' => ['nullable', 'string', 'max:64'],
            'from_network' => ['nullable', 'string', 'max:32'],
            'to_network' => ['nullable', 'string', 'max:32'],
            'expiration' => ['nullable', 'in:24h,7d,30d,never'],
        ];
    }
}
