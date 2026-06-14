<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CreateRecurringScheduleRequest;
use App\Models\RecurringSchedule;
use App\Models\User;
use App\Services\Exchange\RecurringScheduleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecurringController extends Controller
{
    public function __construct(private readonly RecurringScheduleService $service) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('web');

        $rows = RecurringSchedule::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->limit(200)
            ->get()
            ->map(fn (RecurringSchedule $s) => $this->serialize($s))
            ->all();

        return $this->ok($rows);
    }

    public function store(CreateRecurringScheduleRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('web');

        try {
            $schedule = $this->service->create(array_merge(
                $request->validated(),
                ['user_id' => $user->id],
            ), $request);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 422);
        }

        return $this->ok($this->serialize($schedule));
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        return $this->mutate($request, $id, function (RecurringSchedule $s): void {
            $this->service->cancel($s);
        });
    }

    public function pause(Request $request, int $id): JsonResponse
    {
        return $this->mutate($request, $id, function (RecurringSchedule $s): void {
            $this->service->pause($s);
        });
    }

    public function resume(Request $request, int $id): JsonResponse
    {
        return $this->mutate($request, $id, function (RecurringSchedule $s): void {
            $this->service->resume($s);
        });
    }

    private function mutate(Request $request, int $id, callable $fn): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('web');

        $schedule = RecurringSchedule::query()
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $fn($schedule);

        return $this->ok($this->serialize($schedule->fresh() ?? $schedule));
    }

    /** @return array<string, mixed> */
    private function serialize(RecurringSchedule $s): array
    {
        return [
            'id' => $s->id,
            'from_currency' => $s->from_currency,
            'to_currency' => $s->to_currency,
            'from_network' => $s->from_network,
            'to_network' => $s->to_network,
            'amount_send' => (float) $s->amount_send,
            'frequency' => $s->frequency,
            'start_at' => $s->start_at?->toIso8601String(),
            'next_run_at' => $s->next_run_at?->toIso8601String(),
            'end_condition' => $s->end_condition,
            'end_at' => $s->end_at?->toIso8601String(),
            'max_runs' => $s->max_runs,
            'runs_completed' => $s->runs_completed,
            'status' => $s->status,
            'address' => $s->address,
            'refund_address' => $s->refund_address,
            'last_run_at' => $s->last_run_at?->toIso8601String(),
            'created_at' => $s->created_at?->toIso8601String(),
        ];
    }

    /** @param array<mixed> $data */
    private function ok(array $data): JsonResponse
    {
        return response()->json(['ok' => true, 'data' => $data]);
    }
}
