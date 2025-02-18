<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductMoveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'production_id' => ['required', 'integer', 'min:1'],
            'sku' => ['required', 'string', 'min:1', 'max:20'],
            'category_id' => ['required', 'integer', 'gt:0'],
            'tags' => ['required', 'array'],
            'quantity' => ['required', 'integer', 'gt:0'],
            'price' => ['required', 'integer', 'gt:0'],
        ];
    }
}
