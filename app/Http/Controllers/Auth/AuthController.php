<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function showLogin(): Response
    {
        return Inertia::render('Auth/SignIn');
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
                'email' => trans('site.auth.sign_in.errors.throttle', ['seconds' => $seconds]),
            ]);
        }

        $remember = (bool) ($data['remember'] ?? false);

        if (! Auth::guard('web')->attempt(
            ['email' => $data['email'], 'password' => $data['password']],
            $remember,
        )) {
            RateLimiter::hit($key, 60);

            throw ValidationException::withMessages([
                'email' => trans('site.auth.sign_in.errors.invalid'),
            ]);
        }

        RateLimiter::clear($key);

        $user = Auth::guard('web')->user();
        if ($user instanceof User) {
            $user->forceFill([
                'last_seen_at' => now(),
                'ip' => (string) $request->ip(),
            ])->save();
        }

        $request->session()->regenerate();

        return redirect()->intended(route('account.dashboard'));
    }

    public function showRegister(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
            'marketing_opt_in' => ['sometimes', 'boolean'],
            'terms' => ['accepted'],
        ]);

        $key = $this->throttleKey($request, (string) $data['email']);
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => trans('site.auth.sign_in.errors.throttle', ['seconds' => $seconds]),
            ]);
        }
        RateLimiter::hit($key, 60);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'locale' => app()->getLocale(),
            'ip' => (string) $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'marketing_opt_in' => (bool) ($data['marketing_opt_in'] ?? false),
            'last_seen_at' => now(),
        ]);

        event(new Registered($user));

        Auth::guard('web')->login($user, true);
        $request->session()->regenerate();

        return redirect()->route('account.dashboard');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    private function throttleKey(Request $request, string $email): string
    {
        return 'auth:'.Str::lower($email).'|'.((string) $request->ip());
    }
}
