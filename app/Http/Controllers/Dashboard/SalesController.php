<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\SalesRequest;
use App\Http\Requests\SalesUpdateRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Sales;
use App\Models\SalesDetail;
use App\Models\Logging;
use App\Models\Stock;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    public function show(Request $request)
    {
        $sales = Sales::select('id', 'invoice', 'customer_name', 'grand_total', 'delivery_status', 'created_at', 'updated_at')
            ->get();

        return Inertia::render('admin/sales/page', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Delivery',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'search' => request('search'),
            'isSku' => request('isSku'),
            'products' => $sales,
        ]);
    }

    public function create_show(Request $request)
    {
        $my_role = $request->user()->role;

        if ($my_role == 'marketing') {
            return Redirect::route('sales.show');
        }

        $productsInStock = Stock::with(['masterData.category', 'selectedStockCategories.tag'])
            ->get()
            ->map(function ($stock) {
                return [
                    'stock_id' => $stock->id,
                    'master_id' => $stock->master_id,
                    'sku' => $stock->masterData->sku,
                    'product_name' => $stock->masterData->product_name,
                    'category_name' => $stock->masterData->category->name,
                    'quantity' => $stock->quantity,
                    'price' => $stock->price,
                    'tags' => $stock->selectedStockCategories->map(function ($selectedCategory) {
                        return [
                            'id' => $selectedCategory->tag->id,
                            'name' => $selectedCategory->tag->name,
                        ];
                    })->values()->all(),
                    'created_at' => $stock->created_at,
                    'updated_at' => $stock->updated_at,
                ];
            });

        return Inertia::render('admin/sales/add', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Tambah Penjualan',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'productInStock' => $productsInStock,
        ]);
    }

    public function detail_show(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');

        if ($my_role == 'marketing') {
            return Redirect::route('sales.show');
        }

        $sales = Sales::findOrFail($id);

        $salesDetails = SalesDetail::with(['stock.masterData.category', 'stock.selectedStockCategories.tag'])
        ->where('sales_id', $id)
        ->get()
        ->map(function ($detail) {
            return [
                'stock_id' => $detail->stock_id,
                'sku' => $detail->stock->masterData->sku,
                'product_name' => $detail->stock->masterData->product_name,
                'category_name' => $detail->stock->masterData->category->name,
                'tags' => $detail->stock->selectedStockCategories->map(function ($selectedCategory) {
                    return [
                        'id' => $selectedCategory->tag->id,
                        'name' => $selectedCategory->tag->name,
                    ];
                })->values()->all(),
                'quantity' => $detail->quantity,
                'price' => $detail->price,
            ];
        });

        $productsInStock = Stock::with(['masterData.category', 'selectedStockCategories.tag'])
        ->get()
        ->map(function ($stock) {
            return [
                'stock_id' => $stock->id,
                'master_id' => $stock->master_id,
                'sku' => $stock->masterData->sku,
                'product_name' => $stock->masterData->product_name,
                'category_name' => $stock->masterData->category->name,
                'quantity' => $stock->quantity,
                'price' => $stock->price,
                'tags' => $stock->selectedStockCategories->map(function ($selectedCategory) {
                    return [
                        'id' => $selectedCategory->tag->id,
                        'name' => $selectedCategory->tag->name,
                    ];
                })->values()->all(),
                'created_at' => $stock->created_at,
                'updated_at' => $stock->updated_at,
            ];
        });

        return Inertia::render('admin/sales/detail', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Detail Penjualan',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'productInStock' => $productsInStock,
            'salesData' => $sales,
            'salesDetailList' => $salesDetails,
        ]);
    }

    public function delete_show(Request $request)
    {
        $my_role = $request->user()->role;
        $id = $request->query('id');

        if ($my_role == 'marketing') {
            return Redirect::route('sales.show');
        }

        $sales = Sales::findOrFail($id);

        $salesDetails = SalesDetail::with(['stock.masterData.category', 'stock.selectedStockCategories.tag'])
            ->where('sales_id', $id)
            ->get()
            ->map(function ($detail) {
                return [
                    'stock_id' => $detail->stock_id,
                    'sku' => $detail->stock->masterData->sku,
                    'product_name' => $detail->stock->masterData->product_name,
                    'category_name' => $detail->stock->masterData->category->name,
                    'tags' => $detail->stock->selectedStockCategories->map(function ($selectedCategory) {
                        return [
                            'id' => $selectedCategory->tag->id,
                            'name' => $selectedCategory->tag->name,
                        ];
                    })->values()->all(),
                    'quantity' => $detail->quantity,
                    'price' => $detail->price,
                ];
            });

        return Inertia::render('admin/sales/delete', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Hapus Penjualan',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'salesData' => $sales,
            'salesDetailList' => $salesDetails,
        ]);
    }

    public function store(SalesRequest $request)
    {
        try {
            DB::beginTransaction();

            $sales = Sales::create([
                'invoice' => $request->invoice,
                'customer_name' => $request->customer_name,
                'sub_total' => $request->sub_total,
                'vat' => $request->tax,
                'discount' => $request->discount,
                'grand_total' => $request->grand_total,
                'delivery_status' => $request->delivery_status,
            ]);

            foreach ($request->product_list as $product) {
                SalesDetail::create([
                    'sales_id' => $sales->id,
                    'stock_id' => $product['stock_id'],
                    'quantity' => $product['quantity'],
                    'price' => $product['price'],
                ]);

                DB::table('stock')->where('id', $product['stock_id'])->decrement('quantity', $product['quantity']);
            }

            DB::commit();
            return Redirect::route('sales.show')->with('success', 'Data Penjualan berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('sales.show')->with('error', 'Terjadi kesalahan saat menambah data Penjualan.');
        }
    }

    public function update(SalesUpdateRequest $request)
    {
        $validated = $request->validated();
        $id = $request->query('id');

        DB::beginTransaction();
        try {
            $sales = Sales::findOrFail($id);

            $beforeCustomerName = $sales->customer_name;
            $beforeStatus = $sales->delivery_status;
            $beforeSubtotal = $sales->sub_total;
            $beforeVat = $sales->vat;
            $beforeDiscount = $sales->discount;
            $beforeGrandTotal = $sales->grand_total;

            $sales->update([
                'invoice' => $validated['invoice'],
                'customer_name' => $validated['customer_name'],
                'delivery_status' => $validated['delivery_status'],
                'vat' => $validated['tax'],
                'discount' => $validated['discount'],
                'sub_total' => $validated['sub_total'],
                'grand_total' => $validated['grand_total'],
            ]);

            SalesDetail::where('sales_id', $sales->id)->delete();

            $productLogDetails = [];
            foreach ($validated['product_list'] as $item) {
                SalesDetail::create([
                    'sales_id' => $sales->id,
                    'stock_id' => $item['stock_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);

                $stock = Stock::with('masterData')->find($item['stock_id']);
                $sku = $stock->masterData->sku ?? '-';
                $productName = $stock->masterData->product_name ?? 'Produk Tidak Dikenal';

                $productLogDetails[] = "- SKU: $sku, Nama: $productName, Jumlah: {$item['quantity']}, Harga: Rp " . number_format($item['price'], 0, ',', '.');
            }

            $formattedLog = implode("\n", $productLogDetails);

            Logging::create([
                'user_id' => $request->user()->id,
                'action' => 'edit',
                'category' => 'sales',
                'sku' => $validated['invoice'],
                'keterangan' => "Pengiriman dengan Nama Pembeli: $beforeCustomerName, Subtotal: Rp " . number_format($beforeSubtotal, 0, ',', '.') . ", Pajak: Rp " . number_format($beforeVat, 0, ',', '.') . ", Diskon: Rp " . number_format($beforeDiscount, 0, ',', '.') . ", Grand Total: Rp " . number_format($beforeGrandTotal, 0, ',', '.') . ", Status Pengiriman: $beforeStatus. Berhasil diperbarui menjadi Nama Pembeli: {$validated['customer_name']}, Subtotal: Rp " . number_format($validated['sub_total'], 0, ',', '.') . ", Pajak: Rp " . number_format($validated['tax'], 0, ',', '.') . ", Diskon: Rp " . number_format($validated['discount'], 0, ',', '.') . ", Grand Total: Rp " . number_format($validated['grand_total'], 0, ',', '.') . ", Status Pengiriman: {$validated['delivery_status']}, dengan Detail Produk:\n" . $formattedLog,
            ]);

            DB::commit();
            return Redirect::route('sales.show')->with('success', 'Data penjualan berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('sales.show')->with('error', 'Terjadi kesalahan saat memperbarui data: ');
        }
    }

    public function destroy(Request $request)
    {
        $sales_id = $request->query('id');

        DB::beginTransaction();
        try {
            $sales = Sales::find($sales_id);
            if (!$sales) {
                DB::rollBack();
                return Redirect::route('sales.show')->with('error', 'Data penjualan tidak ditemukan.');
            }

            $details = SalesDetail::with('stock.masterData')
                ->where('sales_id', $sales->id)
                ->get();

            $formattedDetails = $details->map(function ($detail) {
                $sku = $detail->stock->masterData->sku ?? '-';
                $name = $detail->stock->masterData->product_name ?? '-';
                return "- SKU: $sku, Nama: $name, Jumlah: {$detail->quantity}, Harga: Rp " . number_format($detail->price, 0, ',', '.');
            })->implode("\n");

            Logging::create([
                'user_id' => $request->user()->id,
                'action' => 'hapus',
                'category' => 'sales',
                'sku' => $sales->invoice,
                'keterangan' => "Data penjualan dengan Nama Pembeli: {$sales->customer_name}, Subtotal: Rp " . number_format($sales->sub_total, 0, ',', '.') . ", Pajak: Rp " . number_format($sales->vat, 0, ',', '.') . ", Diskon: Rp " . number_format($sales->discount, 0, ',', '.') . ", Grand Total: Rp " . number_format($sales->grand_total, 0, ',', '.') . ", Status Pengiriman: {$sales->delivery_status}. Berhasil dihapus dengan Detail Produk:\n" . $formattedDetails,
            ]);

            SalesDetail::where('sales_id', $sales->id)->delete();
            $sales->delete();

            DB::commit();
            return Redirect::route('sales.show')->with('success', 'Data penjualan berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::route('sales.show')->with('error', 'Terjadi kesalahan saat menghapus data penjualan. ');
        }
    }
}
