<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\Exchange\ExchangeService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransactionController extends Controller
{
    private const EXPORT_LIMIT = 5000;

    public function index(Request $request): Response
    {
        return $this->renderList($request, stuckOnly: false);
    }

    public function stuck(Request $request): Response
    {
        return $this->renderList($request, stuckOnly: true);
    }

    public function show(Transaction $tx): Response
    {
        $tx->load(['user:id,email,country,last_seen_at', 'tickets:id,transaction_id,subject,status,created_at']);

        return Inertia::render('Admin/Transactions/Show', [
            'transaction' => [
                'id' => $tx->id,
                'provider_id' => $tx->provider_id,
                'from_currency' => $tx->from_currency,
                'to_currency' => $tx->to_currency,
                'from_network' => $tx->from_network,
                'to_network' => $tx->to_network,
                'amount_send' => (float) $tx->amount_send,
                'amount_receive' => (float) $tx->amount_receive,
                'payin_address' => $tx->payin_address,
                'payout_address' => $tx->payout_address,
                'refund_address' => $tx->refund_address,
                'payin_extra_id' => $tx->payin_extra_id,
                'payout_extra_id' => $tx->payout_extra_id,
                'flow' => $tx->flow,
                'rate_id' => $tx->rate_id,
                'valid_until' => $tx->valid_until?->toIso8601String(),
                'status' => $tx->status,
                'stuck_flagged' => (bool) $tx->stuck_flagged,
                'finished_at' => $tx->finished_at?->toIso8601String(),
                'fee_amount' => (float) $tx->fee_amount,
                'fee_currency' => $tx->fee_currency,
                'partner_fee' => (float) $tx->partner_fee,
                'partner_fee_currency' => $tx->partner_fee_currency,
                'payin_hash' => $tx->payin_hash,
                'payout_hash' => $tx->payout_hash,
                'ip' => $tx->ip,
                'country' => $tx->country,
                'user_agent' => $tx->user_agent,
                'source' => $tx->source,
                'promo_code' => $tx->promo_code,
                'meta' => $tx->meta,
                'created_at' => $tx->created_at?->toIso8601String(),
                'updated_at' => $tx->updated_at?->toIso8601String(),
            ],
            'user' => $tx->user !== null ? [
                'id' => $tx->user->id,
                'email' => $tx->user->email,
                'country' => $tx->user->country,
                'last_seen_at' => $tx->user->last_seen_at?->toIso8601String(),
            ] : null,
            'tickets' => $tx->tickets->map(fn ($t): array => [
                'id' => $t->id,
                'subject' => $t->subject,
                'status' => $t->status,
                'created_at' => $t->created_at?->toIso8601String(),
            ])->all(),
            'audits' => $tx->audits()
                ->latest()
                ->limit(50)
                ->get()
                ->map(fn ($a): array => [
                    'id' => $a->id,
                    'event' => $a->event,
                    'old_values' => $a->old_values,
                    'new_values' => $a->new_values,
                    'user_type' => $a->user_type,
                    'user_id' => $a->user_id,
                    'ip_address' => $a->ip_address,
                    'created_at' => $a->created_at?->toIso8601String(),
                ])->all(),
        ]);
    }

    public function refresh(Transaction $tx, ExchangeService $exchange): RedirectResponse
    {
        $this->authorizePermission('transactions.refresh');

        try {
            $exchange->syncStatus($tx);

            return back()->with('success', trans('site.admin.tx.refresh_success'));
        } catch (\Throwable $e) {
            return back()->with('error', trans('site.admin.tx.refresh_error', ['msg' => $e->getMessage()]));
        }
    }

    public function flag(Transaction $tx): RedirectResponse
    {
        $tx->update(['stuck_flagged' => ! $tx->stuck_flagged]);

        return back()->with('success', trans('site.admin.tx.flag_success'));
    }

    public function export(Request $request): StreamedResponse
    {
        $this->authorizePermission('transactions.export');

        $query = $this->buildQuery($request, stuckOnly: $request->boolean('stuck'));

        $filename = 'transactions-'.now()->format('Ymd-His').'.csv';

        return new StreamedResponse(function () use ($query): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            fputcsv($handle, [
                'id', 'provider_id', 'status', 'flow', 'stuck',
                'from_currency', 'to_currency',
                'amount_send', 'amount_receive',
                'payin_address', 'payout_address',
                'partner_fee', 'partner_fee_currency',
                'email', 'country', 'created_at',
            ]);

            $query
                ->with('user:id,email')
                ->orderByDesc('id')
                ->limit(self::EXPORT_LIMIT)
                ->chunk(500, function ($rows) use ($handle): void {
                    foreach ($rows as $tx) {
                        /** @var Transaction $tx */
                        fputcsv($handle, [
                            $tx->id,
                            $tx->provider_id,
                            $tx->status,
                            $tx->flow,
                            $tx->stuck_flagged ? 'yes' : 'no',
                            $tx->from_currency,
                            $tx->to_currency,
                            (string) $tx->amount_send,
                            (string) $tx->amount_receive,
                            $tx->payin_address,
                            $tx->payout_address,
                            (string) $tx->partner_fee,
                            $tx->partner_fee_currency,
                            $tx->user?->email,
                            $tx->country,
                            $tx->created_at?->toIso8601String(),
                        ]);
                    }
                });

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    private function renderList(Request $request, bool $stuckOnly): Response
    {
        $filters = $this->filters($request, $stuckOnly);

        $paginator = $this->buildQuery($request, $stuckOnly)
            ->with('user:id,email')
            ->latest()
            ->paginate(25)
            ->withQueryString();

        $paginator->getCollection()->transform(fn (Transaction $tx) => [
            'id' => $tx->id,
            'provider_id' => $tx->provider_id,
            'from_currency' => $tx->from_currency,
            'to_currency' => $tx->to_currency,
            'from_network' => $tx->from_network,
            'to_network' => $tx->to_network,
            'amount_send' => (float) $tx->amount_send,
            'amount_receive' => (float) $tx->amount_receive,
            'flow' => $tx->flow,
            'status' => $tx->status,
            'stuck_flagged' => (bool) $tx->stuck_flagged,
            'email' => $tx->user?->email,
            'country' => $tx->country,
            'created_at' => $tx->created_at?->toIso8601String(),
        ]);

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $paginator,
            'filters' => $filters,
            'stuck_only' => $stuckOnly,
            'statuses' => $this->statusList(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function filters(Request $request, bool $stuckOnly): array
    {
        return [
            'q' => (string) $request->string('q'),
            'status' => (string) $request->string('status'),
            'from' => (string) $request->string('from'),
            'to' => (string) $request->string('to'),
            'flow' => (string) $request->string('flow'),
            'date_from' => (string) $request->string('date_from'),
            'date_to' => (string) $request->string('date_to'),
            'stuck' => $stuckOnly,
        ];
    }

    /**
     * @return Builder<Transaction>
     */
    private function buildQuery(Request $request, bool $stuckOnly): Builder
    {
        $q = Transaction::query();

        if ($stuckOnly) {
            $q->where('stuck_flagged', true)
                ->whereNotIn('status', Transaction::TERMINAL_STATUSES);
        }

        $needle = trim((string) $request->string('q'));
        if ($needle !== '') {
            $like = '%'.$needle.'%';
            $q->where(function (Builder $b) use ($like): void {
                $b->where('provider_id', 'like', $like)
                    ->orWhere('payin_address', 'like', $like)
                    ->orWhere('payout_address', 'like', $like)
                    ->orWhereHas('user', function (Builder $u) use ($like): void {
                        $u->where('email', 'like', $like);
                    });
            });
        }

        if (($status = (string) $request->string('status')) !== '') {
            $q->where('status', $status);
        }
        if (($from = (string) $request->string('from')) !== '') {
            $q->where('from_currency', strtolower($from));
        }
        if (($to = (string) $request->string('to')) !== '') {
            $q->where('to_currency', strtolower($to));
        }
        if (($flow = (string) $request->string('flow')) !== '') {
            $q->where('flow', $flow);
        }
        if (($df = (string) $request->string('date_from')) !== '') {
            try {
                $q->where('created_at', '>=', Carbon::parse($df)->startOfDay());
            } catch (\Throwable) {
                // ignore
            }
        }
        if (($dt = (string) $request->string('date_to')) !== '') {
            try {
                $q->where('created_at', '<=', Carbon::parse($dt)->endOfDay());
            } catch (\Throwable) {
                // ignore
            }
        }

        return $q;
    }

    /**
     * @return array<int, string>
     */
    private function statusList(): array
    {
        return [
            Transaction::STATUS_NEW,
            Transaction::STATUS_WAITING,
            Transaction::STATUS_CONFIRMING,
            Transaction::STATUS_EXCHANGING,
            Transaction::STATUS_SENDING,
            Transaction::STATUS_FINISHED,
            Transaction::STATUS_FAILED,
            Transaction::STATUS_REFUNDED,
            Transaction::STATUS_EXPIRED,
            Transaction::STATUS_VERIFYING,
        ];
    }

    private function authorizePermission(string $permission): void
    {
        $admin = auth('admin')->user();
        if ($admin === null || ! method_exists($admin, 'can') || ! $admin->can($permission)) {
            abort(403);
        }
    }
}
