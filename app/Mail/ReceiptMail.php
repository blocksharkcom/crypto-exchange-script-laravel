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

final class ReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Transaction $tx) {}

    public function envelope(): Envelope
    {
        $brand = Settings::brand();

        return new Envelope(
            subject: __('emails.receipt.subject', ['brand' => $brand]),
        );
    }

    public function content(): Content
    {
        $brand = Settings::brand();

        return new Content(
            markdown: 'emails.receipt',
            with: [
                'tx' => $this->tx,
                'brand' => $brand,
                'trackUrl' => url('/tx/'.$this->tx->provider_id),
                'supportUrl' => url('/support'),
            ],
        );
    }
}
