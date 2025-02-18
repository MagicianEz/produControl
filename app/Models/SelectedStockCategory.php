<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SelectedStockCategory extends Model
{
    use HasFactory;

    protected $table = 'selected_stock_category';

    protected $fillable = [
        'stock_id',
        'category_id',
        'tag_id',
    ];

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function tag()
    {
        return $this->belongsTo(Tag::class);
    }
}
