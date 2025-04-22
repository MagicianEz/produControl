<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $tableName = 'sales_detail';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create($this->tableName, function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('stock_id');
            $table->unsignedBigInteger('sales_id');
            $table->integer('quantity');
            $table->bigInteger('price');
            $table->timestamps();
            $table->foreign(columns: 'stock_id')->references('id')->on('stock')->onUpdate('cascade')->onDelete('cascade');
            $table->foreign('sales_id')->references('id')->on('sales')->onUpdate('cascade')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists($this->tableName);
    }
};
