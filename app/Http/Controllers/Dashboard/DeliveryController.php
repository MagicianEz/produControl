<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeliveryApiGetTujuanRequest;
use App\Http\Requests\DeliveryDestroyRequest;
use App\Http\Requests\DeliveryReturRequest;
use App\Http\Requests\DeliveryUpdateRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;
use App\Models\Delivery;
use App\Models\Logging;
use App\Models\MasterData;
use App\Models\Production;
use App\Models\Stock;
use App\Models\Tag;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

class DeliveryController extends Controller
{
    public function api_get_tujuan(DeliveryApiGetTujuanRequest $request)
    {
        $productData = $request->validated();
        if ($productData['tujuan'] == 'production') {
            $PRODUCTION = DB::table('selected_production_category')
                ->join('production', 'selected_production_category.production_id', '=', 'production.id')
                ->join('master_data', 'production.master_id', '=', 'master_data.id')
                ->join('category', 'selected_production_category.category_id', '=', 'category.id')
                ->leftJoin('tag', 'selected_production_category.tag_id', '=', 'tag.id')
                ->select(
                    'master_data.id as master_id',
                    'master_data.product_name as product_name',
                    'master_data.sku as sku',
                    'production.id as production_id',
                    'production.quantity as production_quantity',
                    'category.id as category_id',
                    'category.name as category_name',
                    'tag.id as tag_id',
                    'tag.name as tag_name',
                    'production.created_at',
                    'production.updated_at'
                )
                ->where('category.type', '=', 'production')
                ->where('master_data.sku', '=', $productData['sku'])
                ->get();
            $groupedProducts = [];
            foreach ($PRODUCTION as $product) {
                if (!isset($groupedProducts[$product->production_id])) {
                    $groupedProducts[$product->production_id] = [
                        'tujuan_id' => $product->production_id,
                        'master_id' => $product->master_id,
                        'product_name' => $product->product_name,
                        'sku' => $product->sku,
                        'production_quantity' => $product->production_quantity,
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
            if ($productInProduction) {
                return response()->json([
                    'code' => 200,
                    'data' => $productInProduction,
                ], 200);
            } else {
                return response()->json([
                    'code' => 404,
                    'message' => 'Produk tidak ditemukan',
                ], 404);
            }
        }

        if ($productData['tujuan'] == 'stock') {
            $STOCK = DB::table('selected_stock_category')
                ->join('stock', 'selected_stock_category.stock_id', '=', 'stock.id')
                ->join('master_data', 'stock.master_id', '=', 'master_data.id')
                ->join('category', 'selected_stock_category.category_id', '=', 'category.id')
                ->leftJoin('tag', 'selected_stock_category.tag_id', '=', 'tag.id')
                ->select(
                    'master_data.id as master_id',
                    'master_data.product_name as product_name',
                    'master_data.sku as sku',
                    'stock.id as stock_id',
                    'stock.quantity as stock_quantity',
                    'category.id as category_id',
                    'category.name as category_name',
                    'tag.id as tag_id',
                    'tag.name as tag_name',
                    'stock.created_at',
                    'stock.updated_at'
                )
                ->where('category.type', '=', 'stock')
                ->where('master_data.sku', '=', $productData['sku'])
                ->get();
            $groupedProducts = [];
            foreach ($STOCK as $product) {
                if (!isset($groupedProducts[$product->stock_id])) {
                    $groupedProducts[$product->stock_id] = [
                        'tujuan_id' => $product->stock_id,
                        'master_id' => $product->master_id,
                        'product_name' => $product->product_name,
                        'sku' => $product->sku,
                        'stock_quantity' => $product->stock_quantity,
                        'category_id' => $product->category_id,
                        'category_name' => $product->category_name,
                        'tags' => [],
                        'created_at' => $product->created_at,
                        'updated_at' => $product->updated_at
                    ];
                }
                if ($product->tag_id !== null) {
                    $groupedProducts[$product->stock_id]['tags'][] = [
                        'id' => $product->tag_id,
                        'name' => $product->tag_name
                    ];
                }
            }
            $productInStock = array_values($groupedProducts);
            if ($productInStock) {
                return response()->json([
                    'code' => 200,
                    'data' => $productInStock,
                ], 200);
            } else {
                return response()->json([
                    'code' => 404,
                    'message' => 'Produk tidak ditemukan',
                ], 404);
            }
        }

        return response()->json([
            'code' => 404,
            'message' => 'Tujuan tidak ditemukan',
        ], 404);
    }

    public function show(Request $request)
    {
        Delivery::where('quantity', '=', 0)->delete();
        $products = DB::table('selected_stock_category')
            ->join('stock as s1', 'selected_stock_category.stock_id', '=', 's1.id')
            ->join('delivery', 'delivery.master_id', '=', 's1.master_id')
            ->join('master_data', 's1.master_id', '=', 'master_data.id')
            ->join('category', 'selected_stock_category.category_id', '=', 'category.id')
            ->join('tag', 'selected_stock_category.tag_id', '=', 'tag.id')
            ->select(
                'master_data.id as master_id',
                'master_data.product_name as product_name',
                'master_data.sku as sku',
                'delivery.quantity as product_quantity',
                'delivery.total_price as product_price',
                'delivery.id as delivery_id',
                'delivery.invoice as invoice',
                'delivery.status_pengiriman as status_pengiriman',
                'category.id as category_id',
                'category.name as category_name',
                'tag.id as tag_id',
                'tag.name as tag_name',
                's1.created_at',
                's1.updated_at'
            )
            ->where('category.type', '=', 'stock')
            ->get();
        $groupedProducts = [];
        foreach ($products as $product) {
            $masterDeliveryKey = $product->master_id . '-' . $product->delivery_id;
            if (!isset($groupedProducts[$masterDeliveryKey])) {
                $groupedProducts[$masterDeliveryKey] = [
                    'master_id' => $product->master_id,
                    'product_name' => $product->product_name,
                    'sku' => $product->sku,
                    'product_quantity' => $product->product_quantity,
                    'product_price' => $product->product_price,
                    'category_id' => $product->category_id,
                    'category_name' => $product->category_name,
                    'delivery_id' => $product->delivery_id,
                    'invoice' => $product->invoice,
                    'status_pengiriman' => $product->status_pengiriman,
                    'tags' => [],
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ];
            }
            $groupedProducts[$masterDeliveryKey]['tags'][] = [
                'id' => $product->tag_id,
                'name' => $product->tag_name
            ];
        }
        $groupedProducts = array_values($groupedProducts);

        $ALLCATEGORY = Category::all();
        $transformedCategories = $ALLCATEGORY->map(function ($category) {
            return [
                'value' => $category->name,
                'label' => $category->name,
            ];
        })->unique('value');

        $transformedCategoriesArray = $transformedCategories->values()->toArray();

        return Inertia::render('admin/delivery/page', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Delivery',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'search' => request('search'),
            'isSku' => request('isSku'),
            'products' => $groupedProducts,
            'allCategory' => $transformedCategoriesArray,
        ]);
    }

    public function detail(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');
        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('dashboard.show');
        }
        $deliveryRaw = DB::table('selected_stock_category as ssc')
            ->join('category', 'ssc.category_id', '=', 'category.id')
            ->join('tag', 'ssc.tag_id', '=', 'tag.id')
            ->join('stock', 'ssc.stock_id', '=', 'stock.id')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->join('delivery', 'master_data.id', '=', 'delivery.master_id')
            ->where('delivery.id', '=', $id)
            ->select(
                'stock.master_id as master_id',
                'master_data.sku as sku',
                'master_data.product_name as name',
                'delivery.id as id',
                'delivery.invoice as invoice',
                'delivery.quantity as quantity',
                'delivery.total_price as total_price',
                'delivery.status_pengiriman as status_pengiriman',
                'stock.price as price',
                'category.id as category_id',
                'category.name as category_name',
                'tag.name as tag_name',
                'tag.id as tag_id'
            )
            ->get();
        $delivery = $deliveryRaw->groupBy('category_id')->map(function ($items, $categoryId) {
            return [
                'category_id' => $categoryId,
                'category_name' => $items->first()->category_name,
                'master_id' => $items->first()->master_id,
                'sku' => $items->first()->sku,
                'name' => $items->first()->name,
                'id' => $items->first()->id,
                'invoice' => $items->first()->invoice,
                'quantity' => $items->first()->quantity,
                'total_price' => $items->first()->total_price,
                'status_pengiriman' => $items->first()->status_pengiriman,
                'price' => $items->first()->price,
                'tags' => $items->map(function ($item) {
                    return [
                        'id' => $item->tag_id,
                        'name' => $item->tag_name,
                    ];
                })->values()->all(),
            ];
        })->values()->all();
        if (empty($delivery)) {
            return Redirect::route('stock.show');
        }
        return Inertia::render('admin/delivery/detail', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Delivery Detail Data',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'delivery' => $delivery[0],
        ]);
    }

