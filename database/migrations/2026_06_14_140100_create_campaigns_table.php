<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 160);
            $table->string('subject', 200);
            $table->longText('body');
            $table->string('audience', 32)->default('all'); // all|marketing_opt_in|customers_with_swaps
            $table->string('status', 16)->default('draft'); // draft|queued|sending|sent|failed
            $table->unsignedInteger('recipients_total')->default(0);
            $table->unsignedInteger('recipients_sent')->default(0);
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamps();

            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
