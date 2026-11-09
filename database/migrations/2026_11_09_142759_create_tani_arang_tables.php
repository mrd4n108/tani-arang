<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('password');
                $table->string('role')->default('poktan_coordinator');
                $table->string('region')->default('Jawa Timur');
                $table->timestamps();
            });
        }

        Schema::create('waste_facts', function (Blueprint $table) {
            $table->id();
            $table->string('waste_name');
            $table->string('region_focus');
            $table->string('annual_volume_fact');
            $table->text('burning_hazard_fact');
            $table->text('biochar_benefit_fact');
            $table->json('processing_steps');
            $table->json('nutrient_facts');
            $table->timestamps();
        });

        Schema::create('waste_scans', function (Blueprint $table) {
            $table->id();
            $table->string('farmer_group_name');
            $table->string('village_location');
            $table->string('regency');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('image_path')->nullable();
            $table->string('detected_waste_type');
            $table->string('moisture_condition');
            $table->decimal('ai_confidence', 5, 2);
            $table->text('ai_summary_recommendation');
            $table->json('ai_next_steps');
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('organization');
            $table->string('region');
            $table->string('collaboration_type');
            $table->text('message');
            $table->string('status')->default('Terkirim - Menunggu Tindak Lanjut Hub');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('waste_scans');
        Schema::dropIfExists('waste_facts');
    }
};