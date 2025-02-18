<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckProductionExistRequest;
use App\Http\Requests\ProductionUpdateRequest;
use App\Http\Requests\ProductMergeRequest;
use App\Http\Requests\ProductMoveRequest;
use App\Models\MasterData;
use App\Models\Production;
use App\Models\SelectedProductionCategory;
use App\Models\SelectedStockCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use App\Http\Requests\ProductionRequest;
use App\Http\Requests\ProductionCategoryRequest;
use App\Http\Requests\GetCategoryProduction;
use App\Http\Requests\GetProductionMaxQuantityRequest;
use App\Models\Logging;
use App\Models\Stock;
use App\Models\Tag;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

class ProductionController extends Controller
{

    public function api_get_product_name(GetCategoryProduction $request)
    {
        $productData = $request->validated();
        $product = DB::table('master_data')
            ->select('product_name')
            ->where('sku', $productData['sku'])
            ->first();
        $stockCategory = DB::table('selected_stock_category as ssc')
            ->join('category', 'ssc.category_id', '=', 'category.id')
            ->join('stock', 'ssc.stock_id', '=', 'stock.id')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->where('master_data.sku', $productData['sku'])
            ->select('category.id', 'category.name')
            ->distinct()
            ->get();
        if ($product) {
            return response()->json([
                'code' => 200,
                'data' => [
                    'name' => $product->product_name,
                    'category' => $stockCategory
                ],
            ], 200);
        } else {
            return response()->json([
                'code' => 404,
                'message' => 'Product not found for the given SKU',
            ], 404);
        }
    }

    public function api_get_category(GetCategoryProduction $request)
    {
        $productData = $request->validated();
        $category = DB::table('selected_production_category')
            ->join('production', 'selected_production_category.production_id', '=', 'production.id')
            ->join('master_data', 'production.master_id', '=', 'master_data.id')
            ->select('selected_production_category.category_id as category_id')
            ->where('master_data.sku', '=', $productData['sku'])
            ->first();

        if ($category) {
            $categories = DB::table('tag')
                ->join('category', 'category.id', '=', 'tag.category_id')
                ->select('category.id as category_id', 'category.name as category_name', 'tag.id as tag_id', 'tag.name as tag_name')
                ->where('tag.category_id', $category->category_id)
                ->get()
                ->groupBy('category_id')
                ->map(function ($items, $key) {
                    return [
                        'id' => $key,
                        'name' => $items->first()->category_name,
                        'tags' => $items->map(function ($item) {
                            return [
                                'tag_id' => $item->tag_id,
                                'tag_name' => $item->tag_name,
                            ];
                        })->values(),
                    ];
                })->values();
            return response()->json([
                'code' => 200,
                'data' => [
                    "category" => $categories[0]
                ],
            ], 200);
        } else {
            return response()->json([
                'code' => 404,
                'message' => 'Category not found for the given SKU',
            ], 404);
        }
    }

