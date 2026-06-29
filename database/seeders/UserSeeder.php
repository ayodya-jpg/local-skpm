<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'adminsekpim'],
            [
                'name' => 'Admin SEKPiM',
                'email' => 'adminsekpim@telkomuniversity.ac.id',
                'unit' => 'sekpim',
                'password' => Hash::make('password123'),
            ]
        );

        User::updateOrCreate(
            ['username' => 'logistik'],
            [
                'name' => 'Unit Logistik',
                'email' => 'logistik@telkomuniversity.ac.id',
                'unit' => 'logistik',
                'password' => Hash::make('password123'),
            ]
        );
    }
}
