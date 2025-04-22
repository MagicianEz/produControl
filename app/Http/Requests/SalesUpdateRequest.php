<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SalesUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice' => 'required|string',
            'customer_name' => 'required|string',
            'delivery_status' => 'required|string|in:In Progress,On Hold,In Delivery,Delivered',
            'tax' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'sub_total' => 'required|numeric|min:0',
            'grand_total' => 'required|numeric|min:0',
            'product_list' => 'required|array|min:1',
            'product_list.*.stock_id' => 'required|integer|exists:stock,id',
            'product_list.*.quantity' => 'required|integer|min:1',
            'product_list.*.price' => 'required|numeric|min:0',
        ];
    }

    public function messages()
    {
        return [
            'invoice.required' => 'Nomor invoice wajib diisi.',
            'customer_name.required' => 'Nama pembeli wajib diisi.',
            'product_list.required' => 'Minimal harus ada satu produk yang dijual.',
            'product_list.*.stock_id.exists' => 'Produk yang dipilih tidak valid.',
            'product_list.*.quantity.min' => 'Jumlah produk minimal 1.',
            'delivery_status.in' => 'Status pengiriman tidak valid.',
            'tax.min' => 'Pajak tidak boleh negatif.',
            'discount.min' => 'Diskon tidak boleh negatif.',
            'sub_total.min' => 'Subtotal tidak boleh negatif.',
            'grand_total.min' => 'Grand total tidak boleh negatif.',
        ];
    }
}
