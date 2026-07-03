<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE nomor_surat_requests
            MODIFY status ENUM(
                'pending',
                'approved',
                'final_submitted',
                'revision',
                'completed',
                'rejected'
            ) NULL DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE nomor_surat_requests
            MODIFY status ENUM(
                'pending',
                'approved',
                'final_submitted',
                'completed',
                'rejected'
            ) NULL DEFAULT 'pending'
        ");
    }
};
