<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('limit_orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('from_currency', 16);
            $table->string('to_currency', 16);
            $table->string('from_network', 32)->nullable();
            $table->string('to_network', 32)->nullable();

            $table->decimal('amount_send', 32, 12);
            $table->decimal('target_rate', 32, 12)->comment('When 1 from = target_rate to, fire.');

            $table->string('address');
            $table->string('refund_address')->nullable();
            $table->string('extra_id', 64)->nullable();

            $table->string('status', 16)->default('open');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_polled_at')->nullable();
            $table->decimal('last_quoted_rate', 32, 12)->nullable();
            $table->timestamp('last_quoted_at')->nullable();
            $table->foreignId('filled_transaction_id')->nullable()->references('id')->on('transactions')->nullOnDelete();

            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 512)->nullable();

            $table->timestamps();

            $table->index(['status', 'expires_at']);
            $table->index(['from_currency', 'to_currency']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('limit_orders');
    }
};
