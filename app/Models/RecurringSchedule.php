<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * DCA-style recurring swap schedule.
 *
 * @property int $id
 * @property int $user_id
 * @property string $from_currency
 * @property string $to_currency
 * @property string|null $from_network
 * @property string|null $to_network
 * @property string $amount_send
 * @property string $frequency
 * @property Carbon $start_at
 * @property Carbon $next_run_at
 * @property string $end_condition
 * @property Carbon|null $end_at
 * @property int|null $max_runs
 * @property int $runs_completed
 * @property string $status
 * @property string $address
 * @property string|null $refund_address
 * @property string|null $extra_id
 * @property Carbon|null $last_run_at
 * @property int|null $last_run_tx_id
 */
class RecurringSchedule extends Model implements AuditableContract
{
    use Auditable;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_PAUSED = 'paused';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    public const FREQUENCY_DAILY = 'daily';

    public const FREQUENCY_WEEKLY = 'weekly';

    public const FREQUENCY_MONTHLY = 'monthly';

    public const END_NEVER = 'never';

    public const END_UNTIL_DATE = 'until_date';

    public const END_AFTER_RUNS = 'after_runs';

    protected $fillable = [
        'user_id',
        'from_currency', 'to_currency', 'from_network', 'to_network',
        'amount_send',
        'frequency',
        'start_at', 'next_run_at',
        'end_condition', 'end_at', 'max_runs', 'runs_completed',
        'status',
        'address', 'refund_address', 'extra_id',
        'last_run_at', 'last_run_tx_id',
    ];

    protected $casts = [
        'amount_send' => 'decimal:12',
        'start_at' => 'datetime',
        'next_run_at' => 'datetime',
        'end_at' => 'datetime',
        'last_run_at' => 'datetime',
        'max_runs' => 'integer',
        'runs_completed' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Transactions spawned by this schedule (linked via origin_type/origin_id).
     *
     * @return HasMany<Transaction>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'origin_id')
            ->where('origin_type', 'recurring_schedule');
    }

    public function lastRunTransaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'last_run_tx_id');
    }

    /**
     * Compute the next run timestamp for this schedule, based on its frequency.
     */
    public function computeNextRun(Carbon $from): Carbon
    {
        return match ($this->frequency) {
            self::FREQUENCY_DAILY => $from->copy()->addDay(),
            self::FREQUENCY_WEEKLY => $from->copy()->addWeek(),
            self::FREQUENCY_MONTHLY => $from->copy()->addMonthNoOverflow(),
            default => $from->copy()->addDay(),
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_CANCELLED], true);
    }
}
