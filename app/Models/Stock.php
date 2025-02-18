<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;

    protected $table = 'stock';

    protected $fillable = [
        'quantity',
        'price',
        'master_id',
    ];

    public function masterData()
    {
        return $this->belongsTo(MasterData::class);
    }

    public function selectedStockCategories()
    {
        return $this->hasMany(SelectedStockCategory::class);
    }
}
