<?php

namespace Tests\Feature;

use App\Models\ServiceRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceRequestApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_is_available(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJson(['status' => 'ok']);
    }

    public function test_request_can_be_created(): void
    {
        $response = $this->postJson('/api/requests', [
            'title' => 'Invoice export is missing owner column',
            'description' => 'The monthly export omits the owner column for resolved requests.',
            'category' => 'Data Export',
            'priority' => 'Medium',
            'requester' => [
                'name' => 'Alex Morgan',
                'email' => 'alex.morgan@example.test',
            ],
        ]);

        $response->assertCreated()->assertJsonPath('status', 'Open');
        $this->assertDatabaseHas('service_requests', [
            'requester_email' => 'alex.morgan@example.test',
        ]);
    }

    public function test_queue_can_be_filtered_by_status(): void
    {
        ServiceRequest::factory()->create(['status' => 'Waiting']);
        ServiceRequest::factory()->create(['status' => 'Resolved']);

        $this->getJson('/api/requests?status=Waiting')
            ->assertOk()
            ->assertJsonCount(1, 'items')
            ->assertJsonPath('total', 1);
    }
}
