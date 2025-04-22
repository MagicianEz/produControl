<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterData extends Model
{
    use HasFactory;

    protected $table = 'master_data';

    protected $fillable = [
        'category_id',
        'product_name',
        'sku',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function productions()
    {
        return $this->hasMany(Production::class);
    }

    public function stocks()
    {
        return $this->hasMany(Stock::class, 'master_id', 'id');
    }


    public function salesDetails()
    {
        return $this->hasMany(SalesDetail::class, 'sales_id');
    }
}
