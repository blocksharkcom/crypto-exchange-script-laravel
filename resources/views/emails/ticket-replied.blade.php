@php
    /** @var \App\Models\Ticket $ticket */
    /** @var \App\Models\TicketMessage $message */
    $adminName = $message->admin?->name ?? __('emails.ticket_replied.footer');
@endphp

<x-mail::message>
# {{ __('emails.ticket_replied.heading') }}

{{ __('emails.ticket_replied.intro') }}

**{{ __('emails.ticket_replied.reply_from', ['name' => $adminName]) }}:**

<x-mail::panel>
{!! nl2br(e($message->body)) !!}
</x-mail::panel>

<x-mail::button :url="$portalUrl" color="success">
{{ __('emails.ticket_replied.view_button') }}
</x-mail::button>

{{ __('emails.ticket_replied.footer') }} **{{ $brand }}**
</x-mail::message>
