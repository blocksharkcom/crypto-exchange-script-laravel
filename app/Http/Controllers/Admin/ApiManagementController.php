<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApiSettingsRequest;
use App\Models\ApiLog;
use App\Models\Transaction;
use App\Support\Settings;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ApiManagementController extends Controller
{
    public function index(): Response
    {
        $key = (string) Settings::get('changenow_api_key', (string) config('services.changenow.api_key', ''));

        $recent = ApiLog::query()
            ->orderByDesc('created_at')
            ->limit(100)
            ->get()
            ->map(fn (ApiLog $log) => [
                'id' => $log->id,
                'endpoint' => $log->endpoint,
                'method' => $log->method,
                'ip' => $log->ip,
                'duration_ms' => $log->duration_ms,
                'status_code' => $log->status_code,
                'error' => $log->error,
                'created_at' => $log->created_at?->toIso8601String(),
            ])
            ->all();

        $errors = ApiLog::query()
            ->where(function ($q): void {
                $q->whereNotNull('error')
                    ->orWhere('status_code', '>=', 400);
            })
            ->orderByDesc('created_at')
            ->limit(25)
            ->get()
            ->map(fn (ApiLog $log) => [
                'id' => $log->id,
                'endpoint' => $log->endpoint,
                'status_code' => $log->status_code,
                'error' => $log->error,
                'created_at' => $log->created_at?->toIso8601String(),
            ])
            ->all();

        return Inertia::render('Admin/Api/Index', [
            'config' => [
                'masked_key' => $this->mask($key),
                'has_key' => $key !== '',
                'referral' => (string) Settings::get('changenow_referral', (string) config('services.changenow.referral', '')),
                'base_url' => (string) Settings::get('changenow_base_url', (string) config('services.changenow.base_url', 'https://api.changenow.io/v2/')),
                'default_flow' => (string) Settings::get('changenow_default_flow', 'standard'),
            ],
            'partner_stats' => $this->partnerStats(),
            'success_series' => $this->successSeries(),
            'recent' => $recent,
            'errors' => $errors,
        ]);
    }

    public function update(ApiSettingsRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $payload = [
            'changenow_referral' => (string) ($data['referral'] ?? ''),
            'changenow_base_url' => (string) ($data['base_url'] ?? ''),
            'changenow_default_flow' => (string) ($data['default_flow'] ?? 'standard'),
        ];

        if (! empty($data['api_key'])) {
            $payload['changenow_api_key'] = (string) $data['api_key'];
        }

        Settings::setMany($payload);
        Settings::flush();

        return back()->with('success', trans('site.admin.api.update_success'));
    }

    public function rotate(): RedirectResponse
    {
        Settings::set('changenow_api_key', '');
        Settings::flush();

        return back()->with('info', trans('site.admin.api.rotate_info'));
    }

    /**
     * @return array{finished:int, fees:array<string,float>}
     */
    private function partnerStats(): array
    {
        $finished = (int) Transaction::query()
            ->where('status', Transaction::STATUS_FINISHED)
            ->count();

        $feeRows = Transaction::query()
            ->whereNotNull('partner_fee_currency')
            ->selectRaw('partner_fee_currency, SUM(partner_fee) as total')
            ->groupBy('partner_fee_currency')
            ->get();

        $fees = [];
        foreach ($feeRows as $row) {
            $fees[strtoupper((string) $row->partner_fee_currency)] = (float) $row->total;
        }

        return [
            'finished' => $finished,
            'fees' => $fees,
        ];
    }

    /**
     * @return array{labels:array<int,string>, success_rate:array<int,float>, total:array<int,int>}
     */
    private function successSeries(): array
    {
        $start = CarbonImmutable::now()->subDays(6)->startOfDay();
        $end = CarbonImmutable::now();

        $rows = ApiLog::query()
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE(created_at) as d, COUNT(*) as total, SUM(CASE WHEN status_code BETWEEN 200 AND 299 THEN 1 ELSE 0 END) as ok')
            ->groupBy('d')
            ->orderBy('d')
            ->get()
            ->keyBy('d');

        $labels = [];
        $rates = [];
        $totals = [];

        $cursor = $start;
        while ($cursor->lessThanOrEqualTo($end->startOfDay())) {
            $key = $cursor->toDateString();
            $row = $rows->get($key);
            $labels[] = $cursor->format('M j');

            $total = $row !== null ? (int) $row->total : 0;
            $ok = $row !== null ? (int) $row->ok : 0;

            $totals[] = $total;
            $rates[] = $total > 0 ? round($ok / $total * 100, 1) : 100.0;

            $cursor = $cursor->addDay();
        }

        return [
            'labels' => $labels,
            'success_rate' => $rates,
            'total' => $totals,
        ];
    }

    private function mask(string $key): string
    {
        if ($key === '') {
            return '';
        }
        $len = strlen($key);
        if ($len <= 4) {
            return str_repeat('•', $len);
        }

        return str_repeat('•', max(4, $len - 4)).substr($key, -4);
    }
}
