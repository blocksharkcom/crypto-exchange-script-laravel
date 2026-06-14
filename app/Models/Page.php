<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Page extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_PUBLISHED = 'published';

    protected $fillable = [
        'slug', 'title', 'excerpt', 'body', 'status',
        'show_in_header', 'show_in_footer', 'sort_order', 'updated_by',
    ];

    protected $casts = [
        'show_in_header' => 'bool',
        'show_in_footer' => 'bool',
    ];

    public function editor(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'updated_by');
    }

    public function translations(): HasMany
    {
        return $this->hasMany(PageTranslation::class);
    }

    /**
     * Pick a translation for the requested locale, falling back to the default
     * locale, then to any translation, then to the legacy `title`/`body` columns
     * on the page itself.
     */
    public function translated(string $locale): PageTranslation
    {
        $rows = $this->translations;
        $hit = $rows->firstWhere('locale', $locale)
            ?? $rows->firstWhere('locale', (string) config('app.locale', 'en'))
            ?? $rows->first();

        if ($hit !== null) {
            return $hit;
        }

        // Synthesise a translation from the legacy columns so older pages still render.
        return new PageTranslation([
            'page_id' => $this->id,
            'locale' => (string) config('app.locale', 'en'),
            'title' => (string) $this->title,
            'excerpt' => $this->excerpt,
            'body' => (string) $this->body,
        ]);
    }
}
