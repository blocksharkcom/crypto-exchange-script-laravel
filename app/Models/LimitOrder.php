<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Customer-configured "swap when rate hits target" order.
 *
 * @property int $id
 * @property int $user_id
 * @property string $from_currency
 * @property string $to_currency
 * @property string|null $from_network
 * @property string|null $to_network
 * @property string $amount_send
 * @property string $target_rate
 * @property string $address
 * @property string|null $refund_address
 * @property string|null $extra_id
 * @property string $status
 * @property Carbon|null $expires_at
 * @property Carbon|null $last_polled_at
 * @property string|null $last_quoted_rate
 * @property Carbon|null $last_quoted_at
 * @property int|null $filled_transaction_id
 */
class LimitOrder extends Model implements AuditableContract
{
    use Auditable;

    public const STATUS_OPEN = 'open';

    public const STATUS_FILLED = 'filled';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_FAILED = 'failed';

    public const TERMINAL_STATUSES = [
        self::STATUS_FILLED, self::STATUS_CANCELLED, self::STATUS_EXPIRED, self::STATUS_FAILED,
    ];

    protected $fillable = [
        'user_id',
        'from_currency', 'to_currency', 'from_network', 'to_network',
        'amount_send', 'target_rate',
        'address', 'refund_address', 'extra_id',
        'status', 'expires_at',
        'last_polled_at', 'last_quoted_rate', 'last_quoted_at',
        'filled_transaction_id',
        'ip', 'user_agent',
    ];

    protected $casts = [
        'amount_send' => 'decimal:12',
        'target_rate' => 'decimal:12',
        'last_quoted_rate' => 'decimal:12',
        'expires_at' => 'datetime',
        'last_polled_at' => 'datetime',
        'last_quoted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function filledTransaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'filled_transaction_id');
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, self::TERMINAL_STATUSES, true);
    }
}
