<?php

namespace Database\Factories;

use App\Models\ServiceRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceRequestFactory extends Factory
{
    protected $model = ServiceRequest::class;

    public function definition(): array
    {
        return [
            'public_id' => 'SR-' . fake()->unique()->numberBetween(2000, 9000),
            'title' => fake()->sentence(6),
            'description' => fake()->paragraph(),
            'category' => fake()->randomElement(['Account', 'Billing', 'Data Export', 'Usability']),
            'priority' => fake()->randomElement(['Low', 'Medium', 'High']),
            'status' => fake()->randomElement(['Open', 'In Progress', 'Waiting', 'Resolved']),
            'requester_name' => fake()->name(),
            'requester_email' => fake()->safeEmail(),
            'assignee' => fake()->optional()->name(),
            'channel' => fake()->randomElement(['Portal', 'Email', 'API']),
            'due_at' => fake()->optional()->dateTimeBetween('now', '+14 days'),
            'tags' => ['demo'],
        ];
    }
}
