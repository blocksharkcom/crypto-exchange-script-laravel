<?php

declare(strict_types=1);

namespace App\Services\Exchange;

use App\Mail\RecurringRunMail;
use App\Models\RecurringSchedule;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

final class RecurringScheduleService
{
    public function __construct(private readonly ExchangeService $exchange) {}

    /**
     * Validate and persist a new recurring schedule for the given user.
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input, Request $request): RecurringSchedule
    {
        $userId = (int) ($input['user_id'] ?? 0);
        if ($userId <= 0) {
            throw new \InvalidArgumentException('user_id is required.');
        }

        $from = strtolower(trim((string) ($input['from'] ?? '')));
        $to = strtolower(trim((string) ($input['to'] ?? '')));
        $amount = (float) ($input['amount'] ?? 0);
        $address = trim((string) ($input['address'] ?? ''));
        $frequency = (string) ($input['frequency'] ?? '');
        $endCondition = (string) ($input['end_condition'] ?? RecurringSchedule::END_NEVER);

        if ($from === '' || $to === '' || $from === $to) {
            throw new \InvalidArgumentException('Invalid currency pair.');
        }
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Amount must be greater than zero.');
        }
        if ($address === '') {
            throw new \InvalidArgumentException('Receive address is required.');
        }
        if (! in_array($frequency, [
            RecurringSchedule::FREQUENCY_DAILY,
            RecurringSchedule::FREQUENCY_WEEKLY,
            RecurringSchedule::FREQUENCY_MONTHLY,
        ], true)) {
            throw new \InvalidArgumentException('Invalid frequency.');
        }
        if (! in_array($endCondition, [
            RecurringSchedule::END_NEVER,
            RecurringSchedule::END_UNTIL_DATE,
            RecurringSchedule::END_AFTER_RUNS,
        ], true)) {
            throw new \InvalidArgumentException('Invalid end condition.');
        }

        $start = isset($input['start_at']) && $input['start_at'] !== ''
            ? Carbon::parse((string) $input['start_at'])
            : Carbon::now();
        if ($start->isPast()) {
            $start = Carbon::now();
        }

        $endAt = null;
        $maxRuns = null;
        if ($endCondition === RecurringSchedule::END_UNTIL_DATE) {
            if (empty($input['end_at'])) {
                throw new \InvalidArgumentException('End date is required.');
            }
            $endAt = Carbon::parse((string) $input['end_at']);
            if ($endAt->lessThanOrEqualTo($start)) {
                throw new \InvalidArgumentException('End date must be after the start.');
            }
        }
        if ($endCondition === RecurringSchedule::END_AFTER_RUNS) {
            $maxRuns = (int) ($input['max_runs'] ?? 0);
            if ($maxRuns <= 0) {
                throw new \InvalidArgumentException('Run count must be greater than zero.');
            }
        }

        return RecurringSchedule::create([
            'user_id' => $userId,
            'from_currency' => $from,
            'to_currency' => $to,
            'from_network' => $input['from_network'] ?? null,
            'to_network' => $input['to_network'] ?? null,
            'amount_send' => $amount,
            'frequency' => $frequency,
            'start_at' => $start,
            'next_run_at' => $start,
            'end_condition' => $endCondition,
            'end_at' => $endAt,
            'max_runs' => $maxRuns,
            'runs_completed' => 0,
            'status' => RecurringSchedule::STATUS_ACTIVE,
            'address' => $address,
            'refund_address' => isset($input['refund_address']) && $input['refund_address'] !== ''
                ? trim((string) $input['refund_address']) : null,
            'extra_id' => isset($input['extra_id']) && $input['extra_id'] !== ''
                ? trim((string) $input['extra_id']) : null,
        ]);
    }

    public function cancel(RecurringSchedule $schedule): void
    {
        if ($schedule->isTerminal()) {
            return;
        }
        $schedule->update(['status' => RecurringSchedule::STATUS_CANCELLED]);
    }

    public function pause(RecurringSchedule $schedule): void
    {
        if ($schedule->status !== RecurringSchedule::STATUS_ACTIVE) {
            return;
        }
        $schedule->update(['status' => RecurringSchedule::STATUS_PAUSED]);
    }

    public function resume(RecurringSchedule $schedule): void
    {
        if ($schedule->status !== RecurringSchedule::STATUS_PAUSED) {
            return;
        }

        $now = Carbon::now();
        $next = $schedule->next_run_at instanceof Carbon && $schedule->next_run_at->greaterThan($now)
            ? $schedule->next_run_at
            : $now;

        $schedule->update([
            'status' => RecurringSchedule::STATUS_ACTIVE,
            'next_run_at' => $next,
        ]);
    }

    /**
     * Find and execute every schedule whose next run is due.
     *
     * Returns the number of swap creations that actually fired.
     */
    public function runDue(): int
    {
        $now = Carbon::now();
        $fired = 0;

        $schedules = RecurringSchedule::query()
            ->where('status', RecurringSchedule::STATUS_ACTIVE)
            ->where('next_run_at', '<=', $now)
            ->orderBy('next_run_at')
            ->limit(100)
            ->get();

        foreach ($schedules as $schedule) {
            if ($this->shouldEnd($schedule, $now)) {
                $schedule->update(['status' => RecurringSchedule::STATUS_COMPLETED]);

                continue;
            }

            $tx = $this->fireOnce($schedule);
            if ($tx === null) {
                // Still bump next_run_at so we don't hot-loop on a broken schedule.
                $schedule->update(['next_run_at' => $schedule->computeNextRun($now)]);

                continue;
            }

            $runs = $schedule->runs_completed + 1;
            $nextRun = $schedule->computeNextRun($now);
            $status = $schedule->status;

            // Decide whether this run finishes the schedule.
            $finish = false;
            if ($schedule->end_condition === RecurringSchedule::END_AFTER_RUNS
                && $schedule->max_runs !== null
                && $runs >= (int) $schedule->max_runs) {
                $finish = true;
            }
            if ($schedule->end_condition === RecurringSchedule::END_UNTIL_DATE
                && $schedule->end_at instanceof Carbon
                && $nextRun->greaterThan($schedule->end_at)) {
                $finish = true;
            }
            if ($finish) {
                $status = RecurringSchedule::STATUS_COMPLETED;
            }

            $schedule->update([
                'runs_completed' => $runs,
                'last_run_at' => $now,
                'last_run_tx_id' => $tx->id,
                'next_run_at' => $nextRun,
                'status' => $status,
            ]);

            $fresh = $schedule->fresh() ?? $schedule;
            $this->safeMail(fn () => Mail::to($this->scheduleEmail($fresh))->send(new RecurringRunMail($fresh, $tx)));

            $fired++;
        }

        return $fired;
    }

