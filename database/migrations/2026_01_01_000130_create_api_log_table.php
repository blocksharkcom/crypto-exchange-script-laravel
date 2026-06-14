<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('api_log', function (Blueprint $table): void {
            $table->id();
            $table->string('endpoint', 128);
            $table->string('method', 8);
            $table->string('ip', 45)->nullable();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->unsignedSmallInteger('status_code')->nullable();
            $table->string('error', 512)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['endpoint', 'created_at']);
            $table->index('status_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('api_log');
    }
};
