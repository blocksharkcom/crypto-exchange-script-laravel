<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table): void {
            $table->string('view_token', 64)->nullable()->unique()->after('email');
            $table->timestamp('user_replied_at')->nullable()->after('updated_at');
            $table->timestamp('admin_replied_at')->nullable()->after('user_replied_at');
        });

        Schema::table('ticket_messages', function (Blueprint $table): void {
            $table->boolean('is_internal')->default(false)->after('body');
        });
    }

    public function down(): void
    {
        Schema::table('ticket_messages', function (Blueprint $table): void {
            $table->dropColumn('is_internal');
        });
        Schema::table('tickets', function (Blueprint $table): void {
            $table->dropColumn(['view_token', 'user_replied_at', 'admin_replied_at']);
        });
    }
};
