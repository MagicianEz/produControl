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
            ->select('product_name', 'category_id')
            ->where('sku', $productData['sku'])
            ->first();

        if (!$product) {
            return response()->json([
                'code' => 404,
                'message' => 'Product not found for the given SKU',
            ], 404);
        }

        $category = DB::table('category')
            ->where('id', $product->category_id)
            ->select('id', 'name')
            ->first();

        return response()->json([
            'code' => 200,
            'data' => [
                'name' => $product->product_name,
                'category' => $category,
            ],
        ], 200);
    }

    public function api_check_production_exist(CheckProductionExistRequest $request)
    {
        $productData = $request->validated();
        $tags = $productData['tags'] ?? [];

        $matchingProductions = DB::table('selected_production_category')
            ->join('production', 'selected_production_category.production_id', '=', 'production.id')
            ->join('master_data', 'production.master_id', '=', 'master_data.id')
            ->select('selected_production_category.production_id')
            ->where('master_data.sku', '=', $productData['sku'])
            ->groupBy('selected_production_category.production_id')
            ->get();

        foreach ($matchingProductions as $production) {
            $existingTags = DB::table('selected_production_category')
                ->where('production_id', $production->production_id)
                ->pluck('tag_id')
                ->toArray();

            if (empty(array_diff($tags, $existingTags)) && empty(array_diff($existingTags, $tags))) {
                return response()->json([
                    'code' => 200,
                    'message' => 'Data dengan kategori dan tags tersebut sudah ada, apakah Anda yakin ingin menggabungkan?',
                    'production' => [
                        'id' => $production->production_id,
                        'quantity' => Production::find($production->production_id)->quantity,
                    ],
                ], 200);
            }
        }

        return response()->json([
            'code' => 404,
            'message' => 'Data dengan kategori dan tags tersebut belum tersedia, silakan buat data baru.',
        ], 404);
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
        $products = DB::table('production')
        ->join('master_data', 'production.master_id', '=', 'master_data.id')
        ->join('category', 'master_data.category_id', '=', 'category.id')
        ->leftJoin('selected_production_category', 'selected_production_category.production_id', '=', 'production.id')
        ->leftJoin('tag', 'selected_production_category.tag_id', '=', 'tag.id')
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
        ->where('tag.type', '=', 'production')
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

            $groupedProducts[$product->production_id]['tags'][] = [
                'id' => $product->tag_id,
                'name' => $product->tag_name,
            ];
        }

        $groupedProducts = array_values($groupedProducts);

        $ALLCATEGORY = Category::all();

        $transformedCategories = $ALLCATEGORY->map(function ($category) {
            return [
                'value' => $category->name,
                'label' => $category->name,
            ];
        });

        $transformedCategoriesArray = $transformedCategories->values()->toArray();

        $ALLTAG = DB::table('tag')
        ->where('type', '=', 'production')
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

    public function create_show(Request $request)
    {
        $my_role = $request->user()->role;

        if ($my_role == 'marketing') {
            return Redirect::route('production.show');
        }

        $categoriesWithTags = Category::with(['tags' => function ($query) {
            $query->where('type', 'production');
        }])
        ->get();

        return Inertia::render('admin/production/add', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Production Tambah Produk',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'categoriesWithTags' => $categoriesWithTags,
        ]);
    }

    public function detail_show(Request $request)
    {
        $id = $request->query('id');
        $my_role = $request->user()->role;

        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('production.show');
        }

        $production = DB::table('production')
        ->join('master_data', 'production.master_id', '=', 'master_data.id')
        ->where('production.id', $id)
        ->select(
            'production.master_id as master_id',
            'master_data.sku as sku',
            'master_data.product_name as name',
            'production.id as id',
            'production.quantity as quantity',
            'master_data.category_id as category_id'
        )
        ->first();

        if (!$production) {
            return Redirect::route('production.show')->with('error', 'Data tidak ditemukan.');
        }

        $category = Category::find($production->category_id);

        $categoryProduction = [
        'category_id' => $category->id ?? null,
        'category_name' => $category->name ?? 'Unknown',
        'tags' => SelectedProductionCategory::where('production_id', $id)
            ->join('tag', 'selected_production_category.tag_id', '=', 'tag.id')
            ->select('tag.id as tag_id', 'tag.name as tag_name')
            ->get()
            ->map(fn ($tag) => [
                'id' => $tag->tag_id,
                'name' => $tag->tag_name,
            ])->values()->all(),
    ];

        $categoryWithTags = Category::where('id', $production->category_id)
        ->with(['tags' => function ($query) {
            $query->where('type', 'production');
        }])
        ->first();


        if (!$categoryWithTags) {
            return response()->json([
                'code' => 404,
                'message' => 'Category not found',
            ], 404);
        }

        $categoryWithTags = [
            'category_id' => $categoryWithTags->id,
            'category_name' => $categoryWithTags->name,
            'tags' => $categoryWithTags->tags->map(fn ($tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
            ])->all(),
        ];

        return Inertia::render('admin/production/detail', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Production Detail Data',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'production' => $production,
            'categoryProduction' => $categoryProduction,
            'categoryWithTags' => $categoryWithTags,
        ]);
    }

    public function delete_show(Request $request)
    {
        $id = $request->query('id');
        $my_role = $request->user()->role;

        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('production.show');
        }

        $production = DB::table('production')
            ->join('master_data', 'production.master_id', '=', 'master_data.id')
            ->where('production.id', $id)
            ->select(
                'production.id',
                'production.quantity',
                'master_data.sku',
                'master_data.product_name as name',
                'master_data.category_id'
            )
            ->first();

        if (!$production) {
            return Redirect::route('production.show')->with('error', 'Data tidak ditemukan.');
        }

        $category = Category::find($production->category_id);

        $categoryProduction = [
            'category_id' => $category->id ?? null,
            'category_name' => $category->name ?? 'Unknown',
            'tags' => SelectedProductionCategory::where('production_id', $id)
                ->join('tag', 'selected_production_category.tag_id', '=', 'tag.id')
                ->select('tag.id as tag_id', 'tag.name as tag_name')
                ->get()
                ->map(fn($tag) => [
                    'id' => $tag->tag_id,
                    'name' => $tag->tag_name,
                ])->values()->all(),
        ];

        $categoryWithTags = Category::where('id', $production->category_id)
            ->with(['tags' => function ($query) {
                $query->where('type', 'production');
            }])
            ->first();

        $categoryWithTags = $categoryWithTags ? [
            'category_id' => $categoryWithTags->id,
            'category_name' => $categoryWithTags->name,
            'tags' => $categoryWithTags->tags->map(fn($tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
            ])->all(),
        ] : null;

        return Inertia::render('admin/production/delete', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Production Hapus Data',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'production' => $production,
            'categoryProduction' => $categoryProduction,
            'categoryWithTags' => $categoryWithTags,
        ]);
    }

    public function move_show(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');

        if ($my_role == 'marketing' || !$id) {
            return Redirect::route('production.show');
        }

        $production = DB::table('production as p')
            ->join('master_data as md', 'p.master_id', '=', 'md.id')
            ->join('category as c', 'md.category_id', '=', 'c.id')
            ->where('p.id', $id)
            ->select(
                'p.id as production_id',
                'md.sku',
                'md.product_name',
                'p.quantity',
                'c.name as category_name',
                'c.id as category_id'
            )
            ->first();

        if (!$production) {
            return Redirect::route('production.show');
        }

        $tags = SelectedProductionCategory::where('production_id', $id)
            ->join('tag', 'selected_production_category.tag_id', '=', 'tag.id')
            ->select('tag.id as tag_id', 'tag.name as tag_name')
            ->get()
            ->map(fn($tag) => [
                'id' => $tag->tag_id,
                'name' => $tag->tag_name,
            ])
            ->values()
            ->all();

        $categoriesWithTags = Category::with(['tags' => function ($query) {
            $query->where('type', 'stock');
        }])->get();

        return Inertia::render('admin/production/move', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Production Move To Stock',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'product' => [
                'production_id' => $production->production_id,
                'sku' => $production->sku,
                'product_name' => $production->product_name,
                'quantity' => $production->quantity,
                'category_id' => $production->category_id,
                'category_name' => $production->category_name,
                'tags' => $tags,
            ],
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

        $product = DB::table('production as p')
            ->join('master_data as md', 'p.master_id', '=', 'md.id')
            ->join('category as c', 'md.category_id', '=', 'c.id')
            ->join('selected_production_category as spc', 'p.id', '=', 'spc.production_id')
            ->join('tag as t', 'spc.tag_id', '=', 't.id')
            ->where('p.id', $id)
            ->select(
                'md.sku',
                'md.product_name',
                'md.id as master_id',
                'p.quantity',
                'c.name as category_name',
                'spc.tag_id',
                'p.id as production_id',
                't.id',
                't.name'
            )
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

        $PRODUCTS = DB::table('production as p')
            ->join('master_data as md', 'p.master_id', '=', 'md.id')
            ->join('category as c', 'md.category_id', '=', 'c.id')
            ->leftJoin('selected_production_category as spc', 'p.id', '=', 'spc.production_id')
            ->leftJoin('tag as t', 'spc.tag_id', '=', 't.id')
            ->where('md.sku', $result[0]['sku'])
            ->where('p.id', '<>', $result[0]['production_id'])
            ->select(
                'md.id as master_id',
                'md.product_name as product_name',
                'md.sku as sku',
                'p.id as production_id',
                'p.quantity as product_quantity',
                'c.id as category_id',
                'c.name as category_name',
                't.id as tag_id',
                't.name as tag_name',
                'p.created_at',
                'p.updated_at'
            )
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

        $categoriesWithTags = Category::with(['tags' => function ($query) {
            $query->where('type', 'stock');
        }])->get();

        return Inertia::render('admin/production/merge', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Move To Stock (Merge)',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'product' => $result[0],
            'categoriesWithTags' => $categoriesWithTags,
            'productInProduction' => $productInProduction,
        ]);
    }

    public function store(ProductionRequest $request)
    {
        $productData = $request->validated();
        $tags = $productData['tags'];

        DB::beginTransaction();
        try {
            $product = MasterData::firstOrCreate(
                ['sku' => $productData['sku']],
                [
                    'product_name' => $productData['name'],
                    'category_id' => $productData['category_id'],
                ]
            );

            $existingProduction = Production::where('master_id', $product->id)
                ->whereHas('selectedProductionCategories', function ($query) use ($tags) {
                    $query->whereIn('tag_id', $tags);
                }, '=', count($tags))
                ->whereDoesntHave('selectedProductionCategories', function ($query) use ($tags) {
                    $query->whereNotIn('tag_id', $tags);
                })
                ->first();

            if ($existingProduction) {
                $existingProduction->quantity += $productData['quantity'];
                $existingProduction->save();
    
                $categoryName = Category::find($productData['category_id'])->name;
                $tagNames = Tag::whereIn('id', $productData['tags'])->pluck('name')->toArray();
                $tagNamesString = implode(', ', $tagNames);

                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'tambah',
                    'category' => 'production',
                    'sku' => $product->sku,
                    'keterangan' => 'Produk dengan SKU: ' . $productData['sku'] . ', Kategori: ' . $categoryName . ', Tags: (' . $tagNamesString . '). Berhasil ditambahkan ke Produksi dengan jumlah: ' . $productData['quantity'] . '.'
                ]);
            } else {
                $newProduction = Production::create([
                    'master_id' => $product->id,
                    'quantity' => $productData['quantity'],
                ]);

                foreach ($tags as $tag) {
                    SelectedProductionCategory::create([
                        'production_id' => $newProduction->id,
                        'category_id' => $productData['category_id'],
                        'tag_id' => $tag,
                    ]);
                }

                $categoryName = Category::find($productData['category_id'])->name;
                $tagNames = Tag::whereIn('id', $productData['tags'])->pluck('name')->toArray();
                $tagNamesString = implode(', ', $tagNames);

                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'tambah',
                    'category' => 'production',
                    'sku' => $product->sku,
                    'keterangan' => 'Produk baru dengan SKU: ' . $productData['sku'] . ', Kategori: ' . $categoryName . ', Tags: (' . $tagNamesString . '). Berhasil ditambahkan ke Produksi dengan jumlah: ' . $productData['quantity'] . '.'
                ]);
            }
            DB::commit();
            return Redirect::route('production.show')->with('success', 'Produk berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('production.show')->with('error', 'Terjadi kesalahan saat membuat produk.');
        }
    }

    public function update(ProductionUpdateRequest $request)
    {
        $productData = $request->validated();
        $production_id = $request->query('id');

        if (!$production_id) {
            return Redirect::route('production.show')->with('error', 'ID Produksi tidak ditemukan.');
        }

        DB::beginTransaction();
        try {
            $master_data = MasterData::where('sku', $productData['sku'])->first();
            $oldProductName = $master_data->product_name;
            $newProductName = $productData['product_name'];

            if ($master_data && $oldProductName != $newProductName) {
                $master_data->product_name = $productData['product_name'];
                $master_data->save();

                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'edit',
                    'category' => 'production',
                    'sku' => $productData['sku'],
                    'keterangan' => 'Produk dengan SKU: ' . $productData['sku'] . 
                    '. Berhasil diperbaharui nama produknya dari ' . $oldProductName . ' menjadi ' . $productData['product_name'] . '.'
                ]);

                DB::commit();
            }

            if ($oldProductName !== $newProductName) {
                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'edit',
                    'category' => 'production',
                    'sku' => $productData['sku'],
                    'keterangan' => 'Produk dengan SKU: ' . $productData['sku'] .
                        '. Berhasil diperbaharui nama produknya dari ' . $oldProductName . ' menjadi ' . $newProductName . '.'
                ]);
            }

            $tags = $productData['tags'];

            $productions = Production::whereHas('masterData', function ($query) use ($productData) {
                $query->where('sku', $productData['sku']);
            })->pluck('id')->toArray();

            $matchingProductionId = null;

            foreach ($productions as $productionId) {
                if ($productionId == $production_id) {
                    continue;
                }
            
                $associatedTags = DB::table('selected_production_category')
                    ->where('production_id', $productionId)
                    ->pluck('tag_id')
                    ->toArray();
            
                if (empty(array_diff($tags, $associatedTags)) && empty(array_diff($associatedTags, $tags))) {
                    $matchingProductionId = $productionId;
                    break;
                }
            }

            $production = Production::findOrFail($production_id);
            $oldQuantity = $production->quantity;
            $newQuantity = $productData['quantity'];

            $oldTags = SelectedProductionCategory::where('production_id', $production_id)
            ->pluck('tag_id')->toArray();

            $categoryName = Category::find($productData['category_id'])->name;
            $oldTagsString = implode(', ', Tag::whereIn('id', $oldTags)->pluck('name')->toArray());
            $newTagsString = implode(', ', Tag::whereIn('id', $tags)->pluck('name')->toArray());

            if ($matchingProductionId) {
                $updateProduction = Production::find($matchingProductionId);
                $updateProduction->quantity += $newQuantity;
                $production->updated_at = now();
                $updateProduction->save();
                $production->delete();

                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'edit',
                    'category' => 'production',
                    'sku' => $productData['sku'],
                    'keterangan' => 'Produk dengan SKU: ' . $productData['sku'] . ', Kategori: ' . $categoryName .
                        ', Tags: (' . $oldTagsString . '), Jumlah: ' . $oldQuantity .
                        '. Berhasil disatukan dengan Tags: (' . $newTagsString . '), Jumlah: ' . $newQuantity . '.'
                ]);
            } else {
                $production->quantity = $newQuantity;
                $production->updated_at = now();
                $production->save();

                SelectedProductionCategory::where('production_id', $production_id)->delete();

                foreach ($tags as $tag) {
                    SelectedProductionCategory::create([
                        'production_id' => $production->id,
                        'category_id' => $productData['category_id'],
                        'tag_id' => $tag,
                    ]);
                }

                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'edit',
                    'category' => 'production',
                    'sku' => $productData['sku'],
                    'keterangan' => 'Produk dengan SKU: ' . $productData['sku'] . ', Kategori: ' . $categoryName .
                        ', Tags: (' . $oldTagsString . '), Jumlah: ' . $oldQuantity .
                        '. Berhasil diperbaharui menjadi Tags: (' . $newTagsString . '), Jumlah: ' . $productData['quantity'] . '.'
                ]);
            }

            DB::commit();
            return Redirect::route('production.show')->with('success', 'Produk berhasil diubah.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('production.show')->with('error', 'Terjadi kesalahan saat mengubah data Produksi');
        }
    }

    public function destroy(Request $request)
    {
        $production_id = $request->query('id');

        if (!$production_id) {
            return Redirect::route('production.show')->with('error', 'ID Produksi tidak ditemukan.');
        }

        DB::beginTransaction();
        try {
            $production = Production::find($production_id);

            if (!$production) {
                DB::rollBack();
                return Redirect::route('production.show')->with('error', 'Data Produksi tidak ditemukan.');
            }

            $masterData = MasterData::join('production', 'production.master_id', '=', 'master_data.id')
                ->where('production.id', $production_id)
                ->select('master_data.sku', 'master_data.product_name', 'master_data.category_id')
                ->first();

            if (!$masterData) {
                DB::rollBack();
                return Redirect::route('production.show')->with('error', 'Master data tidak ditemukan.');
            }

            $category = Category::find($masterData->category_id);
            $categoryName = $category ? $category->name : 'Unknown';

            $selectedProduction = SelectedProductionCategory::where('production_id', $production_id)
                ->join('tag', 'selected_production_category.tag_id', '=', 'tag.id')
                ->select('tag.name as tag_name')
                ->get();

            $tags = $selectedProduction->pluck('tag_name')->unique()->values()->all();
            $tagsString = implode(', ', $tags);

            Logging::create([
                'user_id' => $request->user()->id,
                'action' => 'hapus',
                'category' => 'production',
                'sku' => $masterData->sku,
                'keterangan' => 'Produk dengan SKU: ' . $masterData->sku . ', Kategori: ' . $categoryName . ', Tags: (' . $tagsString . '), Jumlah: ' . $production->quantity . '. Berhasil dihapus.'
            ]);

            SelectedProductionCategory::where('production_id', $production_id)->delete();
            $production->delete();

            DB::commit();
            return Redirect::route('production.show')->with('success', 'Berhasil menghapus data Produksi.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('production.show')->with('error', 'Terjadi kesalahan saat menghapus data Produksi: ' . $e->getMessage());
        }
    }

    public function move_store(ProductMoveRequest $request)
    {
        $productData = $request->validated();
        $tags = $productData['tags'];

        DB::beginTransaction();
        try {
            $production = Production::findOrFail($productData['production_id']);

            if ($production->quantity < $productData['quantity']) {
                DB::rollBack();
                return Redirect::route('stock.show')->with('error', 'Jumlah produksi tidak mencukupi.');
            }

            $masterData = MasterData::where('sku', $productData['sku'])->firstOrFail();

            $existingStock = Stock::where('master_id', $masterData->id)
                ->whereHas('selectedStockCategories', function ($query) use ($tags) {
                    $query->whereIn('tag_id', $tags);
                })
                ->withCount(['selectedStockCategories as matched_tags' => function ($query) use ($tags) {
                    $query->whereIn('tag_id', $tags);
                }])
                ->withCount('selectedStockCategories')
                ->havingRaw('matched_tags = ?', [count($tags)])
                ->havingRaw('selected_stock_categories_count = ?', [count($tags)])
                ->first();

            if ($existingStock) {
                $existingStock->quantity += $productData['quantity'];
                $existingStock->save();
            } else {
                $newStock = Stock::create([
                    'quantity' => $productData['quantity'],
                    'price' => $productData['price'],
                    'master_id' => $masterData->id,
                ]);

                foreach ($tags as $tag) {
                    SelectedStockCategory::create([
                        'stock_id' => $newStock->id,
                        'tag_id' => $tag,
                    ]);
                }
            }

            $production->quantity -= $productData['quantity'];
            $production->save();

            $category = Category::find($masterData->category_id);
            $tagNames = Tag::whereIn('id', $tags)->pluck('name')->toArray();
            $harga = 'Rp' . number_format($productData['price'], 0, ',', '.');

            Logging::create([
                'user_id' => $request->user()->id,
                'action' => 'move',
                'category' => 'production',
                'sku' => $productData['sku'],
                'keterangan' => 'Produk dengan Kategori: ' . $category->name .
                    ', Tags: (' . implode(', ', $tagNames) . '). Berhasil dipindahkan ke Stok dengan Harga: ' . $harga .
                    ', Jumlah: ' . $productData['quantity'] . '.'
            ]);

            DB::commit();
            return Redirect::route('stock.show')->with('success', 'Produk berhasil dipindahkan ke Stok.');

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

            $MERGEDATA = collect();
            foreach ($mergeList as $list) {
                $PRODUCTION = DB::table('production')
                    ->join('master_data', 'production.master_id', '=', 'master_data.id')
                    ->join('category', 'master_data.category_id', '=', 'category.id')
                    ->join('selected_production_category as spc', 'production.id', '=', 'spc.production_id')
                    ->join('tag', 'spc.tag_id', '=', 'tag.id')
                    ->where('production.id', '=', $list)
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
                    return Redirect::route('production.show')->with('error', 'Produk yang ingin digabung tidak ada.');
                }

                if ($production->quantity < $productData['quantity']) {
                    DB::rollBack();
                    return Redirect::route('production.show')->with('error', 'Jumlah Produk yang ingin digabung terlalu banyak.');
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

                $categoryProd = DB::table('stock')
                    ->join('master_data', 'stock.master_id', '=', 'master_data.id')
                    ->join('category', 'master_data.category_id', '=', 'category.id')
                    ->where('stock.id', $stockId)
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
                    'keterangan' => "$MERGELENGTH produk pada Produksi dengan tujuan SKU: {$productData['sku']}, Kategori: {$categoryProd->category_name}, Tags: (" . implode(', ', $tagNamesProd) . "), Harga: $harga, Jumlah: {$productData['quantity']}. Berhasil di merge dengan Detail Produk:\n" . $formattedItems
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
                        'keterangan' => "$MERGELENGTH produk pada Produksi dengan tujuan SKU: {$productData['sku']}, Kategori: {$category->name}, Tags: (" . implode(', ', $listTag) . "), Harga: $harga, Jumlah: {$productData['quantity']}. Berhasil di merge dengan Detail Produk:\n" . $formattedItems
                    ]);
                }
            }

            DB::commit();
            return Redirect::route('stock.show')->with('success', 'Produk berhasil dimerge ke Stok.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('production.show')->with('error', 'Terjadi kesalahan saat menggabungkan produk.' . $e->getMessage());
        }
    }
}