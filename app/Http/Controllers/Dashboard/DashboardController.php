<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MasterData;
use App\Models\User;
use App\Models\Production;
use App\Models\Stock;
use App\Models\Delivery;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {

        $USERS = User::count();
        $CATEGORY_PRODUCTION = Category::where('type', '=', 'production')->count();
        $CATEGORY_STOCK = Category::where('type', '=', 'stock')->count();
        $MASTER_DATA = MasterData::count();
        $PRODUCTION = Production::count();
        $STOCK = Stock::count();
        $DELIVERY = Delivery::count();
        $DELIVERY_PROGRESS = Delivery::where('status_pengiriman', 'on progress')->count();
        $DELIVERY_HOLD = Delivery::where('status_pengiriman', 'on hold')->count();
        $DELIVERY_DELIVERY = Delivery::where('status_pengiriman', 'on delivery')->count();
        $DELIVERY_DELIVERED = Delivery::where('status_pengiriman', 'delivered')->count();
        $PRODUCT_PROGRESS = Delivery::where('status_pengiriman', 'on progress')->sum('quantity');
        $PRODUCT_HOLD = Delivery::where('status_pengiriman', 'on hold')->sum('quantity');
        $PRODUCT_DELIVERY = Delivery::where('status_pengiriman', 'on delivery')->sum('quantity');
        $PRODUCT_DELIVERED = Delivery::where('status_pengiriman', 'delivered')->sum('quantity');
        $LOGGING = DB::table('logs')
            ->join('users', 'logs.user_id', '=', 'users.id')
            ->select([
                'users.id as user_id',
                'users.name as user_name',
                'logs.action as log_action',
                'logs.category as log_category',
                'logs.sku as log_sku',
                'logs.keterangan as log_keterangan',
                'logs.created_at as log_createdAt',
            ])
            ->orderBy('logs.created_at', 'desc')
            ->get();
        return Inertia::render('admin/Dashboard', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Dashboard',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'total' => [
                'users' => $USERS - 1,
                'keseluruhan' => $PRODUCTION + $STOCK + $DELIVERY,
                'categoryProduction' => $CATEGORY_PRODUCTION,
                'categoryStock' => $CATEGORY_STOCK,
                'master_data' => $MASTER_DATA,
                'production' => $PRODUCTION,
                'stock' => $STOCK,
                'delivery' => $DELIVERY,
                'delivery_progress' => $DELIVERY_PROGRESS,
                'delivery_hold' => $DELIVERY_HOLD,
                'delivery_delivery' => $DELIVERY_DELIVERY,
                'delivery_delivered' => $DELIVERY_DELIVERED,
                'product_progress' => $PRODUCT_PROGRESS,
                'product_hold' => $PRODUCT_HOLD,
                'product_delivery' => $PRODUCT_DELIVERY,
                'product_delivered' => $PRODUCT_DELIVERED,
            ],
            'loggingData' => $LOGGING,
        ]);
    }
}
