<?php

declare(strict_types=1);

use App\Jobs\FireRecurringSchedulesJob;
use App\Jobs\FlagStuckTransactionsJob;
use App\Jobs\PollLimitOrdersJob;
use App\Jobs\PollTransactionStatusJob;
use App\Models\ApiLog;
use App\Models\Transaction;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| CrossSwap scheduled tasks
|--------------------------------------------------------------------------
|
| Laravel 12 wires scheduled commands through routes/console.php using the
| Schedule facade. Three recurring tasks are registered:
|
|  1. Every minute  - dispatch a status poll job for each open swap.
|  2. Every 10 min  - sweep for transactions stuck past the configured
|                     threshold and flag them so an admin alert fires.
|  3. Daily         - prune stale api_log rows so the table stays small.
|
*/

Schedule::call(function (): void {
    Transaction::query()
        ->whereNotIn('status', Transaction::TERMINAL_STATUSES)
        ->where('status', '!=', Transaction::STATUS_FINISHED)
        ->orderBy('updated_at')
        ->limit(200)
        ->get()
        ->each(static function (Transaction $tx): void {
            PollTransactionStatusJob::dispatch($tx);
        });
})
    ->name('swapforge:poll-open-transactions')
    ->everyMinute()
    ->withoutOverlapping();

Schedule::job(new FlagStuckTransactionsJob)
    ->name('swapforge:flag-stuck-transactions')
    ->everyTenMinutes()
    ->withoutOverlapping();

Schedule::job(new PollLimitOrdersJob)
    ->name('swapforge:poll-limit-orders')
    ->everyMinute()
    ->withoutOverlapping();

Schedule::job(new FireRecurringSchedulesJob)
    ->name('swapforge:fire-recurring-schedules')
    ->everyFiveMinutes()
    ->withoutOverlapping();

Schedule::call(function (): void {
    ApiLog::query()
        ->where('created_at', '<', now()->subDays(30))
        ->delete();
})
    ->name('swapforge:prune-api-log')
    ->dailyAt('03:15')
    ->withoutOverlapping();
