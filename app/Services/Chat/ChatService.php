<?php

declare(strict_types=1);

namespace App\Services\Chat;

use App\Models\ApiLog;
use App\Services\Chat\Exceptions\ChatNotConfigured;
use App\Services\Chat\Exceptions\ChatRequestFailed;
use App\Support\Settings;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Provider-agnostic AI chat client.
 *
 * Currently supports OpenAI (Chat Completions) and Anthropic (Messages API).
 * Reads its configuration from {@see Settings} under the `chat.*` namespace.
 */
class ChatService
{
    public const PROVIDER_NONE = 'none';

    public const PROVIDER_OPENAI = 'openai';

    public const PROVIDER_ANTHROPIC = 'anthropic';

    public const DEFAULT_MODEL_OPENAI = 'gpt-4o-mini';

    public const DEFAULT_MODEL_ANTHROPIC = 'claude-haiku-4-5-20251001';

    public const DEFAULT_ASSISTANT_NAME = 'Aida';

    private const TIMEOUT_SECONDS = 15;

    /**
     * Send a chat message and return the assistant reply.
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{reply: string, tokens_in: int, tokens_out: int}
     */
    public function send(array $messages): array
    {
        $provider = $this->provider();

        if ($provider === self::PROVIDER_NONE) {
            throw new ChatNotConfigured;
        }

        $apiKey = (string) Settings::get('chat.api_key', '');
        if ($apiKey === '') {
            throw new ChatNotConfigured('AI chat provider has no API key set.');
        }

        $systemPrompt = $this->systemPrompt();

        return match ($provider) {
            self::PROVIDER_OPENAI => $this->callOpenAi($messages, $apiKey, $systemPrompt),
            self::PROVIDER_ANTHROPIC => $this->callAnthropic($messages, $apiKey, $systemPrompt),
            default => throw new ChatNotConfigured("Unknown chat provider: {$provider}"),
        };
    }

    public function provider(): string
    {
        $value = (string) Settings::get('chat.provider', self::PROVIDER_NONE);

        return in_array($value, [self::PROVIDER_NONE, self::PROVIDER_OPENAI, self::PROVIDER_ANTHROPIC], true)
            ? $value
            : self::PROVIDER_NONE;
    }

    public function isEnabled(): bool
    {
        return (bool) Settings::get('chat.enabled', false) && $this->provider() !== self::PROVIDER_NONE;
    }

    public function assistantName(): string
    {
        $name = trim((string) Settings::get('chat.assistant_name', ''));

        return $name !== '' ? $name : self::DEFAULT_ASSISTANT_NAME;
    }

    public function model(): string
    {
        $explicit = trim((string) Settings::get('chat.model', ''));
        if ($explicit !== '') {
            return $explicit;
        }

        return match ($this->provider()) {
            self::PROVIDER_OPENAI => self::DEFAULT_MODEL_OPENAI,
            self::PROVIDER_ANTHROPIC => self::DEFAULT_MODEL_ANTHROPIC,
            default => '',
        };
    }

