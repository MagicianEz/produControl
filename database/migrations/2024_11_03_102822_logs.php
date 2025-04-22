<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public $tableName = 'logs';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create($this->tableName, function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger(column: 'user_id');
            $table->enum('action', ['tambah', 'edit', 'hapus', 'move', 'merge', 'retur']);
            $table->enum('category', ['production', 'stock', 'sales']);
            $table->string('sku');
            $table->text('keterangan')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('user')->onUpdate('cascade')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('your_table_name');
    }
};
