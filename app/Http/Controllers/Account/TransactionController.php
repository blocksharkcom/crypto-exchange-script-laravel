<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user('web');

        $filters = [
            'q' => (string) $request->string('q'),
            'status' => (string) $request->string('status'),
            'date_from' => (string) $request->string('date_from'),
            'date_to' => (string) $request->string('date_to'),
        ];

        $query = $this->buildQuery($user->id, $request);

        $paginator = $query
            ->latest()
            ->paginate(25)
            ->withQueryString();

        $paginator->getCollection()->transform(fn (Transaction $tx) => [
            'id' => $tx->id,
            'provider_id' => $tx->provider_id,
            'from_currency' => $tx->from_currency,
            'to_currency' => $tx->to_currency,
            'amount_send' => (float) $tx->amount_send,
            'amount_receive' => (float) $tx->amount_receive,
            'flow' => $tx->flow,
            'status' => $tx->status,
            'created_at' => $tx->created_at?->toIso8601String(),
        ]);

        return Inertia::render('Account/Transactions', [
            'transactions' => $paginator,
            'filters' => $filters,
            'statuses' => [
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
            ],
        ]);
    }

    /**
     * @return Builder<Transaction>
     */
    private function buildQuery(int $userId, Request $request): Builder
    {
        $q = Transaction::query()->where('user_id', $userId);

        $needle = trim((string) $request->string('q'));
        if ($needle !== '') {
            $like = '%'.$needle.'%';
            $q->where('provider_id', 'like', $like);
        }

        if (($status = (string) $request->string('status')) !== '') {
            $q->where('status', $status);
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
}