    private function shouldEnd(RecurringSchedule $schedule, Carbon $now): bool
    {
        if ($schedule->end_condition === RecurringSchedule::END_AFTER_RUNS
            && $schedule->max_runs !== null
            && $schedule->runs_completed >= (int) $schedule->max_runs) {
            return true;
        }
        if ($schedule->end_condition === RecurringSchedule::END_UNTIL_DATE
            && $schedule->end_at instanceof Carbon
            && $schedule->end_at->lessThanOrEqualTo($now)) {
            return true;
        }

        return false;
    }

    private function fireOnce(RecurringSchedule $schedule): ?Transaction
    {
        $request = request();

        try {
            return $this->exchange->createExchange([
                'from' => $schedule->from_currency,
                'to' => $schedule->to_currency,
                'amount' => (float) $schedule->amount_send,
                'address' => $schedule->address,
                'refund_address' => $schedule->refund_address,
                'extra_id' => $schedule->extra_id,
                'from_network' => $schedule->from_network,
                'to_network' => $schedule->to_network,
                'flow' => 'standard',
                'source' => 'recurring_schedule',
                'user_id' => $schedule->user_id,
                'origin_type' => 'recurring_schedule',
                'origin_id' => $schedule->id,
            ], $request);
        } catch (\Throwable $e) {
            Log::warning('RecurringScheduleService.fireOnce failed', [
                'schedule_id' => $schedule->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function scheduleEmail(RecurringSchedule $schedule): string
    {
        return (string) ($schedule->user?->email ?? '');
    }

    private function safeMail(callable $fn): void
    {
        try {
            $fn();
        } catch (\Throwable $e) {
            Log::warning('RecurringScheduleService: mail dispatch failed', ['error' => $e->getMessage()]);
        }
    }
}
