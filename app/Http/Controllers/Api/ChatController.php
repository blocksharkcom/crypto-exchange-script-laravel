<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Chat\ChatService;
use App\Services\Chat\Exceptions\ChatNotConfigured;
use App\Services\Chat\Exceptions\ChatRequestFailed;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(private readonly ChatService $chat) {}

    public function message(Request $request): JsonResponse
    {
        $data = $request->validate([
            'messages' => ['required', 'array', 'min:1', 'max:20'],
            'messages.*.role' => ['required', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string', 'max:4000'],
        ]);

        try {
            /** @var array<int, array{role: string, content: string}> $messages */
            $messages = $data['messages'];
            $result = $this->chat->send($messages);

            return response()->json([
                'ok' => true,
                'data' => [
                    'reply' => $result['reply'],
                    'tokens_in' => $result['tokens_in'],
                    'tokens_out' => $result['tokens_out'],
                ],
            ]);
        } catch (ChatNotConfigured $e) {
            return response()->json([
                'ok' => false,
                'error' => $e->getMessage(),
            ], 503);
        } catch (ChatRequestFailed $e) {
            return response()->json([
                'ok' => false,
                'error' => $e->getMessage(),
            ], 502);
        } catch (\Throwable) {
            return response()->json([
                'ok' => false,
                'error' => 'Unexpected error.',
            ], 500);
        }
    }
}
