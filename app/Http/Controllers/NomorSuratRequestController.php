<?php

namespace App\Http\Controllers;

use App\Models\KodePemilik;
use App\Models\NomorSuratRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class NomorSuratRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = NomorSuratRequest::with([
            'user:id,name,username,unit,email',
            'kodePerihal:id,kode,nama_perihal',
            'kodePemilik:id,kode,nama_pemilik,unit',
            'approvedBy:id,name,username,unit,email',
            'rejectedBy:id,name,username,unit,email',
            'revisionBy:id,name,username,unit,email',
            'completedBy:id,name,username,unit,email',
        ])->latest();

        if (!$user || !($user->unit === 'sekpim' && $user->role === 'admin' && $user->status === 'active')) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('bulan') && $request->bulan !== 'all') {
            $query->whereMonth('tanggal_surat', $request->bulan);
        }

        if ($request->filled('tahun') && $request->tahun !== 'all') {
            $query->whereYear('tanggal_surat', $request->tahun);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('nomor_surat', 'like', "%{$search}%")
                    ->orWhere('judul_surat', 'like', "%{$search}%")
                    ->orWhere('tujuan_surat', 'like', "%{$search}%")
                    ->orWhere('nama_pic_unit_pemohon', 'like', "%{$search}%")
                    ->orWhere('penandatangan_surat', 'like', "%{$search}%")
                    ->orWhere('revision_note', 'like', "%{$search}%")
                    ->orWhere('rejected_reason', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%")
                            ->orWhere('unit', 'like', "%{$search}%");
                    })
                    ->orWhereHas('kodePerihal', function ($kodeQuery) use ($search) {
                        $kodeQuery->where('kode', 'like', "%{$search}%")
                            ->orWhere('nama_perihal', 'like', "%{$search}%");
                    })
                    ->orWhereHas('kodePemilik', function ($kodeQuery) use ($search) {
                        $kodeQuery->where('kode', 'like', "%{$search}%")
                            ->orWhere('nama_pemilik', 'like', "%{$search}%")
                            ->orWhere('unit', 'like', "%{$search}%");
                    });
            });
        }

        return response()->json([
            'nomor_surats' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'kode_perihal_id' => ['required', 'exists:kode_perihals,id'],
            'kode_pemilik_id' => ['required', 'exists:kode_pemiliks,id'],
            'tanggal_surat' => ['required', 'date'],
            'status_tanggal' => ['required', 'in:ondate,backdate'],
            'judul_surat' => ['required', 'string', 'max:255'],
            'tujuan_surat' => ['required', 'string', 'max:255'],
            'nama_pic_unit_pemohon' => ['required', 'string', 'max:255'],
            'penandatangan_surat' => ['required', 'string', 'max:255'],
            'keterangan' => ['nullable', 'string'],
            'file_dokumen' => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:5120'],
        ], [
            'kode_perihal_id.required' => 'Kode perihal wajib dipilih.',
            'kode_pemilik_id.required' => 'Kode pemilik proses wajib dipilih.',
            'tanggal_surat.required' => 'Tanggal surat wajib diisi.',
            'status_tanggal.required' => 'Status tanggal wajib dipilih.',
            'judul_surat.required' => 'Judul surat wajib diisi.',
            'tujuan_surat.required' => 'Tujuan surat wajib diisi.',
            'nama_pic_unit_pemohon.required' => 'Nama PIC unit pemohon wajib diisi.',
            'penandatangan_surat.required' => 'Penandatangan surat wajib diisi.',
            'file_dokumen.max' => 'Ukuran dokumen maksimal 5MB.',
            'file_dokumen.mimes' => 'Format dokumen harus PDF, DOC, DOCX, JPG, JPEG, atau PNG.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi pengajuan gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $filePath = null;

        if ($request->hasFile('file_dokumen')) {
            $filePath = $request->file('file_dokumen')->store('dokumen-awal-surat', 'public');
        }

        $tahun = date('Y', strtotime($request->tanggal_surat));

        $nomorSurat = NomorSuratRequest::create([
            'user_id' => $user->id,
            'kode_perihal_id' => $request->kode_perihal_id,
            'kode_pemilik_id' => $request->kode_pemilik_id,
            'tanggal_surat' => $request->tanggal_surat,
            'status_tanggal' => $request->status_tanggal,
            'tahun' => $tahun,
            'judul_surat' => $request->judul_surat,
            'tujuan_surat' => $request->tujuan_surat,
            'nama_pic_unit_pemohon' => $request->nama_pic_unit_pemohon,
            'penandatangan_surat' => $request->penandatangan_surat,
            'keterangan' => $request->keterangan,
            'status' => 'pending',
            'file_dokumen' => $filePath,
        ]);

        return response()->json([
            'message' => 'Pengajuan nomor surat berhasil dikirim.',
            'nomor_surat' => $nomorSurat->load([
                'user:id,name,username,unit,email',
                'kodePerihal:id,kode,nama_perihal',
                'kodePemilik:id,kode,nama_pemilik,unit',
            ]),
        ], 201);
    }

    public function approve($id)
    {
        $user = auth()->user();

        if (!$this->isAdminSekpim($user)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk menyetujui pengajuan.',
            ], 403);
        }

        $nomorSurat = NomorSuratRequest::with(['kodePerihal', 'kodePemilik'])->findOrFail($id);

        if (!in_array($nomorSurat->status, ['pending', 'revision'])) {
            return response()->json([
                'message' => 'Pengajuan dengan status ini tidak dapat disetujui.',
            ], 422);
        }

        $tahun = $nomorSurat->tahun ?: date('Y', strtotime($nomorSurat->tanggal_surat));

        $lastNumber = NomorSuratRequest::where('tahun', $tahun)
            ->whereNotNull('nomor_urut')
            ->max('nomor_urut');

        $nextNumber = ((int) $lastNumber) + 1;

        $kodePerihal = $nomorSurat->kodePerihal?->kode ?? 'XXX';
        $kodePemilik = $nomorSurat->kodePemilik?->kode ?? 'XXX';

        $nomorFinal = str_pad($nextNumber, 3, '0', STR_PAD_LEFT)
            . '/'
            . $kodePerihal
            . '/'
            . $kodePemilik
            . '/'
            . $tahun;

        $nomorSurat->forceFill([
            'status' => 'approved',
            'nomor_urut' => $nextNumber,
            'nomor_surat' => $nomorFinal,
            'approved_by' => $user->id,
            'approved_at' => now(),
            'rejected_by' => null,
            'rejected_at' => null,
            'rejected_reason' => null,
            'revision_note' => null,
            'revision_by' => null,
            'revision_at' => null,
        ])->save();

        return response()->json([
            'message' => 'Pengajuan berhasil disetujui.',
            'nomor_surat' => $nomorSurat->load([
                'user:id,name,username,unit,email',
                'kodePerihal:id,kode,nama_perihal',
                'kodePemilik:id,kode,nama_pemilik,unit',
                'approvedBy:id,name,username,unit,email',
            ]),
        ]);
    }

    public function reject(Request $request, $id)
    {
        $user = auth()->user();

        if (!$this->isAdminSekpim($user)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk menolak pengajuan.',
            ], 403);
        }

        $request->validate([
            'rejected_reason' => ['nullable', 'string', 'max:1000'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $nomorSurat = NomorSuratRequest::findOrFail($id);

        $reason = $request->rejected_reason ?? $request->reason ?? $request->note;

        if (!$reason) {
            return response()->json([
                'message' => 'Catatan atau alasan penolakan wajib diisi.',
            ], 422);
        }

        if (!in_array($nomorSurat->status, ['pending', 'approved', 'final_submitted', 'revision'])) {
            return response()->json([
                'message' => 'Pengajuan dengan status ini tidak dapat ditolak.',
            ], 422);
        }

        $nomorSurat->forceFill([
            'status' => 'rejected',
            'rejected_reason' => $reason,
            'rejected_by' => $user->id,
            'rejected_at' => now(),
            'revision_note' => null,
            'revision_by' => null,
            'revision_at' => null,
        ])->save();

        return response()->json([
            'message' => 'Pengajuan berhasil ditolak.',
            'nomor_surat' => $nomorSurat->load([
                'user:id,name,username,unit,email',
                'kodePerihal:id,kode,nama_perihal',
                'kodePemilik:id,kode,nama_pemilik,unit',
                'rejectedBy:id,name,username,unit,email',
            ]),
        ]);
    }

    public function revision(Request $request, $id)
    {
        $user = auth()->user();

        if (!$this->isAdminSekpim($user)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk meminta revisi pengajuan.',
            ], 403);
        }

        $request->validate([
            'revision_note' => ['nullable', 'string', 'max:1000'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $nomorSurat = NomorSuratRequest::findOrFail($id);

        $note = $request->revision_note ?? $request->note;

        if (!$note) {
            return response()->json([
                'message' => 'Catatan revisi wajib diisi.',
            ], 422);
        }

        if (!in_array($nomorSurat->status, ['pending', 'approved', 'final_submitted', 'revision'])) {
            return response()->json([
                'message' => 'Pengajuan dengan status ini tidak dapat direvisi.',
            ], 422);
        }

        $nomorSurat->forceFill([
            'status' => 'revision',
            'revision_note' => $note,
            'revision_by' => $user->id,
            'revision_at' => now(),
            'rejected_by' => null,
            'rejected_at' => null,
            'rejected_reason' => null,
        ])->save();

        return response()->json([
            'message' => 'Pengajuan berhasil dikirim untuk revisi.',
            'nomor_surat' => $nomorSurat->load([
                'user:id,name,username,unit,email',
                'kodePerihal:id,kode,nama_perihal',
                'kodePemilik:id,kode,nama_pemilik,unit',
                'revisionBy:id,name,username,unit,email',
            ]),
        ]);
    }

    public function uploadFinal(Request $request, $id)
    {
        $user = auth()->user();

        $request->validate([
            'file_dokumen_final' => ['required', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:5120'],
        ], [
            'file_dokumen_final.required' => 'Dokumen final wajib diupload.',
            'file_dokumen_final.max' => 'Ukuran dokumen final maksimal 5MB.',
            'file_dokumen_final.mimes' => 'Format dokumen final harus PDF, DOC, DOCX, JPG, JPEG, atau PNG.',
        ]);

        $nomorSurat = NomorSuratRequest::findOrFail($id);

        if ($nomorSurat->user_id !== $user->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk upload dokumen final pada pengajuan ini.',
            ], 403);
        }

        if (!in_array($nomorSurat->status, ['approved', 'revision'])) {
            return response()->json([
                'message' => 'Dokumen final hanya dapat diupload ketika pengajuan berstatus approved atau revision.',
            ], 422);
        }

        if ($nomorSurat->file_dokumen_final && Storage::disk('public')->exists($nomorSurat->file_dokumen_final)) {
            Storage::disk('public')->delete($nomorSurat->file_dokumen_final);
        }

        $filePath = $request->file('file_dokumen_final')->store('dokumen-final-surat', 'public');

        $nomorSurat->forceFill([
            'status' => 'final_submitted',
            'file_dokumen_final' => $filePath,
            'final_uploaded_at' => now(),
            'revision_note' => null,
            'revision_by' => null,
            'revision_at' => null,
            'rejected_by' => null,
            'rejected_at' => null,
            'rejected_reason' => null,
        ])->save();

        return response()->json([
            'message' => 'Dokumen final berhasil diupload.',
            'nomor_surat' => $nomorSurat->load([
                'user:id,name,username,unit,email',
                'kodePerihal:id,kode,nama_perihal',
                'kodePemilik:id,kode,nama_pemilik,unit',
            ]),
        ]);
    }

    public function complete(Request $request, $id)
    {
        $user = auth()->user();

        if (!$this->isAdminSekpim($user)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk menyelesaikan pengajuan.',
            ], 403);
        }

        $request->validate([
            'completed_note' => ['nullable', 'string', 'max:1000'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $nomorSurat = NomorSuratRequest::findOrFail($id);

        if ($nomorSurat->status !== 'final_submitted') {
            return response()->json([
                'message' => 'Pengajuan hanya dapat diselesaikan setelah dokumen final diupload.',
            ], 422);
        }

        $note = $request->completed_note ?? $request->note;

        $nomorSurat->forceFill([
            'status' => 'completed',
            'completed_by' => $user->id,
            'completed_at' => now(),
            'completed_note' => $note,
        ])->save();

        return response()->json([
            'message' => 'Pengajuan berhasil diselesaikan.',
            'nomor_surat' => $nomorSurat->load([
                'user:id,name,username,unit,email',
                'kodePerihal:id,kode,nama_perihal',
                'kodePemilik:id,kode,nama_pemilik,unit',
                'completedBy:id,name,username,unit,email',
            ]),
        ]);
    }

    public function previewAwal($id)
    {
        $nomorSurat = NomorSuratRequest::findOrFail($id);

        return $this->previewFile($nomorSurat->file_dokumen, 'Dokumen awal tidak tersedia.');
    }

    public function previewFinal($id)
    {
        $nomorSurat = NomorSuratRequest::findOrFail($id);

        return $this->previewFile($nomorSurat->file_dokumen_final, 'Dokumen final tidak tersedia.');
    }

    public function downloadAwal($id)
    {
        $nomorSurat = NomorSuratRequest::findOrFail($id);

        return $this->downloadFile($nomorSurat->file_dokumen, 'Dokumen awal tidak tersedia.');
    }

    public function downloadFinal($id)
    {
        $nomorSurat = NomorSuratRequest::findOrFail($id);

        return $this->downloadFile($nomorSurat->file_dokumen_final, 'Dokumen final tidak tersedia.');
    }

    private function previewFile($path, $emptyMessage)
    {
        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404, $emptyMessage);
        }

        $fullPath = Storage::disk('public')->path($path);
        $mimeType = Storage::disk('public')->mimeType($path);

        return response()->file($fullPath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . basename($path) . '"',
        ]);
    }

    private function downloadFile($path, $emptyMessage)
    {
        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404, $emptyMessage);
        }

        return Storage::disk('public')->download($path);
    }

    private function isAdminSekpim($user)
    {
        return $user
            && $user->unit === 'sekpim'
            && $user->role === 'admin'
            && $user->status === 'active';
    }
}
