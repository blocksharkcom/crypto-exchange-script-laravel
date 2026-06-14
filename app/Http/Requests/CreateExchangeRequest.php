<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateExchangeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'from' => ['required', 'string', 'max:16'],
            'to' => ['required', 'string', 'max:16'],
            'amount' => ['required', 'numeric', 'min:0.00000001'],
            'address' => ['required', 'string', 'max:200'],
            'refund_address' => ['nullable', 'string', 'max:200'],
            'extra_id' => ['nullable', 'string', 'max:64'],
            'email' => ['nullable', 'email'],
            'from_network' => ['nullable', 'string', 'max:32'],
            'to_network' => ['nullable', 'string', 'max:32'],
            'flow' => ['nullable', 'in:standard,fixed-rate'],
            'rate_id' => ['nullable', 'string', 'max:64'],
            'promo_code' => ['nullable', 'string', 'max:32'],
        ];
    }
}