    public function api_check_production_exist(CheckProductionExistRequest $request)
    {
        try {
            $productData = $request->validated();
            $tags = $productData['tags'] ?? [];
            $categoryQuery = DB::table('selected_production_category')
                ->join('production', 'selected_production_category.production_id', '=', 'production.id')
                ->join('master_data', 'production.master_id', '=', 'master_data.id')
                ->select('selected_production_category.production_id as production_id')
                ->where('master_data.sku', '=', $productData['sku'])
                ->where('selected_production_category.category_id', '=', $productData['category_id'])
                ->whereExists(function ($query) use ($tags) {
                    $query->select(DB::raw(1))
                        ->from('selected_production_category as spc')
                        ->whereColumn('spc.production_id', 'selected_production_category.production_id')
                        ->whereIn('spc.tag_id', $tags)
                        ->groupBy('spc.production_id')
                        ->havingRaw('COUNT(DISTINCT spc.tag_id) = ?', [count($tags)])
                        ->havingRaw('COUNT(DISTINCT spc.tag_id) = (SELECT COUNT(DISTINCT tag_id) FROM selected_production_category WHERE production_id = spc.production_id)');
                });
            $category = $categoryQuery->first();
            if ($category) {
                return response()->json([
                    'code' => 200,
                    'message' => 'Data dengan kategori dan tags tersebut sudah ada, apakah anda yakin ingin menggabungkan keduanya?',
                    'production' => [
                        'id' => $category->production_id,
                        'quantity' => Production::find($category->production_id)->quantity,
                    ],
                ], 200);
            } else {
                return response()->json([
                    'code' => 404,
                    'message' => 'Data dengan kategori tersebut belum tersedia, anda dapat membuatnya.',
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'code' => 404,
                'message' => 'Data dengan kategori tersebut belum tersedia, anda dapat membuatnya.',
            ], 404);
        }
    }

    public function api_get_production_max_quantity(GetProductionMaxQuantityRequest $request)
    {
        $requestData = $request->validated();
        $productionIdList = $requestData['id'];
        $arrayProductionId = explode(',', $productionIdList);
        $maxQuantity = Production::whereIn('id', $arrayProductionId)->min('quantity');
        return response()->json([
            'code' => 200,
            'data' => [
                "max_quantity" => $maxQuantity
            ],
        ], 200);
    }

    public function show(Request $request)
    {
        Production::where('quantity', '=', 0)->delete();
        $products = DB::table('selected_production_category')
            ->join('production', 'selected_production_category.production_id', '=', 'production.id')
            ->join('master_data', 'production.master_id', '=', 'master_data.id')
            ->join('category', 'selected_production_category.category_id', '=', 'category.id')
            ->leftJoin('tag', 'selected_production_category.tag_id', '=', 'tag.id') // Menggunakan leftJoin di sini
            ->select(
                'master_data.id as master_id',
                'master_data.product_name as product_name',
                'master_data.sku as sku',
                'production.id as production_id',
                'production.quantity as product_quantity',
                'category.id as category_id',
                'category.name as category_name',
                'tag.id as tag_id',
                'tag.name as tag_name',
                'production.created_at',
                'production.updated_at'
            )
            ->where('category.type', '=', 'production')
            ->get();

        $groupedProducts = [];
        foreach ($products as $product) {
            if (!isset($groupedProducts[$product->production_id])) {
                $groupedProducts[$product->production_id] = [
                    'production_id' => $product->production_id,
                    'master_id' => $product->master_id,
                    'product_name' => $product->product_name,
                    'sku' => $product->sku,
                    'product_quantity' => $product->product_quantity,
                    'category_id' => $product->category_id,
                    'category_name' => $product->category_name,
                    'tags' => [],
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at
                ];
            }
            // Hanya tambahkan tag jika tag_id tidak bernilai null
            if ($product->tag_id !== null) {
                $groupedProducts[$product->production_id]['tags'][] = [
                    'id' => $product->tag_id,
                    'name' => $product->tag_name
                ];
            }
        }
        $groupedProducts = array_values($groupedProducts);

        $ALLCATEGORY = Category::all()->where('type', '=', 'production');
        $transformedCategories = $ALLCATEGORY->map(function ($category) {
            return [
                'value' => $category->name,
                'label' => $category->name,
            ];
        });
        $transformedCategoriesArray = $transformedCategories->values()->toArray();

        $ALLTAG = DB::table('tag')
            ->join('category', 'tag.category_id', '=', 'category.id')
            ->where('category.type', '=', 'production')
            ->select('tag.name as name')
            ->get();
        $transformedTags = $ALLTAG->map(function ($tag) {
            return [
                'value' => $tag->name,
                'label' => $tag->name,
            ];
        });
        $transformedTagsArray = $transformedTags->values()->toArray();
        return Inertia::render('admin/production/page', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Production',
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
        $id = $request->query('id');
        $my_role = $request->user()->role;
        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('production.show');
        }
        $categoryProductionRaw = DB::table('selected_production_category as spc')
            ->join('category', 'spc.category_id', '=', 'category.id')
            ->join('tag', 'spc.tag_id', '=', 'tag.id')
            ->where('spc.production_id', '=', $id)
            ->select('category.id as category_id', 'category.name as category_name', 'tag.id as tag_id', 'tag.name as tag_name')
            ->get();
        $categoryProductionArray = $categoryProductionRaw->groupBy('category_id')->map(function ($items, $categoryId) {
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
        if (empty($categoryProductionArray)) {
            return Redirect::route('production.show');
        }
        $categoryProduction = $categoryProductionArray[0];
        $categoryWithTags = Category::with('tags')
            ->where('name', '=', $categoryProduction['category_name'])
            ->where('type', '=', 'production')
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
        $production = DB::table('production')
            ->join('master_data', 'production.master_id', '=', 'master_data.id')
            ->where('production.id', '=', $id)
            ->select('production.master_id as master_id', 'master_data.sku as sku', 'master_data.product_name as name', 'production.id as id', 'production.quantity as quantity')
            ->get()
            ->first();
        return Inertia::render('admin/production/detail', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Production Detail Data',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'production' => $production,
            'categoryProduction' => $categoryProduction,
            'categoryWithTags' => $categoryWithTags[0],
        ]);
    }

    public function create_show(Request $request)
    {
        $my_role = $request->user()->role;
        if ($my_role == 'marketing') {
            return Redirect::route('production.show');
        }
        $categoriesWithTags = Category::with(['tags'])
            ->where('type', 'production')
            ->get();
        return Inertia::render('admin/production/product', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Production Tambah Produk',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'categoriesWithTags' => $categoriesWithTags,
        ]);
    }

    public function create_category_show(Request $request)
    {
        $my_role = $request->user()->role;
        if ($my_role == 'marketing') {
            return Redirect::route('production.show');
        }
        return Inertia::render('admin/production/category', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Production Tambah Kategori',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
        ]);
    }

