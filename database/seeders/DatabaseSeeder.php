<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * NOTE: We deliberately do NOT seed demo limit orders or recurring
     * schedules. CodeCanyon rejects products that ship demo customer data.
     */
    public function run(): void
    {
        $this->call(AdminRolesSeeder::class);
    }
}
