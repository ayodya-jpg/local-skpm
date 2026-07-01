<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NomorSuratCounter extends Model
{
    protected $fillable = [
        'tahun',
        'last_number',
    ];
}
