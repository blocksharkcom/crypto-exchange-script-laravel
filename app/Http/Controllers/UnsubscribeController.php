<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnsubscribeController extends Controller
{
    public function show(Request $request): Response
    {
        $email = (string) $request->query('email', '');

        if ($email !== '') {
            User::query()
                ->where('email', $email)
                ->update(['marketing_opt_in' => false]);
        }

        return Inertia::render('Unsubscribed', [
            'email' => $email,
        ]);
    }
}
