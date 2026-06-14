<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Campaign;
use App\Models\User;
use App\Support\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

final class CampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Campaign $campaign,
        public readonly User $user,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->campaign->subject,
            to: [(string) $this->user->email],
        );
    }

    public function content(): Content
    {
        $unsubscribeUrl = URL::signedRoute(
            'email.unsubscribe',
            ['email' => (string) $this->user->email],
            // Pass null to never expire — Laravel's signed URL machinery
            // still validates the HMAC signature for tamper-proofing.
            Carbon::now()->addYears(10),
        );

        return new Content(
            markdown: 'emails.campaign',
            with: [
                'campaign' => $this->campaign,
                'user' => $this->user,
                'brand' => Settings::brand(),
                'unsubscribeUrl' => $unsubscribeUrl,
            ],
        );
    }
}
