<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:8', 'max:120'],
            'description' => ['required', 'string', 'min:20', 'max:2000'],
            'category' => ['required', Rule::in([
                'Account', 'Attachments', 'Billing', 'Data Export', 'Documentation',
                'Feature Request', 'Notifications', 'Usability',
            ])],
            'priority' => ['required', Rule::in(['Low', 'Medium', 'High', 'Urgent'])],
            'requester.name' => ['required', 'string', 'min:2', 'max:80'],
            'requester.email' => ['required', 'email:rfc', 'max:254'],
            'channel' => ['sometimes', Rule::in(['Portal', 'Email', 'API'])],
            'tags' => ['sometimes', 'array', 'max:8'],
            'tags.*' => ['string', 'max:30'],
        ];
    }
}
