<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/user-management', [UserManagementController::class, 'index']);
    Route::post('/user-management', [UserManagementController::class, 'store']);
    Route::put('/user-management/{user}', [UserManagementController::class, 'update']);
    Route::delete('/user-management/{user}', [UserManagementController::class, 'destroy']);
});
