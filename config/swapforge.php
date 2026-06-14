<?php

declare(strict_types=1);

return [
    'brand'         => env('APP_NAME', 'CrossSwap'),
    'tagline'       => 'Exchange any crypto instantly',
    'support_email' => env('MAIL_FROM_ADDRESS', 'support@example.com'),

    'languages' => ['en', 'es', 'de', 'fr'],
    'theme'     => 'light',

    'cache_ttl' => [
        'currencies' => 300,
        'min_amount' => 60,
        'estimate'   => 15,
    ],

    'social' => [
        'twitter'  => '',
        'telegram' => '',
        'discord'  => '',
        'reddit'   => '',
    ],

    'tx_stuck' => [
        // After this many minutes in "waiting" we flag the swap as stuck.
        'waiting_minutes'    => 180,
        // After this many minutes in "confirming".
        'confirming_minutes' => 360,
    ],

    // The marketing /preview page is only shown on the official demo site.
    // Leave false in production installs (CodeCanyon buyers will use this flag).
    'show_preview' => env('SHOW_PREVIEW', false),
];
