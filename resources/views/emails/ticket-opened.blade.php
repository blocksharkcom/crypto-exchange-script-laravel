@php
    /** @var \App\Models\Ticket $ticket */
@endphp

<x-mail::message>
# {{ __('emails.ticket_opened.heading') }}

{{ __('emails.ticket_opened.intro', ['brand' => $brand]) }}

**{{ __('emails.ticket_opened.subject_lbl') }}:** {{ $ticket->subject }}
**{{ __('emails.ticket_opened.reference') }}:** #{{ $ticket->id }}

<x-mail::button :url="$portalUrl" color="success">
{{ __('emails.ticket_opened.view_button') }}
</x-mail::button>

> **{{ __('emails.ticket_opened.tip_lbl') }}:** {{ __('emails.ticket_opened.tip') }}

{{ __('emails.ticket_opened.footer') }} **{{ $brand }}**
</x-mail::message>
