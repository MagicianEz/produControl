<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesDetail extends Model
{
    use HasFactory;

    protected $table = 'sales_detail';

    protected $fillable = [
        'stock_id',
        'sales_id',
        'quantity',
        'price',
    ];

    public function stock()
    {
        return $this->belongsTo(Stock::class, 'stock_id');
    }

    public function sales()
    {
        return $this->belongsTo(Sales::class, 'sales_id');
    }
}
