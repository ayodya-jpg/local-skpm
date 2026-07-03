<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('nomor_surat_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('nomor_surat_requests', 'penandatangan_surat')) {
                $table->string('penandatangan_surat')
                    ->nullable()
                    ->after('tujuan_surat');
            }

            if (!Schema::hasColumn('nomor_surat_requests', 'status_tanggal')) {
                $table->enum('status_tanggal', ['ondate', 'backdate'])
                    ->default('ondate')
                    ->after('tanggal_surat');
            }
        });
    }

    public function down(): void
    {
        Schema::table('nomor_surat_requests', function (Blueprint $table) {
            if (Schema::hasColumn('nomor_surat_requests', 'penandatangan_surat')) {
                $table->dropColumn('penandatangan_surat');
            }

            if (Schema::hasColumn('nomor_surat_requests', 'status_tanggal')) {
                $table->dropColumn('status_tanggal');
            }
        });
    }
};