<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetController extends Controller
{
    public function showForgot(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function sendLink(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $key = 'forgot:'.Str::lower((string) $data['email']).'|'.((string) $request->ip());
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => trans('site.auth.sign_in.errors.throttle', ['seconds' => $seconds]),
            ]);
        }
        RateLimiter::hit($key, 120);

        Password::broker('users')->sendResetLink(['email' => $data['email']]);

        return back()->with('success', trans('site.auth.forgot.sent'));
    }

    public function showReset(Request $request, string $token): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => (string) $request->query('email', ''),
        ]);
    }

    public function reset(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ]);

        $status = Password::broker('users')->reset($data, function ($user, string $password): void {
            $user->forceFill([
                'password' => $password,
                'remember_token' => Str::random(60),
            ])->save();
        });

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('auth.login.show')->with('success', trans('site.auth.reset.success'));
        }

        throw ValidationException::withMessages([
            'email' => trans('site.auth.reset.errors.invalid'),
        ]);
    }
}
