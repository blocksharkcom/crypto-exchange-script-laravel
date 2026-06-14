<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\LimitOrder;
use App\Models\User;
use App\Services\Exchange\LimitOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LimitOrderController extends Controller
{
    public function __construct(private readonly LimitOrderService $service) {}

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user('web');

        $paginator = LimitOrder::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->paginate(25)
            ->withQueryString();

        $paginator->getCollection()->transform(fn (LimitOrder $o) => $this->serialize($o));

        return Inertia::render('Account/LimitOrders', [
            'orders' => $paginator,
            'statuses' => [
                LimitOrder::STATUS_OPEN,
                LimitOrder::STATUS_FILLED,
                LimitOrder::STATUS_CANCELLED,
                LimitOrder::STATUS_EXPIRED,
                LimitOrder::STATUS_FAILED,
            ],
        ]);
    }

    public function cancel(Request $request, int $id): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user('web');

        $order = LimitOrder::query()
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $this->service->cancel($order);

        return back()->with('success', __('site.account.limit_orders.cancelled'));
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
}
