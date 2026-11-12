<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('waste_scans', function (Blueprint $table) {
            if (!Schema::hasColumn('waste_scans', 'processing_status')) {
                $table->string('processing_status', 40)
                    ->default('Belum diolah')
                    ->after('ai_next_steps');
            }

            if (!Schema::hasColumn('waste_scans', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('waste_scans', function (Blueprint $table) {
            if (Schema::hasColumn('waste_scans', 'processing_status')) {
                $table->dropColumn('processing_status');
            }

            if (Schema::hasColumn('waste_scans', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};