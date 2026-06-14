<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user('web');

        $base = Transaction::query()->where('user_id', $user->id);

        $totalSwaps = (int) (clone $base)->count();
        $finished = (int) (clone $base)->where('status', Transaction::STATUS_FINISHED)->count();

        /** @var array<int, object{from_currency:string, total:string}> $volumeRows */
        $volumeRows = (clone $base)
            ->selectRaw('from_currency, SUM(amount_send) as total')
            ->groupBy('from_currency')
            ->orderByDesc('total')
            ->get()
            ->all();

        $volume = [];
        foreach ($volumeRows as $row) {
            $volume[strtoupper((string) $row->from_currency)] = (float) $row->total;
        }

        /** @var array<int, object{fee_currency:?string, total:string}> $feeRows */
        $feeRows = (clone $base)
            ->whereNotNull('fee_currency')
            ->selectRaw('fee_currency, SUM(fee_amount) as total')
            ->groupBy('fee_currency')
            ->orderByDesc('total')
            ->get()
            ->all();

        $fees = [];
        foreach ($feeRows as $row) {
            if ($row->fee_currency === null) {
                continue;
            }
            $fees[strtoupper((string) $row->fee_currency)] = (float) $row->total;
        }

        /** @var object{from_currency:string,to_currency:string,c:int}|null $favRow */
        $favRow = (clone $base)
            ->selectRaw('from_currency, to_currency, COUNT(*) as c')
            ->groupBy('from_currency', 'to_currency')
            ->orderByDesc('c')
            ->first();

        $favorite = $favRow === null
            ? null
            : strtoupper((string) $favRow->from_currency).' → '.strtoupper((string) $favRow->to_currency);

        $now = CarbonImmutable::now();
        $start14d = $now->subDays(13)->startOfDay();

        $series = $this->dailySeries($user->id, $start14d, $now);

        $recent = Transaction::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Transaction $tx): array => $this->serializeRow($tx))
            ->all();

        return Inertia::render('Account/Dashboard', [
            'kpi' => [
                'total_swaps' => $totalSwaps,
                'finished' => $finished,
                'volume_top' => array_slice($volume, 0, 3, true),
                'fees_top' => array_slice($fees, 0, 3, true),
                'favorite_pair' => $favorite,
                'since' => $user->created_at?->toIso8601String(),
            ],
            'series' => $series,
            'recent_transactions' => $recent,
        ]);
    }

    /**
     * @return array{labels:array<int,string>, swaps:array<int,int>, volume:array<int,float>}
     */
    private function dailySeries(int $userId, CarbonImmutable $from, CarbonImmutable $to): array
    {
        $rows = Transaction::query()
            ->where('user_id', $userId)
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as d, COUNT(*) as c, SUM(amount_send) as v')
            ->groupBy('d')
            ->orderBy('d')
            ->get()
            ->keyBy('d');

        $labels = [];
        $swaps = [];
        $volume = [];

        $cursor = $from->startOfDay();
        $end = $to->startOfDay();

        while ($cursor->lessThanOrEqualTo($end)) {
            $key = $cursor->toDateString();
            $labels[] = $cursor->format('M j');
            $row = $rows->get($key);
            $swaps[] = $row !== null ? (int) $row->c : 0;
            $volume[] = $row !== null ? (float) $row->v : 0.0;
            $cursor = $cursor->addDay();
        }

        return [
            'labels' => $labels,
            'swaps' => $swaps,
            'volume' => $volume,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRow(Transaction $tx): array
    {
        return [
            'id' => $tx->id,
            'provider_id' => $tx->provider_id,
            'from_currency' => $tx->from_currency,
            'to_currency' => $tx->to_currency,
            'amount_send' => (float) $tx->amount_send,
            'amount_receive' => (float) $tx->amount_receive,
            'status' => $tx->status,
            'created_at' => $tx->created_at?->toIso8601String(),
        ];
    }
}
