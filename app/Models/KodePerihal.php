<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KodePerihal extends Model
{
    protected $fillable = [
        'kode',
        'nama_perihal',
        'deskripsi',
        'is_active',
    ];
}
