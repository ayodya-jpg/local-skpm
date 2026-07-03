<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    private function ensureSekpimAdmin()
    {
        $user = Auth::user();

        if (
            !$user ||
            $user->unit !== 'sekpim' ||
            !in_array($user->role, ['admin', 'super_admin'], true)
        ) {
            abort(response()->json([
                'message' => 'Akses ditolak. Hanya admin SEKPiM yang dapat mengelola user.',
            ], 403));
        }
    }

    public function index()
    {
        $this->ensureSekpimAdmin();

        $users = User::query()
            ->select([
                'id',
                'name',
                'username',
                'email',
                'unit',
                'role',
                'status',
                'created_at',
                'updated_at',
            ])
            ->orderByRaw("
                CASE 
                    WHEN status = 'pending' THEN 1
                    WHEN status = 'active' THEN 2
                    WHEN status = 'inactive' THEN 3
                    WHEN status = 'rejected' THEN 4
                    ELSE 5
                END
            ")
            ->latest()
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureSekpimAdmin();

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
            'password' => ['required', 'string', 'min:6'],
            'unit' => ['required', 'string', 'max:100'],
            'role' => ['required', Rule::in(['user', 'admin', 'approver', 'super_admin'])],
            'status' => ['required', Rule::in(['pending', 'active', 'inactive', 'rejected'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'] ?? null,
            'password' => $validated['password'],
            'unit' => $validated['unit'],
            'role' => $validated['role'],
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'User berhasil ditambahkan.',
            'user' => $user,
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $this->ensureSekpimAdmin();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:100',
                'alpha_dash',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => ['nullable', 'string', 'min:6'],
            'unit' => ['required', 'string', 'max:100'],
            'role' => ['required', Rule::in(['user', 'admin', 'approver', 'super_admin'])],
            'status' => ['required', Rule::in(['pending', 'active', 'inactive', 'rejected'])],
        ]);

        $payload = [
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'] ?? null,
            'unit' => $validated['unit'],
            'role' => $validated['role'],
            'status' => $validated['status'],
        ];

        if (!empty($validated['password'])) {
            $payload['password'] = $validated['password'];
        }

        $user->update($payload);

        return response()->json([
            'message' => 'User berhasil diperbarui.',
            'user' => $user->fresh(),
        ]);
    }

    public function activate(User $user)
    {
        $this->ensureSekpimAdmin();

        $user->update([
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'User berhasil diaktifkan.',
            'user' => $user->fresh(),
        ]);
    }

    public function deactivate(User $user)
    {
        $this->ensureSekpimAdmin();

        $user->update([
            'status' => 'inactive',
        ]);

        return response()->json([
            'message' => 'User berhasil dinonaktifkan.',
            'user' => $user->fresh(),
        ]);
    }

    public function reject(User $user)
    {
        $this->ensureSekpimAdmin();

        $user->update([
            'status' => 'rejected',
        ]);

        return response()->json([
            'message' => 'User berhasil ditolak.',
            'user' => $user->fresh(),
        ]);
    }

    public function destroy(User $user)
    {
        $this->ensureSekpimAdmin();

        if ($user->id === Auth::id()) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun sendiri.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus.',
        ]);
    }
}