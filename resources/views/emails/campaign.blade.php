@php
    /** @var \App\Models\Campaign $campaign */
    /** @var \App\Models\User $user */
@endphp

<x-mail::message>
{!! \Illuminate\Support\Str::markdown($campaign->body) !!}

---

<small>{{ __('emails.campaign.unsubscribe_intro') }} <a href="{{ $unsubscribeUrl }}">{{ __('emails.campaign.unsubscribe_link') }}</a>.</small>

{{ __('emails.campaign.footer') }} **{{ $brand }}**
</x-mail::message>
