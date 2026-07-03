<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\KodePerihalController;
use App\Http\Controllers\KodePemilikController;
use App\Http\Controllers\NomorSuratRequestController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\ArsipController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', function () {
    return view('welcome');
})->name('login');

Route::get('/app', function () {
    return view('welcome');
});

Route::get('/app/{any}', function () {
    return view('welcome');
})->where('any', '.*');

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard-units', [DashboardController::class, 'units']);
    Route::get('/dashboard-units/{unit}', [DashboardController::class, 'unitDetail']);

    Route::get('/users', [UserManagementController::class, 'index']);
    Route::post('/users/{id}/activate', [UserManagementController::class, 'activate']);
    Route::post('/users/{id}/deactivate', [UserManagementController::class, 'deactivate']);
    Route::post('/users/{id}/update-role', [UserManagementController::class, 'updateRole']);
    Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);

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
    Route::post('/nomor-surat/{id}/revision', [NomorSuratRequestController::class, 'revision']);
    Route::post('/nomor-surat/{id}/complete', [NomorSuratRequestController::class, 'complete']);

    Route::post('/nomor-surat/{id}/upload-final', [NomorSuratRequestController::class, 'uploadFinal']);

    Route::get('/nomor-surat/{id}/preview-awal', [NomorSuratRequestController::class, 'previewAwal']);
    Route::get('/nomor-surat/{id}/preview-final', [NomorSuratRequestController::class, 'previewFinal']);
    Route::get('/nomor-surat/{id}/download-awal', [NomorSuratRequestController::class, 'downloadAwal']);
    Route::get('/nomor-surat/{id}/download-final', [NomorSuratRequestController::class, 'downloadFinal']);

    Route::get('/laporan/nomor-surat', [LaporanController::class, 'nomorSurat']);
    Route::get('/laporan/surat-keluar/data', [LaporanController::class, 'suratKeluarData']);
    Route::get('/laporan/surat-keluar/export-excel', [LaporanController::class, 'exportSuratKeluarExcel']);

    Route::get('/arsip/surat-keluar', [ArsipController::class, 'suratKeluar']);
});
