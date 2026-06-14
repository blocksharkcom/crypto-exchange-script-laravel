<?php

declare(strict_types=1);

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CreateRecurringScheduleRequest extends FormRequest
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
            'address' => ['required', 'string', 'max:200'],
            'refund_address' => ['nullable', 'string', 'max:200'],
            'extra_id' => ['nullable', 'string', 'max:64'],
            'from_network' => ['nullable', 'string', 'max:32'],
            'to_network' => ['nullable', 'string', 'max:32'],
            'frequency' => ['required', 'in:daily,weekly,monthly'],
            'start_at' => ['nullable', 'date'],
            'end_condition' => ['required', 'in:never,until_date,after_runs'],
            'end_at' => ['nullable', 'required_if:end_condition,until_date', 'date'],
            'max_runs' => ['nullable', 'required_if:end_condition,after_runs', 'integer', 'min:1', 'max:9999'],
        ];
    }
}
