<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Campaign extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_QUEUED = 'queued';

    public const STATUS_SENDING = 'sending';

    public const STATUS_SENT = 'sent';

    public const STATUS_FAILED = 'failed';

    public const AUDIENCE_ALL = 'all';

    public const AUDIENCE_OPT_IN = 'marketing_opt_in';

    public const AUDIENCE_CUSTOMERS_WITH_SWAPS = 'customers_with_swaps';

    protected $fillable = [
        'name', 'subject', 'body', 'audience', 'status',
        'recipients_total', 'recipients_sent',
        'scheduled_at', 'sent_at', 'created_by',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }
}
