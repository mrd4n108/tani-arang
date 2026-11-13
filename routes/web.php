<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaniArangController;
use Illuminate\Support\Facades\Route;

Route::get('/', [TaniArangController::class, 'dashboard'])->name('dashboard');
Route::get('/facts', [TaniArangController::class, 'facts'])->name('facts');
Route::get('/scanner', [TaniArangController::class, 'scanner'])->name('scanner');
Route::post('/scanner/analyze', [TaniArangController::class, 'analyzeScan'])->name('scanner.analyze');
Route::post('/scanner/store', [TaniArangController::class, 'storeScan'])->name('scanner.store');
Route::get('/community-map', [TaniArangController::class, 'communityMap'])->name('community-map');

// Rute Developer 4: Manajemen Status & Arsip Log Dokumentasi
Route::patch('/community-map/scans/{scan}/status', [TaniArangController::class, 'updateScanStatus'])->name('scans.update-status');
Route::delete('/community-map/scans/{scan}', [TaniArangController::class, 'destroyScan'])->name('scans.destroy');
Route::post('/community-map/scans/{id}/restore', [TaniArangController::class, 'restoreScan'])->name('scans.restore');

Route::get('/contact', [TaniArangController::class, 'contact'])->name('contact');
Route::post('/contact', [TaniArangController::class, 'storeContact'])->name('contact.store');

// Rute Terproteksi Role Petani
Route::middleware(['auth', 'role:petani'])->group(function () {
    Route::get('/petani/history', [TaniArangController::class, 'petaniHistory'])->name('petani.history');
});

// Rute Terproteksi Role Komunitas
Route::middleware(['auth', 'role:komunitas'])->group(function () {
    Route::patch('/community-map/submissions/{id}/status', [TaniArangController::class, 'updateSubmissionStatus'])->name('submissions.update-status');
    Route::post('/community-map/submissions/{id}/verify', [TaniArangController::class, 'verifySubmission'])->name('submissions.verify');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
