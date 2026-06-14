<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table): void {
            $table->id();
            $table->string('provider_id')->nullable()->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('from_currency', 16);
            $table->string('to_currency', 16);
            $table->string('from_network', 32)->nullable();
            $table->string('to_network', 32)->nullable();

            $table->decimal('amount_send', 32, 12);
            $table->decimal('amount_receive', 32, 12)->nullable();

            $table->string('payin_address')->nullable();
            $table->string('payout_address')->nullable();
            $table->string('refund_address')->nullable();
            $table->string('payin_extra_id')->nullable();
            $table->string('payout_extra_id')->nullable();

            $table->string('flow', 16)->default('standard'); // 'standard' | 'fixed-rate'
            $table->string('rate_id')->nullable();
            $table->timestamp('valid_until')->nullable();

            $table->string('status', 24)->default('new')->index();
            $table->boolean('stuck_flagged')->default(false)->index();
            $table->timestamp('finished_at')->nullable();

            $table->decimal('fee_amount', 32, 12)->default(0);
            $table->string('fee_currency', 16)->nullable();
            $table->decimal('partner_fee', 32, 12)->default(0); // referral commission est.
            $table->string('partner_fee_currency', 16)->nullable();

            $table->string('payin_hash')->nullable();
            $table->string('payout_hash')->nullable();

            $table->string('ip', 45)->nullable();
            $table->string('country', 2)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->string('source', 64)->nullable();
            $table->string('promo_code', 32)->nullable();

            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['from_currency', 'to_currency']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
