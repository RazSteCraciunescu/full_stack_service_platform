<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('service_requests', function (Blueprint $table): void {
            $table->id();
            $table->string('public_id', 24)->unique();
            $table->string('title', 120);
            $table->text('description');
            $table->string('category', 40)->index();
            $table->string('priority', 12)->index();
            $table->string('status', 20)->default('Open')->index();
            $table->string('requester_name', 80);
            $table->string('requester_email', 254)->index();
            $table->string('assignee', 80)->nullable()->index();
            $table->string('channel', 12)->default('Portal');
            $table->timestamp('due_at')->nullable()->index();
            $table->json('tags')->nullable();
            $table->decimal('satisfaction', 2, 1)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_requests');
    }
};
