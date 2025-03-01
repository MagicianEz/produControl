<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockMoveRequest extends FormRequest
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
            'invoice' => ['required', 'string', 'min:1'],
            'stock_id' => ['required', 'integer', 'min:1', 'max:100'],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'invoice.required' => 'Nomor Invoice harus diisi',
            'product_name.min' => 'Nomor Invoice harus memiliki minimal 1 karakter',
            'invoice.min' => 'Nomor Invoice harus memiliki minimal 1 karakter',
            'invoice.max' => 'Nomor Invoice tidak boleh lebih dari 100 karakter',

            'quantity.required' => 'Jumlah Produk harus diisi',
            'quantity.integer' => 'Jumlah Produk harus berupa angka',
            'quantity.min' => 'Jumlah Produk minimal harus 1',
        ];
    }
}
