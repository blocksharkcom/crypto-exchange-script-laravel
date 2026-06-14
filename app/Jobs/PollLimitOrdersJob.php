<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ApiLog;
use App\Models\LimitOrder;
use App\Services\Exchange\LimitOrderService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;

/**
 * Re-quotes every open, non-expired limit order in small batches and fills any
 * order whose target has been reached. Also marks past-expiry orders as expired.
 */
final class PollLimitOrdersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 120;

    public function __construct()
    {
        $this->onQueue('default');
    }

    /** @return array<int, object> */
    public function middleware(): array
    {
        return [
            (new WithoutOverlapping('limit-poller'))
                ->releaseAfter(60)
                ->expireAfter(180),
        ];
    }

    public function handle(LimitOrderService $svc): void
    {
        $started = microtime(true);
        $expired = $svc->expireOverdue();

        LimitOrder::query()
            ->where('status', LimitOrder::STATUS_OPEN)
            ->where(function ($q): void {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            })
            ->orderBy('last_polled_at')
            ->limit(50)
            ->get()
            ->each(function (LimitOrder $order) use ($svc): void {
                try {
                    $svc->poll($order);
                } catch (\Throwable $e) {
                    // Never let one bad order crash the batch.
                    report($e);
                }
            });

        $this->log($started, $expired);
    }

    private function log(float $started, int $expired): void
    {
        try {
            ApiLog::create([
                'endpoint' => '/internal/limit-orders.poll',
                'method' => 'JOB',
                'ip' => null,
                'duration_ms' => (int) round((microtime(true) - $started) * 1000),
                'status_code' => 200,
                'error' => $expired > 0 ? "expired={$expired}" : null,
                'created_at' => now(),
            ]);
        } catch (\Throwable) {
            // never block on logging failure
        }
    }
}
