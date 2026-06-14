<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HelpController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Help/Index', [
            'categories' => $this->loadCategories(),
            'popular' => $this->loadPopularArticles(),
            'search' => (string) $request->string('q'),
            'results' => $this->searchArticles((string) $request->string('q')),
        ]);
    }

    public function category(string $slug): Response
    {
        $categories = $this->loadCategories();
        $category = collect($categories)->firstWhere('slug', $slug);
        abort_unless($category, 404);

        return Inertia::render('Help/Category', [
            'category' => $category,
            'articles' => $this->loadArticlesForCategory($slug),
        ]);
    }

    public function article(string $slug): Response
    {
        $articles = (array) trans('help_articles.articles');
        abort_unless(isset($articles[$slug]), 404);
        $raw = $articles[$slug];

        $categories = $this->loadCategories();
        $category = collect($categories)->firstWhere('slug', $raw['category']);

        return Inertia::render('Help/Article', [
            'article' => [
                'slug' => $slug,
                'title' => $raw['title'],
                'summary' => $raw['summary'],
                'body' => $raw['body'],
                'category' => $category,
            ],
            'related' => $this->loadRelatedArticles($raw['category'], $slug, 4),
        ]);
    }

    /** @return array<int, array<string, mixed>> */
    private function loadCategories(): array
    {
        $cats = (array) trans('help_articles.categories');
        $articles = (array) trans('help_articles.articles');

        return collect($cats)->map(function (array $c, string $slug) use ($articles): array {
            $count = collect($articles)->where('category', $slug)->count();

            return [
                'slug' => $slug,
                'title' => $c['title'],
                'desc' => $c['desc'],
                'icon' => $c['icon'] ?? 'help',
                'count' => $count,
            ];
        })->values()->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function loadArticlesForCategory(string $categorySlug): array
    {
        $articles = (array) trans('help_articles.articles');

        return collect($articles)
            ->filter(fn (array $a) => ($a['category'] ?? null) === $categorySlug)
            ->map(fn (array $a, string $slug) => [
                'slug' => $slug,
                'title' => $a['title'],
                'summary' => $a['summary'],
            ])
            ->values()
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function loadPopularArticles(): array
    {
        $popular = ['how-crypto-swap-works', 'why-swap-slow', 'floating-vs-fixed', 'wrong-address', 'non-custodial-explained', 'password-reset'];
        $articles = (array) trans('help_articles.articles');

        return collect($popular)
            ->filter(fn (string $slug) => isset($articles[$slug]))
            ->map(fn (string $slug) => [
                'slug' => $slug,
                'title' => $articles[$slug]['title'],
                'summary' => $articles[$slug]['summary'],
                'category' => $articles[$slug]['category'],
            ])
            ->values()
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function loadRelatedArticles(string $categorySlug, string $exceptSlug, int $limit): array
    {
        $articles = (array) trans('help_articles.articles');

        return collect($articles)
            ->filter(fn (array $a, string $slug) => $slug !== $exceptSlug && ($a['category'] ?? null) === $categorySlug)
            ->map(fn (array $a, string $slug) => [
                'slug' => $slug,
                'title' => $a['title'],
                'summary' => $a['summary'],
            ])
            ->take($limit)
            ->values()
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function searchArticles(string $query): array
    {
        $query = trim($query);
        if ($query === '') {
            return [];
        }
        $needle = mb_strtolower($query);
        $articles = (array) trans('help_articles.articles');

        return collect($articles)
            ->filter(function (array $a) use ($needle): bool {
                $haystack = mb_strtolower(($a['title'] ?? '').' '.($a['summary'] ?? '').' '.($a['body'] ?? ''));

                return str_contains($haystack, $needle);
            })
            ->map(fn (array $a, string $slug) => [
                'slug' => $slug,
                'title' => $a['title'],
                'summary' => $a['summary'],
                'category' => $a['category'],
            ])
            ->values()
            ->take(20)
            ->all();
    }

    public function lookup(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:200'],
            'reference' => ['required', 'string', 'max:64'],
        ]);

        $ticket = Ticket::query()
            ->where('email', $data['email'])
            ->where(function ($q) use ($data): void {
                $q->where('id', (int) ltrim($data['reference'], '#'))
                    ->orWhereHas('transaction', fn ($q2) => $q2->where('provider_id', $data['reference']));
            })
            ->latest()
            ->first();

        if (! $ticket || ! $ticket->view_token) {
            return back()
                ->with('error', trans('site.help.lookup.not_found'))
                ->withInput();
        }

        return redirect()->to($ticket->portalUrl());
    }

    public function show(Ticket $ticket, string $token): Response
    {
        abort_if(! hash_equals((string) $ticket->view_token, $token), 404);

        $ticket->load([
            'transaction:id,provider_id,from_currency,to_currency,status',
            'messages' => function ($q): void {
                $q->where('is_internal', false)->orderBy('created_at')->with('admin:id,name');
            },
        ]);

        return Inertia::render('Help/Ticket', [
            'ticket' => [
                'id' => $ticket->id,
                'subject' => $ticket->subject,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'created_at' => $ticket->created_at?->toIso8601String(),
                'updated_at' => $ticket->updated_at?->toIso8601String(),
                'view_token' => $ticket->view_token,
            ],
            'transaction' => $ticket->transaction !== null ? [
                'provider_id' => $ticket->transaction->provider_id,
                'from_currency' => $ticket->transaction->from_currency,
                'to_currency' => $ticket->transaction->to_currency,
                'status' => $ticket->transaction->status,
            ] : null,
            'messages' => $ticket->messages->map(fn (TicketMessage $m) => [
                'id' => $m->id,
                'sender' => $m->sender,
                'body' => $m->body,
                'admin_name' => $m->admin?->name,
                'created_at' => $m->created_at?->toIso8601String(),
            ])->all(),
        ]);
    }

    public function reply(Request $request, Ticket $ticket, string $token): RedirectResponse
    {
        abort_if(! hash_equals((string) $ticket->view_token, $token), 404);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender' => 'user',
            'body' => $data['body'],
        ]);

        $ticket->update([
            'status' => Ticket::STATUS_OPEN,
            'user_replied_at' => now(),
        ]);

        return back()->with('success', trans('site.help.thread.reply_sent'));
    }
}
