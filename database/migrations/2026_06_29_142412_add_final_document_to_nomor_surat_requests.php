<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('nomor_surat_requests', function (Blueprint $table) {
            $table->string('file_dokumen_final')->nullable()->after('file_dokumen');
            $table->timestamp('final_uploaded_at')->nullable()->after('file_dokumen_final');

            $table->foreignId('completed_by')->nullable()->after('final_uploaded_at');
            $table->timestamp('completed_at')->nullable()->after('completed_by');
            $table->text('completed_note')->nullable()->after('completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('nomor_surat_requests', function (Blueprint $table) {
            $table->dropColumn([
                'file_dokumen_final',
                'final_uploaded_at',
                'completed_by',
                'completed_at',
                'completed_note',
            ]);
        });
    }
};
