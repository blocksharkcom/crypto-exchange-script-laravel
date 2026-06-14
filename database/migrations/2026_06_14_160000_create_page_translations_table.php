<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_translations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('page_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 10);
            $table->string('title', 200);
            $table->string('excerpt', 300)->nullable();
            $table->longText('body');
            $table->timestamps();

            $table->unique(['page_id', 'locale']);
        });

        // Migrate existing single-language pages into translations rows for the default locale.
        $defaultLocale = (string) config('app.locale', 'en');
        $rows = DB::table('pages')->select('id', 'title', 'excerpt', 'body', 'created_at', 'updated_at')->get();
        foreach ($rows as $row) {
            DB::table('page_translations')->insert([
                'page_id' => $row->id,
                'locale' => $defaultLocale,
                'title' => $row->title,
                'excerpt' => $row->excerpt,
                'body' => $row->body,
                'created_at' => $row->created_at ?? now(),
                'updated_at' => $row->updated_at ?? now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('page_translations');
    }
};
