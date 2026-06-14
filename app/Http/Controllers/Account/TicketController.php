<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user('web');

        $tickets = Ticket::query()
            ->where('user_id', $user->id)
            ->orWhere('email', $user->email)
            ->with('transaction:id,provider_id,from_currency,to_currency')
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (Ticket $t): array => [
                'id' => $t->id,
                'subject' => $t->subject,
                'status' => $t->status,
                'priority' => $t->priority,
                'portal_url' => $t->portalUrl(),
                'created_at' => $t->created_at?->toIso8601String(),
                'updated_at' => $t->updated_at?->toIso8601String(),
                'transaction' => $t->transaction !== null ? [
                    'provider_id' => $t->transaction->provider_id,
                    'from_currency' => $t->transaction->from_currency,
                    'to_currency' => $t->transaction->to_currency,
                ] : null,
            ])
            ->all();

        return Inertia::render('Account/Tickets', [
            'tickets' => $tickets,
        ]);
    }
}
