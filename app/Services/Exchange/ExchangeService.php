<?php

declare(strict_types=1);

namespace App\Services\Exchange;

use App\Models\Transaction;
use App\Models\User;
use App\Services\ChangeNow\ChangeNowClient;
use App\Services\ChangeNow\Data\Currency;
use App\Services\ChangeNow\Exceptions\ChangeNowException;
use App\Support\Settings;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class ExchangeService
{
    public function __construct(private readonly ChangeNowClient $client) {}

    /**
     * @return array<int, array<string, mixed>>
     */
    public function currencies(string $flow = 'standard'): array
    {
        $cacheKey = "currencies.{$flow}";
        $ttl = (int) config('swapforge.cache_ttl.currencies', 300);

        return Cache::remember($cacheKey, $ttl, function () use ($flow): array {
            $raw = $this->client->currencies($flow);

            $featured = array_map('strtolower', (array) Settings::get('featured_currencies', ['btc', 'eth', 'usdt', 'bnb', 'sol', 'usdc', 'xmr', 'ada', 'trx', 'doge']));
            $blacklist = array_map('strtolower', (array) Settings::get('blacklist_currencies', []));

            $rows = [];
            foreach ($raw as $row) {
                if (! is_array($row)) {
                    continue;
                }
                $ticker = strtolower((string) ($row['ticker'] ?? ''));
                if ($ticker === '' || in_array($ticker, $blacklist, true)) {
                    continue;
                }
                $isFeatured = in_array($ticker, $featured, true);
                $rows[] = Currency::fromArray($row, $isFeatured)->toArray();
            }

            usort($rows, static function (array $a, array $b): int {
                if ($a['featured'] !== $b['featured']) {
                    return $a['featured'] ? -1 : 1;
                }

                return strcmp($a['ticker'], $b['ticker']);
            });

            return $rows;
        });
    }

    /** @param array<string, mixed> $input @return array<string, mixed> */
    public function minAmount(array $input): array
    {
        $from = strtolower((string) $input['from']);
        $to = strtolower((string) $input['to']);
        $flow = $this->normalizeFlow($input['flow'] ?? 'standard');

        $key = "min.{$from}.{$to}.{$flow}.".($input['from_network'] ?? '').'.'.($input['to_network'] ?? '');
        $ttl = (int) config('swapforge.cache_ttl.min_amount', 60);

        return Cache::remember($key, $ttl, function () use ($from, $to, $flow, $input): array {
            $data = $this->client->minAmount($from, $to, $input['from_network'] ?? null, $input['to_network'] ?? null, $flow);

            return ['min_amount' => (float) ($data['minAmount'] ?? 0)];
        });
    }

    /**
     * Same as estimate() but cached for a short TTL. Used by background pollers
     * (limit orders) to avoid hammering the upstream rate limit for shared pairs.
     *
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public function cachedEstimate(array $input, int $ttlSeconds = 20): array
    {
        $from = strtolower((string) $input['from']);
        $to = strtolower((string) $input['to']);
        $amount = (float) $input['amount'];
        $flow = $this->normalizeFlow($input['flow'] ?? 'standard');

        $key = "estimate.{$from}.{$to}.{$flow}.{$amount}.".($input['from_network'] ?? '').'.'.($input['to_network'] ?? '');

        return Cache::remember($key, $ttlSeconds, fn (): array => $this->estimate($input));
    }

    /** @param array<string, mixed> $input @return array<string, mixed> */
    public function estimate(array $input): array
    {
        $from = strtolower((string) $input['from']);
        $to = strtolower((string) $input['to']);
        $amount = (float) $input['amount'];
        $flow = $this->normalizeFlow($input['flow'] ?? 'standard');

        $data = $this->client->estimate(
            $from,
            $to,
            $amount,
            $input['from_network'] ?? null,
            $input['to_network'] ?? null,
            $flow,
        );

        return [
            'from' => $from,
            'to' => $to,
            'amount_send' => $amount,
            'amount_receive' => (float) ($data['toAmount'] ?? 0),
            'rate_id' => (string) ($data['rateId'] ?? ''),
            'valid_until' => isset($data['validUntil']) ? Carbon::parse($data['validUntil'])->toIso8601String() : null,
            'flow' => $flow,
            'warning' => $data['warningMessage'] ?? null,
            'transaction_speed_forecast' => $data['transactionSpeedForecast'] ?? null,
        ];
    }

    /** @param array<string, mixed> $input */
    public function createExchange(array $input, Request $request): Transaction
    {
        if (auth('web')->check()) {
            $authUserGuard = auth('web')->user();
            if ($authUserGuard instanceof User && $authUserGuard->isSuspended()) {
                throw new ChangeNowException(trans('site.errors.account_suspended'), 403);
            }
        }

        $from = strtolower((string) $input['from']);
        $to = strtolower((string) $input['to']);
        $flow = $this->normalizeFlow($input['flow'] ?? 'standard');
        $amount = (float) $input['amount'];

        $payload = [
            'fromCurrency' => $from,
            'toCurrency' => $to,
            'fromAmount' => $amount,
            'address' => trim((string) $input['address']),
            'flow' => $flow,
            'type' => 'direct',
        ];

        if (! empty($input['from_network'])) {
            $payload['fromNetwork'] = $input['from_network'];
        }
        if (! empty($input['to_network'])) {
            $payload['toNetwork'] = $input['to_network'];
        }
        if (! empty($input['refund_address'])) {
            $payload['refundAddress'] = trim((string) $input['refund_address']);
        }
        if (! empty($input['extra_id'])) {
            $payload['extraId'] = trim((string) $input['extra_id']);
        }
        if (! empty($input['rate_id'])) {
            $payload['rateId'] = (string) $input['rate_id'];
        }

        $resp = $this->client->createExchange($payload);

        $providerId = (string) ($resp['id'] ?? '');
        if ($providerId === '') {
            throw new ChangeNowException('Upstream did not return an exchange id.', 502);
        }

        $userId = null;
        if (isset($input['user_id']) && $input['user_id'] !== null) {
            $userId = (int) $input['user_id'];
        } elseif (auth('web')->check()) {
            $authUser = auth('web')->user();
            if ($authUser instanceof User) {
                $authUser->forceFill([
                    'last_seen_at' => now(),
                    'ip' => $request->ip(),
                ])->save();
                $userId = (int) $authUser->id;
            }
        } elseif (! empty($input['email']) && filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            $userId = $this->touchUser((string) $input['email'], $request);
        }

        $originType = isset($input['origin_type']) && $input['origin_type'] !== ''
            ? (string) $input['origin_type']
            : 'instant';
        $originId = isset($input['origin_id']) && $input['origin_id'] !== null
            ? (int) $input['origin_id']
            : null;

        return Transaction::create([
            'provider_id' => $providerId,
            'user_id' => $userId,
            'from_currency' => $from,
            'to_currency' => $to,
            'from_network' => $input['from_network'] ?? null,
            'to_network' => $input['to_network'] ?? null,
            'amount_send' => $amount,
            'amount_receive' => (float) ($resp['toAmount'] ?? 0),
            'payin_address' => (string) ($resp['payinAddress'] ?? ''),
            'payout_address' => (string) ($resp['payoutAddress'] ?? $payload['address']),
            'refund_address' => $payload['refundAddress'] ?? null,
            'payin_extra_id' => $resp['payinExtraId'] ?? null,
            'payout_extra_id' => $resp['payoutExtraId'] ?? null,
            'flow' => $flow,
            'rate_id' => $input['rate_id'] ?? null,
            'valid_until' => isset($resp['validUntil']) ? Carbon::parse($resp['validUntil']) : null,
            'status' => Transaction::STATUS_WAITING,
            'ip' => $request->ip(),
            'country' => $input['country'] ?? null,
            'user_agent' => $request->userAgent(),
            'source' => $input['source'] ?? null,
            'promo_code' => $input['promo_code'] ?? null,
            'origin_type' => $originType,
            'origin_id' => $originId,
        ]);
    }

    public function syncStatus(Transaction $tx): Transaction
    {
        if ($tx->provider_id === null) {
            return $tx;
        }

        $upstream = $this->client->status($tx->provider_id);
        $status = strtolower((string) ($upstream['status'] ?? $tx->status));

        $stuck = $tx->stuck_flagged;
        if (! $tx->isTerminal()) {
            $cfg = config('swapforge.tx_stuck');
            $ageMin = $tx->created_at?->diffInMinutes(now()) ?? 0;
            if ($status === Transaction::STATUS_WAITING && $ageMin > (int) $cfg['waiting_minutes']) {
                $stuck = true;
            }
            if ($status === Transaction::STATUS_CONFIRMING && $ageMin > (int) $cfg['confirming_minutes']) {
                $stuck = true;
            }
        }

        $tx->update([
            'status' => $status,
            'payin_hash' => $upstream['payinHash'] ?? $tx->payin_hash,
            'payout_hash' => $upstream['payoutHash'] ?? $tx->payout_hash,
            'amount_receive' => (float) ($upstream['amountTo'] ?? $upstream['expectedAmountTo'] ?? $tx->amount_receive),
            'stuck_flagged' => $stuck,
            'finished_at' => $status === Transaction::STATUS_FINISHED ? now() : $tx->finished_at,
        ]);

        return $tx->fresh();
    }

    public function validateAddress(string $currency, string $address): bool
    {
        $res = $this->client->validateAddress($currency, $address);

        return (bool) ($res['result'] ?? false);
    }

    private function normalizeFlow(mixed $flow): string
    {
        return in_array($flow, ['standard', 'fixed-rate'], true) ? (string) $flow : 'standard';
    }

    private function touchUser(string $email, Request $request): int
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'ip' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
                'locale' => app()->getLocale(),
                'last_seen_at' => now(),
            ],
        );
        $user->update(['last_seen_at' => now(), 'ip' => $request->ip()]);

        return $user->id;
    }
}
