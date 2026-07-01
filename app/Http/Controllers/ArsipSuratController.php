<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ArsipSuratController extends Controller
{
    public function index()
    {
        return response()->json([
            'arsip_surats' => [],
            'message' => 'Fitur arsip surat belum diaktifkan.',
        ]);
    }

    public function store(Request $request)
    {
        return response()->json([
            'message' => 'Fitur tambah arsip surat belum diaktifkan.',
        ], 501);
    }

    public function update(Request $request, $id)
    {
        return response()->json([
            'message' => 'Fitur update arsip surat belum diaktifkan.',
        ], 501);
    }

    public function destroy($id)
    {
        return response()->json([
            'message' => 'Fitur hapus arsip surat belum diaktifkan.',
        ], 501);
    }
}
