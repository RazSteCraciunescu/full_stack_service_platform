<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceRequestResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->public_id,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'priority' => $this->priority,
            'status' => $this->status,
            'requester' => [
                'name' => $this->requester_name,
                'email' => $this->requester_email,
            ],
            'assignee' => $this->assignee,
            'channel' => $this->channel,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'dueAt' => $this->due_at?->toISOString(),
            'tags' => $this->tags ?? [],
            'satisfaction' => $this->satisfaction === null ? null : (float) $this->satisfaction,
            'comments' => [],
        ];
    }
}
