<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\LimitOrder;
use App\Support\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class LimitOrderExpiredMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly LimitOrder $order) {}

    public function envelope(): Envelope
    {
        $pair = strtoupper($this->order->from_currency.'/'.$this->order->to_currency);

        return new Envelope(
            subject: trans('emails.limit_expired.subject', [
                'brand' => Settings::brand(),
                'pair' => $pair,
            ]),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.limit-order-expired',
            with: [
                'order' => $this->order,
                'brand' => Settings::brand(),
                'pair' => strtoupper($this->order->from_currency.'/'.$this->order->to_currency),
                'newOrderUrl' => url('/account/limit-orders'),
            ],
        );
    }
}
