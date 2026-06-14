<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\RecurringSchedule;
use App\Models\Transaction;
use App\Support\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

final class RecurringRunMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly RecurringSchedule $schedule,
        public readonly Transaction $tx,
    ) {}

    public function envelope(): Envelope
    {
        $pair = strtoupper($this->schedule->from_currency.'/'.$this->schedule->to_currency);

        return new Envelope(
            subject: trans('emails.recurring_run.subject', [
                'brand' => Settings::brand(),
                'pair' => $pair,
            ]),
        );
    }

    public function content(): Content
    {
        $skipUrl = URL::temporarySignedRoute(
            'account.recurring.pause-signed',
            now()->addHours(24),
            ['schedule' => $this->schedule->id],
        );

        return new Content(
            markdown: 'emails.recurring-run',
            with: [
                'schedule' => $this->schedule,
                'tx' => $this->tx,
                'brand' => Settings::brand(),
                'pair' => strtoupper($this->schedule->from_currency.'/'.$this->schedule->to_currency),
                'trackUrl' => url('/tx/'.$this->tx->provider_id),
                'skipUrl' => $skipUrl,
            ],
        );
    }
}
