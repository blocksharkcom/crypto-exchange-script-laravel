<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_schedules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('from_currency', 16);
            $table->string('to_currency', 16);
            $table->string('from_network', 32)->nullable();
            $table->string('to_network', 32)->nullable();

            $table->decimal('amount_send', 32, 12);

            $table->string('frequency', 12); // daily | weekly | monthly

            $table->timestamp('start_at');
            $table->timestamp('next_run_at');

            $table->string('end_condition', 16); // never | until_date | after_runs
            $table->timestamp('end_at')->nullable();
            $table->unsignedInteger('max_runs')->nullable();
            $table->unsignedInteger('runs_completed')->default(0);

            $table->string('status', 16)->default('active');

            $table->string('address');
            $table->string('refund_address')->nullable();
            $table->string('extra_id', 64)->nullable();

            $table->timestamp('last_run_at')->nullable();
            $table->foreignId('last_run_tx_id')->nullable()->references('id')->on('transactions')->nullOnDelete();

            $table->timestamps();

            $table->index(['status', 'next_run_at']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_schedules');
    }
};
