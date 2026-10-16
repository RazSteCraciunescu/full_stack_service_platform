<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::in([
                'Backlog', 'Open', 'In Progress', 'Waiting', 'Resolved', 'Closed',
            ])],
            'priority' => ['sometimes', Rule::in(['Low', 'Medium', 'High', 'Urgent'])],
            'assignee' => ['sometimes', 'nullable', 'string', 'max:80'],
            'dueAt' => ['sometimes', 'nullable', 'date'],
            'tags' => ['sometimes', 'array', 'max:8'],
            'tags.*' => ['string', 'max:30'],
        ];
    }
}
