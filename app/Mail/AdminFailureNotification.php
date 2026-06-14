<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Transaction;
use App\Support\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class AdminFailureNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Transaction $tx, public string $reason = 'failed') {}

    public function envelope(): Envelope
    {
        $brand = Settings::brand();
        $label = $this->reason === 'stuck' ? 'stuck' : 'failed';

        return new Envelope(
            subject: __('emails.admin_failure.subject', [
                'brand' => $brand,
                'status' => $label,
                'id' => $this->tx->provider_id,
            ]),
        );
    }

    public function content(): Content
    {
        $brand = Settings::brand();

        return new Content(
            markdown: 'emails.admin-failure',
            with: [
                'tx' => $this->tx,
                'reason' => $this->reason,
                'brand' => $brand,
                'adminUrl' => url('/admin/transactions/'.$this->tx->id),
            ],
        );
    }
}
