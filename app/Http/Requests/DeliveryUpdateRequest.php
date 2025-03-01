<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DeliveryUpdateRequest extends FormRequest
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
            'id' => ['required', 'integer', 'min:1'],
            'invoice' => ['required', 'string', 'min:1', 'max:100'],
            'total_price' => ['required', 'integer', 'min:1'],
            'quantity' => ['required', 'integer', 'min:1'],
            'status_pengiriman' => ['required', 'string', 'min:1'],
        ];
    }
    
    public function messages(): array
    {
        return [
            'invoice.required' => 'Nama Produk wajib diisi',
            'invoice.string' => 'Nama Produk harus berupa teks',
            'invoice.min' => 'Nama Produk harus memiliki minimal 1 karakter',
            'invoice.max' => 'Nama Produk tidak boleh lebih dari 100 karakter',

            'quantity.required' => 'Jumlah Produk harus diisi',
            'quantity.integer' => 'Jumlah Produk harus berupa angka',
            'quantity.min' => 'Jumlah Produk minimal harus 1',
        ];
    }
}
