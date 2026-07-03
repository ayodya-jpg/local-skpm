<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('nomor_surat_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('nomor_surat_requests', 'nama_pic_unit_pemohon')) {
                $table->string('nama_pic_unit_pemohon')
                    ->nullable()
                    ->after('tujuan_surat');
            }
        });
    }

    public function down(): void
    {
        Schema::table('nomor_surat_requests', function (Blueprint $table) {
            if (Schema::hasColumn('nomor_surat_requests', 'nama_pic_unit_pemohon')) {
                $table->dropColumn('nama_pic_unit_pemohon');
            }
        });
    }
};