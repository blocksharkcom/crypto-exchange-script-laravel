<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PreviewController extends Controller
{
    public function show(): Response
    {
        abort_unless((bool) config('swapforge.show_preview'), 404);

        $demoAdmin = env('DEMO_ADMIN_EMAIL');
        $demoUser = env('DEMO_USER_EMAIL');

        return Inertia::render('Preview', [
            'changenowAffiliateUrl' => 'https://changenow.io/affiliate',
            'changenowApiDocsUrl' => 'https://documenter.getpostman.com/view/8180765/SVfTPnM8',
            'codecanyonUrl' => 'https://codecanyon.net/',
            'demo' => [
                'admin' => $demoAdmin ? [
                    'url' => url('/admin/login'),
                    'email' => $demoAdmin,
                    'password' => env('DEMO_ADMIN_PASSWORD'),
                ] : null,
                'user' => $demoUser ? [
                    'url' => url('/sign-in'),
                    'email' => $demoUser,
                    'password' => env('DEMO_USER_PASSWORD'),
                ] : null,
            ],
        ]);
    }
}
