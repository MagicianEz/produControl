<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;

    protected $table = 'stock';

    protected $fillable = [
        'master_id',
        'quantity',
        'price'
    ];

    public function masterData()
    {
        return $this->belongsTo(MasterData::class, 'master_id', 'id');
    }

    public function selectedStockCategories()
    {
        return $this->hasMany(SelectedStockCategory::class);
    }

    public function sales()
    {
        return $this->hasMany(Sales::class, 'sales_id');
    }
}
