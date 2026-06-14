@component('mail::message')
# {{ __('emails.recurring_run.heading') }}

{{ __('emails.recurring_run.intro', ['brand' => $brand, 'pair' => $pair]) }}

@component('mail::panel')
**{{ __('emails.recurring_run.pair') }}:** {{ $pair }}

**{{ __('emails.recurring_run.amount') }}:** {{ rtrim(rtrim((string) $schedule->amount_send, '0'), '.') }} {{ strtoupper($schedule->from_currency) }}

**{{ __('emails.recurring_run.received') }}:** {{ rtrim(rtrim((string) $tx->amount_receive, '0'), '.') }} {{ strtoupper($tx->to_currency) }}

**{{ __('emails.recurring_run.frequency') }}:** {{ __('site.recurring.frequencies.'.$schedule->frequency) }}

**{{ __('emails.recurring_run.runs_completed') }}:** {{ $schedule->runs_completed }}
@if($schedule->next_run_at)

**{{ __('emails.recurring_run.next_run') }}:** {{ $schedule->next_run_at->toDayDateTimeString() }}
@endif
@endcomponent

@component('mail::button', ['url' => $trackUrl, 'color' => 'success'])
{{ __('emails.recurring_run.view_button') }}
@endcomponent

[{{ __('emails.recurring_run.skip_next') }}]({{ $skipUrl }})

{{ __('emails.recurring_run.footer', ['brand' => $brand]) }}
@endcomponent
