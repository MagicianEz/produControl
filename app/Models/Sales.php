<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sales extends Model
{
    use HasFactory;

    protected $table = 'sales';

    protected $fillable = [
        'invoice',
        'customer_name',
        'sub_total',
        'vat',
        'discount',
        'grand_total',
        'delivery_status'
    ];

    public function salesDetails()
    {
        return $this->hasMany(SalesDetail::class, 'sales_id');
    }
}
