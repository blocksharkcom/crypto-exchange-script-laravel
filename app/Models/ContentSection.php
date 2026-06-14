<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentSection extends Model
{
    protected $fillable = [
        'key',
        'locale',
        'data',
        'updated_by',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function editor(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'updated_by');
    }
}