    public function delete(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');
        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('dashboard.show');
        }
        $deliveryRaw = DB::table('selected_stock_category as ssc')
            ->join('category', 'ssc.category_id', '=', 'category.id')
            ->join('tag', 'ssc.tag_id', '=', 'tag.id')
            ->join('stock', 'ssc.stock_id', '=', 'stock.id')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->join('delivery', 'master_data.id', '=', 'delivery.master_id')
            ->where('delivery.id', '=', $id)
            ->select(
                'stock.master_id as master_id',
                'master_data.sku as sku',
                'master_data.product_name as name',
                'delivery.id as id',
                'delivery.quantity as quantity',
                'delivery.invoice as invoice',
                'delivery.total_price as total_price',
                'stock.price as price',
                'category.id as category_id',
                'category.name as category_name',
                'tag.name as tag_name',
                'tag.id as tag_id'
            )
            ->get();
        $delivery = $deliveryRaw->groupBy('category_id')->map(function ($items, $categoryId) {
            return [
                'category_id' => $categoryId,
                'category_name' => $items->first()->category_name,
                'master_id' => $items->first()->master_id,
                'sku' => $items->first()->sku,
                'name' => $items->first()->name,
                'id' => $items->first()->id,
                'quantity' => $items->first()->quantity,
                'invoice' => $items->first()->invoice,
                'total_price' => $items->first()->total_price,
                'price' => $items->first()->price,
                'tags' => $items->map(function ($item) {
                    return [
                        'id' => $item->tag_id,
                        'name' => $item->tag_name,
                    ];
                })->values()->all(),
            ];
        })->values()->all();
        if (empty($delivery)) {
            return Redirect::route('delivery.show');
        }
        return Inertia::render('admin/delivery/delete', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Delivery Hapus Data',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'delivery' => $delivery[0],
        ]);
    }

    public function retur(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');
        if ($my_role == 'marketing' || $id == null) {
            return Redirect::route('dashboard.show');
        }
        $delivery = Delivery::join('master_data', 'delivery.master_id', '=', 'master_data.id')
            ->where('delivery.id', $id)
            ->select(
                'master_data.id as master_id',
                'master_data.product_name as product_name',
                'master_data.sku as sku',
                'delivery.quantity as product_quantity',
                'delivery.total_price as product_price',
                'delivery.id as delivery_id',
                'delivery.status_pengiriman as status_pengiriman',
                'delivery.invoice as invoice',
                'delivery.created_at',
                'delivery.updated_at'
            )
            ->first();
        if (!$delivery) {
            return redirect()->route('delivery.show')->with('error', 'Delivery tidak ada.');
        }
        $STOCK = DB::table('selected_stock_category')
            ->join('stock', 'selected_stock_category.stock_id', '=', 'stock.id')
            ->join('master_data', 'stock.master_id', '=', 'master_data.id')
            ->join('category', 'selected_stock_category.category_id', '=', 'category.id')
            ->leftJoin('tag', 'selected_stock_category.tag_id', '=', 'tag.id')
            ->select(
                'master_data.id as master_id',
                'master_data.product_name as product_name',
                'master_data.sku as sku',
                'stock.id as stock_id',
                'stock.quantity as stock_quantity',
                'category.id as category_id',
                'category.name as category_name',
                'tag.id as tag_id',
                'tag.name as tag_name',
                'stock.created_at',
                'stock.updated_at'
            )
            ->where('category.type', '=', 'stock')
            ->where('master_data.sku', '=', $delivery->sku)
            ->get();
        $groupedProducts = [];
        foreach ($STOCK as $product) {
            if (!isset($groupedProducts[$product->stock_id])) {
                $groupedProducts[$product->stock_id] = [
                    'stock_id' => $product->stock_id,
                    'master_id' => $product->master_id,
                    'product_name' => $product->product_name,
                    'sku' => $product->sku,
                    'stock_quantity' => $product->stock_quantity,
                    'category_id' => $product->category_id,
                    'category_name' => $product->category_name,
                    'tags' => [],
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at
                ];
            }
            if ($product->tag_id !== null) {
                $groupedProducts[$product->stock_id]['tags'][] = [
                    'id' => $product->tag_id,
                    'name' => $product->tag_name
                ];
            }
        }
        $productInStock = array_values($groupedProducts);
        return Inertia::render('admin/delivery/retur', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Delivery Retur',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'delivery' => $delivery,
            'stock' => $productInStock,
        ]);
    }

    public function retur_update(DeliveryReturRequest $request)
    {
        try {
            $productData = $request->validated();
            $tujuan = $productData['tujuan'];
            DB::beginTransaction();

            if ($tujuan == 'stock') {
                $delivery = Delivery::find($productData['delivery_id']);
                if (!$delivery) {
                    DB::rollBack();
                    return Redirect::route('delivery.show')->with('error', 'Data delivery tidak ada.');
                }
                $stock = Stock::find($productData['tujuan_id']);
                if (!$stock) {
                    DB::rollBack();
                    return Redirect::route('delivery.show')->with('error', 'Data stock tujuan tidak ada.');
                }
                if ($delivery->quantity < $productData['quantity']) {
                    DB::rollBack();
                    return Redirect::route('delivery.show')->with('error', 'Jumlah retur melebihi quantity delivery.');
                }
                $quantitySaatIni = $delivery->quantity;
                $hargaSatuan = ($delivery->total_price / $delivery->quantity);
                $harga = 'Rp' . number_format($hargaSatuan * $productData['quantity'], 0, ',', '.');
                $delivery->quantity -= $productData['quantity'];
                $delivery->total_price = ($quantitySaatIni - $productData['quantity']) * $hargaSatuan;
                $delivery->save();
                $stock->quantity += $productData['quantity'];
                $stock->save();
                $masterData = MasterData::find($delivery->master_id);
                $category = Category::find($productData['category_id']);
                $tags = [];
                foreach ($productData['tags'] as $tagId) {
                    $tag = Tag::find($tagId);
                    $tags[] = $tag->name;
                }
                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'retur',
                    'category' => 'delivery',
                    'sku' => $masterData->sku,
                    'keterangan' => $productData['quantity'] . ' Produk berhasil di retur ke Stock dengan SKU: ' . $masterData->sku . ', Kategori: ' . $category->name . ', Tags: (' . implode(', ', $tags) . '), dan Harga: ' . $harga . '.'
                ]);
                DB::commit();
                return Redirect::route('delivery.show')->with('success', 'Delivery berhasil diretur ke stock.');
            }

            if ($tujuan == 'production') {
                $delivery = Delivery::find($productData['delivery_id']);
                if (!$delivery) {
                    DB::rollBack();
                    return Redirect::route('delivery.show')->with('error', 'Data delivery tidak ada.');
                }
                $production = Production::find($productData['tujuan_id']);
                if (!$production) {
                    DB::rollBack();
                    return Redirect::route('delivery.show')->with('error', 'Data stock tujuan tidak ada.');
                }
                if ($delivery->quantity < $productData['quantity']) {
                    DB::rollBack();
                    return Redirect::route('delivery.show')->with('error', 'Jumlah retur melebihi quantity delivery.');
                }
                $quantitySaatIni = $delivery->quantity;
                $hargaSatuan = ($delivery->total_price / $delivery->quantity);
                $harga = 'Rp' . number_format($hargaSatuan * $productData['quantity'], 0, ',', '.');
                $delivery->quantity -= $productData['quantity'];
                $delivery->total_price = ($quantitySaatIni - $productData['quantity']) * $hargaSatuan;
                $delivery->save();
                $production->quantity += $productData['quantity'];
                $production->save();
                $masterData = MasterData::find($delivery->master_id);
                $category = Category::find($productData['category_id']);
                $tags = [];
                foreach ($productData['tags'] as $tagId) {
                    $tag = Tag::find($tagId);
                    $tags[] = $tag->name;
                }
                Logging::create([
                    'user_id' => $request->user()->id,
                    'action' => 'retur',
                    'category' => 'delivery',
                    'sku' => $masterData->sku,
                    'keterangan' => $productData['quantity'] . ' Produk berhasil di retur ke Production dengan SKU: ' . $masterData->sku . ', Kategori: ' . $category->name . ', Tags: (' . implode(', ', $tags) . '), dan Harga: ' . $harga . '.'
                ]);
                DB::commit();
                return Redirect::route('delivery.show')->with('success', 'Delivery berhasil diretur ke production.');
            }
            return Redirect::route('delivery.show')->with('error', 'Tujuan retur tidak ada.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('delivery.show')->with('error', 'Terjadi kesalahan saat mengubah data delivery.');
        }
    }

    public function update(DeliveryUpdateRequest $request)
    {
        $productData = $request->validated();
        DB::beginTransaction();
        try {
            $delivery = Delivery::find($productData['id']);
            if (!$delivery) {
                DB::rollBack();
                return Redirect::route('delivery.show')->with('error', 'Data delivery tidak ada.');
            }
            $dataSaatIniInvoice = $delivery->invoice;
            $dataSaatIniStatus = $delivery->status_pengiriman;
            $dataSaatIniJumlah = $delivery->quantity;
            $delivery->invoice = $productData['invoice'];
            $delivery->quantity = $productData['quantity'];
            $delivery->total_price = $productData['total_price'];
            $delivery->status_pengiriman = $productData['status_pengiriman'];
            $delivery->save();
            $masterData = MasterData::find($delivery->master_id);
            Logging::create([
                'user_id' => $request->user()->id,
                'action' => 'edit',
                'category' => 'delivery',
                'sku' => $masterData->sku,
                'keterangan' => 'Produk dengan SKU ' . $masterData->sku . ', Nomor  Invoice: ' . $dataSaatIniInvoice . ', Status Pengiriman: ' . $dataSaatIniStatus . ', dan Jumlah: ' . $dataSaatIniJumlah . '. Berhasil diubah menjadi Nomor  Invoice: ' . $productData['invoice'] . ', Status Pengiriman: ' . ucwords($productData['status_pengiriman']) . ', dan Jumlah: ' . $productData['quantity'] . '.'
            ]);
            DB::commit();
            return Redirect::route('delivery.show')->with('success', 'Delivery berhasil diubah.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('delivery.show')->with('error', 'Terjadi kesalahan saat mengubah data delivery.');
        }
    }

    public function destroy(DeliveryDestroyRequest $request)
    {
        $my_role = $request->user()->role;
        $productData = $request->validated();
        if ($my_role == 'marketing' || $productData['id'] == null) {
            return Redirect::route('delivery.show');
        }
        DB::beginTransaction();
        try {
            $delivery = Delivery::find($productData['id']);
            if (!$delivery) {
                DB::rollBack();
                return Redirect::route('delivery.show')->with('error', 'Data delivery tidak ada.');
            }
            $masterData = DB::table('master_data')
                ->join('delivery', 'delivery.master_id', '=', 'master_data.id')
                ->where('delivery.id', $delivery->id)
                ->first();
            Logging::create([
                'user_id' => $request->user()->id,
                'action' => 'hapus',
                'category' => 'delivery',
                'sku' => $masterData->sku,
                'keterangan' => 'Produk dengan SKU: ' . $masterData->sku . ' dan Nomor  Invoice: ' . $delivery->invoice . ' telah dihapus.'
            ]);
            $delivery->delete();
            DB::commit();
            return Redirect::route('delivery.show')->with('success', 'Delivery berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('delivery.show')->with('error', 'Terjadi kesalahan saat menghapus data delivery.');
        }
    }
}
