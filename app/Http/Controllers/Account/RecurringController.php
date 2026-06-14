<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\RecurringSchedule;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Exchange\RecurringScheduleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecurringController extends Controller
{
    public function __construct(private readonly RecurringScheduleService $service) {}

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user('web');

        $paginator = RecurringSchedule::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->paginate(25)
            ->withQueryString();

        $paginator->getCollection()->transform(fn (RecurringSchedule $s) => $this->serialize($s));

        return Inertia::render('Account/Recurring', [
            'schedules' => $paginator,
        ]);
    }

    public function cancel(Request $request, int $id): RedirectResponse
    {
        $s = $this->find($request, $id);
        $this->service->cancel($s);

        return back()->with('success', __('site.account.recurring.cancelled'));
    }

    public function pause(Request $request, int $id): RedirectResponse
    {
        $s = $this->find($request, $id);
        $this->service->pause($s);

        return back()->with('success', __('site.account.recurring.paused'));
    }

    public function resume(Request $request, int $id): RedirectResponse
    {
        $s = $this->find($request, $id);
        $this->service->resume($s);

        return back()->with('success', __('site.account.recurring.resumed'));
    }

    public function pauseSigned(Request $request, int $schedule): RedirectResponse
    {
        if (! $request->hasValidSignature()) {
            abort(403);
        }
        $row = RecurringSchedule::query()->find($schedule);
        if ($row !== null) {
            $this->service->pause($row);
        }

        return redirect()->route('account.recurring')->with('success', __('site.account.recurring.paused'));
    }

    private function find(Request $request, int $id): RecurringSchedule
    {
        /** @var User $user */
        $user = $request->user('web');

        return RecurringSchedule::query()
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();
    }

    /** @return array<string, mixed> */
    private function serialize(RecurringSchedule $s): array
    {
        $history = $s->transactions()
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(fn (Transaction $tx) => [
                'id' => $tx->id,
                'provider_id' => $tx->provider_id,
                'amount_send' => (float) $tx->amount_send,
                'amount_receive' => (float) $tx->amount_receive,
                'status' => $tx->status,
                'created_at' => $tx->created_at?->toIso8601String(),
            ])
            ->all();

        return [
            'id' => $s->id,
            'from_currency' => $s->from_currency,
            'to_currency' => $s->to_currency,
            'from_network' => $s->from_network,
            'to_network' => $s->to_network,
            'amount_send' => (float) $s->amount_send,
            'frequency' => $s->frequency,
            'start_at' => $s->start_at?->toIso8601String(),
            'next_run_at' => $s->next_run_at?->toIso8601String(),
            'end_condition' => $s->end_condition,
            'end_at' => $s->end_at?->toIso8601String(),
            'max_runs' => $s->max_runs,
            'runs_completed' => $s->runs_completed,
            'status' => $s->status,
            'address' => $s->address,
            'refund_address' => $s->refund_address,
            'last_run_at' => $s->last_run_at?->toIso8601String(),
            'created_at' => $s->created_at?->toIso8601String(),
            'history' => $history,
        ];
    }
}
