<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Support\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly string $token) {}

    /** @return array<int, string> */
    public function via(mixed $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        $brand = Settings::brand();
        $email = is_object($notifiable) && property_exists($notifiable, 'email')
            ? (string) $notifiable->email
            : (string) ($notifiable->getEmailForPasswordReset() ?? '');
        $url = url(route('auth.password.reset', ['token' => $this->token], false).'?email='.urlencode($email));

        return (new MailMessage)
            ->subject(__('site.auth.reset.email_subject', ['brand' => $brand]))
            ->markdown('emails.reset-password', [
                'brand' => $brand,
                'resetUrl' => $url,
                'supportUrl' => url('/support'),
                'expireMinutes' => (int) config('auth.passwords.users.expire', 60),
            ]);
    }
}
