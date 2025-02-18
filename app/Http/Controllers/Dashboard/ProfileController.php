<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use App\Http\Requests\ProfileUpdateRequest;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProfileController extends Controller
{

    public function edit(Request $request): Response
    {
        return Inertia::render('admin/profile/Edit', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Profile Saya',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        // $request->user()->fill($request->validated());
        $request->user()->name = $request->get('name');
        $request->user()->save();
        return Redirect::route('profile.edit');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return Redirect::to('/');
    }
}
