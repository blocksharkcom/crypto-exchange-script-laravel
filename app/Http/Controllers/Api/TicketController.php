<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\TicketOpenedMail;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class TicketController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:200'],
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:5000'],
            'transaction_id' => ['nullable', 'string', 'max:64'],
        ]);

        $tx = null;
        if (! empty($data['transaction_id'])) {
            $tx = Transaction::query()->where('provider_id', $data['transaction_id'])->first();
        }

        $user = User::firstOrCreate(['email' => $data['email']], [
            'ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        $ticket = Ticket::create([
            'user_id' => $user->id,
            'transaction_id' => $tx?->id,
            'email' => $data['email'],
            'view_token' => Str::random(48),
            'subject' => $data['subject'],
            'status' => Ticket::STATUS_OPEN,
            'priority' => 'normal',
        ]);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender' => 'user',
            'body' => $data['message'],
        ]);

        try {
            Mail::to($ticket->email)->queue(new TicketOpenedMail($ticket));
        } catch (\Throwable) {
            // Don't fail the ticket creation if SMTP is misconfigured.
        }

        return response()->json([
            'ok' => true,
            'data' => [
                'ticket_id' => $ticket->id,
                'portal_url' => $ticket->portalUrl(),
            ],
        ]);
    }
}
