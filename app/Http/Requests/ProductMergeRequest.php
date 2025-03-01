<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductMergeRequest extends FormRequest
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
            'sku' => ['required', 'string', 'min:1', 'max:20'],
            'name' => ['required', 'string', 'min:1', 'max:50'],
            'category_id' => ['required', 'integer'],
            'tags' => ['required', 'array'],
            'quantity' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'integer', 'min:1'],
            'merge_list' => ['required', 'array']
        ];
    }

    public function messages(): array
    {
        return [
            'sku.required' => 'SKU tidak boleh kosong',
            'sku.string' => 'SKU harus berupa teks',
            'sku.min' => 'SKU harus memiliki minimal 1 karakter',
            'sku.max' => 'SKU tidak boleh lebih dari 20 karakter',

            'name.required' => 'Nama Produk wajib diisi',
            'name.string' => 'Nama Produk harus berupa teks',
            'name.min' => 'Nama Produk harus memiliki minimal 1 karakter',
            'name.max' => 'Nama Produk tidak boleh lebih dari 50 karakter',

            'category_id.required' => 'Harap pilih kategori',
            'category_id.integer' => 'Kategori harus berupa angka',

            'tags.required' => 'Harap pilih minimal 1 Tag',
            'tags.array' => 'Format Tags tidak valid',
            
            'quantity.required' => 'Jumlah Produk harus diisi',
            'quantity.integer' => 'Jumlah Produk harus berupa angka',
            'quantity.min' => 'Jumlah Produk minimal harus 1',

            'price.required' => 'Harga Satuan Produk harus diisi',
            'price.integer' => 'Harga Satuan Produk harus berupa angka',
            'price.min' => 'Harga Satuan Produk minimal harus Rp 1'
        ];
    }
}
