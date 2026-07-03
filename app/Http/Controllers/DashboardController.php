<?php

namespace App\Http\Controllers;

use App\Models\NomorSuratRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        return $this->unitDetail($request, Auth::user()->unit);
    }

    public function units(Request $request)
    {
        $user = Auth::user();

        $bulan = $request->bulan;
        $tahun = $request->tahun;

        /*
        |--------------------------------------------------------------------------
        | Dashboard Utama
        |--------------------------------------------------------------------------
        | Semua user boleh melihat card ringkasan semua unit.
        | Tetapi user biasa tidak boleh membuka detail lengkap unit lain.
        | Pembatasan detail dilakukan di method unitDetail().
        */
        $query = NomorSuratRequest::query()
            ->join('users', 'nomor_surat_requests.user_id', '=', 'users.id');

        if ($bulan && $bulan !== 'all') {
            $query->whereMonth('nomor_surat_requests.tanggal_surat', $bulan);
        }

        if ($tahun && $tahun !== 'all') {
            $query->whereYear('nomor_surat_requests.tanggal_surat', $tahun);
        }

        $units = $query
            ->select(
                'users.unit as unit',
                DB::raw('COUNT(nomor_surat_requests.id) as total_pengajuan'),
                DB::raw("SUM(CASE WHEN nomor_surat_requests.status = 'pending' THEN 1 ELSE 0 END) as total_pending"),
                DB::raw("SUM(CASE WHEN nomor_surat_requests.status = 'approved' THEN 1 ELSE 0 END) as total_approved"),
                DB::raw("SUM(CASE WHEN nomor_surat_requests.status = 'final_submitted' THEN 1 ELSE 0 END) as total_final_submitted"),
                DB::raw("SUM(CASE WHEN nomor_surat_requests.status = 'revision' THEN 1 ELSE 0 END) as total_revision"),
                DB::raw("SUM(CASE WHEN nomor_surat_requests.status = 'completed' THEN 1 ELSE 0 END) as total_completed"),
                DB::raw("SUM(CASE WHEN nomor_surat_requests.status = 'rejected' THEN 1 ELSE 0 END) as total_rejected")
            )
            ->whereNotNull('users.unit')
            ->groupBy('users.unit')
            ->orderBy('users.unit')
            ->get()
            ->map(function ($item) use ($user) {
                $menungguTindakLanjut =
                    (int) $item->total_pending +
                    (int) $item->total_final_submitted +
                    (int) $item->total_revision;

                $canOpenDetail = $user->unit === 'sekpim' || $user->unit === $item->unit;

                return [
                    'unit' => $item->unit,
                    'nama_unit' => strtoupper($item->unit),

                    /*
                    |--------------------------------------------------------------------------
                    | Ringkasan Umum
                    |--------------------------------------------------------------------------
                    | Data ini boleh dilihat semua user.
                    | Detail lengkap tetap dibatasi.
                    */
                    'total_pengajuan' => (int) $item->total_pengajuan,
                    'menunggu_tindak_lanjut' => $menungguTindakLanjut,
                    'total_completed' => (int) $item->total_completed,

                    /*
                    |--------------------------------------------------------------------------
                    | Detail Status
                    |--------------------------------------------------------------------------
                    | Tetap dikirim agar card admin lebih informatif.
                    | Di frontend user biasa tidak harus melihat semua rinciannya.
                    */
                    'total_pending' => (int) $item->total_pending,
                    'total_approved' => (int) $item->total_approved,
                    'total_final_submitted' => (int) $item->total_final_submitted,
                    'total_revision' => (int) $item->total_revision,
                    'total_rejected' => (int) $item->total_rejected,

                    'can_open_detail' => $canOpenDetail,
                    'is_own_unit' => $user->unit === $item->unit,
                ];
            })
            ->values();

        return response()->json([
            'user_unit' => $user->unit,
            'is_sekpim' => $user->unit === 'sekpim',
            'bulan' => $bulan,
            'tahun' => $tahun,
            'units' => $units,
        ]);
    }

    public function unitDetail(Request $request, $unit)
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | Detail Dashboard Unit
        |--------------------------------------------------------------------------
        | User biasa hanya boleh membuka detail unit sendiri.
        | Admin SEKPiM boleh membuka detail semua unit.
        */
        if ($user->unit !== 'sekpim' && $user->unit !== $unit) {
            return response()->json([
                'message' => 'Akses ditolak. Anda hanya dapat membuka detail dashboard unit sendiri.',
            ], 403);
        }

        $bulan = $request->bulan;
        $tahun = $request->tahun;

        $query = NomorSuratRequest::query()
            ->whereHas('user', function ($userQuery) use ($unit) {
                $userQuery->where('unit', $unit);
            });

        if ($bulan && $bulan !== 'all') {
            $query->whereMonth('tanggal_surat', $bulan);
        }

        if ($tahun && $tahun !== 'all') {
            $query->whereYear('tanggal_surat', $tahun);
        }

        $latestRequests = (clone $query)
            ->with([
                'user:id,name,username,unit,email',
                'kodePerihal:id,kode,nama_perihal',
                'kodePemilik:id,kode,nama_pemilik,unit',
            ])
            ->latest()
            ->limit(8)
            ->get();

        $needFollowUp = (clone $query)
            ->with([
                'user:id,name,username,unit,email',
                'kodePerihal:id,kode,nama_perihal',
                'kodePemilik:id,kode,nama_pemilik,unit',
            ])
            ->whereIn('status', [
                'pending',
                'final_submitted',
                'revision',
            ])
            ->latest()
            ->limit(8)
            ->get();

        return response()->json([
            'unit' => $unit,
            'nama_unit' => strtoupper($unit),
            'user_unit' => $user->unit,
            'is_sekpim' => $user->unit === 'sekpim',
            'bulan' => $bulan,
            'tahun' => $tahun,

            'stats' => [
                'total_pengajuan' => (clone $query)->count(),
                'total_pending' => (clone $query)->where('status', 'pending')->count(),
                'total_approved' => (clone $query)->where('status', 'approved')->count(),
                'total_final_submitted' => (clone $query)->where('status', 'final_submitted')->count(),
                'total_revision' => (clone $query)->where('status', 'revision')->count(),
                'total_completed' => (clone $query)->where('status', 'completed')->count(),
                'total_rejected' => (clone $query)->where('status', 'rejected')->count(),
            ],

            'latest_requests' => $latestRequests,
            'need_follow_up' => $needFollowUp,
        ]);
    }
}