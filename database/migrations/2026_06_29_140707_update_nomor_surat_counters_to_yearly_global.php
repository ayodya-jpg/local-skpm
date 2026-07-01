<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. Hapus foreign key yang masih menempel pada kolom lama
        |--------------------------------------------------------------------------
        */

        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'nomor_surat_counters'
              AND COLUMN_NAME IN ('kode_perihal_id', 'kode_pemilik_id')
              AND REFERENCED_TABLE_NAME IS NOT NULL
        ");

        foreach ($foreignKeys as $foreignKey) {
            try {
                DB::statement(
                    "ALTER TABLE nomor_surat_counters DROP FOREIGN KEY `{$foreignKey->CONSTRAINT_NAME}`"
                );
            } catch (\Throwable $e) {
                //
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 2. Hapus index yang memakai kolom lama
        |--------------------------------------------------------------------------
        */

        $indexes = DB::select("SHOW INDEX FROM nomor_surat_counters");

        foreach ($indexes as $index) {
            $keyName = $index->Key_name;
            $columnName = $index->Column_name;

            if (
                $keyName !== 'PRIMARY' &&
                in_array($columnName, ['kode_perihal_id', 'kode_pemilik_id'])
            ) {
                try {
                    DB::statement("ALTER TABLE nomor_surat_counters DROP INDEX `$keyName`");
                } catch (\Throwable $e) {
                    //
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 3. Hapus kolom kode_perihal_id dan kode_pemilik_id
        |--------------------------------------------------------------------------
        */

        Schema::table('nomor_surat_counters', function (Blueprint $table) {
            if (Schema::hasColumn('nomor_surat_counters', 'kode_perihal_id')) {
                $table->dropColumn('kode_perihal_id');
            }
        });

        Schema::table('nomor_surat_counters', function (Blueprint $table) {
            if (Schema::hasColumn('nomor_surat_counters', 'kode_pemilik_id')) {
                $table->dropColumn('kode_pemilik_id');
            }
        });

        /*
        |--------------------------------------------------------------------------
        | 4. Rapikan data lama agar satu tahun hanya punya satu counter
        |--------------------------------------------------------------------------
        */

        $years = DB::table('nomor_surat_counters')
            ->select('tahun', DB::raw('MAX(last_number) as max_last_number'))
            ->groupBy('tahun')
            ->get();

        foreach ($years as $year) {
            $mainCounter = DB::table('nomor_surat_counters')
                ->where('tahun', $year->tahun)
                ->orderBy('id')
                ->first();

            if ($mainCounter) {
                DB::table('nomor_surat_counters')
                    ->where('id', $mainCounter->id)
                    ->update([
                        'last_number' => $year->max_last_number,
                        'updated_at' => now(),
                    ]);

                DB::table('nomor_surat_counters')
                    ->where('tahun', $year->tahun)
                    ->where('id', '!=', $mainCounter->id)
                    ->delete();
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 5. Tambahkan unique berdasarkan tahun
        |--------------------------------------------------------------------------
        | Jadi nomor surat global per tahun.
        */

        $indexesAfter = DB::select("SHOW INDEX FROM nomor_surat_counters");

        $hasUniqueTahun = collect($indexesAfter)->contains(function ($index) {
            return $index->Column_name === 'tahun' && (int) $index->Non_unique === 0;
        });

        if (! $hasUniqueTahun) {
            Schema::table('nomor_surat_counters', function (Blueprint $table) {
                $table->unique('tahun');
            });
        }
    }

    public function down(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Rollback sederhana
        |--------------------------------------------------------------------------
        */

        $indexes = DB::select("SHOW INDEX FROM nomor_surat_counters");

        foreach ($indexes as $index) {
            if (
                $index->Key_name !== 'PRIMARY' &&
                $index->Column_name === 'tahun' &&
                (int) $index->Non_unique === 0
            ) {
                try {
                    DB::statement("ALTER TABLE nomor_surat_counters DROP INDEX `{$index->Key_name}`");
                } catch (\Throwable $e) {
                    //
                }
            }
        }

        Schema::table('nomor_surat_counters', function (Blueprint $table) {
            if (! Schema::hasColumn('nomor_surat_counters', 'kode_perihal_id')) {
                $table->unsignedBigInteger('kode_perihal_id')->nullable()->after('tahun');
            }

            if (! Schema::hasColumn('nomor_surat_counters', 'kode_pemilik_id')) {
                $table->unsignedBigInteger('kode_pemilik_id')->nullable()->after('kode_perihal_id');
            }
        });
    }
};
