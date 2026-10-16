<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Http\Resources\ServiceRequestResource;
use App\Models\ServiceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ServiceRequest::query()->latest('updated_at');

        $query->when(
            $request->filled('status'),
            fn ($builder) => $builder->where('status', $request->string('status')->toString()),
        );
        $query->when(
            $request->filled('priority'),
            fn ($builder) => $builder->where('priority', $request->string('priority')->toString()),
        );
        $query->when($request->filled('q'), function ($builder) use ($request): void {
            $search = '%' . addcslashes($request->string('q')->toString(), '%_') . '%';
            $builder->where(
                fn ($nested) => $nested
                    ->where('title', 'like', $search)
                    ->orWhere('public_id', 'like', $search),
            );
        });

        $items = $query->limit(100)->get();

        return response()->json([
            'items' => ServiceRequestResource::collection($items)->resolve(),
            'total' => $items->count(),
        ]);
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $model = DB::transaction(function () use ($validated): ServiceRequest {
            return ServiceRequest::create([
                'public_id' => 'SR-' . now()->format('ymdHis') . random_int(10, 99),
                'title' => $validated['title'],
                'description' => $validated['description'],
                'category' => $validated['category'],
                'priority' => $validated['priority'],
                'status' => 'Open',
                'requester_name' => $validated['requester']['name'],
                'requester_email' => strtolower($validated['requester']['email']),
                'channel' => $validated['channel'] ?? 'Portal',
                'tags' => array_values(array_unique($validated['tags'] ?? [])),
            ]);
        });

        return (new ServiceRequestResource($model))
            ->response()
            ->setStatusCode(201);
    }

    public function show(ServiceRequest $serviceRequest): ServiceRequestResource
    {
        return new ServiceRequestResource($serviceRequest);
    }

    public function update(
        UpdateServiceRequest $request,
        ServiceRequest $serviceRequest,
    ): ServiceRequestResource {
        $values = $request->validated();
        if (array_key_exists('dueAt', $values)) {
            $values['due_at'] = $values['dueAt'];
            unset($values['dueAt']);
        }
        $serviceRequest->update($values);

        return new ServiceRequestResource($serviceRequest->refresh());
    }
}
