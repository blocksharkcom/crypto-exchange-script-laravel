<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    public const STATUS_OPEN = 'open';

    public const STATUS_PENDING = 'pending';

    public const STATUS_CLOSED = 'closed';

    protected $fillable = [
        'user_id', 'transaction_id', 'email', 'view_token', 'subject',
        'status', 'priority', 'assigned_to', 'closed_at',
        'user_replied_at', 'admin_replied_at',
    ];

    protected $casts = [
        'closed_at' => 'datetime',
        'user_replied_at' => 'datetime',
        'admin_replied_at' => 'datetime',
    ];

    public function portalUrl(): string
    {
        return url("/help/ticket/{$this->id}/{$this->view_token}");
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'assigned_to');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }
}
