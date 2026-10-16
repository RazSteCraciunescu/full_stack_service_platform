<?php

namespace Database\Seeders;

use App\Models\ServiceRequest;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        ServiceRequest::factory()->count(12)->create();
    }
}
