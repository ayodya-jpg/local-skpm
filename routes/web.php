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

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard-data', [DashboardController::class, 'index']);
    Route::get('/dashboard-units', [DashboardController::class, 'units']);
    Route::get('/dashboard-units/{unit}', [DashboardController::class, 'unitDetail']);

    Route::get('/user-management', [UserManagementController::class, 'index']);
    Route::post('/user-management', [UserManagementController::class, 'store']);
    Route::put('/user-management/{user}', [UserManagementController::class, 'update']);
    Route::post('/user-management/{user}/activate', [UserManagementController::class, 'activate']);
    Route::post('/user-management/{user}/deactivate', [UserManagementController::class, 'deactivate']);
    Route::post('/user-management/{user}/reject', [UserManagementController::class, 'reject']);
    Route::delete('/user-management/{user}', [UserManagementController::class, 'destroy']);

    Route::get('/kode-perihal', [KodePerihalController::class, 'index']);
    Route::post('/kode-perihal', [KodePerihalController::class, 'store']);
    Route::put('/kode-perihal/{id}', [KodePerihalController::class, 'update']);
    Route::delete('/kode-perihal/{id}', [KodePerihalController::class, 'destroy']);

    Route::get('/kode-pemilik', [KodePemilikController::class, 'index']);
    Route::post('/kode-pemilik', [KodePemilikController::class, 'store']);
    Route::put('/kode-pemilik/{id}', [KodePemilikController::class, 'update']);
    Route::delete('/kode-pemilik/{id}', [KodePemilikController::class, 'destroy']);

    Route::get('/nomor-surat', [NomorSuratRequestController::class, 'index']);
    Route::post('/nomor-surat', [NomorSuratRequestController::class, 'store']);

    Route::post('/nomor-surat/{id}/approve', [NomorSuratRequestController::class, 'approve']);
    Route::post('/nomor-surat/{id}/reject', [NomorSuratRequestController::class, 'reject']);

    Route::get('/nomor-surat/{id}/preview-awal', [NomorSuratRequestController::class, 'previewDokumenAwal']);
    Route::get('/nomor-surat/{id}/preview-final', [NomorSuratRequestController::class, 'previewDokumenFinal']);

    Route::get('/nomor-surat/{id}/download-awal', [NomorSuratRequestController::class, 'downloadDokumenAwal']);
    Route::get('/nomor-surat/{id}/download-final', [NomorSuratRequestController::class, 'downloadDokumenFinal']);

    Route::post('/nomor-surat/{id}/upload-final', [NomorSuratRequestController::class, 'uploadFinal']);
    Route::post('/nomor-surat/{id}/revision-final', [NomorSuratRequestController::class, 'revisionFinal']);
    Route::post('/nomor-surat/{id}/complete', [NomorSuratRequestController::class, 'complete']);

    Route::delete('/nomor-surat/{id}', [NomorSuratRequestController::class, 'destroy']);

    Route::get('/laporan/nomor-surat', [LaporanController::class, 'nomorSurat']);
    Route::get('/laporan/surat-keluar/data', [LaporanController::class, 'suratKeluarData']);
    Route::get('/laporan/surat-keluar/export-excel', [LaporanController::class, 'exportSuratKeluarExcel']);

    Route::get('/arsip-surat', [ArsipSuratController::class, 'index']);
    Route::post('/arsip-surat', [ArsipSuratController::class, 'store']);
    Route::put('/arsip-surat/{id}', [ArsipSuratController::class, 'update']);
    Route::delete('/arsip-surat/{id}', [ArsipSuratController::class, 'destroy']);
});

Route::get('/app/{any?}', function () {
    return view('welcome');
})->where('any', '.*');