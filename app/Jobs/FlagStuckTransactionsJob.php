<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

/**
 * Periodic sweep that flags non-terminal transactions exceeding the
 * configured stuck thresholds (one for "waiting", one for "confirming").
 */
final class FlagStuckTransactionsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 120;

    public function __construct()
    {
        $this->onQueue('default');
    }

    /**
     * Run the sweep as a single instance via a Redis mutex.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [
            (new WithoutOverlapping('stuck-flagger'))
                ->releaseAfter(300)
                ->expireAfter(600),
        ];
    }

    public function handle(): void
    {
        $waitingMinutes = (int) config('swapforge.tx_stuck.waiting_minutes', 180);
        $confirmingMinutes = (int) config('swapforge.tx_stuck.confirming_minutes', 360);

        DB::transaction(function () use ($waitingMinutes, $confirmingMinutes): void {
            Transaction::query()
                ->whereNotIn('status', Transaction::TERMINAL_STATUSES)
                ->where('stuck_flagged', false)
                ->where(function ($q) use ($waitingMinutes, $confirmingMinutes): void {
                    $q->where(function ($q2) use ($waitingMinutes): void {
                        $q2->where('status', Transaction::STATUS_WAITING)
                            ->where('created_at', '<=', now()->subMinutes($waitingMinutes));
                    })->orWhere(function ($q2) use ($confirmingMinutes): void {
                        $q2->where('status', Transaction::STATUS_CONFIRMING)
                            ->where('created_at', '<=', now()->subMinutes($confirmingMinutes));
                    });
                })
                ->update(['stuck_flagged' => true, 'updated_at' => now()]);
        });
    }
}
