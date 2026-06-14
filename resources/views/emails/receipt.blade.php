@component('mail::message')
# {{ __('emails.receipt.heading') }}

{{ __('emails.receipt.greeting', ['brand' => $brand]) }}

@component('mail::panel')
**{{ __('emails.receipt.pair') }}:** {{ strtoupper($tx->from_currency) }} &rarr; {{ strtoupper($tx->to_currency) }}

**{{ __('emails.receipt.sent') }}:** {{ rtrim(rtrim((string) $tx->amount_send, '0'), '.') }} {{ strtoupper($tx->from_currency) }}

**{{ __('emails.receipt.received') }}:** {{ rtrim(rtrim((string) $tx->amount_receive, '0'), '.') }} {{ strtoupper($tx->to_currency) }}

**{{ __('emails.receipt.transaction_id') }}:** {{ $tx->provider_id }}

**{{ __('emails.receipt.completed_at') }}:** {{ optional($tx->finished_at)->toDayDateTimeString() ?? '—' }}
@endcomponent

@component('mail::button', ['url' => $trackUrl, 'color' => 'success'])
{{ __('emails.receipt.view_button') }}
@endcomponent

{{ __('emails.receipt.support_note') }} [{{ __('emails.receipt.support_link') }}]({{ $supportUrl }}).

{{ __('emails.receipt.thanks') }}<br>
**{{ $brand }}**
@endcomponent
