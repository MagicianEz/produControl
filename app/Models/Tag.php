<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    protected $table = 'tag';

    protected $fillable = [
        'name',
        'category_id',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function selectedStockCategories()
    {
        return $this->hasMany(SelectedStockCategory::class);
    }

    public function selectedProductionCategories()
    {
        return $this->hasMany(SelectedProductionCategory::class);
    }
}
