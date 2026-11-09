<?php

use App\Http\Controllers\TaniArangController;
use Illuminate\Support\Facades\Route;

Route::get('/', [TaniArangController::class, 'dashboard'])->name('dashboard');
Route::get('/facts', [TaniArangController::class, 'facts'])->name('facts');
Route::get('/scanner', [TaniArangController::class, 'scanner'])->name('scanner');
Route::post('/scanner/analyze', [TaniArangController::class, 'analyzeScan'])->name('scanner.analyze');
Route::post('/scanner/store', [TaniArangController::class, 'storeScan'])->name('scanner.store');
Route::get('/community-map', [TaniArangController::class, 'communityMap'])->name('community-map');
Route::get('/contact', [TaniArangController::class, 'contact'])->name('contact');
Route::post('/contact', [TaniArangController::class, 'storeContact'])->name('contact.store');