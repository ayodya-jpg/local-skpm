<?php

namespace App\Http\Controllers;

use App\Models\KodePerihal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class KodePerihalController extends Controller
{
    private function checkSekpimAccess()
    {
        if (!Auth::check() || Auth::user()->unit !== 'sekpim') {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin SEKPiM yang dapat mengelola kode perihal.',
            ], 403);
        }

        return null;
    }

    public function index()
    {
        $kodePerihals = KodePerihal::latest()->get();

        return response()->json([
            'kode_perihals' => $kodePerihals,
        ]);
    }

    public function store(Request $request)
    {
        if ($response = $this->checkSekpimAccess()) {
            return $response;
        }

        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:50', 'unique:kode_perihals,kode'],
            'nama_perihal' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $kodePerihal = KodePerihal::create([
            'kode' => strtoupper($validated['kode']),
            'nama_perihal' => $validated['nama_perihal'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Kode perihal berhasil ditambahkan.',
            'kode_perihal' => $kodePerihal,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if ($response = $this->checkSekpimAccess()) {
            return $response;
        }

        $kodePerihal = KodePerihal::findOrFail($id);

        $validated = $request->validate([
            'kode' => [
                'required',
                'string',
                'max:50',
                Rule::unique('kode_perihals', 'kode')->ignore($kodePerihal->id),
            ],
            'nama_perihal' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $kodePerihal->update([
            'kode' => strtoupper($validated['kode']),
            'nama_perihal' => $validated['nama_perihal'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Kode perihal berhasil diperbarui.',
            'kode_perihal' => $kodePerihal,
        ]);
    }

    public function destroy($id)
    {
        if ($response = $this->checkSekpimAccess()) {
            return $response;
        }

        $kodePerihal = KodePerihal::findOrFail($id);
        $kodePerihal->delete();

        return response()->json([
            'message' => 'Kode perihal berhasil dihapus.',
        ]);
    }
}
