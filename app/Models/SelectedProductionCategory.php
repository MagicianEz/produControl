<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SelectedProductionCategory extends Model
{
    use HasFactory;

    protected $table = 'selected_production_category';

    protected $fillable = [
        'production_id',
        'tag_id'
    ];

    public function production()
    {
        return $this->belongsTo(Production::class);
    }

    public function tag()
    {
        return $this->belongsTo(Tag::class);
    }
}
