<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class WasteScan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
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
        'destination_mode',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'ai_confidence' => 'float',
        'ai_next_steps' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function submission(): HasOne
    {
        return $this->hasOne(WasteSubmission::class, 'scan_id');
    }
}
