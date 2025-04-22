<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
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
            'tagsProduction' => ['required', 'string', 'min:1', 'max:255'],
            'tagsStock' => ['required', 'string', 'min:1', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama Kategori wajib diisi',
            'name.string' => 'Nama Kategori harus berupa teks',
            'name.min' => 'Nama Kategori harus memiliki minimal 1 karakter',
            'name.max' => 'Nama Kategori tidak boleh lebih dari 20 karakter',

            'tagsProduction.required' => 'Harap isi minimal 1 Tag Produksi',
            'tagsProduction.array' => 'Format Tags tidak valid',
            'tagsProduction.min' => 'Tags Produksi harus memiliki minimal 1 karakter',
            'tagsProduction.max' => 'Tags Produksi terlalu banyak',

            'tagsStock.required' => 'Harap isi minimal 1 Tag',
            'tagsStock.array' => 'Format Tags tidak valid',
            'tagsStock.min' => 'Tags harus memiliki minimal 1 karakter',
            'tagsStock.max' => 'Tags terlalu banyak',
        ];
    }
}
