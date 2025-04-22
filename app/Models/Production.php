<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Production extends Model
{
    use HasFactory;

    protected $table = 'production';

    protected $fillable = [
        'master_id',
        'quantity'
    ];

    public function masterData()
    {
        return $this->belongsTo(MasterData::class, 'master_id');
    }

    public function selectedProductionCategories()
    {
        return $this->hasMany(SelectedProductionCategory::class);
    }
}
