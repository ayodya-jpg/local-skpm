<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('nomor_surat_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('nomor_surat_requests', 'revision_note')) {
                $table->text('revision_note')
                    ->nullable()
                    ->after('status');
            }

            if (!Schema::hasColumn('nomor_surat_requests', 'revision_by')) {
                $table->foreignId('revision_by')
                    ->nullable()
                    ->after('revision_note')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('nomor_surat_requests', 'revision_at')) {
                $table->timestamp('revision_at')
                    ->nullable()
                    ->after('revision_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('nomor_surat_requests', function (Blueprint $table) {
            if (Schema::hasColumn('nomor_surat_requests', 'revision_by')) {
                $table->dropConstrainedForeignId('revision_by');
            }

            if (Schema::hasColumn('nomor_surat_requests', 'revision_at')) {
                $table->dropColumn('revision_at');
            }

            if (Schema::hasColumn('nomor_surat_requests', 'revision_note')) {
                $table->dropColumn('revision_note');
            }
        });
    }
};