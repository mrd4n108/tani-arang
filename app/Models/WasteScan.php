<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WasteScan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'farmer_group_name',
        'village_location',
        'regency',
        'latitude',
        'longitude',
        'image_path',
        'detected_waste_type',
        'moisture_condition',
        'ai_confidence',
        'ai_summary_recommendation',
        'ai_next_steps',
        'processing_status',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'ai_confidence' => 'float',
        'ai_next_steps' => 'array',
    ];
}