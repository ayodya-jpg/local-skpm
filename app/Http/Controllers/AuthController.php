<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:100',
                'alpha_dash',
                Rule::unique('users', 'username'),
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
            ],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'unit' => ['required', 'string', 'max:100'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'] ?? null,
            'password' => $validated['password'],

            /*
            |--------------------------------------------------------------------------
            | Keamanan Register
            |--------------------------------------------------------------------------
            | Role dan status tidak boleh diambil dari input user.
            | Walaupun user memanipulasi request lewat inspect/postman,
            | sistem tetap memaksa akun baru sebagai user biasa dan pending.
            */
            'unit' => $validated['unit'],
            'role' => 'user',
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Pendaftaran berhasil. Akun Anda menunggu aktivasi dari admin SEKPiM.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'unit' => $user->unit,
                'role' => $user->role,
                'status' => $user->status,
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Username atau password salah.',
            ], 422);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        if ($user->status !== 'active') {
            Auth::logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $message = match ($user->status) {
                'pending' => 'Akun Anda masih menunggu aktivasi admin SEKPiM.',
                'inactive' => 'Akun Anda sedang dinonaktifkan. Silakan hubungi admin SEKPiM.',
                'rejected' => 'Pendaftaran akun Anda ditolak. Silakan hubungi admin SEKPiM.',
                default => 'Akun Anda belum aktif.',
            };

            return response()->json([
                'message' => $message,
                'status' => $user->status,
            ], 403);
        }

        return response()->json([
            'message' => 'Login berhasil.',
            'user' => $user,
        ]);
    }

    public function me()
    {
        return response()->json([
            'user' => Auth::user(),
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }
}