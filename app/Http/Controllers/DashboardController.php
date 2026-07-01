<?php

namespace App\Http\Controllers;

use App\Models\NomorSuratRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $bulan = $request->bulan;
        $tahun = $request->tahun;

        $query = NomorSuratRequest::query();

        if ($user->unit !== 'sekpim') {
            $query->where('user_id', $user->id);
        }

        if ($bulan && $bulan !== 'all') {
            $query->whereMonth('tanggal_surat', $bulan);
        }

        if ($tahun && $tahun !== 'all') {
            $query->whereYear('tanggal_surat', $tahun);
        }

        return response()->json([
            'user_unit' => $user->unit,
            'scope' => $user->unit === 'sekpim' ? 'all' : 'own',
            'bulan' => $bulan,
            'tahun' => $tahun,

            'total_pengajuan' => (clone $query)->count(),
            'total_pending' => (clone $query)->where('status', 'pending')->count(),
            'total_approved' => (clone $query)->where('status', 'approved')->count(),
            'total_final_submitted' => (clone $query)->where('status', 'final_submitted')->count(),
            'total_completed' => (clone $query)->where('status', 'completed')->count(),
            'total_rejected' => (clone $query)->where('status', 'rejected')->count(),
        ]);
    }
}
