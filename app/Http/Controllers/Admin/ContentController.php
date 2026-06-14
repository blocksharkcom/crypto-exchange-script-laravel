<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ContentUpdateRequest;
use App\Support\Content;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContentController extends Controller
{
    public function index(): Response
    {
        $sections = array_map(
            static fn (string $key): array => ['key' => $key],
            Content::KEYS,
        );

        return Inertia::render('Admin/Content/Index', [
            'sections' => $sections,
        ]);
    }

    public function edit(string $key): Response
    {
        if (! in_array($key, Content::KEYS, true)) {
            abort(404);
        }

        $defaults = Content::defaults($key);

        $data = [];
        foreach (Content::LOCALES as $locale) {
            $row = Content::get($key, $locale, []);
            $data[$locale] = $row !== [] ? $row : $defaults;
        }

        return Inertia::render('Admin/Content/Edit', [
            'sectionKey' => $key,
            'locales' => Content::LOCALES,
            'data' => $data,
            'defaults' => $defaults,
        ]);
    }

    public function update(ContentUpdateRequest $request, string $key): RedirectResponse
    {
        if (! in_array($key, Content::KEYS, true)) {
            abort(404);
        }

        /** @var array{locale: string, data: array<string, mixed>} $payload */
        $payload = $request->validated();

        Content::set($key, $payload['locale'], $payload['data']);

        return back()->with('success', trans('site.admin.content.saved'));
    }
}
