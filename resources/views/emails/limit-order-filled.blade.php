@component('mail::message')
# {{ __('emails.limit_filled.heading') }}

{{ __('emails.limit_filled.intro', ['brand' => $brand, 'pair' => $pair]) }}

@component('mail::panel')
**{{ __('emails.limit_filled.pair') }}:** {{ $pair }}

**{{ __('emails.limit_filled.target') }}:** {{ rtrim(rtrim(number_format($target, 8, '.', ''), '0'), '.') }}

**{{ __('emails.limit_filled.executed_rate') }}:** {{ rtrim(rtrim(number_format($executedRate, 8, '.', ''), '0'), '.') }}

**{{ __('emails.limit_filled.received') }}:** {{ rtrim(rtrim((string) $tx->amount_receive, '0'), '.') }} {{ strtoupper($tx->to_currency) }}

**{{ __('emails.limit_filled.transaction_id') }}:** {{ $tx->provider_id }}
@endcomponent

@component('mail::button', ['url' => $trackUrl, 'color' => 'success'])
{{ __('emails.limit_filled.view_button') }}
@endcomponent

{{ __('emails.limit_filled.footer', ['brand' => $brand]) }}
@endcomponent
