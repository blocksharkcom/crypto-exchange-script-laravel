@component('mail::message')
# {{ __('emails.reset.heading') }}

{{ __('emails.reset.intro', ['brand' => $brand]) }}

@component('mail::button', ['url' => $resetUrl, 'color' => 'success'])
{{ __('emails.reset.button') }}
@endcomponent

{{ __('emails.reset.expire_note', ['minutes' => $expireMinutes]) }}

{{ __('emails.reset.ignore_note') }}

{{ __('emails.reset.support_note') }} [{{ __('emails.reset.support_link') }}]({{ $supportUrl }}).

{{ __('emails.reset.thanks') }}<br>
**{{ $brand }}**
@endcomponent
