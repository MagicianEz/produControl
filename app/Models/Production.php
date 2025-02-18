<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Production extends Model
{
    use HasFactory;

    protected $table = 'production';

    protected $fillable = [
        'quantity',
        'master_id',
    ];

    public function masterData()
    {
        return $this->belongsTo(MasterData::class);
    }
}
