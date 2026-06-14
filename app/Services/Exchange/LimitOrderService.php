<?php

declare(strict_types=1);

namespace App\Services\Exchange;

use App\Mail\LimitOrderExpiredMail;
use App\Mail\LimitOrderFilledMail;
use App\Models\LimitOrder;
use App\Models\Transaction;
use App\Services\ChangeNow\Exceptions\ChangeNowException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

final class LimitOrderService
{
    public function __construct(private readonly ExchangeService $exchange) {}

    /**
     * Validate and persist a new limit order for the given user.
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input, Request $request): LimitOrder
    {
        $userId = (int) ($input['user_id'] ?? 0);
        if ($userId <= 0) {
            throw new \InvalidArgumentException('user_id is required.');
        }

        $from = strtolower(trim((string) ($input['from'] ?? '')));
        $to = strtolower(trim((string) ($input['to'] ?? '')));
        $amount = (float) ($input['amount'] ?? 0);
        $target = (float) ($input['target_rate'] ?? 0);
        $address = trim((string) ($input['address'] ?? ''));

        if ($from === '' || $to === '' || $from === $to) {
            throw new \InvalidArgumentException('Invalid currency pair.');
        }
        if ($address === '') {
            throw new \InvalidArgumentException('Receive address is required.');
        }
        if ($target <= 0) {
            throw new \InvalidArgumentException('Target rate must be greater than zero.');
        }

        // Pair must satisfy min-amount for this provider.
        try {
            $min = $this->exchange->minAmount([
                'from' => $from,
                'to' => $to,
                'from_network' => $input['from_network'] ?? null,
                'to_network' => $input['to_network'] ?? null,
            ]);
            $minAmount = (float) ($min['min_amount'] ?? 0);
            if ($minAmount > 0 && $amount < $minAmount) {
                throw new \InvalidArgumentException(sprintf(
                    'Amount must be at least %s %s for this pair.',
                    rtrim(rtrim(number_format($minAmount, 12, '.', ''), '0'), '.'),
                    strtoupper($from),
                ));
            }
        } catch (ChangeNowException $e) {
            // If we cannot validate min upstream, fall back to a loose >0 check.
            if ($amount <= 0) {
                throw new \InvalidArgumentException('Amount must be greater than zero.');
            }
            Log::warning('LimitOrderService.create: min-amount lookup failed', ['error' => $e->getMessage()]);
        }

        // Capture an initial quoted rate so the user can see how far off we are.
        $initialQuotedRate = null;
        $initialQuotedAt = null;
        try {
            $est = $this->exchange->estimate([
                'from' => $from,
                'to' => $to,
                'amount' => $amount,
                'from_network' => $input['from_network'] ?? null,
                'to_network' => $input['to_network'] ?? null,
            ]);
            if ($amount > 0 && ! empty($est['amount_receive'])) {
                $initialQuotedRate = (float) $est['amount_receive'] / $amount;
                $initialQuotedAt = Carbon::now();
            }
        } catch (\Throwable $e) {
            Log::info('LimitOrderService.create: initial estimate failed', ['error' => $e->getMessage()]);
        }

        $expiresAt = $this->resolveExpiry((string) ($input['expiration'] ?? 'never'));

        return LimitOrder::create([
            'user_id' => $userId,
            'from_currency' => $from,
            'to_currency' => $to,
            'from_network' => $input['from_network'] ?? null,
            'to_network' => $input['to_network'] ?? null,
            'amount_send' => $amount,
            'target_rate' => $target,
            'address' => $address,
            'refund_address' => isset($input['refund_address']) && $input['refund_address'] !== ''
                ? trim((string) $input['refund_address']) : null,
            'extra_id' => isset($input['extra_id']) && $input['extra_id'] !== ''
                ? trim((string) $input['extra_id']) : null,
            'status' => LimitOrder::STATUS_OPEN,
            'expires_at' => $expiresAt,
            'last_quoted_rate' => $initialQuotedRate,
            'last_quoted_at' => $initialQuotedAt,
            'ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 512),
        ]);
    }

    public function cancel(LimitOrder $order): void
    {
        if ($order->status !== LimitOrder::STATUS_OPEN) {
            return;
        }
        $order->update(['status' => LimitOrder::STATUS_CANCELLED]);
    }

    /**
     * Re-quote one open limit order and fire the swap if the target is reached.
     */
    public function poll(LimitOrder $order): LimitOrder
    {
        if ($order->isTerminal()) {
            return $order;
        }

        // Expiry sweep
        if ($order->expires_at instanceof Carbon && $order->expires_at->isPast()) {
            $order->update([
                'status' => LimitOrder::STATUS_EXPIRED,
                'last_polled_at' => Carbon::now(),
            ]);
            $this->safeMail(fn () => Mail::to($this->orderEmail($order))->send(new LimitOrderExpiredMail($order->fresh() ?? $order)));

            return $order->fresh() ?? $order;
        }

        try {
            $est = $this->exchange->cachedEstimate([
                'from' => $order->from_currency,
                'to' => $order->to_currency,
                'amount' => (float) $order->amount_send,
                'from_network' => $order->from_network,
                'to_network' => $order->to_network,
            ]);
        } catch (\Throwable $e) {
            $order->update(['last_polled_at' => Carbon::now()]);
            Log::info('LimitOrderService.poll: estimate failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return $order->fresh() ?? $order;
        }

        $receive = (float) ($est['amount_receive'] ?? 0);
        $send = (float) $order->amount_send;
        $implied = $send > 0 ? $receive / $send : 0.0;

        $order->update([
            'last_quoted_rate' => $implied,
            'last_quoted_at' => Carbon::now(),
            'last_polled_at' => Carbon::now(),
        ]);

        if ($implied >= (float) $order->target_rate) {
            return $this->fill($order, $est);
        }

        return $order->fresh() ?? $order;
    }

    /**
     * Mark every open order whose expires_at < now as expired in one sweep.
     */
    public function expireOverdue(): int
    {
        $orders = LimitOrder::query()
            ->where('status', LimitOrder::STATUS_OPEN)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->get();

        foreach ($orders as $order) {
            $order->update(['status' => LimitOrder::STATUS_EXPIRED]);
            $this->safeMail(fn () => Mail::to($this->orderEmail($order))->send(new LimitOrderExpiredMail($order->fresh() ?? $order)));
        }

        return $orders->count();
    }

    /** @param array<string, mixed> $estimate */
    private function fill(LimitOrder $order, array $estimate): LimitOrder
    {
        $request = request();

        try {
            $tx = DB::transaction(function () use ($order, $estimate, $request): Transaction {
                $tx = $this->exchange->createExchange([
                    'from' => $order->from_currency,
                    'to' => $order->to_currency,
                    'amount' => (float) $order->amount_send,
                    'address' => $order->address,
                    'refund_address' => $order->refund_address,
                    'extra_id' => $order->extra_id,
                    'from_network' => $order->from_network,
                    'to_network' => $order->to_network,
                    'flow' => 'standard',
                    'rate_id' => $estimate['rate_id'] ?? null,
                    'source' => 'limit_order',
                    'user_id' => $order->user_id,
                    'origin_type' => 'limit_order',
                    'origin_id' => $order->id,
                ], $request);

                $order->update([
                    'status' => LimitOrder::STATUS_FILLED,
                    'filled_transaction_id' => $tx->id,
                ]);

                return $tx;
            });
        } catch (\Throwable $e) {
            $order->update(['status' => LimitOrder::STATUS_FAILED]);
            Log::warning('LimitOrderService.fill: createExchange failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return $order->fresh() ?? $order;
        }

        $fresh = $order->fresh() ?? $order;
        $this->safeMail(fn () => Mail::to($this->orderEmail($fresh))->send(new LimitOrderFilledMail($fresh, $tx)));

        return $fresh;
    }

    private function resolveExpiry(string $choice): ?Carbon
    {
        return match ($choice) {
            '24h' => Carbon::now()->addDay(),
            '7d' => Carbon::now()->addDays(7),
            '30d' => Carbon::now()->addDays(30),
            'never' => null,
            default => null,
        };
    }

    private function orderEmail(LimitOrder $order): string
    {
        return (string) ($order->user?->email ?? '');
    }

    private function safeMail(callable $fn): void
    {
        try {
            $fn();
        } catch (\Throwable $e) {
            Log::warning('LimitOrderService: mail dispatch failed', ['error' => $e->getMessage()]);
        }
    }
}
