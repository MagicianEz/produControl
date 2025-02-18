<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\MasterData;
use App\Models\Tag;
use App\Models\Delivery;
use App\Models\Production;
use App\Models\Stock;
use App\Models\SelectedStockCategory;
use App\Models\SelectedProductionCategory;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // =================================================================
        // USER
        // =================================================================

        User::create([
            'username' => 'sudo',
            'name' => 'Super Administrator',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        User::create([
            'username' => 'admin',
            'name' => 'Akun Admin Demo',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        User::create([
            'username' => 'operator',
            'name' => 'Akun Operator Demo',
            'password' => Hash::make('password'),
            'role' => 'operator'
        ]);

        User::create([
            'username' => 'marketing',
            'name' => 'Akun Marketing Demo ',
            'password' => Hash::make('password'),
            'role' => 'marketing'
        ]);
    }
}
