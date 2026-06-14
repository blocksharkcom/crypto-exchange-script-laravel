<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Admin/Auth/Login');
    }

    public function login(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        $key = $this->throttleKey($request, (string) $data['email']);

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            throw ValidationException::withMessages([
                'email' => trans('site.admin.auth.throttle', ['seconds' => $seconds]),
            ]);
        }

        $remember = (bool) ($data['remember'] ?? false);

        if (! Auth::guard('admin')->attempt(
            ['email' => $data['email'], 'password' => $data['password']],
            $remember,
        )) {
            RateLimiter::hit($key, 60);

            throw ValidationException::withMessages([
                'email' => trans('site.admin.auth.invalid'),
            ]);
        }

        RateLimiter::clear($key);

        $admin = Auth::guard('admin')->user();

        if ($admin !== null && method_exists($admin, 'forceFill')) {
            $admin->forceFill([
                'last_login_at' => now(),
                'last_login_ip' => (string) $request->ip(),
            ])->save();
        }

        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard'));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }

    private function throttleKey(Request $request, string $email): string
    {
        return Str::lower($email).'|'.((string) $request->ip());
    }
}
