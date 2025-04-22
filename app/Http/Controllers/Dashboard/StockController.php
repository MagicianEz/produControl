<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckStockExistRequest;
use App\Models\MasterData;
use App\Models\SelectedStockCategory;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;
use App\Models\Category;
use App\Http\Requests\StockUpdateRequest;
use App\Models\Logging;
use App\Models\Stock;
use App\Models\Tag;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function api_check_stock_exist(CheckStockExistRequest $request)
    {
        $productData = $request->validated();
        $tags = $productData['tags'] ?? [];

        $matchingStocks = DB::table('selected_stock_category')
            ->join('stock', 'selected_stock_category.stock_id', '=', 'stock.id')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->select('selected_stock_category.stock_id')
            ->where('master_data.sku', '=', $productData['sku'])
            ->groupBy('selected_stock_category.stock_id')
            ->get();

        foreach ($matchingStocks as $stock) {
            $existingTags = DB::table('selected_stock_category')
                ->where('stock_id', $stock->stock_id)
                ->pluck('tag_id')
                ->toArray();

            if (empty(array_diff($tags, $existingTags)) && empty(array_diff($existingTags, $tags))) {
                $stockData = DB::table('stock')
                    ->join('master_data', 'stock.master_id', '=', 'master_data.id')
                    ->where('stock.id', '=', $stock->stock_id)
                    ->select('stock.*', 'master_data.sku', 'master_data.product_name')
                    ->first();

                return response()->json([
                    'code' => 200,
                    'message' => 'Data dengan kategori dan tags tersebut sudah ada, apakah Anda yakin ingin menggabungkan?',
                    'stock' => [
                        'id' => $stock->stock_id,
                        'data' => $stockData,
                        'quantity' => $stockData->quantity,
                        'price' => $stockData->price,
                    ],
                ], 200);
            }
        }

        return response()->json([
            'code' => 404,
            'message' => 'Data dengan kategori dan tags tersebut belum tersedia, Anda dapat membuatnya.',
        ], 404);
    }

    public function show(Request $request): Response
    {
        $products = DB::table('selected_stock_category')
            ->join('stock', 'selected_stock_category.stock_id', '=', 'stock.id')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->join('tag', 'selected_stock_category.tag_id', '=', 'tag.id')
            ->join('category', 'master_data.category_id', '=', 'category.id')
            ->select(
                'master_data.id as master_id',
                'master_data.product_name as product_name',
                'master_data.sku as sku',
                'stock.id as stock_id',
                'stock.quantity as product_quantity',
                'category.id as category_id',
                'category.name as category_name',
                'tag.id as tag_id',
                'tag.name as tag_name',
                'stock.price as product_price',
                'stock.created_at',
                'stock.updated_at'
            )
            ->where('tag.type', '=', 'stock')
            ->get();

        $groupedProducts = [];
        foreach ($products as $product) {
            if (!isset($groupedProducts[$product->stock_id])) {
                $groupedProducts[$product->stock_id] = [
                    'stock_id' => $product->stock_id,
                    'master_id' => $product->master_id,
                    'sku' => $product->sku,
                    'product_name' => $product->product_name,
                    'product_quantity' => $product->product_quantity,
                    'category_id' => $product->category_id,
                    'category_name' => $product->category_name,
                    'tags' => [],
                    'product_price' => $product->product_price,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at
                ];
            }
            $groupedProducts[$product->stock_id]['tags'][] = [
                'id' => $product->tag_id,
                'name' => $product->tag_name
            ];
        }
        $groupedProducts = array_values($groupedProducts);

        $allCategories = Category::select('id', 'name')->get();
        $transformedCategoriesArray = $allCategories->map(fn($category) => [
            'value' => $category->name,
            'label' => $category->name,
        ])->values()->toArray();

        $allTags = Tag::where('type', 'stock')->select('name')->get();
        $transformedTagsArray = $allTags->map(fn($tag) => [
            'value' => $tag->name,
            'label' => $tag->name,
        ])->values()->toArray();

        return Inertia::render('admin/stock/page', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Stock',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'search' => request('search'),
            'products' => $groupedProducts,
            'allCategory' => $transformedCategoriesArray,
            'allTag' => $transformedTagsArray,
        ]);
    }

    public function detail_show(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');

        if ($my_role == 'marketing' || !$id) {
            return Redirect::route('stock.show');
        }

        $stock = DB::table('stock')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->join('category', 'master_data.category_id', '=', 'category.id')
            ->where('stock.id', '=', $id)
            ->select(
                'stock.master_id as master_id',
                'master_data.sku as sku',
                'master_data.product_name as name',
                'stock.id as id',
                'stock.quantity as quantity',
                'stock.price as price',
                'category.id as category_id',
                'category.name as category_name'
            )
            ->first();

        if (!$stock) {
            return Redirect::route('stock.show')->with('error', 'Data tidak ditemukan.');
        }

        $tags = DB::table('selected_stock_category')
            ->join('tag', 'selected_stock_category.tag_id', '=', 'tag.id')
            ->where('selected_stock_category.stock_id', '=', $id)
            ->where('tag.type', '=', 'stock')
            ->select('tag.id as tag_id', 'tag.name as tag_name')
            ->get()
            ->map(fn($tag) => [
                'id' => $tag->tag_id,
                'name' => $tag->tag_name,
            ])
            ->values()
            ->all();

        $categoryStock = [
            'category_id' => $stock->category_id,
            'category_name' => $stock->category_name,
            'tags' => $tags,
        ];

        $categoryWithTags = Category::where('id', $stock->category_id)
            ->with(['tags' => function ($query) {
                $query->where('type', 'stock');
            }])
            ->first();

        if ($categoryWithTags) {
            $categoryWithTags = [
                'category_id' => $categoryWithTags->id,
                'category_name' => $categoryWithTags->name,
                'tags' => $categoryWithTags->tags->map(fn($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                ])->all(),
            ];
        } else {
            $categoryWithTags = null;
        }

        return Inertia::render('admin/stock/detail', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Stock Detail Data',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'stock' => $stock,
            'categoryStock' => $categoryStock,
            'categoryWithTags' => $categoryWithTags,
        ]);
    }

    public function delete_show(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');

        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('stock.show');
        }

        $stock = DB::table('stock')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->join('category', 'master_data.category_id', '=', 'category.id')
            ->where('stock.id', '=', $id)
            ->select(
                'stock.master_id as master_id',
                'master_data.sku as sku',
                'master_data.product_name as name',
                'stock.id as id',
                'stock.quantity as quantity',
                'category.id as category_id',
                'category.name as category_name'
            )
            ->first();

        if (!$stock) {
            return Redirect::route('stock.show');
        }

        $tags = DB::table('tag')
            ->join('selected_stock_category', 'tag.id', '=', 'selected_stock_category.tag_id')
            ->where('selected_stock_category.stock_id', '=', $id)
            ->where('tag.type', 'stock')
            ->select('tag.id as tag_id', 'tag.name as tag_name')
            ->get()
            ->map(function ($tag) {
                return [
                    'id' => $tag->tag_id,
                    'name' => $tag->tag_name,
                ];
            })
            ->values()
            ->all();

        $categoryWithTags = Category::with(['tags' => function ($query) {
                $query->where('type', 'stock');
            }])
            ->where('id', $stock->category_id)
            ->get()
            ->map(function ($category) {
                return [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'tags' => $category->tags->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'name' => $tag->name,
                        ];
                    })->all(),
                ];
            })
            ->first();

        return Inertia::render('admin/stock/delete', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Stock Hapus Data',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'stock' => [
                'id' => $stock->id,
                'master_id' => $stock->master_id,
                'sku' => $stock->sku,
                'name' => $stock->name,
                'quantity' => $stock->quantity,
                'category_id' => $stock->category_id,
                'category_name' => $stock->category_name,
                'tags' => $tags
            ],
            'categoryStock' => [
                'category_id' => $stock->category_id,
                'category_name' => $stock->category_name,
                'tags' => $tags
            ],
            'categoryWithTags' => $categoryWithTags,
        ]);
    }

    public function update(StockUpdateRequest $request)
    {
        $productData = $request->validated();
        $stock_id = $request->query('id');

        if (!$stock_id) {
            return Redirect::route('stock.show')->with('error', 'ID Stok tidak ditemukan.');
        }

        DB::beginTransaction();
        try {
            $master_data = MasterData::where('sku', $productData['sku'])->firstOrFail();
            $oldProductName = $master_data->product_name;
            $newProductName = $productData['product_name'];

            if ($oldProductName !== $newProductName) {
                $master_data->product_name = $newProductName;
                $master_data->save();

                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'edit',
                    'category' => 'stock',
                    'sku' => $productData['sku'],
                    'keterangan' => "Produk dengan SKU: {$productData['sku']} berhasil diperbaharui namanya dari '{$oldProductName}' menjadi '{$newProductName}'."
                ]);
            }

            $category = Category::findOrFail($master_data->category_id);
            $categoryName = $category->name;

            $tags = $productData['tags'];

            $existingStock = Stock::where('master_id', $master_data->id)
                ->where('id', '!=', $stock_id)
                ->whereExists(function ($query) use ($tags) {
                    $query->select(DB::raw(1))
                        ->from('selected_stock_category as ssc')
                        ->whereColumn('ssc.stock_id', 'stock.id')
                        ->whereIn('ssc.tag_id', $tags)
                        ->groupBy('ssc.stock_id')
                        ->havingRaw('COUNT(DISTINCT ssc.tag_id) = ?', [count($tags)])
                        ->havingRaw('COUNT(DISTINCT ssc.tag_id) = (SELECT COUNT(DISTINCT tag_id) FROM selected_stock_category WHERE stock_id = ssc.stock_id)');
                })
                ->first();


            $stock = Stock::findOrFail($stock_id);
            $oldQuantity = $stock->quantity;
            $newQuantity = $productData['quantity'];
            $oldPrice = $stock->price;
            $newPrice = $productData['price'];

            $oldTags = SelectedStockCategory::where('stock_id', $stock_id)->pluck('tag_id')->toArray();
            $oldTagsString = implode(', ', Tag::whereIn('id', $oldTags)->pluck('name')->toArray());
            $newTagsString = implode(', ', Tag::whereIn('id', $tags)->pluck('name')->toArray());

            if ($existingStock && $existingStock->id !== $stock_id) {
                $existingStock->quantity += $newQuantity;
                $existingStock->updated_at = now();
                $existingStock->save();

                $stock->delete();

                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'edit',
                    'category' => 'stock',
                    'sku' => $productData['sku'],
                    'keterangan' => "Produk dengan SKU: {$productData['sku']}, Kategori: {$categoryName}, Tags: ({$oldTagsString}), Jumlah: {$oldQuantity} berhasil disatukan dengan Stok yang memiliki Tags: ({$newTagsString}), Jumlah: {$newQuantity}."
                ]);
            } else {
                $stock->quantity = $newQuantity;
                $stock->price = $newPrice;
                $stock->updated_at = now();
                $stock->save();

                SelectedStockCategory::where('stock_id', $stock_id)->delete();
                foreach ($tags as $tag) {
                    SelectedStockCategory::create([
                        'stock_id' => $stock->id,
                        'tag_id' => $tag,
                    ]);
                }

                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'edit',
                    'category' => 'stock',
                    'sku' => $productData['sku'],
                    'keterangan' => "Produk dengan SKU: {$productData['sku']}, Kategori: {$categoryName}, Tags: ({$oldTagsString}), Harga: Rp" . number_format($oldPrice, 0, ',', '.') . ", Jumlah: {$oldQuantity} berhasil diperbarui menjadi Tags: ({$newTagsString}), Harga: Rp" . number_format($newPrice, 0, ',', '.') . ", Jumlah: {$newQuantity}."
                ]);
            }

            DB::commit();
            return Redirect::route('stock.show')->with('success', 'Berhasil mengubah data Stok.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('stock.show')->with('error', 'Terjadi kesalahan saat mengubah data Stok.');
        }
    }

    public function destroy(Request $request)
    {
        $stock_id = $request->query('id');

        DB::beginTransaction();
        try {
            $stock = Stock::find($stock_id);
            if (!$stock) {
                DB::rollBack();
                return Redirect::route('stock.show')->with('error', 'Data stok tidak ditemukan.');
            }

            $masterData = DB::table('master_data')
                ->join('stock', 'stock.master_id', '=', 'master_data.id')
                ->join('category', 'master_data.category_id', '=', 'category.id')
                ->where('stock.id', $stock->id)
                ->select('master_data.sku', 'master_data.product_name', 'category.name as category_name')
                ->first();

            if (!$masterData) {
                DB::rollBack();
                return Redirect::route('stock.show')->with('error', 'Data master produk tidak ditemukan.');
            }

            $tags = DB::table('tag')
                ->join('selected_stock_category', 'tag.id', '=', 'selected_stock_category.tag_id')
                ->where('selected_stock_category.stock_id', '=', $stock_id)
                ->where('tag.type', 'stock')
                ->pluck('tag.name')
                ->toArray();

            $harga = 'Rp' . number_format($stock->price, 0, ',', '.');

            Logging::create([
                'user_id' => $request->user()->id,
                'action' => 'hapus',
                'category' => 'stock',
                'sku' => $masterData->sku,
                'keterangan' => 'Produk dengan SKU: ' . $masterData->sku . ', Nama Produk: ' . $masterData->product_name .
                    ', Kategori: ' . $masterData->category_name . ', Tags: (' . implode(', ', $tags) . '), Harga: ' . $harga .
                    ', Jumlah: ' . $stock->quantity . '. Telah dihapus.'
            ]);

            $stock->delete();

            DB::commit();
            return Redirect::route('stock.show')->with('success', 'Berhasil menghapus data Stok.');

        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('stock.show')->with('error', 'Terjadi kesalahan saat menghapus data Stok.');
        }
    }
}