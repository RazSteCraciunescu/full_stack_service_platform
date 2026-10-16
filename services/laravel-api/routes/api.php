<?php

use App\Http\Controllers\Api\ServiceRequestController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['status' => 'ok', 'service' => 'laravel-api']);
Route::apiResource('requests', ServiceRequestController::class)
    ->parameters(['requests' => 'serviceRequest'])
    ->only(['index', 'store', 'show', 'update']);
