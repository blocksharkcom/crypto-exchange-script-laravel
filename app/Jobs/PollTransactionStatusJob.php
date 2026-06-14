<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Transaction;
use App\Services\Exchange\ExchangeService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Polls upstream provider for the latest status of a single transaction
 * and persists changes. Skipped if the transaction is already terminal.
 */
final class PollTransactionStatusJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 30;

    public function __construct(public Transaction $tx)
    {
        $this->onQueue('exchange-polling');
    }

    public function handle(ExchangeService $exchange): void
    {
        $fresh = $this->tx->fresh();

        if ($fresh === null || $fresh->isTerminal()) {
            return;
        }

        $exchange->syncStatus($fresh);
    }

    /**
     * Exponential-ish 30s backoff between retries.
     *
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [30, 30, 30];
    }

    public function failed(\Throwable $e): void
    {
        // Failed jobs are tracked by Horizon; nothing else to do here.
    }
}