    public function move_show(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');
        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('production.show');
        }
        $product = DB::table('selected_production_category as spc')
            ->join('production as p', 'spc.production_id', '=', 'p.id')
            ->join('master_data as md', 'p.master_id', '=', 'md.id')
            ->join('category as c', 'spc.category_id', '=', 'c.id')
            ->where('p.id', $id)
            ->where('c.type', 'production')
            ->select('md.sku', 'md.product_name', 'p.quantity', 'c.name as category_name', 'p.id as production_id')
            ->get();
        if ($product->isEmpty()) {
            return Redirect::route('production.show');
        }
        $result = $product->groupBy(function ($item) {
            return $item->sku . $item->product_name . $item->quantity . $item->category_name;
        })->map(function ($groupedItems) {
            $firstItem = $groupedItems->first();
            return [
                'production_id' => $firstItem->production_id,
                'sku' => $firstItem->sku,
                'product_name' => $firstItem->product_name,
                'quantity' => $firstItem->quantity,
                'category_name' => $firstItem->category_name,
            ];
        })->values()->all();
        $productionData = $result[0];
        $categoriesWithTags = Category::with('tags')
            ->where('name', '=', $productionData['category_name'])
            ->where('type', 'stock')
            ->get();
        return Inertia::render('admin/production/move', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Production Move To Stock',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'product' => $productionData,
            'categoriesWithTags' => $categoriesWithTags,
        ]);
    }

    public function merge_show(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');
        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('production.show');
        }
        $product = DB::table('selected_production_category as spc')
            ->join('production as p', 'spc.production_id', '=', 'p.id')
            ->join('master_data as md', 'p.master_id', '=', 'md.id')
            ->join('category as c', 'spc.category_id', '=', 'c.id')
            ->join('tag as t', 'spc.tag_id', '=', 't.id')
            ->where('p.id', $id)
            ->where('c.type', 'production')
            ->select('md.sku', 'md.product_name', 'md.id as master_id', 'p.quantity', 'c.name as category_name', 'spc.tag_id', 'p.id as production_id', 't.id', 't.name')
            ->get();

        if ($product->isEmpty()) {
            return Redirect::route('production.show');
        }
        $result = $product->groupBy(function ($item) {
            return $item->sku . $item->product_name . $item->quantity . $item->category_name;
        })->map(function ($groupedItems) {
            $firstItem = $groupedItems->first();
            return [
                'production_id' => $firstItem->production_id,
                'master_id' => $firstItem->master_id,
                'sku' => $firstItem->sku,
                'product_name' => $firstItem->product_name,
                'quantity' => $firstItem->quantity,
                'category_name' => $firstItem->category_name,
                'tags' => $groupedItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                    ];
                })->unique()->values()->all(),
            ];
        })->values()->all();
        $PRODUCTS = DB::table('selected_production_category')
            ->join('production', 'selected_production_category.production_id', '=', 'production.id')
            ->join('master_data', 'production.master_id', '=', 'master_data.id')
            ->join('category', 'selected_production_category.category_id', '=', 'category.id')
            ->leftJoin('tag', 'selected_production_category.tag_id', '=', 'tag.id') // Menggunakan leftJoin di sini
            ->select(
                'master_data.id as master_id',
                'master_data.product_name as product_name',
                'master_data.sku as sku',
                'production.id as production_id',
                'production.quantity as product_quantity',
                'category.id as category_id',
                'category.name as category_name',
                'tag.id as tag_id',
                'tag.name as tag_name',
                'production.created_at',
                'production.updated_at'
            )
            ->where('category.type', '=', 'production')
            ->get();
        $groupedProducts = [];
        foreach ($PRODUCTS as $product) {
            if (!isset($groupedProducts[$product->production_id])) {
                $groupedProducts[$product->production_id] = [
                    'production_id' => $product->production_id,
                    'master_id' => $product->master_id,
                    'product_name' => $product->product_name,
                    'sku' => $product->sku,
                    'product_quantity' => $product->product_quantity,
                    'category_id' => $product->category_id,
                    'category_name' => $product->category_name,
                    'tags' => [],
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at
                ];
            }
            if ($product->tag_id !== null) {
                $groupedProducts[$product->production_id]['tags'][] = [
                    'id' => $product->tag_id,
                    'name' => $product->tag_name
                ];
            }
        }
        $productInProduction = array_values($groupedProducts);
        $categoriesWithTags = Category::with('tags')
            ->where('type', 'stock')
            ->get();
        return Inertia::render('admin/production/merge', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Production Move To Stock (Merge)',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'product' => $result[0],
            'categoriesWithTags' => $categoriesWithTags,
            'productInProduction' => $productInProduction,
        ]);
    }

    public function delete_show(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');
        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('production.show');
        }
        $categoryProductionRaw = DB::table('selected_production_category as spc')
            ->join('category', 'spc.category_id', '=', 'category.id')
            ->join('tag', 'spc.tag_id', '=', 'tag.id')
            ->where('spc.production_id', '=', $id)
            ->select('category.id as category_id', 'category.name as category_name', 'tag.id as tag_id', 'tag.name as tag_name')
            ->get();
        $categoryProductionArray = $categoryProductionRaw->groupBy('category_id')->map(function ($items, $categoryId) {
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
        if (empty($categoryProductionArray)) {
            return Redirect::route('production.show');
        }
        $categoryProduction = $categoryProductionArray[0];
        $categoryWithTags = Category::with('tags')
            ->where('name', '=', $categoryProduction['category_name'])
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
        $production = DB::table('production')
            ->join('master_data', 'production.master_id', '=', 'master_data.id')
            ->where('production.id', '=', $id)
            ->select('production.master_id as master_id', 'master_data.sku as sku', 'master_data.product_name as name', 'production.id as id', 'production.quantity as quantity')
            ->get()
            ->first();
        return Inertia::render('admin/production/delete', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Production Hapus Data',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'production' => $production,
            'categoryProduction' => $categoryProduction,
            'categoryWithTags' => $categoryWithTags[0],
        ]);
    }

    public function store(ProductionRequest $request)
    {
        $productData = $request->validated();
        $tags = $productData['tags'];
        $productions = DB::table('production')
            ->join('master_data', 'production.master_id', '=', 'master_data.id')
            ->where('master_data.sku', $productData['sku'])
            ->select('production.id')
            ->get();
        $filteredProductionIds = [];
        foreach ($productions as $production) {
            $associatedTags = DB::table('selected_production_category')
                ->where('production_id', $production->id)
                ->pluck('tag_id')
                ->toArray();
            if (empty(array_diff($tags, $associatedTags)) && empty(array_diff($associatedTags, $tags))) {
                $filteredProductionIds[] = $production->id;
            }
        }
        $productionIds = reset($filteredProductionIds);
        DB::beginTransaction();
        try {
            $product = MasterData::firstOrCreate(
                ['sku' => $productData['sku']],
                ['product_name' => $productData['name']]
            );
            if (!$productionIds) {
                $production = Production::create([
                    'master_id' => $product->id,
                    'quantity' => $productData['quantity'],
                ]);
                if (!empty($productData['tags'])) {
                    foreach ($productData['tags'] as $tag) {
                        SelectedProductionCategory::create([
                            'production_id' => $production->id,
                            'category_id' => $productData['category_id'],
                            'tag_id' => $tag,
                        ]);
                    }
                    $category = Category::find($productData['category_id']);
                    $tagNames = Tag::whereIn('id', $productData['tags'])->pluck('name')->toArray();
                    $tagNamesString = implode(', ', $tagNames);
                    Logging::create([
                        'user_id' => $request->user()->id,
                        'action' => 'tambah',
                        'category' => 'production',
                        'sku' => $product->sku,
                        'keterangan' => 'Produk dengan SKU: ' . $productData['sku'] . ', Kategori: ' . $category->name . ', Tags: (' . $tagNamesString . '). Berhasil ditambahkan ke Production dengan jumlah: ' . $productData['quantity'] . '.'
                    ]);
                }
            } else {
                $production = Production::find($productionIds);
                if ($production) {
                    $production->quantity += $productData['quantity'];
                    $production->save();
                    $category = DB::table('selected_production_category as spc')
                        ->join('production', 'spc.production_id', '=', 'production.id')
                        ->where('production.id', '=', $production->id)
                        ->first();
                    $categoryName = Category::where('id', $category->category_id)->first();
                    $tagNames = Tag::whereIn('id', $productData['tags'])->pluck('name')->toArray();
                    $tagNamesString = implode(', ', $tagNames);
                    Logging::create([
                        'user_id' => $request->user()->id,
                        'action' => 'tambah',
                        'category' => 'production',
                        'sku' => $product->sku,
                        'keterangan' => 'Produk dengan Kategori: ' . $categoryName->name . ', Tags: (' . $tagNamesString . '), dan Jumlah: ' . $productData['quantity'] . ' telah ditambahkan di Production.'
                    ]);
                } else {
                    $production = Production::create([
                        'master_id' => $product->id,
                        'quantity' => $productData['quantity'],
                    ]);
                    if (!empty($productData['tags'])) {
                        foreach ($productData['tags'] as $tag) {
                            SelectedProductionCategory::create([
                                'production_id' => $production->id,
                                'category_id' => $productData['category_id'],
                                'tag_id' => $tag,
                            ]);
                        }
                        $category = Category::find($productData['category_id']);
                        $tagNames = Tag::whereIn('id', $productData['tags'])->pluck('name')->toArray();
                        $tagNamesString = implode(', ', $tagNames);
                        Logging::create([
                            'user_id' => $request->user()->id,
                            'action' => 'tambah',
                            'category' => 'production',
                            'sku' => $product->sku,
                            'keterangan' => 'Produk dengan SKU: ' . $productData['sku'] . ', Kategori: ' . $category->name . ', Tags: (' . $tagNamesString . '). Berhasil ditambahkan ke Production dengan jumlah: ' . $productData['quantity'] . ').'
                        ]);
                    }
                }
            }
            DB::commit();
            return Redirect::route('production.show')->with('success', 'Product berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('production.show')->with('error', 'Terjadi kesalahan saat membuat produk.');
        }
    }

    public function category_store(ProductionCategoryRequest $request)
    {
        $categoryData = $request->validated();
        DB::beginTransaction();
        try {
            $category = Category::create([
                'name' => $categoryData['name'],
                'type' => 'production',
            ]);
            $tags = explode(',', $categoryData['tags']);
            foreach ($tags as $tag) {
                Tag::create([
                    'name' => ucwords(trim($tag)),
                    'category_id' => $category->id,
                ]);
            }
            DB::commit();
            return Redirect::route('production.show')->with('success', 'Production category berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('production.show')->with('error', 'Terjadi kesalahan saat membuat kategori produksi.');
        }
    }

    public function move_store(ProductMoveRequest $request)
    {
        $productData = $request->validated();
        $tags = $productData['tags'];
        $stocks = DB::table('stock')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->where('master_data.sku', $productData['sku'])
            ->select('stock.id')
            ->get();
        $filteredStockIds = [];
        foreach ($stocks as $stock) {
            $associatedTags = DB::table('selected_stock_category')
                ->where('stock_id', $stock->id)
                ->pluck('tag_id')
                ->toArray();
            if (empty(array_diff($tags, $associatedTags)) && empty(array_diff($associatedTags, $tags))) {
                $filteredStockIds[] = $stock->id;
            }
        }
        $stockId = reset($filteredStockIds);
        $PRODUCTION = DB::table('selected_production_category as spc')
            ->join('production', 'spc.production_id', '=', 'production.id')
            ->join('category', 'spc.category_id', '=', 'category.id')
            ->join('tag', 'spc.tag_id', '=', 'tag.id')
            ->where('spc.production_id', '=', $productData['production_id'])
            ->select(
                'production.id as production_id',
                'production.created_at',
                'production.updated_at',
                'production.quantity',
                'production.master_id',
                'category.name as category_name',
                'tag.name as tag_name'
            )
            ->get()
            ->groupBy('production_id')
            ->map(function ($items) {
                $first = $items->first();
                return (object) [
                    'id' => $first->production_id,
                    'production_id' => $first->production_id,
                    'category' => $first->category_name ?? '',
                    'tags' => $items->pluck('tag_name')->unique()->values()->all(),
                    'created_at' => $first->created_at,
                    'updated_at' => $first->updated_at,
                    'quantity' => $first->quantity,
                    'master_id' => $first->master_id,
                ];
            })
            ->values();
        DB::beginTransaction();
        try {
            if ($stockId) {
                $production = Production::findOrFail($productData['production_id']);
                $production->quantity -= $productData['quantity'];
                $production->save();
                $stock = Stock::findOrFail($stockId);
                $stock->quantity += $productData['quantity'];
                $stock->save();
                $categoryProd = DB::table('selected_stock_category as ssc')
                    ->join('stock', 'ssc.stock_id', '=', 'stock.id')
                    ->join('category', 'ssc.category_id', '=', 'category.id')
                    ->join('tag', 'ssc.tag_id', '=', 'tag.id')
                    ->where('ssc.stock_id', $stockId)
                    ->select('category.name as category_name')
                    ->first();
                $tagNamesProd = Tag::whereIn('id', $productData['tags'])->pluck('name')->toArray();
                $harga = 'Rp' . number_format($productData['price'], 0, ',', '.');
                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'move',
                    'category' => 'production',
                    'sku' => $productData['sku'],
                    'keterangan' => 'Produk dengan Kategori: ' . $categoryProd->category_name .
                        ', dan Tags: (' . implode(', ', $PRODUCTION[0]->tags) . '). Berhasil dipindahkan ke Stock dengan Tags baru: (' . implode(', ', $tagNamesProd) . '), Harga: ' . $harga . ', dan Jumlah: ' . $productData['quantity'] . '.',
                ]);
            } else {
                $product = Production::where('id', $productData['production_id'])
                    ->where('quantity', '>=', $productData['quantity'])
                    ->first();
                if (!$product) {
                    DB::rollBack();
                    return Redirect::route('stock.show')->with('error', 'Product tidak tersedia.');
                }
                $product->quantity -= $productData['quantity'];
                $product->save();
                $newStock = Stock::create([
                    'quantity' => $productData['quantity'],
                    'price' => $productData['price'],
                    'master_id' => $product['master_id'],
                ]);
                foreach ($tags as $tag) {
                    SelectedStockCategory::create([
                        'stock_id' => $newStock->id,
                        'category_id' => $productData['category_id'],
                        'tag_id' => $tag,
                    ]);
                }
                $category = Category::find($productData['category_id']);
                $tagNames = Tag::whereIn('id', $tags)->pluck('name')->toArray();
                $harga = 'Rp' . number_format($productData['price'], 0, ',', '.');
                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'move',
                    'category' => 'production',
                    'sku' => $productData['sku'],
                    'keterangan' => 'Produk dengan Kategori: ' .  $category->name .
                        ', dan Tags: (' . implode(', ', $PRODUCTION[0]->tags) . '). Berhasil dipindahkan ke Stock dengan Tags baru: (' . implode(', ', $tagNames) . '), harga ' . $harga . ', dan Jumlah: ' .
                        $productData['quantity'] . '.'
                ]);
            }
            DB::commit();
            return Redirect::route('stock.show')->with('success', 'Product berhasil dipindahkan ke stock.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('stock.show')->with('error', 'Terjadi kesalahan saat memindahkan produk: ' . $e->getMessage());
        }
    }

    public function merge_store(ProductMergeRequest $request)
    {
        $productData = $request->validated();
        $tags = $productData['tags'];
        $stocks = DB::table('stock')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->where('master_data.sku', $productData['sku'])
            ->select('stock.id')
            ->get();
        $filteredStockIds = [];
        foreach ($stocks as $stock) {
            $associatedTags = DB::table('selected_stock_category')
                ->where('stock_id', $stock->id)
                ->pluck('tag_id')
                ->toArray();
            if (empty(array_diff($tags, $associatedTags)) && empty(array_diff($associatedTags, $tags))) {
                $filteredStockIds[] = $stock->id;
            }
        }
        $stockId = reset($filteredStockIds);
        $mergeList = $productData['merge_list'];
        DB::beginTransaction();
        try {
            $product = null;
            if (!$stockId && isset($productData['sku'], $productData['name'])) {
                $product = MasterData::firstOrCreate(
                    ['sku' => $productData['sku']],
                    ['product_name' => $productData['name']]
                );
            } else {
                $productStock = DB::table('stock')
                    ->join('master_data', 'stock.master_id', '=', 'master_data.id')
                    ->where('stock.id', '=', $stockId)
                    ->first();
                $product = [
                    'id' => $productStock->id,
                    'product_name' => $productStock->product_name,
                    'sku' => $productStock->sku,
                    'created_at' => $productStock->created_at,
                    'updated_at' => $productStock->updated_at,
                ];
            }
            $MERGEDATA = [];
            $MERGEDATA = collect();
            foreach ($mergeList as $list) {
                $PRODUCTION = DB::table('selected_production_category as spc')
                    ->join('production', 'spc.production_id', '=', 'production.id')
                    ->join('master_data', 'production.master_id', '=', 'master_data.id')
                    ->join('category', 'spc.category_id', '=', 'category.id')
                    ->join('tag', 'spc.tag_id', '=', 'tag.id')
                    ->where('spc.production_id', '=', $list)
                    ->select(
                        'production.id as production_id',
                        'production.created_at',
                        'production.updated_at',
                        'production.quantity',
                        'production.master_id',
                        'master_data.sku',
                        'category.name as category_name',
                        'tag.name as tag_name'
                    )
                    ->get()
                    ->groupBy('production_id')
                    ->map(function ($items) {
                        $first = $items->first();
                        return (object) [
                            'id' => $first->production_id,
                            'production_id' => $first->production_id,
                            'sku' => $first->sku,
                            'category' => $first->category_name ?? '',
                            'tags' => $items->pluck('tag_name')->unique()->values()->all(),
                            'created_at' => $first->created_at,
                            'updated_at' => $first->updated_at,
                            'quantity' => $first->quantity,
                            'master_id' => $first->master_id,
                        ];
                    })
                    ->values();
                $MERGEDATA = $MERGEDATA->merge([$PRODUCTION[0]]);
                $production = Production::where('id', '=', $list)->first();
                if (!$production) {
                    DB::rollBack();
                    return Redirect::route('production.show')->with('error', 'Product yang ingin digabung tidak ada.');
                }
                if ($production->quantity < $productData['quantity']) {
                    DB::rollBack();
                    return Redirect::route('production.show')->with('error', 'Jumlah product yang ingin digabung terlalu banyak.');
                }
                $production->quantity -= $productData['quantity'];
                $production->save();
            }
            $formattedItems = $MERGEDATA->map(function ($item) {
                return "- SKU: {$item->sku}, Kategori: {$item->category}, Tags: (" . implode(', ', $item->tags) . ")";
            })->implode("\n");
            $MERGELENGTH = $MERGEDATA->count();
            if ($stockId) {
                $stock = Stock::findOrFail($stockId);
                $stock->quantity += $productData['quantity'];
                $stock->save();
                $categoryProd = DB::table('selected_stock_category as ssc')
                    ->join('stock', 'ssc.stock_id', '=', 'stock.id')
                    ->join('category', 'ssc.category_id', '=', 'category.id')
                    ->join('tag', 'ssc.tag_id', '=', 'tag.id')
                    ->where('ssc.stock_id', $stockId)
                    ->select('category.name as category_name')
                    ->first();
                $tagNamesProd = Tag::whereIn('id', $productData['tags'])->pluck('name')->toArray();
                $category = Category::find($productData['category_id']);
                $harga = 'Rp' . number_format($productData['price'], 0, ',', '.');
                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'merge',
                    'category' => 'production',
                    'sku' => $productData['sku'],
                    'keterangan' => $MERGELENGTH . ' Produk pada Production telah di Merge ke Stock tujuan SKU: ' . $productData['sku'] . ', Kategori: ' . $categoryProd->category_name . ', Tags: (' . implode(', ', $tagNamesProd) . '), Harga: ' . $harga . ', dan Jumlah: ' . $productData['quantity'] . '. List produk yang di Merge:\n' . $formattedItems
                ]);
            } else {
                $newStock = Stock::create([
                    'id' => $stockId,
                    'quantity' => $productData['quantity'],
                    'price' => $productData['price'],
                    'master_id' => $product['id'],
                ]);
                if (!empty($productData['tags'])) {
                    $listTag = [];
                    foreach ($productData['tags'] as $tag) {
                        $tagSearch = Tag::find($tag);
                        $listTag[] = $tagSearch->name;
                        SelectedStockCategory::create([
                            'stock_id' => $newStock->id,
                            'category_id' => $productData['category_id'],
                            'tag_id' => $tag,
                        ]);
                    }
                    $category = Category::find($productData['category_id']);
                    $harga = 'Rp' . number_format($productData['price'], 0, ',', '.');
                    Logging::create([
                        'user_id' => $request->user()->id,
                        'action' => 'merge',
                        'category' => 'production',
                        'sku' => $productData['sku'],
                        'keterangan' => $MERGELENGTH . ' Produk pada Production telah di Merge ke Stock tujuan SKU: ' . $productData['sku'] . ', Kategori: ' . $category->name . ', Tags: (' . implode(', ', $listTag) . '), Harga: ' . $harga . ', dan Jumlah: ' . $productData['quantity'] . '. List produk yang di Merge:\n' . $formattedItems
                    ]);
                }
            }
            DB::commit();
            return Redirect::route('stock.show')->with('success', 'Product berhasil dimerge ke stock.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('production.show')->with('error', 'Terjadi kesalahan saat menggabungkan produk.');
        }
    }

    public function update(ProductionUpdateRequest $request)
    {
        $productData = $request->validated();
        $production_id = $request->query('id');
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
            $tags = $productData['tags'];
            $productions = DB::table('production')
                ->join('master_data', 'production.master_id', '=', 'master_data.id')
                ->where('master_data.sku', $productData['sku'])
                ->select('production.id')
                ->get();
            $filteredProductionIds = [];
            foreach ($productions as $production) {
                $associatedTags = DB::table('selected_production_category')
                    ->where('production_id', $production->id)
                    ->pluck('tag_id')
                    ->toArray();
                if (empty(array_diff($tags, $associatedTags)) && empty(array_diff($associatedTags, $tags))) {
                    $filteredProductionIds[] = $production->id;
                }
            }
            $productionIds = reset($filteredProductionIds);
            $production = Production::find($production_id);
            $MASTERDATA_DATABASE_QUANTITY = $production->quantity;
            $MASTERDATA_BARU_QUANTITY = 0;
            $TAGLAMA = DB::table('selected_production_category as spc')
                ->join('tag', 'spc.tag_id', '=', 'tag.id')
                ->where('spc.production_id', $production_id)
                ->select('spc.*', 'tag.*')
                ->get()
                ->pluck('name')->toArray();
            if ($productionIds) {
                $updateProductionExist = Production::find($productionIds);
                if ($production && $updateProductionExist) {
                    $production->quantity -= $productData['quantity'];
                    $production->save();
                    $updateProduction = Production::find($productionIds);
                    if ($production->id == $updateProduction->id) {
                        $updateProduction->quantity = $productData['quantity'];
                        $updateProduction->save();
                    } else {
                        $updateProduction->quantity += $productData['quantity'];
                        $updateProduction->save();
                    }
                    $MASTERDATA_BARU_QUANTITY = $updateProduction->quantity;
                    $updateProductionCategory = DB::table('selected_production_category as spc')
                        ->join('production', 'spc.production_id', '=', 'production.id')
                        ->join('category', 'spc.category_id', '=', 'category.id')
                        ->join('tag', 'spc.tag_id', '=', 'tag.id')
                        ->where('production.id', $updateProduction->id)
                        ->select([
                            'category.name as category_name',
                            'tag.name as tag_name'
                        ])->get();
                    $categorySelected = $updateProductionCategory->isNotEmpty() ? $updateProductionCategory[0]->category_name : 'N/A';
                    $listTag = $updateProductionCategory->map(function ($category) {
                        return $category->tag_name;
                    });
                    if ($MASTERDATA_DATABASE_NAMA != $MASTERDATA_BARU_NAMA) {
                        Logging::create([
                            'user_id' => $request->user()->id,
                            'action' => 'edit',
                            'category' => 'production',
                            'sku' => $productData['sku'],
                            'keterangan' => '111 Produk dengan SKU: ' . $productData['sku'] .
                                ' dan Nama Produk: ' . $MASTERDATA_DATABASE_NAMA . '. Berhasil ubah Nama Produk menjadi: ' . $MASTERDATA_BARU_NAMA . '.'
                        ]);
                        DB::commit();
                    } else if (empty(array_diff($TAGLAMA, $listTag->toArray())) && empty(array_diff($TAGLAMA, $listTag->toArray()))) {
                        Logging::create([
                            'user_id' => $request->user()->id,
                            'action' => 'edit',
                            'category' => 'production',
                            'sku' => $productData['sku'],
                            'keterangan' => '222 Produk dengan SKU: ' . $productData['sku'] .
                                ', Kategori: ' . $categorySelected . ', Tags: (' . implode(', ', $TAGLAMA) . '), dan Jumlah: ' . $MASTERDATA_DATABASE_QUANTITY . '. Berhasil diubah menjadi Tags: (' . implode(', ', $listTag->toArray()) .
                                '), dan Jumlah: ' . $productData['quantity'] . '.'
                        ]);
                        DB::commit();
                        return Redirect::route('production.show')->with('success', 'Product berhasil diubah');
                    } else {
                        Logging::create([
                            'user_id' => $request->user()->id,
                            'action' => 'edit',
                            'category' => 'production',
                            'sku' => $productData['sku'],
                            'keterangan' => '333 Produk dengan SKU: ' . $productData['sku'] .
                                ' Kategori: ' . $categorySelected . ' Tags: (' . implode(', ', $TAGLAMA) . '), dan Jumlah: ' . $MASTERDATA_DATABASE_QUANTITY . '. Berhasil digabungkan ke Tags: (' . implode(', ', $listTag->toArray()) .
                                '), dan Jumlah produk tujuan menjadi: ' . $MASTERDATA_BARU_QUANTITY . '.'
                        ]);
                        DB::commit();
                    }
                    if ($MASTERDATA_DATABASE_QUANTITY != $MASTERDATA_BARU_QUANTITY) {
                        Logging::create([
                            'user_id' => $request->user()->id,
                            'action' => 'edit',
                            'category' => 'production',
                            'sku' => $productData['sku'],
                            'keterangan' => '444 Produk dengan SKU: ' . $productData['sku'] .
                                ', Kategori: ' . $categorySelected . ', Tags: (' . implode(', ', $TAGLAMA) . '), dan Jumlah: ' . $MASTERDATA_DATABASE_QUANTITY . '. Berhasil diubah menjadi Tags: (' . implode(', ', $listTag->toArray()) .
                                '), dan Jumlah: ' . $productData['quantity'] . '.'
                        ]);
                        DB::commit();
                    }
                    return Redirect::route('production.show')->with('success', 'Product berhasil diubah');
                } else {
                    DB::rollBack();
                    return Redirect::route('production.show')->with('error', 'Error! Data dengan sku dan Tags tersebut sudah ada.');
                }
            } else {
                $production = Production::findOrFail($production_id);
                $production->quantity = $productData['quantity'];
                $production->save();
                $selectedProductionCategory = SelectedProductionCategory::where('production_id', $production_id);
                if ($selectedProductionCategory->exists()) {
                    $selectedProductionCategory->delete();
                }
                $listTag = [];
                if (!empty($productData['tags'])) {
                    foreach ($productData['tags'] as $tag) {
                        $tagSearch = Tag::find($tag);
                        $listTag[] = $tagSearch->name;
                        SelectedProductionCategory::create([
                            'production_id' => $production->id,
                            'category_id' => $productData['category_id'],
                            'tag_id' => $tag,
                        ]);
                    }
                } else {
                    SelectedProductionCategory::create([
                        'production_id' => $production->id,
                        'category_id' => $productData['category_id'],
                    ]);
                }
                $updateProductionCategory = DB::table('selected_production_category as spc')
                    ->join('production', 'spc.production_id', '=', 'production.id')
                    ->join('category', 'spc.category_id', '=', 'category.id')
                    ->join('tag', 'spc.tag_id', '=', 'tag.id')
                    ->where('production.id', $production->id)
                    ->select([
                        'category.name as category_name',
                        'tag.name as tag_name'
                    ])->get();
                $categorySelected = $updateProductionCategory->isNotEmpty() ? $updateProductionCategory[0]->category_name : 'N/A';
                if ($MASTERDATA_DATABASE_NAMA != $MASTERDATA_BARU_NAMA) {
                    Logging::create([
                        'user_id' => $request->user()->id,
                        'action' => 'edit',
                        'category' => 'production',
                        'sku' => $productData['sku'],
                        'keterangan' => '555 Produk dengan SKU: ' . $productData['sku'] .
                            ' dan Nama Produk: ' . $MASTERDATA_DATABASE_NAMA . '. Berhasil ubah Nama Produk menjadi: ' . $MASTERDATA_BARU_NAMA . '.'
                    ]);
                    DB::commit();
                }
                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'edit',
                    'category' => 'production',
                    'sku' => $productData['sku'],
                    'keterangan' => '666 Produk dengan SKU: ' . $productData['sku'] .
                        ', Kategori: ' . $categorySelected . ', Tags: (' . implode(', ', $TAGLAMA) . '), dan Jumlah: ' . $MASTERDATA_DATABASE_QUANTITY . '. Berhasil diubah menjadi Tags: (' . implode(', ', $listTag) .
                        '), dan Jumlah: ' . $productData['quantity'] . '.'
                ]);
                DB::commit();
                return Redirect::route('production.show')->with('success', 'Berhasil mengubah data production.');
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('production.show')->with('error', 'Terjadi kesalahan saat mengubah data production.');
        }
    }

    public function destroy(Request $request)
    {
        $production_id = $request->query('id');
        DB::beginTransaction();
        try {
            $production = Production::find($production_id);
            $masterData = DB::table('master_data')
                ->join('production', 'production.master_id', '=', 'master_data.id')
                ->where('production.id', $production->id)
                ->first();
            $PRODUCTION = DB::table('selected_production_category as spc')
                ->join('production', 'spc.production_id', '=', 'production.id')
                ->join('master_data', 'production.master_id', '=', 'master_data.id')
                ->join('category', 'spc.category_id', '=', 'category.id')
                ->join('tag', 'spc.tag_id', '=', 'tag.id')
                ->where('spc.production_id', '=', $production_id)
                ->select(
                    'production.id as production_id',
                    'production.created_at',
                    'production.updated_at',
                    'production.quantity',
                    'production.master_id',
                    'master_data.sku',
                    'category.name as category_name',
                    'tag.name as tag_name'
                )
                ->get()
                ->groupBy('production_id')
                ->map(function ($items) {
                    $first = $items->first();
                    return (object) [
                        'id' => $first->production_id,
                        'production_id' => $first->production_id,
                        'sku' => $first->sku,
                        'category' => $first->category_name ?? '',
                        'tags' => $items->pluck('tag_name')->unique()->values()->all(),
                        'created_at' => $first->created_at,
                        'updated_at' => $first->updated_at,
                        'quantity' => $first->quantity,
                        'master_id' => $first->master_id,
                    ];
                })
                ->values();
            Logging::create([
                'user_id' => $request->user()->id,
                'action' => 'hapus',
                'category' => 'production',
                'sku' => $masterData->sku,
                'keterangan' => 'Produk dengan SKU: ' . $masterData->sku . ', Kategori: ' . $PRODUCTION[0]->category . ', Tags: (' . implode(', ', $PRODUCTION[0]->tags) . '), dan Jumlah: ' . $masterData->quantity . ' telah dihapus.'
            ]);
            $production->delete();
            DB::commit();
            return Redirect::route('production.show')->with('success', 'Berhasil menghapus data production.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('production.show')->with('error', 'Terjadi kesalahan saat menghapus data production.');
        }
    }
}