<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class WasteSubmission extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tracking_code',
        'user_id',
        'community_id',
        'scan_id',
        'waste_type',
        'estimated_weight_kg',
        'moisture_condition',
        'destination_mode',
        'status',
        'notes',
        'photo_path',
        'verification_photo_path',
        'verification_notes',
        'verified_at',
    ];

    protected $casts = [
        'estimated_weight_kg' => 'float',
        'verified_at' => 'datetime',
    ];

    /**
     * The farmer who submitted this waste.
     */
    public function farmer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Alias for farmer relationship (owner of the submission).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * The community center receiving this waste.
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(User::class, 'community_id');
    }

    /**
     * The linked waste scan if initiated from a scan.
     */
    public function scan(): BelongsTo
    {
        return $this->belongsTo(WasteScan::class, 'scan_id');
    }

    /**
     * Notifications related to this submission.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(SubmissionNotification::class, 'submission_id');
    }
}
