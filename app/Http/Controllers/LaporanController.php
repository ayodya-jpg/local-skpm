<?php

namespace App\Http\Controllers;

use App\Models\NomorSuratRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LaporanController extends Controller
{
    public function nomorSurat(Request $request)
    {
        if (Auth::user()->unit !== 'sekpim') {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin SEKPiM yang dapat mengakses laporan.',
            ], 403);
        }

        $query = NomorSuratRequest::with([
            'user:id,name,username,unit,email',
            'kodePerihal:id,kode,nama_perihal',
            'kodePemilik:id,kode,nama_pemilik,unit',
        ])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('tahun')) {
            $query->where('tahun', $request->tahun);
        }

        if ($request->filled('unit')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('unit', $request->unit);
            });
        }

        return response()->json([
            'laporan_nomor_surat' => $query->get(),
        ]);
    }
}
