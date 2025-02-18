<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'category';

    protected $fillable = [
        'name',
        'type',
    ];


    public function tags()
    {
        return $this->hasMany(Tag::class);
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
