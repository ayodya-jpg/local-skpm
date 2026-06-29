<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    private function checkSekpimAccess()
    {
        if (!Auth::check() || Auth::user()->unit !== 'sekpim') {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin SEKPiM yang dapat mengakses User Management.',
            ], 403);
        }

        return null;
    }

    public function index()
    {
        if ($response = $this->checkSekpimAccess()) {
            return $response;
        }

        $users = User::select('id', 'name', 'username', 'unit', 'email', 'created_at')
            ->latest()
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        if ($response = $this->checkSekpimAccess()) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:100', 'unique:users,username'],
            'unit' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'unit' => strtolower($validated['unit']),
            'email' => $validated['email'] ?? $validated['username'] . '@sekpim.local',
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'User berhasil ditambahkan.',
            'user' => $user,
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        if ($response = $this->checkSekpimAccess()) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:100',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'unit' => ['required', 'string', 'max:100'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $user->name = $validated['name'];
        $user->username = $validated['username'];
        $user->unit = strtolower($validated['unit']);
        $user->email = $validated['email'] ?? $validated['username'] . '@sekpim.local';

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'User berhasil diperbarui.',
            'user' => $user,
        ]);
    }

    public function destroy(User $user)
    {
        if ($response = $this->checkSekpimAccess()) {
            return $response;
        }

        if ($user->id === Auth::id()) {
            return response()->json([
                'message' => 'Akun yang sedang login tidak boleh dihapus.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus.',
        ]);
    }
}
