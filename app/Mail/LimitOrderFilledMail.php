<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\LimitOrder;
use App\Models\Transaction;
use App\Support\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class LimitOrderFilledMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly LimitOrder $order,
        public readonly Transaction $tx,
    ) {}

    public function envelope(): Envelope
    {
        $pair = strtoupper($this->order->from_currency.'/'.$this->order->to_currency);

        return new Envelope(
            subject: trans('emails.limit_filled.subject', [
                'brand' => Settings::brand(),
                'pair' => $pair,
            ]),
        );
    }

    public function content(): Content
    {
        $send = max((float) $this->order->amount_send, 1e-12);
        $receive = (float) $this->tx->amount_receive;
        $executed = $send > 0 ? $receive / $send : 0.0;

        return new Content(
            markdown: 'emails.limit-order-filled',
            with: [
                'order' => $this->order,
                'tx' => $this->tx,
                'brand' => Settings::brand(),
                'pair' => strtoupper($this->order->from_currency.'/'.$this->order->to_currency),
                'target' => (float) $this->order->target_rate,
                'executedRate' => $executed,
                'trackUrl' => url('/tx/'.$this->tx->provider_id),
            ],
        );
    }
}
