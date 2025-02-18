<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    protected $table = 'delivery';

    protected $fillable = [
        'invoice',
        'quantity',
        'total_price',
        'master_id',
        'status_pengiriman',
    ];

    public function masterData()
    {
        return $this->belongsTo(MasterData::class);
    }
}
