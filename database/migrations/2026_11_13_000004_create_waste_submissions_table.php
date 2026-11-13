<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('waste_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_code')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('community_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('scan_id')->nullable()->constrained('waste_scans')->nullOnDelete();
            $table->string('waste_type');
            $table->decimal('estimated_weight_kg', 8, 2)->nullable();
            $table->string('moisture_condition')->nullable();
            $table->string('destination_mode')->default('komunitas');
            $table->string('status')->default('Menanti'); // 'Menanti', 'Diterima', 'Sedang Diolah', 'Selesai'
            $table->text('notes')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('verification_photo_path')->nullable();
            $table->text('verification_notes')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waste_submissions');
    }
};
