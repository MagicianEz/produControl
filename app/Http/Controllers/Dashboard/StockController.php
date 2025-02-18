<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckStockExistRequest;
use App\Http\Requests\GetCategoryStock;
use App\Http\Requests\StockMoveRequest;
use App\Models\MasterData;
use App\Models\SelectedStockCategory;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;
use App\Models\Category;
use App\Http\Requests\ProductionCategoryRequest;
use App\Http\Requests\StockUpdateRequest;
use App\Models\Delivery;
use App\Models\Logging;
use App\Models\Stock;
use App\Models\Tag;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function api_get_stock_product_name(GetCategoryStock $request)
    {
        $productData = $request->validated();
        $product = DB::table('master_data')
            ->select('product_name')
            ->where('sku', $productData['sku'])
            ->first();
        if ($product) {
            return response()->json([
                'code' => 200,
                'data' => [
                    'name' => $product->product_name,
                ],
            ], 200);
        } else {
            return response()->json([
                'code' => 404,
                'message' => 'Product not found for the given SKU',
            ], 404);
        }
    }

    public function api_check_production_exist(CheckStockExistRequest $request)
    {
        $productData = $request->validated();
        $tags = $productData['tags'];
        $categoryQuery = DB::table('selected_stock_category')
            ->join('stock', 'selected_stock_category.stock_id', '=', 'stock.id')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->select('selected_stock_category.stock_id as stock_id')
            ->where('master_data.sku', '=', $productData['sku'])
            ->where('selected_stock_category.category_id', '=', $productData['category_id'])
            ->whereExists(function ($query) use ($tags) {
                $query->select(DB::raw(1))
                    ->from('selected_stock_category as spc')
                    ->whereColumn('spc.stock_id', 'selected_stock_category.stock_id')
                    ->whereIn('spc.tag_id', $tags)
                    ->groupBy('spc.stock_id')
                    ->havingRaw('COUNT(DISTINCT spc.tag_id) = ?', [count($tags)])
                    ->havingRaw('COUNT(DISTINCT spc.tag_id) = (SELECT COUNT(DISTINCT tag_id) FROM selected_stock_category WHERE stock_id = spc.stock_id)');
            });
        $category = $categoryQuery->first();
        $stockData = DB::table('stock')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->where('stock.id', '=', $category->stock_id)
            ->select('stock.*', 'master_data.sku', 'master_data.product_name')
            ->first();
        if ($category) {
            return response()->json([
                'code' => 200,
                'message' => 'Data dengan kategori dan tags tersebut sudah ada, apakah anda yakin ingin menggabungkan keduanya?',
                'stock' => [
                    'id' => $category->stock_id,
                    'data' => $stockData,
                    'quantity' => Stock::find($category->stock_id)->quantity,
                    'price' => Stock::find($category->stock_id)->price,
                ],
            ], 200);
        } else {
            return response()->json([
                'code' => 404,
                'message' => 'Data dengan kategori tersebut belum tersedia, anda dapat membuatnya.',
            ], 404);
        }
    }

    public function show(Request $request): Response
    {
        $products = DB::table('selected_stock_category')
            ->join('stock', 'selected_stock_category.stock_id', '=', 'stock.id')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->join('category', 'selected_stock_category.category_id', '=', 'category.id')
            ->join('tag', 'selected_stock_category.tag_id', '=', 'tag.id')
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
            ->where('category.type', '=', 'stock')
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

        $ALLCATEGORY = Category::all()->where('type', '=', 'stock');
        $transformedCategories = $ALLCATEGORY->map(function ($category) {
            return [
                'value' => $category->name,
                'label' => $category->name,
            ];
        });
        $transformedCategoriesArray = $transformedCategories->values()->toArray();

        $ALLTAG = DB::table('tag')
            ->join('category', 'tag.category_id', '=', 'category.id')
            ->where('category.type', '=', 'stock')
            ->select('tag.name as name')
            ->get();
        $transformedTags = $ALLTAG->map(function ($tag) {
            return [
                'value' => $tag->name,
                'label' => $tag->name,
            ];
        });
        $transformedTagsArray = $transformedTags->values()->toArray();
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
        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('stock.show');
        }
        $categoryStockRaw = DB::table('selected_stock_category as ssc')
            ->join('category', 'ssc.category_id', '=', 'category.id')
            ->join('tag', 'ssc.tag_id', '=', 'tag.id')
            ->where('ssc.stock_id', '=', $id)
            ->select('category.id as category_id', 'category.name as category_name', 'tag.id as tag_id', 'tag.name as tag_name')
            ->get();
        $categoryStockArray = $categoryStockRaw->groupBy('category_id')->map(function ($items, $categoryId) {
            return [
                'category_id' => $categoryId,
                'category_name' => $items->first()->category_name,
                'tags' => $items->map(function ($item) {
                    return [
                        'id' => $item->tag_id,
                        'name' => $item->tag_name,
                    ];
                })->values()->all(),
            ];
        })->values()->all();
        if (empty($categoryStockArray)) {
            return Redirect::route('stock.show');
        }
        $categoryStock = $categoryStockArray[0];
        $categoryWithTags = Category::with('tags')
            ->where('name', '=', $categoryStock['category_name'])
            ->where('type', '=', 'stock')
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
            });
        $stock = DB::table('stock')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->where('stock.id', '=', $id)
            ->select('stock.master_id as master_id', 'master_data.sku as sku', 'master_data.product_name as name', 'stock.id as id', 'stock.quantity as quantity', 'stock.price as price')
            ->get()
            ->first();
        return Inertia::render('admin/stock/detail', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Stock Detail Data',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'stock' => $stock,
            'categoryStock' => $categoryStock,
            'categoryWithTags' => $categoryWithTags[0],
        ]);
    }

    public function category_show(Request $request)
    {
        $my_role = $request->user()->role;
        if ($my_role == 'marketing') {
            return Redirect::route('stock.show');
        }
        return Inertia::render('admin/stock/category', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Stock Tambah Kategori',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
        ]);
    }

    public function move_show(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');
        if ($my_role == 'marketing' || is_null($id)) {
            return Redirect::route('production.show');
        }
        $product = DB::table('selected_stock_category as spc')
            ->join('stock as s', 'spc.stock_id', '=', 's.id')
            ->join('master_data as md', 's.master_id', '=', 'md.id')
            ->join('category as c', 'spc.category_id', '=', 'c.id')
            ->where('s.id', $id)
            ->where('c.type', 'stock')
            ->select('s.id as stock_id', 'md.sku', 'md.product_name', 's.quantity', 's.price', 'c.name as category_name', 'spc.tag_id')
            ->get();

        if ($product->isEmpty()) {
            return Redirect::route('stock.show');
        }
        $result = $product->groupBy(function ($item) {
            return $item->sku . $item->product_name . $item->quantity . $item->price . $item->category_name;
        })->map(function ($groupedItems) {
            $firstItem = $groupedItems->first();
            return [
                'stock_id' => $firstItem->stock_id,
                'price' => $firstItem->price,
                'sku' => $firstItem->sku,
                'product_name' => $firstItem->product_name,
                'quantity' => $firstItem->quantity,
                'category_name' => $firstItem->category_name,
                'tag' => $groupedItems->pluck('tag_id')->all(),
            ];
        })->values();
        if ($result->isEmpty()) {
            return Redirect::route('stock.show');
        }
        return Inertia::render('admin/stock/move', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Stock Move To Delivery',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'product' => $result->first(),
        ]);
    }

    public function delete_show(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');
        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('stock.show');
        }
        $categoryStockRaw = DB::table('selected_stock_category as ssc')
            ->join('category', 'ssc.category_id', '=', 'category.id')
            ->join('tag', 'ssc.tag_id', '=', 'tag.id')
            ->where('ssc.stock_id', '=', $id)
            ->select('category.id as category_id', 'category.name as category_name', 'tag.id as tag_id', 'tag.name as tag_name')
            ->get();
        $categoryStockArray = $categoryStockRaw->groupBy('category_id')->map(function ($items, $categoryId) {
            return [
                'category_id' => $categoryId,
                'category_name' => $items->first()->category_name,
                'tags' => $items->map(function ($item) {
                    return [
                        'id' => $item->tag_id,
                        'name' => $item->tag_name,
                    ];
                })->values()->all(),
            ];
        })->values()->all();
        if (empty($categoryStockArray)) {
            return Redirect::route('stock.show');
        }
        $categoryStock = $categoryStockArray[0];
        $categoryWithTags = Category::with('tags')
            ->where('name', '=', $categoryStock['category_name'])
            ->where('type', '=', 'stock')
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
            });
        $stock = DB::table('stock')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->where('stock.id', '=', $id)
            ->select('stock.master_id as master_id', 'master_data.sku as sku', 'master_data.product_name as name', 'stock.id as id', 'stock.quantity as quantity')
            ->get()
            ->first();
        return Inertia::render('admin/stock/delete', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Stock Hapus Data',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'stock' => $stock,
            'categoryStock' => $categoryStock,
            'categoryWithTags' => $categoryWithTags[0],
        ]);
    }

    public function category_store(ProductionCategoryRequest $request)
    {
        $categoryData = $request->validated();
        DB::beginTransaction();
        try {
            $CATEGORY = Category::create([
                'name' => $categoryData['name'],
                'type' => 'stock',
            ]);
            $tags = explode(',', $categoryData['tags']);
            foreach ($tags as $tag) {
                Tag::create([
                    'name' => ucwords(trim($tag)),
                    'category_id' => $CATEGORY->id,
                ]);
            }
            DB::commit();
            return Redirect::route('stock.show')->with('success', 'Stock category berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('stock.show')->with('error', 'Terjadi kesalahan saat membuat kategori stock.');
        }
    }

    public function move_store(StockMoveRequest $request)
    {
        $productData = $request->validated();
        $deliveryExist = Delivery::where('invoice', '=', $productData['invoice'])->first();
        if ($deliveryExist) {
            return redirect()->route('stock.show')->with('error', 'Nomor invoice sudah digunakan.');
        }
        DB::beginTransaction();
        try {
            $stock = Stock::where('id', $productData['stock_id'])
                ->where('quantity', '>=', $productData['quantity'])
                ->first();
            if (!$stock) {
                DB::rollBack();
                return redirect()->route('stock.show')->with('error', 'Product tidak tersedia atau jumlah tidak mencukupi.');
            }
            $stock->quantity -= $productData['quantity'];
            $stock->save();
            $product = MasterData::find($stock->master_id);
            Delivery::create(attributes: [
                'invoice' => $productData['invoice'],
                'quantity' => $productData['quantity'],
                'master_id' => $product['id'],
                'total_price' => $stock->price * $productData['quantity'],
            ]);
            $masterData = MasterData::find($stock->master_id);
            $updateProductionCategory = DB::table('selected_stock_category as ssc')
                ->join('stock', 'ssc.stock_id', '=', 'stock.id')
                ->join('category', 'ssc.category_id', '=', 'category.id')
                ->join('tag', 'ssc.tag_id', '=', 'tag.id')
                ->where('stock.id', $productData['stock_id'])
                ->select([
                    'category.name as category_name',
                    'tag.name as tag_name'
                ])->get();
            $listTag = $updateProductionCategory->map(function ($category) {
                return $category->tag_name;
            });
            $harga = 'Rp' . number_format($stock->price * $productData['quantity'], 0, ',', '.');
            Logging::create([
                'user_id' => $request->user()->id,
                'action' => 'move',
                'category' => 'stock',
                'sku' => $masterData->sku,
                // Produk dengan SKU: BOT001, Kategori: Cap, Tags: (Sortir, Assembling, Repacking), dan Harga: Rp20.000. Berhasil dipindahkan ke Delivery dengan No Invoice: TKI_10010105, dan Jumlah: 2.
                'keterangan' => 'Produk dengan SKU: ' . $masterData->sku . ', Kategori: ' . $updateProductionCategory[0]->category_name . ', Tags: (' . implode(', ', $listTag->toArray()) . '), dan Harga: ' . $harga  . '. Berhasil dipindahkan ke Delivery dengan Nomor Invoice: ' . $productData['invoice'] . ', dan Jumlah: ' . $productData['quantity'] . '.'
            ]);
            DB::commit();
            return redirect()->route('delivery.show')->with('success', 'Product berhasil dipindahkan ke delivery.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('stock.show')->with('error', 'Terjadi kesalahan saat memindahkan produk ke stock.');
        }
    }

    public function update(StockUpdateRequest $request)
    {
        $productData = $request->validated();
        $stock_id = $request->query('id');
        DB::beginTransaction();
        try {
            $master_data = MasterData::where('sku', $productData['sku'])->first();
            $MASTERDATA_DATABASE_NAMA = $master_data->product_name;
            if ($master_data && $master_data->product_name != $productData['product_name']) {
                $master_data->product_name = $productData['product_name'];
                $master_data->save();
                DB::commit();
            }
            $MASTERDATA_BARU_NAMA = $master_data->product_name;
            $stockIds = DB::table('selected_stock_category as ssc')
                ->join('stock', 'ssc.stock_id', '=', 'stock.id')
                ->join('master_data', 'stock.master_id', '=', 'master_data.id')
                ->select('stock.id as stock_id')
                ->where('master_data.sku', $productData['sku'])
                ->groupBy('stock.id')
                ->havingRaw("GROUP_CONCAT(ssc.tag_id ORDER BY ssc.tag_id ASC) = ?", [implode(',', $productData['tags'])])
                ->pluck('stock_id')
                ->first();
            $stockExists = DB::table('stock')
                ->join('master_data', 'stock.master_id', '=', 'master_data.id')
                ->where('master_data.sku', $productData['sku'])
                ->select('stock.id')
                ->get();
            $filteredStockIds = [];
            foreach ($stockExists as $stockExist) {
                $associatedTags = DB::table('selected_stock_category')
                    ->where('stock_id', $stockExist->id)
                    ->pluck('tag_id')
                    ->toArray();
                if (empty(array_diff($productData['tags'], $associatedTags)) && empty(array_diff($associatedTags, $productData['tags']))) {
                    $filteredStockIds[] = $stockExist->id;
                }
            }
            $stockIds = reset($filteredStockIds);
            $stock = Stock::find($stock_id);
            $MASTERDATA_DATABASE_QUANTITY = $stock->quantity;
            $MASTERDATA_DATABASE_PRICE = $stock->price;
            $MASTERDATA_BARU_QUANTITY = 0;
            $MASTERDATA_BARU_PRICE = 0;
            $TAGLAMA = DB::table('selected_stock_category as ssc')
                ->join('tag', 'ssc.tag_id', '=', 'tag.id')
                ->where('ssc.stock_id', $stock_id)
                ->select('ssc.*', 'tag.*')
                ->get()
                ->pluck('name')->toArray();
            if ($stockIds) {
                $updateStockExist = Stock::find($stockIds);
                if ($stock && $updateStockExist) {
                    $stock->quantity -= $productData['quantity'];
                    $stock->save();
                    $updateStock = Stock::find($stockIds);
                    if ($stock->id == $updateStock->id) {
                        $updateStock->quantity = $productData['quantity'];
                        $updateStock->price = $productData['price'];
                        $updateStock->save();
                    } else {
                        $updateStock->quantity += $productData['quantity'];
                        $updateStock->price = $productData['price'];
                        $updateStock->save();
                    }
                    $MASTERDATA_BARU_QUANTITY = $updateStock->quantity;
                    $MASTERDATA_BARU_PRICE = $updateStock->price;
                    $updateStockCategory = DB::table('selected_stock_category as ssc')
                        ->join('stock', 'ssc.stock_id', '=', 'stock.id')
                        ->join('category', 'ssc.category_id', '=', 'category.id')
                        ->join('tag', 'ssc.tag_id', '=', 'tag.id')
                        ->where('stock.id', $updateStock->id)
                        ->select([
                            'category.name as category_name',
                            'tag.name as tag_name'
                        ])->get();
                    $categorySelected = $updateStockCategory->isNotEmpty() ? $updateStockCategory[0]->category_name : 'N/A';
                    $listTag = $updateStockCategory->map(function ($category) {
                        return $category->tag_name;
                    });
                    $hargaAwal = 'Rp' . number_format($MASTERDATA_DATABASE_PRICE, 0, ',', '.');
                    $harga = 'Rp' . number_format($productData['price'], 0, ',', '.');
                    $hargaBaru = 'Rp' . number_format($MASTERDATA_BARU_PRICE, 0, ',', '.');
                    if ($MASTERDATA_DATABASE_NAMA != $MASTERDATA_BARU_NAMA) {
                        Logging::create([
                            'user_id' => $request->user()->id,
                            'action' => 'edit',
                            'category' => 'stock',
                            'sku' => $productData['sku'],
                            'keterangan' => '111 Produk dengan SKU: ' . $productData['sku'] .
                                ' dan Nama Produk: ' . $MASTERDATA_DATABASE_NAMA . '. Berhasil ubah Nama Produk menjadi: ' . $MASTERDATA_BARU_NAMA . '.'
                        ]);
                        DB::commit();
                    } else if (empty(array_diff($TAGLAMA, $listTag->toArray())) && empty(array_diff($TAGLAMA, $listTag->toArray()))) {
                        Logging::create([
                            'user_id' => $request->user()->id,
                            'action' => 'edit',
                            'category' => 'stock',
                            'sku' => $productData['sku'],
                            'keterangan' => '222 Produk dengan SKU: ' . $productData['sku'] .
                                ' Kategori: ' . $categorySelected . ' Tags: (' . implode(', ', $TAGLAMA) . '), Harga: ' . $hargaAwal .
                                ', dan Jumlah: ' . $MASTERDATA_DATABASE_QUANTITY .
                                '. Berhasil diubah menjadi Tags: (' . implode(', ', $listTag->toArray()) .
                                '), Harga: ' . $harga . ', dan Jumlah: ' . $productData['quantity'] . '.'
                        ]);
                        DB::commit();
                        return Redirect::route('stock.show')->with('success', 'Stock berhasil diubah');
                    } else {
                        Logging::create([
                            'user_id' => $request->user()->id,
                            'action' => 'edit',
                            'category' => 'stock',
                            'sku' => $productData['sku'],
                            'keterangan' => '333 Produk dengan SKU: ' . $productData['sku'] .
                                ', Kategori: ' . $categorySelected . ', Tags: (' . implode(', ', $TAGLAMA) . '), Harga: ' . $hargaAwal . ', dan Jumlah: ' . $MASTERDATA_DATABASE_QUANTITY . '. Berhasil diubah menjadi Tags: (' . implode(', ', $listTag->toArray()) .
                                '), Harga: ' . $hargaBaru . ', dan Jumlah: ' . $MASTERDATA_BARU_QUANTITY . '.'
                        ]);
                        DB::commit();
                    }
                    if ($MASTERDATA_DATABASE_QUANTITY != $MASTERDATA_BARU_QUANTITY || $MASTERDATA_DATABASE_PRICE != $MASTERDATA_BARU_PRICE) {
                        Logging::create([
                            'user_id' => $request->user()->id,
                            'action' => 'edit',
                            'category' => 'stock',
                            'sku' => $productData['sku'],
                            'keterangan' => '444 Produk dengan SKU: ' . $productData['sku'] .
                                ' Kategori: ' . $categorySelected . ' Tags: (' . implode(', ', $TAGLAMA) . '), Harga: ' . $hargaAwal .
                                ', dan Jumlah: ' . $MASTERDATA_DATABASE_QUANTITY .
                                '. Berhasil diubah menjadi Tags: (' . implode(', ', $listTag->toArray()) .
                                '), Harga: ' . $harga . ', dan Jumlah: ' . $productData['quantity'] . '.'
                        ]);
                        DB::commit();
                    }
                    return Redirect::route('stock.show')->with('success', 'Stock berhasil diubah');
                } else {
                    DB::rollBack();
                    return Redirect::route('stock.show')->with('error', 'Error! Data dengan sku dan Tags tersebut sudah ada.');
                }
            } else {
                $stock = Stock::findOrFail($stock_id);
                $stock->quantity = $productData['quantity'];
                $stock->price = $productData['price'];
                $stock->save();
                $selectedStockCategory = SelectedStockCategory::where('stock_id', $stock_id);
                if ($selectedStockCategory->exists()) {
                    $selectedStockCategory->delete();
                }
                $listTag = [];
                if (!empty($productData['tags'])) {
                    foreach ($productData['tags'] as $tag) {
                        $tagSearch = Tag::find($tag);
                        $listTag[] = $tagSearch->name;
                        SelectedStockCategory::create([
                            'stock_id' => $stock->id,
                            'category_id' => $productData['category_id'],
                            'tag_id' => $tag,
                        ]);
                    }
                } else {
                    SelectedStockCategory::create([
                        'stock_id' => $stock->id,
                        'category_id' => $productData['category_id'],
                    ]);
                }
                $hargaAwal = 'Rp' . number_format($MASTERDATA_DATABASE_PRICE, 0, ',', '.');
                $harga = 'Rp' . number_format($productData['price'], 0, ',', '.');
                $updateStockCategory = DB::table('selected_stock_category as spc')
                    ->join('stock', 'spc.stock_id', '=', 'stock.id')
                    ->join('category', 'spc.category_id', '=', 'category.id')
                    ->join('tag', 'spc.tag_id', '=', 'tag.id')
                    ->where('stock.id', $stock->id)
                    ->select([
                        'category.name as category_name',
                        'tag.name as tag_name'
                    ])->get();
                $categorySelected = $updateStockCategory->isNotEmpty() ? $updateStockCategory[0]->category_name : 'N/A';

                if ($MASTERDATA_DATABASE_NAMA !== $MASTERDATA_BARU_NAMA) {
                    Logging::create([
                        'user_id' => $request->user()->id,
                        'action' => 'edit',
                        'category' => 'stock',
                        'sku' => $productData['sku'],
                        'keterangan' => '555 Produk dengan SKU: ' . $productData['sku'] .
                            ' dan Nama Produk: ' . $MASTERDATA_DATABASE_NAMA . '. Berhasil ubah Nama Produk menjadi: ' . $MASTERDATA_BARU_NAMA . '.'
                    ]);
                    DB::commit();
                }
                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'edit',
                    'category' => 'stock',
                    'sku' => $productData['sku'],
                    'keterangan' => '666 Produk dengan SKU: ' . $productData['sku'] .
                        ', Kategori: ' . $categorySelected . ', Tags: (' . implode(', ', $TAGLAMA) . '), Harga: ' . $hargaAwal . ', dan Jumlah: ' . $MASTERDATA_DATABASE_QUANTITY . '. Berhasil diubah menjadi Tags: (' . implode(', ', $listTag) .
                        '), Harga: ' . $harga . ', dan Jumlah: ' . $productData['quantity'] . '.'
                ]);
                DB::commit();
                return Redirect::route('stock.show')->with('success', 'Berhasil mengubah data stock.');
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('stock.show')->with('error', 'Terjadi kesalahan saat mengubah data stock.');
        }
    }

    public function destroy(Request $request)
    {
        $stock_id = $request->query('id');
        DB::beginTransaction();
        try {
            $stock = Stock::find($stock_id);
            $masterData = DB::table('master_data')
                ->join('stock', 'stock.master_id', '=', 'master_data.id')
                ->where('stock.id', $stock->id)
                ->first();
            $updateProductionCategory = DB::table('selected_stock_category as ssc')
                ->join('stock', 'ssc.stock_id', '=', 'stock.id')
                ->join('category', 'ssc.category_id', '=', 'category.id')
                ->join('tag', 'ssc.tag_id', '=', 'tag.id')
                ->where('stock.id', $stock_id)
                ->select([
                    'category.name as category_name',
                    'tag.name as tag_name'
                ])->get();
            $listTag = $updateProductionCategory->map(function ($category) {
                return $category->tag_name;
            });
            $harga = 'Rp' . number_format($stock->price, 0, ',', '.');
            Logging::create([
                'user_id' => $request->user()->id,
                'action' => 'hapus',
                'category' => 'stock',
                'sku' => $masterData->sku,
                'keterangan' => 'Produk dengan SKU: ' . $masterData->sku . ', Kategori: ' . $updateProductionCategory[0]->category_name . ', Tags: (' . implode(', ', $listTag->toArray()) . '), Harga: ' . $harga . ', dan Jumlah: ' . $stock->quantity . '. Telah dihapus.'
            ]);
            $stock->delete();
            DB::commit();
            return Redirect::route('stock.show')->with('success', 'Berhasil menghapus data stock.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('stock.show')->with('error', 'Terjadi kesalahan saat menghapus data stock.');
        }
    }
}