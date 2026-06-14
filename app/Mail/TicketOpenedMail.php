<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Ticket;
use App\Support\Settings;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class TicketOpenedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Ticket $ticket) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: trans('emails.ticket_opened.subject', [
                'brand' => Settings::brand(),
                'ticket_id' => '#'.$this->ticket->id,
            ]),
            to: [$this->ticket->email],
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.ticket-opened',
            with: [
                'ticket' => $this->ticket,
                'brand' => Settings::brand(),
                'portalUrl' => $this->ticket->portalUrl(),
            ],
        );
    }
}
