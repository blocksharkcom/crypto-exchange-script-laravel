<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Transaction;
use Carbon\CarbonImmutable;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = CarbonImmutable::now();
        $last24 = $now->subHours(24);
        $prev24 = $now->subHours(48);
        $start14d = $now->subDays(13)->startOfDay();

        $current = $this->kpiWindow($last24, $now);
        $previous = $this->kpiWindow($prev24, $last24);

        $stuckCount = (int) Transaction::query()
            ->where('stuck_flagged', true)
            ->whereNotIn('status', Transaction::TERMINAL_STATUSES)
            ->count();

        $openTickets = (int) Ticket::query()
            ->whereIn('status', [Ticket::STATUS_OPEN, Ticket::STATUS_PENDING])
            ->count();

        return Inertia::render('Admin/Dashboard', [
            'kpi' => [
                'current' => $current,
                'previous' => $previous,
                'stuck_count' => $stuckCount,
                'open_tickets' => $openTickets,
            ],
            'series' => $this->dailySeries($start14d, $now),
            'recent_transactions' => Transaction::query()
                ->latest()
                ->limit(20)
                ->get()
                ->map(fn (Transaction $tx): array => $this->serializeTransactionRow($tx))
                ->all(),
            'stuck_top' => Transaction::query()
                ->where('stuck_flagged', true)
                ->whereNotIn('status', Transaction::TERMINAL_STATUSES)
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (Transaction $tx): array => $this->serializeTransactionRow($tx))
                ->all(),
            'tickets_top' => Ticket::query()
                ->with(['user:id,email'])
                ->whereIn('status', [Ticket::STATUS_OPEN, Ticket::STATUS_PENDING])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (Ticket $t): array => [
                    'id' => $t->id,
                    'subject' => $t->subject,
                    'email' => $t->email,
                    'status' => $t->status,
                    'priority' => $t->priority,
                    'created_at' => $t->created_at?->toIso8601String(),
                ])
                ->all(),
        ]);
    }

    /**
     * @return array{count:int, finished:int, volume:array<string,float>, fees:array<string,float>}
     */
    private function kpiWindow(CarbonImmutable $from, CarbonImmutable $to): array
    {
        $base = Transaction::query()
            ->whereBetween('created_at', [$from, $to]);

        $count = (int) (clone $base)->count();
        $finished = (int) (clone $base)->where('status', Transaction::STATUS_FINISHED)->count();

        /** @var array<int, object{from_currency:string, total:string}> $volumeRows */
        $volumeRows = (clone $base)
            ->selectRaw('from_currency, SUM(amount_send) as total')
            ->groupBy('from_currency')
            ->get()
            ->all();

        $volume = [];
        foreach ($volumeRows as $row) {
            $volume[strtoupper((string) $row->from_currency)] = (float) $row->total;
        }

        /** @var array<int, object{partner_fee_currency:?string, total:string}> $feeRows */
        $feeRows = (clone $base)
            ->whereNotNull('partner_fee_currency')
            ->selectRaw('partner_fee_currency, SUM(partner_fee) as total')
            ->groupBy('partner_fee_currency')
            ->get()
            ->all();

        $fees = [];
        foreach ($feeRows as $row) {
            if ($row->partner_fee_currency === null) {
                continue;
            }
            $fees[strtoupper((string) $row->partner_fee_currency)] = (float) $row->total;
        }

        return [
            'count' => $count,
            'finished' => $finished,
            'volume' => $volume,
            'fees' => $fees,
        ];
    }

    /**
     * @return array{labels:array<int,string>, swaps:array<int,int>, volume:array<int,float>}
     */
    private function dailySeries(CarbonImmutable $from, CarbonImmutable $to): array
    {
        $rows = Transaction::query()
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
    private function serializeTransactionRow(Transaction $tx): array
    {
        return [
            'id' => $tx->id,
            'provider_id' => $tx->provider_id,
            'from_currency' => $tx->from_currency,
            'to_currency' => $tx->to_currency,
            'amount_send' => (float) $tx->amount_send,
            'amount_receive' => (float) $tx->amount_receive,
            'status' => $tx->status,
            'stuck_flagged' => (bool) $tx->stuck_flagged,
            'created_at' => $tx->created_at?->toIso8601String(),
        ];
    }
}
