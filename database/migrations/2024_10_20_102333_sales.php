<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $tableName = 'sales';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create($this->tableName, function (Blueprint $table) {
            $table->id();
            $table->string('invoice', 100);
            $table->string('customer_name', 50);
            $table->bigInteger('sub_total');
            $table->bigInteger('vat');
            $table->bigInteger('discount');
            $table->bigInteger('grand_total');
            $table->enum('delivery_status', ['In Progress', 'On Hold', 'In Delivery', 'Delivered'])->default('In Progress'); // Tambahan ENUM
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
