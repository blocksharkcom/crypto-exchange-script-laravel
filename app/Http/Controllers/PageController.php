<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function show(string $slug): Response
    {
        $page = Page::query()
            ->with('translations')
            ->where('slug', $slug)
            ->where('status', Page::STATUS_PUBLISHED)
            ->firstOrFail();

        $tr = $page->translated((string) app()->getLocale());

        return Inertia::render('PageView', [
            'page' => [
                'slug' => $page->slug,
                'title' => $tr->title,
                'excerpt' => $tr->excerpt,
                'body' => $tr->body,
                'locale' => $tr->locale,
                'updated_at' => $page->updated_at?->toIso8601String(),
            ],
        ]);
    }
}
