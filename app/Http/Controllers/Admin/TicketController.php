<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TicketReplyRequest;
use App\Mail\TicketRepliedMail;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(Request $request): Response
    {
        $q = Ticket::query()->with(['user:id,email']);

        $status = (string) $request->string('status');
        if (in_array($status, [Ticket::STATUS_OPEN, Ticket::STATUS_PENDING, Ticket::STATUS_CLOSED], true)) {
            $q->where('status', $status);
        }

        $needle = trim((string) $request->string('q'));
        if ($needle !== '') {
            $like = '%'.$needle.'%';
            $q->where(function (Builder $b) use ($like): void {
                $b->where('subject', 'like', $like)
                    ->orWhere('email', 'like', $like);
            });
        }

        $paginator = $q->latest()->paginate(25)->withQueryString();

        $paginator->getCollection()->transform(fn (Ticket $t) => [
            'id' => $t->id,
            'subject' => $t->subject,
            'email' => $t->email,
            'user_email' => $t->user?->email,
            'status' => $t->status,
            'priority' => $t->priority,
            'created_at' => $t->created_at?->toIso8601String(),
            'updated_at' => $t->updated_at?->toIso8601String(),
        ]);

        return Inertia::render('Admin/Tickets/Index', [
            'tickets' => $paginator,
            'filters' => [
                'q' => (string) $request->string('q'),
                'status' => $status,
            ],
        ]);
    }

    public function show(Ticket $ticket): Response
    {
        $ticket->load([
            'user:id,email,country',
            'transaction:id,provider_id,from_currency,to_currency,status',
            'messages' => function ($q): void {
                $q->orderBy('created_at')->with('admin:id,name,email');
            },
        ]);

        return Inertia::render('Admin/Tickets/Show', [
            'ticket' => [
                'id' => $ticket->id,
                'subject' => $ticket->subject,
                'email' => $ticket->email,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'closed_at' => $ticket->closed_at?->toIso8601String(),
                'created_at' => $ticket->created_at?->toIso8601String(),
                'updated_at' => $ticket->updated_at?->toIso8601String(),
            ],
            'user' => $ticket->user !== null ? [
                'id' => $ticket->user->id,
                'email' => $ticket->user->email,
                'country' => $ticket->user->country,
            ] : null,
            'transaction' => $ticket->transaction !== null ? [
                'id' => $ticket->transaction->id,
                'provider_id' => $ticket->transaction->provider_id,
                'from_currency' => $ticket->transaction->from_currency,
                'to_currency' => $ticket->transaction->to_currency,
                'status' => $ticket->transaction->status,
            ] : null,
            'messages' => $ticket->messages->map(fn (TicketMessage $m) => [
                'id' => $m->id,
                'sender' => $m->sender,
                'body' => $m->body,
                'admin' => $m->admin !== null ? ['name' => $m->admin->name, 'email' => $m->admin->email] : null,
                'created_at' => $m->created_at?->toIso8601String(),
            ])->all(),
        ]);
    }

    public function reply(TicketReplyRequest $request, Ticket $ticket): RedirectResponse
    {
        $admin = auth('admin')->user();
        $internal = (bool) $request->boolean('internal');

        $message = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender' => 'admin',
            'admin_id' => $admin?->getAuthIdentifier(),
            'body' => (string) $request->validated('body'),
            'is_internal' => $internal,
        ]);

        if ($ticket->status !== Ticket::STATUS_CLOSED) {
            $ticket->update([
                'status' => Ticket::STATUS_PENDING,
                'admin_replied_at' => now(),
            ]);
        }

        if (! $internal) {
            try {
                $message->load('admin');
                Mail::to($ticket->email)
                    ->queue(new TicketRepliedMail($ticket, $message));
            } catch (\Throwable) {
                // mail failures must not break the admin flow
            }
        }

        return back()->with('success', trans('site.admin.tickets.reply_sent'));
    }

    public function close(Ticket $ticket): RedirectResponse
    {
        $ticket->update([
            'status' => Ticket::STATUS_CLOSED,
            'closed_at' => now(),
        ]);

        return back()->with('success', trans('site.admin.tickets.closed'));
    }
}
