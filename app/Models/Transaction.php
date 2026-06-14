<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Transaction extends Model implements AuditableContract
{
    use Auditable;

    public const STATUS_NEW = 'new';

    public const STATUS_WAITING = 'waiting';

    public const STATUS_CONFIRMING = 'confirming';

    public const STATUS_EXCHANGING = 'exchanging';

    public const STATUS_SENDING = 'sending';

    public const STATUS_FINISHED = 'finished';

    public const STATUS_FAILED = 'failed';

    public const STATUS_REFUNDED = 'refunded';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_VERIFYING = 'verifying';

    public const TERMINAL_STATUSES = [
        self::STATUS_FINISHED, self::STATUS_FAILED, self::STATUS_REFUNDED, self::STATUS_EXPIRED,
    ];

    protected $fillable = [
        'provider_id', 'user_id',
        'from_currency', 'to_currency', 'from_network', 'to_network',
        'amount_send', 'amount_receive',
        'payin_address', 'payout_address', 'refund_address',
        'payin_extra_id', 'payout_extra_id',
        'flow', 'rate_id', 'valid_until',
        'status', 'stuck_flagged', 'finished_at',
        'fee_amount', 'fee_currency', 'partner_fee', 'partner_fee_currency',
        'payin_hash', 'payout_hash',
        'ip', 'country', 'user_agent', 'source', 'promo_code', 'meta',
        'origin_type', 'origin_id',
    ];

    protected $casts = [
        'amount_send' => 'decimal:12',
        'amount_receive' => 'decimal:12',
        'fee_amount' => 'decimal:12',
        'partner_fee' => 'decimal:12',
        'stuck_flagged' => 'bool',
        'valid_until' => 'datetime',
        'finished_at' => 'datetime',
        'meta' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, self::TERMINAL_STATUSES, true);
    }

    protected function pair(): Attribute
    {
        return Attribute::get(fn () => strtoupper($this->from_currency.'/'.$this->to_currency));
    }
}
