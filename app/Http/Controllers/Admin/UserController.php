<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $q = User::query();

        $needle = trim((string) $request->string('q'));
        if ($needle !== '') {
            $like = '%'.$needle.'%';
            $q->where(function (Builder $b) use ($like): void {
                $b->where('email', 'like', $like)
                    ->orWhere('name', 'like', $like);
            });
        }

        $status = (string) $request->string('status');
        if ($status === 'suspended') {
            $q->whereNotNull('suspended_at');
        } elseif ($status === 'active') {
            $q->whereNull('suspended_at');
        }

        $paginator = $q->withCount('transactions')
            ->latest()
            ->paginate(25)
            ->withQueryString();

        $paginator->getCollection()->transform(fn (User $u) => [
            'id' => $u->id,
            'email' => $u->email,
            'name' => $u->name,
            'country' => $u->country,
            'transactions_count' => (int) ($u->transactions_count ?? 0),
            'last_seen_at' => $u->last_seen_at?->toIso8601String(),
            'created_at' => $u->created_at?->toIso8601String(),
            'suspended_at' => $u->suspended_at?->toIso8601String(),
        ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => $paginator,
            'filters' => [
                'q' => (string) $request->string('q'),
                'status' => $status,
            ],
        ]);
    }

    public function show(User $user): Response
    {
        $user->load([
            'transactions' => function ($q): void {
                $q->latest()->limit(50);
            },
            'tickets' => function ($q): void {
                $q->latest()->limit(50);
            },
        ]);

        return Inertia::render('Admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'country' => $user->country,
                'locale' => $user->locale,
                'ip' => $user->ip,
                'marketing_opt_in' => (bool) $user->marketing_opt_in,
                'last_seen_at' => $user->last_seen_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
                'suspended_at' => $user->suspended_at?->toIso8601String(),
                'suspended_reason' => $user->suspended_reason,
            ],
            'transactions' => $user->transactions->map(fn ($tx) => [
                'id' => $tx->id,
                'provider_id' => $tx->provider_id,
                'from_currency' => $tx->from_currency,
                'to_currency' => $tx->to_currency,
                'amount_send' => (float) $tx->amount_send,
                'amount_receive' => (float) $tx->amount_receive,
                'status' => $tx->status,
                'created_at' => $tx->created_at?->toIso8601String(),
            ])->all(),
            'tickets' => $user->tickets->map(fn ($t) => [
                'id' => $t->id,
                'subject' => $t->subject,
                'status' => $t->status,
                'priority' => $t->priority,
                'created_at' => $t->created_at?->toIso8601String(),
            ])->all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:12', 'max:255'],
            'locale' => ['nullable', 'string', 'max:8'],
            'marketing_opt_in' => ['boolean'],
        ]);

        $user = User::create([
            'name' => $data['name'] ?? null,
            'email' => $data['email'],
            'password' => $data['password'],
            'locale' => $data['locale'] ?? null,
            'marketing_opt_in' => (bool) ($data['marketing_opt_in'] ?? false),
        ]);

        return redirect()
            ->route('admin.users.show', $user)
            ->with('success', trans('site.admin.users.created'));
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'locale' => $user->locale,
                'marketing_opt_in' => (bool) $user->marketing_opt_in,
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:12', 'max:255'],
            'locale' => ['nullable', 'string', 'max:8'],
            'marketing_opt_in' => ['boolean'],
        ]);

        $payload = [
            'name' => $data['name'] ?? null,
            'email' => $data['email'],
            'locale' => $data['locale'] ?? null,
            'marketing_opt_in' => (bool) ($data['marketing_opt_in'] ?? false),
        ];
        if (! empty($data['password'])) {
            $payload['password'] = $data['password'];
        }

        $user->update($payload);

        return redirect()
            ->route('admin.users.show', $user)
            ->with('success', trans('site.admin.users.saved'));
    }

    public function suspend(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:200'],
        ]);

        $user->forceFill([
            'suspended_at' => now(),
            'suspended_reason' => $data['reason'] ?? null,
        ])->save();

        // Best-effort: purge any active database-driven sessions for this user.
        $sessionsTable = (string) config('session.table', 'sessions');
        try {
            DB::table($sessionsTable)->where('user_id', $user->id)->delete();
        } catch (\Throwable $e) {
            // Different driver (file/cache) — nothing to purge.
        }

        return back()->with('success', trans('site.admin.users.suspended'));
    }

    public function restore(User $user): RedirectResponse
    {
        $user->forceFill([
            'suspended_at' => null,
            'suspended_reason' => null,
        ])->save();

        return back()->with('success', trans('site.admin.users.restored'));
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', trans('site.admin.users.deleted'));
    }
}
