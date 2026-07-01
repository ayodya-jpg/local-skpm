<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KodePemilik extends Model
{
    protected $fillable = [
        'kode',
        'nama_pemilik',
        'unit',
        'is_active',
    ];
}
