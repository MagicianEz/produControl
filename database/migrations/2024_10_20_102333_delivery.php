<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $tableName = 'delivery';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create($this->tableName, function (Blueprint $table) {
            $table->id();
            $table->string('invoice', 100);
            $table->integer('quantity');
            $table->bigInteger('total_price');
            $table->unsignedBigInteger('master_id');
            $table->foreign('master_id')->references('id')->on('master_data')->onUpdate('cascade')->onDelete('cascade');
            $table->enum('status_pengiriman', ['on hold', 'on progress', 'on delivery', 'delivered'])->default('on progress');
            $table->timestamps();
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
