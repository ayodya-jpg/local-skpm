<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NomorSuratRequest extends Model
{
    protected $fillable = [
        'user_id',
        'kode_perihal_id',
        'kode_pemilik_id',
        'tanggal_surat',
        'tahun',
        'judul_surat',
        'tujuan_surat',
        'keterangan',
        'status',
        'nomor_urut',
        'nomor_surat',
        'file_dokumen',
        'file_dokumen_final',
        'final_uploaded_at',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejected_reason',
        'completed_by',
        'completed_at',
        'completed_note',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_surat' => 'date',
            'final_uploaded_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function kodePerihal()
    {
        return $this->belongsTo(KodePerihal::class);
    }

    public function kodePemilik()
    {
        return $this->belongsTo(KodePemilik::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}
