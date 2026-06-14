<?php

declare(strict_types=1);

use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ExchangeController;
use App\Http\Controllers\Api\LimitOrderController;
use App\Http\Controllers\Api\RecurringController;
use App\Http\Controllers\Api\TicketController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:api')->prefix('exchange')->group(function (): void {
    Route::get('currencies', [ExchangeController::class, 'currencies']);
    Route::get('min-amount', [ExchangeController::class, 'minAmount']);
    Route::get('estimate', [ExchangeController::class, 'estimate']);
    Route::post('create', [ExchangeController::class, 'create']);
    Route::get('status/{id}', [ExchangeController::class, 'status']);
    Route::post('validate', [ExchangeController::class, 'validateAddress']);
});

Route::middleware('throttle:api')->prefix('support')->group(function (): void {
    Route::post('ticket', [TicketController::class, 'store']);
});

Route::middleware('throttle:20,1')->prefix('chat')->group(function (): void {
    Route::post('message', [ChatController::class, 'message']);
});

// Customer-only swap orchestrations: limit orders + recurring (DCA) schedules.
Route::middleware(['throttle:api', 'auth:web'])->group(function (): void {
    Route::get('limit-orders', [LimitOrderController::class, 'index']);
    Route::post('limit-orders', [LimitOrderController::class, 'store']);
    Route::post('limit-orders/{id}/cancel', [LimitOrderController::class, 'cancel'])->whereNumber('id');

    Route::get('recurring', [RecurringController::class, 'index']);
    Route::post('recurring', [RecurringController::class, 'store']);
    Route::post('recurring/{id}/cancel', [RecurringController::class, 'cancel'])->whereNumber('id');
    Route::post('recurring/{id}/pause', [RecurringController::class, 'pause'])->whereNumber('id');
    Route::post('recurring/{id}/resume', [RecurringController::class, 'resume'])->whereNumber('id');
});