    public function systemPrompt(): string
    {
        $explicit = trim((string) Settings::get('chat.system_prompt', ''));
        if ($explicit !== '') {
            return $explicit;
        }

        $brand = Settings::brand();
        $assistant = $this->assistantName();

        return "You are {$assistant}, a friendly support assistant for {$brand}, a non-custodial crypto exchange. "
            .'Answer in 1-3 short paragraphs. '
            .'If the user asks about a specific transaction, ask them for the transaction ID. '
            .'If they need a human, direct them to /help to open a ticket. '
            .'Never promise refunds or quote specific exchange rates.';
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{reply: string, tokens_in: int, tokens_out: int}
     */
    private function callOpenAi(array $messages, string $apiKey, string $systemPrompt): array
    {
        $model = $this->model();
        $payload = [
            'model' => $model,
            'messages' => array_merge(
                [['role' => 'system', 'content' => $systemPrompt]],
                $this->normalizeMessages($messages),
            ),
            'temperature' => 0.4,
        ];

        $started = microtime(true);
        $status = 0;
        $error = null;

        try {
            /** @var Response $response */
            $response = Http::baseUrl('https://api.openai.com/v1/')
                ->timeout(self::TIMEOUT_SECONDS)
                ->withToken($apiKey)
                ->acceptJson()
                ->asJson()
                ->post('chat/completions', $payload);

            $status = $response->status();

            if ($response->failed()) {
                $error = (string) ($response->json('error.message') ?? "HTTP {$status}");
                throw new ChatRequestFailed($error, $status >= 400 ? $status : 502);
            }

            $reply = (string) ($response->json('choices.0.message.content') ?? '');
            $reply = trim($reply);
            if ($reply === '') {
                throw new ChatRequestFailed('Empty response from OpenAI.', 502);
            }

            return [
                'reply' => $reply,
                'tokens_in' => (int) ($response->json('usage.prompt_tokens') ?? 0),
                'tokens_out' => (int) ($response->json('usage.completion_tokens') ?? 0),
            ];
        } catch (ChatRequestFailed $e) {
            $error = $e->getMessage();
            throw $e;
        } catch (\Throwable $e) {
            $error = $e->getMessage();
            Log::warning('Chat OpenAI request failed', ['error' => $error]);
            throw new ChatRequestFailed('AI assistant is unavailable. Please try again.', 502);
        } finally {
            $this->log('POST', '/chat/openai', microtime(true) - $started, $status, $error);
        }
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{reply: string, tokens_in: int, tokens_out: int}
     */
    private function callAnthropic(array $messages, string $apiKey, string $systemPrompt): array
    {
        $model = $this->model();
        $payload = [
            'model' => $model,
            'system' => $systemPrompt,
            'max_tokens' => 1024,
            'messages' => $this->normalizeMessages($messages),
        ];

        $started = microtime(true);
        $status = 0;
        $error = null;

        try {
            /** @var Response $response */
            $response = Http::baseUrl('https://api.anthropic.com/v1/')
                ->timeout(self::TIMEOUT_SECONDS)
                ->withHeaders([
                    'x-api-key' => $apiKey,
                    'anthropic-version' => '2023-06-01',
                ])
                ->acceptJson()
                ->asJson()
                ->post('messages', $payload);

            $status = $response->status();

            if ($response->failed()) {
                $error = (string) ($response->json('error.message') ?? "HTTP {$status}");
                throw new ChatRequestFailed($error, $status >= 400 ? $status : 502);
            }

            $content = $response->json('content');
            $reply = '';
            if (is_array($content)) {
                foreach ($content as $block) {
                    if (is_array($block) && ($block['type'] ?? '') === 'text') {
                        $reply .= (string) ($block['text'] ?? '');
                    }
                }
            }
            $reply = trim($reply);
            if ($reply === '') {
                throw new ChatRequestFailed('Empty response from Anthropic.', 502);
            }

            return [
                'reply' => $reply,
                'tokens_in' => (int) ($response->json('usage.input_tokens') ?? 0),
                'tokens_out' => (int) ($response->json('usage.output_tokens') ?? 0),
            ];
        } catch (ChatRequestFailed $e) {
            $error = $e->getMessage();
            throw $e;
        } catch (\Throwable $e) {
            $error = $e->getMessage();
            Log::warning('Chat Anthropic request failed', ['error' => $error]);
            throw new ChatRequestFailed('AI assistant is unavailable. Please try again.', 502);
        } finally {
            $this->log('POST', '/chat/anthropic', microtime(true) - $started, $status, $error);
        }
    }

    /**
     * Strip anything that isn't a user/assistant turn and clamp string lengths.
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array<int, array{role: string, content: string}>
     */
    private function normalizeMessages(array $messages): array
    {
        $out = [];
        foreach ($messages as $m) {
            $role = $m['role'] ?? '';
            $content = (string) ($m['content'] ?? '');
            if (! in_array($role, ['user', 'assistant'], true)) {
                continue;
            }
            $content = trim($content);
            if ($content === '') {
                continue;
            }
            if (strlen($content) > 4000) {
                $content = substr($content, 0, 4000);
            }
            $out[] = ['role' => $role, 'content' => $content];
        }

        return $out;
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
                'error' => $error !== null ? substr($error, 0, 512) : null,
                'created_at' => now(),
            ]);
        } catch (\Throwable) {
            // Never block the request on logging failure.
        }
    }
}
