<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\Exchange\ExchangeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Home', [
            'featured' => array_values(array_unique(array_map('strtolower', (array) config('swapforge.featured', ['btc', 'eth', 'usdt', 'bnb', 'sol', 'usdc', 'xmr', 'ada', 'trx', 'doge'])))),
        ]);
    }

    public function transaction(string $providerId, ExchangeService $exchange): Response
    {
        $tx = Transaction::query()->where('provider_id', $providerId)->firstOrFail();
        $tx = $exchange->syncStatus($tx);

        return Inertia::render('Track', [
            'transaction' => [
                'id' => $tx->provider_id,
                'from' => $tx->from_currency,
                'to' => $tx->to_currency,
                'amount_send' => (float) $tx->amount_send,
                'amount_receive' => (float) $tx->amount_receive,
                'payin_address' => $tx->payin_address,
                'payout_address' => $tx->payout_address,
                'payin_hash' => $tx->payin_hash,
                'payout_hash' => $tx->payout_hash,
                'status' => $tx->status,
                'created_at' => $tx->created_at?->toIso8601String(),
                'valid_until' => $tx->valid_until?->toIso8601String(),
            ],
        ]);
    }

    public function setLocale(string $locale, Request $request): RedirectResponse
    {
        if (in_array($locale, (array) config('swapforge.languages', ['en']), true)) {
            cookie()->queue(cookie()->forever('swapforge_lang', $locale));
            app()->setLocale($locale);
        }

        return back();
    }
}
