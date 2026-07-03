<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NomorSuratRequest extends Model
{
    use HasFactory;

    protected $table = 'nomor_surat_requests';

    protected $fillable = [
        'user_id',
        'kode_perihal_id',
        'kode_pemilik_id',

        'tanggal_surat',
        'status_tanggal',
        'tahun',

        'judul_surat',
        'tujuan_surat',
        'nama_pic_unit_pemohon',
        'penandatangan_surat',
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

        'revision_note',
        'revision_by',
        'revision_at',

        'completed_by',
        'completed_at',
        'completed_note',
    ];

    protected $casts = [
        'tanggal_surat' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'revision_at' => 'datetime',
        'completed_at' => 'datetime',
        'final_uploaded_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function kodePerihal()
    {
        return $this->belongsTo(KodePerihal::class, 'kode_perihal_id');
    }

    public function kodePemilik()
    {
        return $this->belongsTo(KodePemilik::class, 'kode_pemilik_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function revisionBy()
    {
        return $this->belongsTo(User::class, 'revision_by');
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}   
