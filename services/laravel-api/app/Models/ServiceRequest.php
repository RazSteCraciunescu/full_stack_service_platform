<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    use HasFactory;

    protected $table = 'service_requests';

    protected $fillable = [
        'public_id',
        'title',
        'description',
        'category',
        'priority',
        'status',
        'requester_name',
        'requester_email',
        'assignee',
        'channel',
        'due_at',
        'tags',
        'satisfaction',
    ];

    protected function casts(): array
    {
        return [
            'due_at' => 'datetime',
            'tags' => 'array',
            'satisfaction' => 'decimal:1',
        ];
    }
}
