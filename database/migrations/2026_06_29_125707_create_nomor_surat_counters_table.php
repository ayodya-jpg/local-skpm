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
    Schema::create('nomor_surat_counters', function (Blueprint $table) {
        $table->id();

        $table->year('tahun');
        $table->foreignId('kode_perihal_id')->constrained('kode_perihals')->cascadeOnDelete();
        $table->foreignId('kode_pemilik_id')->constrained('kode_pemiliks')->cascadeOnDelete();

        $table->integer('last_number')->default(0);

        $table->timestamps();

        $table->unique(['tahun', 'kode_perihal_id', 'kode_pemilik_id'], 'unique_counter_nomor_surat');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nomor_surat_counters');
    }
};
