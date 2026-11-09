<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WasteFact extends Model
{
    use HasFactory;

    protected $fillable = [
        'waste_name',
        'region_focus',
        'annual_volume_fact',
        'burning_hazard_fact',
        'biochar_benefit_fact',
        'processing_steps',
        'nutrient_facts',
    ];

    protected $casts = [
        'processing_steps' => 'array',
        'nutrient_facts' => 'array',
    ];
}