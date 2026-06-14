@component('mail::message')
# {{ __('emails.admin_failure.heading', ['status' => $reason === 'stuck' ? __('emails.admin_failure.stuck') : __('emails.admin_failure.failed')]) }}

{{ __('emails.admin_failure.intro', ['brand' => $brand]) }}

@component('mail::panel')
**{{ __('emails.admin_failure.transaction_id') }}:** {{ $tx->provider_id }}

**{{ __('emails.admin_failure.status') }}:** {{ $tx->status }}

**{{ __('emails.admin_failure.pair') }}:** {{ strtoupper($tx->from_currency) }} &rarr; {{ strtoupper($tx->to_currency) }}

**{{ __('emails.admin_failure.amount_sent') }}:** {{ rtrim(rtrim((string) $tx->amount_send, '0'), '.') }} {{ strtoupper($tx->from_currency) }}

**{{ __('emails.admin_failure.amount_received') }}:** {{ rtrim(rtrim((string) $tx->amount_receive, '0'), '.') }} {{ strtoupper($tx->to_currency) }}

**{{ __('emails.admin_failure.created_at') }}:** {{ optional($tx->created_at)->toDayDateTimeString() ?? '—' }}

**{{ __('emails.admin_failure.flagged_stuck') }}:** {{ $tx->stuck_flagged ? __('emails.admin_failure.yes') : __('emails.admin_failure.no') }}
@endcomponent

@component('mail::button', ['url' => $adminUrl, 'color' => 'error'])
{{ __('emails.admin_failure.open_button') }}
@endcomponent

{{ __('emails.admin_failure.footer') }}<br>
**{{ $brand }}**
@endcomponent
