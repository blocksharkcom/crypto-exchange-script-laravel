<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CreateLimitOrderRequest;
use App\Models\LimitOrder;
use App\Models\User;
use App\Services\ChangeNow\Exceptions\ChangeNowException;
use App\Services\Exchange\LimitOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LimitOrderController extends Controller
{
    public function __construct(private readonly LimitOrderService $service) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('web');

        $orders = LimitOrder::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->limit(200)
            ->get()
            ->map(fn (LimitOrder $o) => $this->serialize($o))
            ->all();

        return $this->ok($orders);
    }

    public function store(CreateLimitOrderRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('web');

        try {
            $order = $this->service->create(array_merge(
                $request->validated(),
                ['user_id' => $user->id],
            ), $request);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 422);
        } catch (ChangeNowException $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], $e->getCode() ?: 502);
        }

        return $this->ok($this->serialize($order));
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('web');

        $order = LimitOrder::query()
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $this->service->cancel($order);

        return $this->ok($this->serialize($order->fresh() ?? $order));
    }

    /** @return array<string, mixed> */
    private function serialize(LimitOrder $order): array
    {
        return [
            'id' => $order->id,
            'from_currency' => $order->from_currency,
            'to_currency' => $order->to_currency,
            'from_network' => $order->from_network,
            'to_network' => $order->to_network,
            'amount_send' => (float) $order->amount_send,
            'target_rate' => (float) $order->target_rate,
            'last_quoted_rate' => $order->last_quoted_rate !== null ? (float) $order->last_quoted_rate : null,
            'last_quoted_at' => $order->last_quoted_at?->toIso8601String(),
            'address' => $order->address,
            'refund_address' => $order->refund_address,
            'status' => $order->status,
            'expires_at' => $order->expires_at?->toIso8601String(),
            'filled_transaction_id' => $order->filled_transaction_id,
            'created_at' => $order->created_at?->toIso8601String(),
        ];
    }

    /** @param array<mixed> $data */
    private function ok(array $data): JsonResponse
    {
        return response()->json(['ok' => true, 'data' => $data]);
    }
}
