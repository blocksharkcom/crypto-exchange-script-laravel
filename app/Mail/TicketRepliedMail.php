<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Support\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class TicketRepliedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Ticket $ticket,
        public readonly TicketMessage $message,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: trans('emails.ticket_replied.subject', [
                'brand' => Settings::brand(),
                'ticket_id' => '#'.$this->ticket->id,
            ]),
            to: [$this->ticket->email],
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.ticket-replied',
            with: [
                'ticket' => $this->ticket,
                'message' => $this->message,
                'brand' => Settings::brand(),
                'portalUrl' => $this->ticket->portalUrl(),
            ],
        );
    }
}
