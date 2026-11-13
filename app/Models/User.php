<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'region', 'community_address', 'phone'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user is a Petani.
     */
    public function isPetani(): bool
    {
        return $this->role === 'petani';
    }

    /**
     * Check if user is a Komunitas.
     */
    public function isKomunitas(): bool
    {
        return $this->role === 'komunitas';
    }

    /**
     * Check if user has specific role or one of given roles.
     *
     * @param string|array<string> $role
     */
    public function hasRole(string|array $role): bool
    {
        if (is_array($role)) {
            return in_array($this->role, $role, true);
        }

        return $this->role === $role;
    }

    /**
     * Waste submissions created by this user (as farmer).
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(WasteSubmission::class, 'user_id');
    }

    /**
     * Waste submissions received by this user (as community center).
     */
    public function receivedSubmissions(): HasMany
    {
        return $this->hasMany(WasteSubmission::class, 'community_id');
    }

    /**
     * Waste scans logged by this user.
     */
    public function scans(): HasMany
    {
        return $this->hasMany(WasteScan::class, 'user_id');
    }

    /**
     * Notifications received by this user.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(SubmissionNotification::class, 'user_id');
    }

    /**
     * Count unread notifications.
     */
    public function unreadNotificationsCount(): int
    {
        return $this->notifications()->where('is_read', false)->count();
    }
}
