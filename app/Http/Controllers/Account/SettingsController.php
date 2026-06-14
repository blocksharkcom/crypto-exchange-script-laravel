<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('Account/Settings', [
            'available_locales' => (array) config('swapforge.languages', ['en']),
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user('web');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'locale' => ['nullable', 'string', 'max:10'],
            'marketing_opt_in' => ['sometimes', 'boolean'],
        ]);

        $user->forceFill([
            'name' => $data['name'],
            'email' => $data['email'],
            'locale' => $data['locale'] ?? $user->locale,
            'marketing_opt_in' => (bool) ($data['marketing_opt_in'] ?? false),
        ])->save();

        return back()->with('success', trans('site.account.settings.flash.profile_saved'));
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user('web');

        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ]);

        if ($user->password === null || ! Hash::check((string) $data['current_password'], (string) $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => trans('site.account.settings.errors.current_password'),
            ]);
        }

        $user->forceFill([
            'password' => $data['password'],
        ])->save();

        return back()->with('success', trans('site.account.settings.flash.password_saved'));
    }
}
