<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddUserRequest;
use App\Http\Requests\DestroyUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function show(Request $request)
    {
        $my_role = $request->user()->role;
        if ($my_role != 'admin') {
            return Redirect::route('dashboard.show');
        }
        $data_user = User::where('username', '!=', 'sudo')->get();
        return Inertia::render('admin/user/page', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'User',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'users' => $data_user,
        ]);
    }

    public function create_show(Request $request)
    {
        $my_role = $request->user()->role;
        if ($my_role != 'admin') {
            return Redirect::route('dashboard.show');
        }
        return Inertia::render('admin/user/create', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'User Tambah Data ',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
        ]);
    }

    public function detail_show(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');
        if ($my_role != 'admin' || $id == null) {
            return Redirect::route('dashboard.show');
        }
        $data_user = User::find($id);
        return Inertia::render('admin/user/detail', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'User Detail Data',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'user' => $data_user
        ]);
    }

    public function delete_show(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');
        if ($my_role != 'admin' || $id == null) {
            return Redirect::route('dashboard.show');
        }
        $data_user = User::find($id);
        return Inertia::render('admin/user/delete', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'User Hapus Data',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'user' => $data_user
        ]);
    }

    public function store(AddUserRequest $request)
    {
        $requestData = $request->validated();
        $USER = DB::table('users')->where('username', '=', $requestData['username'])->first();
        if ($USER) {
            return Redirect::route('user.create.show')->with('error', 'Username sudah terdaftar.');
        }
        User::create([
            'name' => $requestData['name'],
            'username' => $requestData['username'],
            'password' => Hash::make($requestData['password']),
            'role' => $requestData['role'],
        ]);

        return Redirect::route('user.show')->with('success', 'User berhasil dibuat.');
    }

    public function update(UpdateUserRequest $request)
    {
        $requestData = $request->validated();

        // Find the user by username
        $user = User::where('username', $requestData['username'])->first();

        if (!$user) {
            return Redirect::route('user.create.show')->with('error', 'User tidak ada.');
        }

        // Update the user's name and role
        $user->name = $requestData['name'];
        $user->role = $requestData['role'];

        // Check if a new password is provided and update it
        if (!empty($requestData['password'])) {
            $user->password = Hash::make($requestData['password']);
        }

        $user->save();

        return Redirect::route('user.show')->with('success', 'Data user berhasil diupdate.');
    }

    public function destroy(DestroyUserRequest $request)
    {
        $requestData = $request->validated();
        $user = User::find($requestData['id']);
        if (!$user) {
            return Redirect::route('user.create.show')->with('error', 'User tidak ada.');
        }
        $user->delete();
        return Redirect::route('user.show')->with('success', 'Data user berhasil dihapus.');
    }
}
