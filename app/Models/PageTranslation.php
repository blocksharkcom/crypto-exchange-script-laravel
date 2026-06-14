<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageTranslation extends Model
{
    protected $fillable = [
        'page_id', 'locale', 'title', 'excerpt', 'body',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }
}
