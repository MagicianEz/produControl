<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductionCategoryRequest extends FormRequest
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
            'name' => ['required', 'string', 'min:1', 'max:20'],
            'tags' => ['required', 'string', 'min:1', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama Kategori wajib diisi',
            'name.string' => 'Nama Kategori harus berupa teks',
            'name.min' => 'Nama Kategori harus memiliki minimal 1 karakter',
            'name.max' => 'Nama Kategori tidak boleh lebih dari 20 karakter',

            'tags.required' => 'Harap isi minimal 1 Tag',
            'tags.array' => 'Format Tags tidak valid',
            'tags.min' => 'Tags harus memiliki minimal 1 karakter',
            'tags.max' => 'Tags terlalu banyak',
        ];
    }
}
