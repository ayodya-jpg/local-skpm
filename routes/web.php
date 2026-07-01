<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KodePerihalController;
use App\Http\Controllers\KodePemilikController;
use App\Http\Controllers\NomorSuratRequestController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\ArsipSuratController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */
    Route::get('/dashboard-data', [DashboardController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | User Management
    |--------------------------------------------------------------------------
    */
    Route::get('/user-management', [UserManagementController::class, 'index']);
    Route::post('/user-management', [UserManagementController::class, 'store']);
    Route::put('/user-management/{user}', [UserManagementController::class, 'update']);
    Route::delete('/user-management/{user}', [UserManagementController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Master Data Kode Perihal
    |--------------------------------------------------------------------------
    */
    Route::get('/kode-perihal', [KodePerihalController::class, 'index']);
    Route::post('/kode-perihal', [KodePerihalController::class, 'store']);
    Route::put('/kode-perihal/{id}', [KodePerihalController::class, 'update']);
    Route::delete('/kode-perihal/{id}', [KodePerihalController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Master Data Kode Pemilik / Unit / Prodi
    |--------------------------------------------------------------------------
    */
    Route::get('/kode-pemilik', [KodePemilikController::class, 'index']);
    Route::post('/kode-pemilik', [KodePemilikController::class, 'store']);
    Route::put('/kode-pemilik/{id}', [KodePemilikController::class, 'update']);
    Route::delete('/kode-pemilik/{id}', [KodePemilikController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Penomoran Surat
    |--------------------------------------------------------------------------
    | Alur:
    | 1. User ajukan nomor surat + upload dokumen awal
    | 2. Admin SEKPiM cek/download dokumen awal
    | 3. Admin approve/reject
    | 4. Kalau approve, nomor surat keluar
    | 5. User upload dokumen final yang sudah diberi nomor
    | 6. Admin cek dokumen final
    | 7. Admin klik selesai
    */
    Route::get('/nomor-surat', [NomorSuratRequestController::class, 'index']);
    Route::post('/nomor-surat', [NomorSuratRequestController::class, 'store']);

    Route::post('/nomor-surat/{id}/approve', [NomorSuratRequestController::class, 'approve']);
    Route::post('/nomor-surat/{id}/reject', [NomorSuratRequestController::class, 'reject']);

    Route::get('/nomor-surat/{id}/download-awal', [NomorSuratRequestController::class, 'downloadDokumenAwal']);
    Route::get('/nomor-surat/{id}/download-final', [NomorSuratRequestController::class, 'downloadDokumenFinal']);

    Route::post('/nomor-surat/{id}/upload-final', [NomorSuratRequestController::class, 'uploadFinal']);
    Route::post('/nomor-surat/{id}/complete', [NomorSuratRequestController::class, 'complete']);

    Route::delete('/nomor-surat/{id}', [NomorSuratRequestController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Laporan
    |--------------------------------------------------------------------------
    */
    Route::get('/laporan/nomor-surat', [LaporanController::class, 'nomorSurat']);

    /*
    |--------------------------------------------------------------------------
    | Arsip Surat Sementara
    |--------------------------------------------------------------------------
    */
    Route::get('/arsip-surat', [ArsipSuratController::class, 'index']);
    Route::post('/arsip-surat', [ArsipSuratController::class, 'store']);
    Route::put('/arsip-surat/{id}', [ArsipSuratController::class, 'update']);
    Route::delete('/arsip-surat/{id}', [ArsipSuratController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| React App Route
|--------------------------------------------------------------------------
| Route ini dipakai agar halaman React tetap bisa dibuka langsung dari URL:
| /app/d, /app/n/add, /app/n/history, /app/n/apv, /app/m/kp, dan lainnya.
| Letakkan di paling bawah agar tidak mengganggu route Laravel di atas.
*/
Route::get('/app/{any?}', function () {
    return view('welcome');
})->where('any', '.*');
