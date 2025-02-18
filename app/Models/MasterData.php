<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterData extends Model
{
    use HasFactory;

    protected $table = 'master_data';

    protected $fillable = [
        'product_name',
        'sku',
    ];

    public function deliveries()
    {
        return $this->hasMany(Delivery::class);
    }

    public function productions()
    {
        return $this->hasMany(Production::class);
    }

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }
}
