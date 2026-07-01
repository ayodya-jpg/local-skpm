<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('nomor_surat_requests', function (Blueprint $table) {
        $table->id();

        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->foreignId('kode_perihal_id')->constrained('kode_perihals')->cascadeOnDelete();
        $table->foreignId('kode_pemilik_id')->constrained('kode_pemiliks')->cascadeOnDelete();

        $table->date('tanggal_surat');
        $table->year('tahun');

        $table->string('judul_surat');
        $table->string('tujuan_surat');
        $table->text('keterangan')->nullable();

        $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

        $table->integer('nomor_urut')->nullable();
        $table->string('nomor_surat')->nullable();

        $table->string('file_dokumen')->nullable();

        $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
        $table->timestamp('approved_at')->nullable();

        $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
        $table->timestamp('rejected_at')->nullable();
        $table->text('rejected_reason')->nullable();

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nomor_surat_requests');
    }
};
