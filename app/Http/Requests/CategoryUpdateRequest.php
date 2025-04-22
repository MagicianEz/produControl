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
            
            'production_tags_checked' => ['required', 'array'],
            'production_tags_checked.*.id' => ['required', 'integer'],
            'production_tags_checked.*.name' => ['required', 'string', 'max:20'],
            
            'stock_tags_checked' => ['required', 'array'],
            'stock_tags_checked.*.id' => ['required', 'integer'],
            'stock_tags_checked.*.name' => ['required', 'string', 'max:20'],
            
            'new_production_tags' => ['array'],
            'new_production_tags.*' => ['string', 'max:20'],
            
            'new_stock_tags' => ['array'],
            'new_stock_tags.*' => ['string', 'max:20'],
            
            'tags_delete' => ['array'],
            'tags_delete.*.id' => ['required', 'integer'],
            'tags_delete.*.name' => ['required', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_name.required' => 'Nama Kategori wajib diisi',
            'category_name.string' => 'Nama Kategori harus berupa teks',
            'category_name.min' => 'Nama Kategori harus memiliki minimal 1 karakter',
            'category_name.max' => 'Nama Kategori tidak boleh lebih dari 20 karakter',

            'production_tags_checked.required' => 'Harap ceklis minimal 1 Tag Produksi',
            'production_tags_checked.array' => 'Format Tags Produksi tidak valid',
            
            'stock_tags_checked.required' => 'Harap ceklis minimal 1 Tag Stok',
            'stock_tags_checked.array' => 'Format Tags Stok tidak valid',
            
            'new_production_tags.array' => 'Tag Produksi baru harus dalam format array',
            'new_production_tags.*.string' => 'Setiap Tag Produksi baru harus berupa teks',
            'new_production_tags.*.max' => 'Tag Produksi baru tidak boleh lebih dari 20 karakter',

            'new_stock_tags.array' => 'Tag Stok baru harus dalam format array',
            'new_stock_tags.*.string' => 'Setiap Tag Stok baru harus berupa teks',
            'new_stock_tags.*.max' => 'Tag Stok baru tidak boleh lebih dari 20 karakter',
            
            'tags_delete.array' => 'Tag yang dihapus harus dalam format array',
            'tags_delete.*.id.required' => 'ID Tag yang dihapus harus diisi',
            'tags_delete.*.id.integer' => 'ID Tag yang dihapus harus berupa angka',
            'tags_delete.*.name.required' => 'Nama Tag yang dihapus harus diisi',
            'tags_delete.*.name.string' => 'Nama Tag yang dihapus harus berupa teks',
            'tags_delete.*.name.max' => 'Nama Tag yang dihapus tidak boleh lebih dari 20 karakter',
        ];
    }
}
