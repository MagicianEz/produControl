<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryUpdateRequest extends FormRequest
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
            'category_id' => ['required', 'integer', 'min:1'],
            'category_name' => ['required', 'string', 'min:1', 'max:20'],
            'tags_checked' => ['required', 'array'],
            'tags_delete' => ['array'],
            'new_tags' => ['array'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_name.required' => 'Nama Kategori wajib diisi',
            'category_name.string' => 'Nama Kategori harus berupa teks',
            'category_name.min' => 'Nama Kategori harus memiliki minimal 1 karakter',
            'category_name.max' => 'Nama Kategori tidak boleh lebih dari 20 karakter',

            'tags_checked.required' => 'Harap ceklis minimal 1 Tag',
            'tags_checked.array' => 'Format Tags tidak valid',
        ];
    }
}
