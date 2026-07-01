<?php

namespace App\Http\Controllers;

use App\Models\KodePemilik;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class KodePemilikController extends Controller
{
    private function checkSekpimAccess()
    {
        if (!Auth::check() || Auth::user()->unit !== 'sekpim') {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin SEKPiM yang dapat mengelola kode pemilik.',
            ], 403);
        }

        return null;
    }

    public function index()
    {
        $kodePemiliks = KodePemilik::latest()->get();

        return response()->json([
            'kode_pemiliks' => $kodePemiliks,
        ]);
    }

    public function store(Request $request)
    {
        if ($response = $this->checkSekpimAccess()) {
            return $response;
        }

        $validated = $request->validate([
            'kode' => ['required', 'string', 'max:100', 'unique:kode_pemiliks,kode'],
            'nama_pemilik' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $kodePemilik = KodePemilik::create([
            'kode' => strtoupper($validated['kode']),
            'nama_pemilik' => $validated['nama_pemilik'],
            'unit' => strtolower($validated['unit']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Kode pemilik berhasil ditambahkan.',
            'kode_pemilik' => $kodePemilik,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if ($response = $this->checkSekpimAccess()) {
            return $response;
        }

        $kodePemilik = KodePemilik::findOrFail($id);

        $validated = $request->validate([
            'kode' => [
                'required',
                'string',
                'max:100',
                Rule::unique('kode_pemiliks', 'kode')->ignore($kodePemilik->id),
            ],
            'nama_pemilik' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $kodePemilik->update([
            'kode' => strtoupper($validated['kode']),
            'nama_pemilik' => $validated['nama_pemilik'],
            'unit' => strtolower($validated['unit']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Kode pemilik berhasil diperbarui.',
            'kode_pemilik' => $kodePemilik,
        ]);
    }

    public function destroy($id)
    {
        if ($response = $this->checkSekpimAccess()) {
            return $response;
        }

        $kodePemilik = KodePemilik::findOrFail($id);
        $kodePemilik->delete();

        return response()->json([
            'message' => 'Kode pemilik berhasil dihapus.',
        ]);
    }
}
