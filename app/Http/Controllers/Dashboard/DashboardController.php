<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MasterData;
use App\Models\User;
use App\Models\Production;
use App\Models\Stock;
use App\Models\Sales;
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
        $CATEGORY = Category::count();
        $TAGS_PRODUCTION = Tag::where('type', '=', 'production')->count();
        $TAGS_STOCK = Tag::where('type', '=', 'stock')->count();
        $MASTER_DATA = MasterData::count();
        $PRODUCTION = Production::count();
        $STOCK = Stock::count();
        $DELIVERY = Sales::count();
        $DELIVERY_PROGRESS = Sales::where('delivery_status', 'in progress')->count();
        $DELIVERY_HOLD = Sales::where('delivery_status', 'on hold')->count();
        $DELIVERY_DELIVERY = Sales::where('delivery_status', 'in delivery')->count();
        $DELIVERY_DELIVERED = Sales::where('delivery_status', 'delivered')->count();
        $LOGGING = DB::table('logs')
            ->join('user', 'logs.user_id', '=', 'user.id')
            ->select([
                'user.id as user_id',
                'user.name as user_name',
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
                'category' => $CATEGORY,
                'tagsProduction' => $TAGS_PRODUCTION,
                'tagsStock' => $TAGS_STOCK,
                'master_data' => $MASTER_DATA,
                'production' => $PRODUCTION,
                'stock' => $STOCK,
                'delivery' => $DELIVERY,
                'delivery_progress' => $DELIVERY_PROGRESS,
                'delivery_hold' => $DELIVERY_HOLD,
                'delivery_delivery' => $DELIVERY_DELIVERY,
                'delivery_delivered' => $DELIVERY_DELIVERED,
            ],
            'loggingData' => $LOGGING,
        ]);
    }
}
