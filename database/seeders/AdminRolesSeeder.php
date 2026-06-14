<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AdminRolesSeeder extends Seeder
{
    /**
     * Seed admin roles and permissions used by the admin guard.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'admin.access',
            'transactions.refresh',
            'transactions.export',
            'tickets.reply',
            'api.manage',
            'settings.update',
            'audit.view',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate([
                'name' => $name,
                'guard_name' => 'admin',
            ]);
        }

        $superadmin = Role::firstOrCreate([
            'name' => 'superadmin',
            'guard_name' => 'admin',
        ]);
        $superadmin->syncPermissions($permissions);

        $support = Role::firstOrCreate([
            'name' => 'support',
            'guard_name' => 'admin',
        ]);
        $support->syncPermissions([
            'admin.access',
            'tickets.reply',
            'transactions.refresh',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
