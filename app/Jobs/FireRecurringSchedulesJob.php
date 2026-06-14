<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ApiLog;
use App\Services\Exchange\RecurringScheduleService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;

/**
 * Fires every DCA schedule whose next_run_at has arrived.
 */
final class FireRecurringSchedulesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 180;

    public function __construct()
    {
        $this->onQueue('default');
    }

    /** @return array<int, object> */
    public function middleware(): array
    {
        return [
            (new WithoutOverlapping('recurring-runner'))
                ->releaseAfter(120)
                ->expireAfter(300),
        ];
    }

    public function handle(RecurringScheduleService $svc): void
    {
        $started = microtime(true);
        $fired = 0;

        try {
            $fired = $svc->runDue();
        } catch (\Throwable $e) {
            report($e);
        }

        $this->log($started, $fired);
    }

    private function log(float $started, int $fired): void
    {
        try {
            ApiLog::create([
                'endpoint' => '/internal/recurring.run',
                'method' => 'JOB',
                'ip' => null,
                'duration_ms' => (int) round((microtime(true) - $started) * 1000),
                'status_code' => 200,
                'error' => $fired > 0 ? "fired={$fired}" : null,
                'created_at' => now(),
            ]);
        } catch (\Throwable) {
            // never block on logging failure
        }
    }
}
