<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Allow the request if needed
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1', 'max:100'],
            'username' => ['required', 'string', 'min:1', 'max:50'],
            'password' => ['required', 'string', 'min:1', 'max:255'],
            'role' => [
                'required',
                Rule::in(['admin', 'operator', 'marketing']),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama Pengguna wajib diisi',
            'name.string' => 'Nama Pengguna harus berupa teks',
            'name.min' => 'Nama Pengguna harus memiliki minimal 1 karakter',
            'name.max' => 'Nama Pengguna tidak boleh lebih dari 100 karakter',

            'username.required' => 'Username wajib diisi',
            'username.string' => 'Username harus berupa teks',
            'username.min' => 'Username harus memiliki minimal 1 karakter',
            'username.max' => 'Username tidak boleh lebih dari 50 karakter',

            'password.required' => 'Password wajib diisi',
            'password.string' => 'Password harus berupa teks',
            'password.min' => 'Password harus memiliki minimal 1 karakter',
            'password.max' => 'Password tidak boleh lebih dari 255 karakter',

            'role.required' => 'Role wajib diisi',
        ];
    }
}
