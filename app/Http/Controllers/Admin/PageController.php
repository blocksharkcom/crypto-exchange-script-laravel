<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PageRequest;
use App\Models\Page;
use App\Models\PageTranslation;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /** @return array<int, string> */
    private function locales(): array
    {
        return (array) config('swapforge.languages', ['en']);
    }

    public function index(): Response
    {
        $pages = Page::query()
            ->with('translations:id,page_id,locale')
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get()
            ->map(fn (Page $p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'title' => $p->title,
                'excerpt' => $p->excerpt,
                'status' => $p->status,
                'show_in_header' => $p->show_in_header,
                'show_in_footer' => $p->show_in_footer,
                'sort_order' => $p->sort_order,
                'updated_at' => $p->updated_at?->toIso8601String(),
                'translation_locales' => $p->translations->pluck('locale')->all(),
            ])
            ->all();

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages,
            'locales' => $this->locales(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Pages/Edit', [
            'page' => null,
            'locales' => $this->locales(),
            'translations' => [],
        ]);
    }

    public function store(PageRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $translations = (array) $request->input('translations', []);

        $page = Page::create([
            'slug' => $data['slug'],
            'title' => $data['title'],
            'excerpt' => $data['excerpt'] ?? null,
            'body' => $data['body'],
            'status' => $data['status'],
            'show_in_header' => (bool) ($data['show_in_header'] ?? false),
            'show_in_footer' => (bool) ($data['show_in_footer'] ?? false),
            'sort_order' => (int) ($data['sort_order'] ?? 0),
            'updated_by' => auth('admin')->id(),
        ]);

        $this->syncTranslations($page, $translations);

        return redirect()
            ->route('admin.pages.edit', $page)
            ->with('success', trans('site.admin.pages.created'));
    }

    public function edit(Page $page): Response
    {
        $page->load('translations');

        $translations = [];
        foreach ($this->locales() as $loc) {
            $t = $page->translations->firstWhere('locale', $loc);
            $defaultLoc = (string) config('app.locale', 'en');
            $translations[$loc] = [
                'title' => $t?->title ?? ($loc === $defaultLoc ? $page->title : ''),
                'excerpt' => $t?->excerpt ?? null,
                'body' => $t?->body ?? ($loc === $defaultLoc ? $page->body : ''),
            ];
        }

        return Inertia::render('Admin/Pages/Edit', [
            'page' => [
                'id' => $page->id,
                'slug' => $page->slug,
                'title' => $page->title,
                'excerpt' => $page->excerpt,
                'body' => $page->body,
                'status' => $page->status,
                'show_in_header' => $page->show_in_header,
                'show_in_footer' => $page->show_in_footer,
                'sort_order' => $page->sort_order,
                'public_url' => $page->status === Page::STATUS_PUBLISHED ? url("/p/{$page->slug}") : null,
            ],
            'locales' => $this->locales(),
            'translations' => $translations,
        ]);
    }

    public function update(PageRequest $request, Page $page): RedirectResponse
    {
        $data = $request->validated();
        $translations = (array) $request->input('translations', []);

        $page->update([
            'slug' => $data['slug'],
            'title' => $data['title'],
            'excerpt' => $data['excerpt'] ?? null,
            'body' => $data['body'],
            'status' => $data['status'],
            'show_in_header' => (bool) ($data['show_in_header'] ?? false),
            'show_in_footer' => (bool) ($data['show_in_footer'] ?? false),
            'sort_order' => (int) ($data['sort_order'] ?? 0),
            'updated_by' => auth('admin')->id(),
        ]);

        $this->syncTranslations($page, $translations);

        return back()->with('success', trans('site.admin.pages.saved'));
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        return redirect()->route('admin.pages.index')->with('success', trans('site.admin.pages.deleted'));
    }

    /** @param array<string, array<string, mixed>> $translations */
    private function syncTranslations(Page $page, array $translations): void
    {
        foreach ($translations as $locale => $row) {
            if (! in_array($locale, $this->locales(), true)) {
                continue;
            }
            $title = trim((string) ($row['title'] ?? ''));
            $body = (string) ($row['body'] ?? '');

            if ($title === '' && $body === '') {
                PageTranslation::query()
                    ->where(['page_id' => $page->id, 'locale' => $locale])
                    ->delete();

                continue;
            }

            PageTranslation::updateOrCreate(
                ['page_id' => $page->id, 'locale' => $locale],
                [
                    'title' => $title,
                    'excerpt' => $row['excerpt'] ?? null,
                    'body' => $body,
                ],
            );
        }
    }
}
