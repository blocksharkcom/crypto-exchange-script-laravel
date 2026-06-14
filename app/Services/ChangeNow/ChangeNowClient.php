<?php

declare(strict_types=1);

namespace App\Services\ChangeNow;

use App\Models\ApiLog;
use App\Services\ChangeNow\Exceptions\ChangeNowException;
use App\Support\Settings;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Thin client for the ChangeNOW v2 partner API.
 * https://documenter.getpostman.com/view/8180765/SVfTPnM8
 */
class ChangeNowClient
{
    private string $baseUrl;

    private string $apiKey;

    private string $referral;

    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) (Settings::get('changenow_base_url') ?: config('services.changenow.base_url')), '/');
        $this->apiKey = (string) (Settings::get('changenow_api_key') ?: config('services.changenow.api_key'));
        $this->referral = (string) (Settings::get('changenow_referral') ?: config('services.changenow.referral'));
        $this->timeout = (int) config('services.changenow.timeout', 15);
    }

    public function isConfigured(): bool
    {
        return $this->apiKey !== '';
    }

    /** @return array<int, array<string, mixed>> */
    public function currencies(string $flow = 'standard'): array
    {
        return $this->get('/exchange/currencies', [
            'active' => 'true',
            'flow' => $flow,
            'buy' => 'true',
            'sell' => 'true',
        ]);
    }

    /** @return array<int, array<string, mixed>> */
    public function availablePairs(string $from, string $flow = 'standard'): array
    {
        return $this->get('/exchange/availablePairs', [
            'flow' => $flow,
            'fromCurrency' => $from,
        ]);
    }

    /** @return array<string, mixed> */
    public function minAmount(string $from, string $to, ?string $fromNetwork = null, ?string $toNetwork = null, string $flow = 'standard'): array
    {
        $params = ['fromCurrency' => $from, 'toCurrency' => $to, 'flow' => $flow];
        if ($fromNetwork) {
            $params['fromNetwork'] = $fromNetwork;
        }
        if ($toNetwork) {
            $params['toNetwork'] = $toNetwork;
        }

        return $this->get('/exchange/min-amount', $params);
    }

    /** @return array<string, mixed> */
    public function estimate(string $from, string $to, float $amount, ?string $fromNetwork = null, ?string $toNetwork = null, string $flow = 'standard'): array
    {
        $params = [
            'fromCurrency' => $from,
            'toCurrency' => $to,
            'fromAmount' => $amount,
            'flow' => $flow,
            'type' => 'direct',
        ];
        if ($fromNetwork) {
            $params['fromNetwork'] = $fromNetwork;
        }
        if ($toNetwork) {
            $params['toNetwork'] = $toNetwork;
        }

        return $this->get('/exchange/estimated-amount', $params);
    }

    /** @param array<string, mixed> $payload @return array<string, mixed> */
    public function createExchange(array $payload): array
    {
        if ($this->referral && empty($payload['payload'])) {
            $payload['payload'] = ['referral' => $this->referral];
        }

        return $this->post('/exchange', $payload);
    }

    /** @return array<string, mixed> */
    public function status(string $providerId): array
    {
        return $this->get('/exchange/by-id', ['id' => $providerId]);
    }

    /** @return array<string, mixed> */
    public function validateAddress(string $currency, string $address): array
    {
        return $this->get('/validate/address', ['currency' => $currency, 'address' => $address]);
    }

    /** @param array<string, mixed> $query @return array<mixed> */
    private function get(string $path, array $query = []): array
    {
        return $this->request('GET', $path, query: $query);
    }

    /** @param array<string, mixed> $body @return array<mixed> */
    private function post(string $path, array $body): array
    {
        return $this->request('POST', $path, body: $body);
    }

    /**
     * @param  array<string, mixed>  $query
     * @param  array<string, mixed>|null  $body
     * @return array<mixed>
     */
    private function request(string $method, string $path, array $query = [], ?array $body = null): array
    {
        if (! $this->isConfigured()) {
            throw new ChangeNowException('ChangeNOW API key is not configured.', 503);
        }

        $client = Http::baseUrl($this->baseUrl)
            ->timeout($this->timeout)
            ->withHeaders([
                'Accept' => 'application/json',
                'x-changenow-api-key' => $this->apiKey,
            ])
            ->retry(2, 250, fn (\Throwable $e) => $e instanceof ConnectionException, throw: false)
            ->acceptJson()
            ->asJson();

        $started = microtime(true);
        $error = null;
        $status = 0;
        try {
            /** @var Response $response */
            $response = match ($method) {
                'GET' => $client->get($path, $query),
                'POST' => $client->post($path, $body ?? []),
                default => throw new ChangeNowException("Unsupported method: {$method}", 500),
            };
            $status = $response->status();

            if ($response->failed()) {
                $error = $response->json('message') ?? $response->json('error') ?? "HTTP {$status}";
                throw new ChangeNowException(is_string($error) ? $error : 'Upstream error', $status);
            }

            return (array) $response->json();
        } catch (ChangeNowException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $error = $e->getMessage();
            Log::warning('ChangeNOW request failed', ['path' => $path, 'error' => $error]);
            throw new ChangeNowException('Upstream service unreachable.', 502);
        } finally {
            $this->log($method, $path, microtime(true) - $started, $status, $error);
        }
    }

    private function log(string $method, string $path, float $duration, int $status, ?string $error): void
    {
        try {
            ApiLog::create([
                'endpoint' => substr($path, 0, 128),
                'method' => $method,
                'ip' => request()->ip(),
                'duration_ms' => (int) round($duration * 1000),
                'status_code' => $status,
                'error' => $error ? substr((string) $error, 0, 512) : null,
                'created_at' => now(),
            ]);
        } catch (\Throwable) {
            // never block the request on logging failure
        }
    }
}
