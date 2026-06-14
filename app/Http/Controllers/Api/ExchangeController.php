<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateExchangeRequest;
use App\Http\Requests\EstimateRequest;
use App\Models\Transaction;
use App\Services\ChangeNow\Exceptions\ChangeNowException;
use App\Services\Exchange\ExchangeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExchangeController extends Controller
{
    public function __construct(private readonly ExchangeService $exchange) {}

    public function currencies(Request $request): JsonResponse
    {
        $flow = $request->string('flow', 'standard')->toString();

        return $this->safe(fn () => $this->exchange->currencies($flow));
    }

    public function minAmount(Request $request): JsonResponse
    {
        return $this->safe(fn () => $this->exchange->minAmount($request->only(['from', 'to', 'from_network', 'to_network', 'flow'])));
    }

    public function estimate(EstimateRequest $request): JsonResponse
    {
        return $this->safe(fn () => $this->exchange->estimate($request->validated()));
    }

    public function create(CreateExchangeRequest $request): JsonResponse
    {
        return $this->safe(function () use ($request): array {
            $tx = $this->exchange->createExchange($request->validated(), $request);

            return $this->transactionToArray($tx);
        });
    }

    public function status(string $providerId): JsonResponse
    {
        $providerId = preg_replace('/[^a-zA-Z0-9_-]/', '', $providerId) ?: '';
        $tx = Transaction::query()->where('provider_id', $providerId)->firstOrFail();
        $tx = $this->exchange->syncStatus($tx);

        return $this->ok($this->transactionToArray($tx));
    }

    public function validateAddress(Request $request): JsonResponse
    {
        $data = $request->validate([
            'currency' => ['required', 'string', 'max:16'],
            'address' => ['required', 'string', 'max:200'],
        ]);

        return $this->safe(fn () => ['valid' => $this->exchange->validateAddress($data['currency'], $data['address'])]);
    }

    private function safe(callable $fn): JsonResponse
    {
        try {
            return $this->ok($fn());
        } catch (ChangeNowException $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], $e->getCode() ?: 502);
        }
    }

    /** @param array<mixed> $data */
    private function ok(array $data): JsonResponse
    {
        return response()->json(['ok' => true, 'data' => $data]);
    }

    /** @return array<string, mixed> */
    private function transactionToArray(Transaction $tx): array
    {
        return [
            'id' => $tx->provider_id,
            'local_id' => $tx->id,
            'from' => $tx->from_currency,
            'to' => $tx->to_currency,
            'from_network' => $tx->from_network,
            'to_network' => $tx->to_network,
            'amount_send' => (float) $tx->amount_send,
            'amount_receive' => (float) $tx->amount_receive,
            'payin_address' => $tx->payin_address,
            'payin_extra_id' => $tx->payin_extra_id,
            'payout_address' => $tx->payout_address,
            'payout_extra_id' => $tx->payout_extra_id,
            'flow' => $tx->flow,
            'valid_until' => $tx->valid_until?->toIso8601String(),
            'status' => $tx->status,
            'payin_hash' => $tx->payin_hash,
            'payout_hash' => $tx->payout_hash,
        ];
    }
}
