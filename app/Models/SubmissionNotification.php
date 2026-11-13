<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'submission_id',
        'type',
        'title',
        'message',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    /**
     * The recipient user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * The associated waste submission.
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(WasteSubmission::class, 'submission_id');
    }
}
