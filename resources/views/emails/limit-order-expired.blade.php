@component('mail::message')
# {{ __('emails.limit_expired.heading') }}

{{ __('emails.limit_expired.intro', ['brand' => $brand, 'pair' => $pair]) }}

@component('mail::panel')
**{{ __('emails.limit_expired.pair') }}:** {{ $pair }}

**{{ __('emails.limit_expired.amount') }}:** {{ rtrim(rtrim((string) $order->amount_send, '0'), '.') }} {{ strtoupper($order->from_currency) }}

**{{ __('emails.limit_expired.target') }}:** {{ rtrim(rtrim((string) $order->target_rate, '0'), '.') }}
@endcomponent

@component('mail::button', ['url' => $newOrderUrl])
{{ __('emails.limit_expired.cta') }}
@endcomponent

{{ __('emails.limit_expired.footer', ['brand' => $brand]) }}
@endcomponent
