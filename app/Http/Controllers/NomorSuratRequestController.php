<?php

namespace App\Http\Controllers;

use App\Models\NomorSuratCounter;
use App\Models\NomorSuratRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class NomorSuratRequestController extends Controller
{
    public function index()
    {
        $query = NomorSuratRequest::with([
            'user:id,name,username,unit,email',
            'kodePerihal:id,kode,nama_perihal',
            'kodePemilik:id,kode,nama_pemilik,unit',
            'approvedBy:id,name,username,unit,email',
            'rejectedBy:id,name,username,unit,email',
            'revisionBy:id,name,username,unit,email',
            'completedBy:id,name,username,unit,email',
        ])->latest();

        if (Auth::user()->unit !== 'sekpim') {
            $query->where('user_id', Auth::id());
        }

        return response()->json([
            'nomor_surats' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_perihal_id' => ['required', 'exists:kode_perihals,id'],
            'kode_pemilik_id' => ['required', 'exists:kode_pemiliks,id'],
            'tanggal_surat' => ['required', 'date'],
            'status_tanggal' => ['required', 'in:ondate,backdate'],
            'judul_surat' => ['required', 'string', 'max:255'],
            'tujuan_surat' => ['required', 'string', 'max:255'],
            'nama_pic_unit_pemohon' => ['required', 'string', 'max:255'],
            'penandatangan_surat' => ['required', 'string', 'max:255'],
            'keterangan' => ['nullable', 'string'],
            'file_dokumen' => [
                'nullable',
                'file',
                'mimes:pdf,doc,docx,jpg,jpeg,png',
                'max:5120',
            ],
        ]);

        $filePath = null;

        if ($request->hasFile('file_dokumen')) {
            $filePath = $request
                ->file('file_dokumen')
                ->store('dokumen-surat', 'public');
        }

        $tahun = date('Y', strtotime($validated['tanggal_surat']));

        $requestSurat = NomorSuratRequest::create([
            'user_id' => Auth::id(),
            'kode_perihal_id' => $validated['kode_perihal_id'],
            'kode_pemilik_id' => $validated['kode_pemilik_id'],
            'tanggal_surat' => $validated['tanggal_surat'],
            'status_tanggal' => $validated['status_tanggal'],
            'tahun' => $tahun,
            'judul_surat' => $validated['judul_surat'],
            'tujuan_surat' => $validated['tujuan_surat'],
            'nama_pic_unit_pemohon' => $validated['nama_pic_unit_pemohon'],
            'penandatangan_surat' => $validated['penandatangan_surat'],
            'keterangan' => $validated['keterangan'] ?? null,
            'status' => 'pending',
            'file_dokumen' => $filePath,
        ]);

        return response()->json([
            'message' => 'Pengajuan nomor surat berhasil dikirim.',
            'nomor_surat' => $requestSurat->fresh([
                'user',
                'kodePerihal',
                'kodePemilik',
            ]),
        ], 201);
    }

    public function approve($id)
    {
        if (Auth::user()->unit !== 'sekpim') {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin SEKPiM yang dapat melakukan approval.',
            ], 403);
        }

        $requestSurat = NomorSuratRequest::with([
            'kodePerihal',
            'kodePemilik',
            'user',
        ])->findOrFail($id);

        if ($requestSurat->status !== 'pending') {
            return response()->json([
                'message' => 'Pengajuan ini sudah diproses.',
            ], 422);
        }

        $result = DB::transaction(function () use ($requestSurat) {
            $counter = NomorSuratCounter::where('tahun', $requestSurat->tahun)
                ->lockForUpdate()
                ->first();

            if (! $counter) {
                $counter = NomorSuratCounter::create([
                    'tahun' => $requestSurat->tahun,
                    'last_number' => 0,
                ]);
            }

            $counter->last_number = $counter->last_number + 1;
            $counter->save();

            $nomorUrut = str_pad($counter->last_number, 3, '0', STR_PAD_LEFT);

            $nomorSurat = $nomorUrut . '/'
                . $requestSurat->kodePerihal->kode . '/'
                . $requestSurat->kodePemilik->kode . '/'
                . $requestSurat->tahun;

            $requestSurat->update([
                'status' => 'approved',
                'nomor_urut' => $counter->last_number,
                'nomor_surat' => $nomorSurat,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            return $requestSurat->fresh([
                'user',
                'kodePerihal',
                'kodePemilik',
                'approvedBy',
            ]);
        });

        return response()->json([
            'message' => 'Pengajuan berhasil disetujui. Nomor surat berhasil dibuat.',
            'nomor_surat' => $result,
        ]);
    }

    public function reject(Request $request, $id)
    {
        if (Auth::user()->unit !== 'sekpim') {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin SEKPiM yang dapat menolak pengajuan.',
            ], 403);
        }

        $validated = $request->validate([
            'rejected_reason' => ['required', 'string'],
        ]);

        $requestSurat = NomorSuratRequest::findOrFail($id);

        if ($requestSurat->status !== 'pending') {
            return response()->json([
                'message' => 'Pengajuan ini sudah diproses. Penolakan hanya bisa dilakukan saat status masih diajukan.',
            ], 422);
        }

        $requestSurat->update([
            'status' => 'rejected',
            'rejected_by' => Auth::id(),
            'rejected_at' => now(),
            'rejected_reason' => $validated['rejected_reason'],
        ]);

        return response()->json([
            'message' => 'Pengajuan berhasil ditolak.',
            'nomor_surat' => $requestSurat->fresh([
                'user',
                'kodePerihal',
                'kodePemilik',
                'rejectedBy',
            ]),
        ]);
    }

    private function canAccessRequest(NomorSuratRequest $requestSurat): bool
    {
        return Auth::user()->unit === 'sekpim'
            || $requestSurat->user_id === Auth::id()
            || optional($requestSurat->user)->unit === Auth::user()->unit;
    }

    private function getFileResponse(NomorSuratRequest $requestSurat, ?string $filePath, string $mode = 'download')
    {
        if (! $this->canAccessRequest($requestSurat)) {
            return response()->json([
                'message' => 'Akses ditolak.',
            ], 403);
        }

        if (! $filePath) {
            return response()->json([
                'message' => 'Dokumen tidak ditemukan.',
            ], 404);
        }

        $fullPath = storage_path('app/public/' . $filePath);

        if (! file_exists($fullPath)) {
            return response()->json([
                'message' => 'File tidak ditemukan di storage.',
            ], 404);
        }

        $fileName = basename($fullPath);
        $mimeType = mime_content_type($fullPath) ?: 'application/octet-stream';

        if ($mode === 'preview') {
            return response()->file($fullPath, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'inline; filename="' . $fileName . '"',
            ]);
        }

        return response()->download($fullPath, $fileName, [
            'Content-Type' => $mimeType,
        ]);
    }

    public function previewDokumenAwal($id)
    {
        $requestSurat = NomorSuratRequest::with('user')->findOrFail($id);

        return $this->getFileResponse(
            $requestSurat,
            $requestSurat->file_dokumen,
            'preview'
        );
    }

    public function previewDokumenFinal($id)
    {
        $requestSurat = NomorSuratRequest::with('user')->findOrFail($id);

        return $this->getFileResponse(
            $requestSurat,
            $requestSurat->file_dokumen_final,
            'preview'
        );
    }

    public function downloadDokumenAwal($id)
    {
        $requestSurat = NomorSuratRequest::with('user')->findOrFail($id);

        return $this->getFileResponse(
            $requestSurat,
            $requestSurat->file_dokumen,
            'download'
        );
    }

    public function downloadDokumenFinal($id)
    {
        $requestSurat = NomorSuratRequest::with('user')->findOrFail($id);

        return $this->getFileResponse(
            $requestSurat,
            $requestSurat->file_dokumen_final,
            'download'
        );
    }

    public function uploadFinal(Request $request, $id)
    {
        try {
            $requestSurat = NomorSuratRequest::findOrFail($id);

            if ($requestSurat->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Akses ditolak. Hanya pemohon yang dapat upload dokumen final.',
                    'user_login_id' => Auth::id(),
                    'pemohon_id' => $requestSurat->user_id,
                ], 403);
            }

            if (! in_array($requestSurat->status, ['approved', 'revision'], true)) {
                return response()->json([
                    'message' => 'Dokumen final hanya dapat diupload setelah nomor surat disetujui atau setelah dokumen final diminta revisi.',
                    'status_saat_ini' => $requestSurat->status,
                ], 422);
            }

            $request->validate([
                'file_dokumen_final' => [
                    'required',
                    'file',
                    'mimes:pdf,doc,docx,jpg,jpeg,png',
                    'max:5120',
                ],
            ]);

            if (! $request->hasFile('file_dokumen_final')) {
                return response()->json([
                    'message' => 'File dokumen final tidak terkirim dari frontend.',
                ], 422);
            }

            if ($requestSurat->file_dokumen_final) {
                Storage::disk('public')->delete($requestSurat->file_dokumen_final);
            }

            $filePath = $request
                ->file('file_dokumen_final')
                ->store('dokumen-final-surat', 'public');

            $requestSurat->update([
                'file_dokumen_final' => $filePath,
                'final_uploaded_at' => now(),
                'status' => 'final_submitted',
                'revision_note' => null,
                'revision_by' => null,
                'revision_at' => null,
            ]);

            return response()->json([
                'message' => 'Dokumen final berhasil diupload dan menunggu pengecekan SEKPiM.',
                'nomor_surat' => $requestSurat->fresh([
                    'user',
                    'kodePerihal',
                    'kodePemilik',
                ]),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Upload final gagal dari Laravel.',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    public function revisionFinal(Request $request, $id)
    {
        if (Auth::user()->unit !== 'sekpim') {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin SEKPiM yang dapat meminta revisi dokumen final.',
            ], 403);
        }

        $validated = $request->validate([
            'revision_note' => ['required', 'string'],
        ]);

        $requestSurat = NomorSuratRequest::findOrFail($id);

        if ($requestSurat->status !== 'final_submitted') {
            return response()->json([
                'message' => 'Revisi hanya dapat diberikan ketika dokumen final sudah dikirim oleh unit.',
                'status_saat_ini' => $requestSurat->status,
            ], 422);
        }

        $requestSurat->update([
            'status' => 'revision',
            'revision_note' => $validated['revision_note'],
            'revision_by' => Auth::id(),
            'revision_at' => now(),
        ]);

        return response()->json([
            'message' => 'Dokumen final dikembalikan ke unit untuk revisi.',
            'nomor_surat' => $requestSurat->fresh([
                'user',
                'kodePerihal',
                'kodePemilik',
                'revisionBy',
            ]),
        ]);
    }

    public function complete(Request $request, $id)
    {
        if (Auth::user()->unit !== 'sekpim') {
            return response()->json([
                'message' => 'Akses ditolak. Hanya admin SEKPiM yang dapat menyelesaikan pengajuan.',
            ], 403);
        }

        $requestSurat = NomorSuratRequest::findOrFail($id);

        if ($requestSurat->status !== 'final_submitted') {
            return response()->json([
                'message' => 'Pengajuan hanya dapat diselesaikan setelah unit mengupload dokumen final.',
            ], 422);
        }

        if (! $requestSurat->file_dokumen_final) {
            return response()->json([
                'message' => 'Dokumen final belum tersedia.',
            ], 422);
        }

        $requestSurat->update([
            'status' => 'completed',
            'completed_by' => Auth::id(),
            'completed_at' => now(),
            'completed_note' => $request->completed_note,
        ]);

        return response()->json([
            'message' => 'Pengajuan nomor surat telah selesai.',
            'nomor_surat' => $requestSurat->fresh([
                'user',
                'kodePerihal',
                'kodePemilik',
                'completedBy',
            ]),
        ]);
    }

    public function destroy($id)
    {
        $requestSurat = NomorSuratRequest::findOrFail($id);

        if (
            Auth::user()->unit !== 'sekpim' &&
            $requestSurat->user_id !== Auth::id()
        ) {
            return response()->json([
                'message' => 'Akses ditolak.',
            ], 403);
        }

        if ($requestSurat->file_dokumen) {
            Storage::disk('public')->delete($requestSurat->file_dokumen);
        }

        if ($requestSurat->file_dokumen_final) {
            Storage::disk('public')->delete($requestSurat->file_dokumen_final);
        }

        $requestSurat->delete();

        return response()->json([
            'message' => 'Pengajuan berhasil dihapus.',
        ]);
    }
}