<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\ProductionController;
use App\Http\Controllers\Dashboard\StockController;
use App\Http\Controllers\Dashboard\DeliveryController;
use App\Http\Controllers\Dashboard\ProfileController;
use App\Http\Controllers\Dashboard\UserController;
use App\Http\Controllers\Dashboard\CategoryController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

Route::group(['prefix' => 'dashboard', 'middleware' => ['auth', 'verified']], function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard.show');

    Route::group(['prefix' => 'category'], function () {
        Route::get('/', [CategoryController::class, 'index'])->name('category.show');
        Route::get('/detail', [CategoryController::class, 'detail'])->name('category.detail.show');
        Route::get('/delete', [CategoryController::class, 'delete'])->name('category.delete.show');
        Route::patch('/update', [CategoryController::class, 'update'])->name('category.update');
        Route::delete('/destroy', [CategoryController::class, 'destroy'])->name('category.destroy');
    });

    Route::group(['prefix' => 'production'], function () {
        Route::get('/api/product-name', [ProductionController::class, 'api_get_product_name'])->name('api.product.name');
        Route::get('/api/category', [ProductionController::class, 'api_get_category'])->name('api.category');
        Route::get('/api/check-product-exist', [ProductionController::class, 'api_check_production_exist'])->name('api.production.check.product.exist');
        Route::get('/api/production-max-quantity', [ProductionController::class, 'api_get_production_max_quantity'])->name('api.production.max.quantity');
        Route::get('/', [ProductionController::class, 'show'])->name('production.show');
        Route::get('/detail', [ProductionController::class, 'detail_show'])->name('production.detail.show');
        Route::get('/add', [ProductionController::class, 'create_show'])->name('production.add.show');
        Route::get('/add/category', [ProductionController::class, 'create_category_show'])->name('production.add.category.show');
        Route::get('/move', [ProductionController::class, 'move_show'])->name('production.move.show');
        Route::get('/merge', [ProductionController::class, 'merge_show'])->name('production.merge.show');
        Route::get('/delete', [ProductionController::class, 'delete_show'])->name('production.delete.show');
        Route::post('/add', [ProductionController::class, 'store'])->name('production.add.store');
        Route::post('/add/category', [ProductionController::class, 'category_store'])->name('production.add.category.store');
        Route::post('/move', [ProductionController::class, 'move_store'])->name('production.move.store');
        Route::post('/merge', [ProductionController::class, 'merge_store'])->name('production.merge.store');
        Route::patch('/update', [ProductionController::class, 'update'])->name('production.update');
        Route::delete('/destroy', [ProductionController::class, 'destroy'])->name('production.destroy');
    });

    Route::group(['prefix' => 'stock'], function () {
        Route::get('/api/product-name', [StockController::class, 'api_get_stock_product_name'])->name('api.stock.product.name.exist');
        Route::get('/api/check-product-exist', [StockController::class, 'api_check_production_exist'])->name('api.stock.check.product.exist');
        Route::get('/', [StockController::class, 'show'])->name('stock.show');
        Route::get('/detail', [StockController::class, 'detail_show'])->name('stock.detail.show');
        Route::get('/add/category', [StockController::class, 'category_show'])->name('stock.add.category.show');
        Route::get('/move', [StockController::class, 'move_show'])->name('stock.move.show');
        Route::get('/delete', [StockController::class, 'delete_show'])->name('stock.delete.show');
        Route::post('/add/category', [StockController::class, 'category_store'])->name('stock.add.category.store');
        Route::post('/move', [StockController::class, 'move_store'])->name('stock.move.store');
        Route::patch('/update', [StockController::class, 'update'])->name('stock.update');
        Route::delete('/destroy', [StockController::class, 'destroy'])->name('stock.destroy');
    });

    Route::group(['prefix' => 'delivery'], function () {
        Route::get('/api/tujuan', [DeliveryController::class, 'api_get_tujuan'])->name('api.delivery.retur.tujuan');
        Route::get('/', [DeliveryController::class, 'show'])->name('delivery.show');
        Route::get('/detail', [DeliveryController::class, 'detail'])->name('delivery.detail.show');
        Route::get('/delete', [DeliveryController::class, 'delete'])->name('delivery.delete.show');
        Route::get('/retur', [DeliveryController::class, 'retur'])->name('delivery.retur.show');
        Route::patch('/retur/update', [DeliveryController::class, 'retur_update'])->name('delivery.retur.update');
        Route::patch('/update', [DeliveryController::class, 'update'])->name('delivery.update');
        Route::delete('/destroy', [DeliveryController::class, 'destroy'])->name('delivery.destroy');
    });

    Route::group(['prefix' => 'user'], function () {
        Route::get('/', [UserController::class, 'show'])->name('user.show');
        Route::get('/add', [UserController::class, 'create_show'])->name('user.create.show');
        Route::get('/detail', [UserController::class, 'detail_show'])->name('user.detail.show');
        Route::get('/delete', [UserController::class, 'delete_show'])->name('user.delete.show');
        Route::post('/add', [UserController::class, 'store'])->name('user.create.store');
        Route::patch('/update', [UserController::class, 'update'])->name('user.update');
        Route::delete('/destroy', [UserController::class, 'destroy'])->name('user.destroy');
    });

    Route::group(['prefix' => 'profile'], function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });
});

require __DIR__ . '/auth.php';
