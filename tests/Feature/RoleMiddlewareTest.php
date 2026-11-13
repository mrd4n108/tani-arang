<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WasteSubmission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_petani_user_accessing_komunitas_status_update_is_forbidden(): void
    {
        $petani = User::factory()->create(['role' => 'petani']);
        $komunitas = User::factory()->create(['role' => 'komunitas']);
        $submission = WasteSubmission::create([
            'tracking_code' => 'STR-202611-MID01',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'waste_type' => 'Jerami Padi',
            'status' => 'Menanti',
        ]);

        $response = $this->actingAs($petani)->patch("/community-map/submissions/{$submission->id}/status", [
            'status' => 'Diterima',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('waste_submissions', [
            'id' => $submission->id,
            'status' => 'Menanti',
        ]);
    }

    public function test_petani_user_accessing_komunitas_verification_upload_is_forbidden(): void
    {
        $petani = User::factory()->create(['role' => 'petani']);
        $komunitas = User::factory()->create(['role' => 'komunitas']);
        $submission = WasteSubmission::create([
            'tracking_code' => 'STR-202611-MID02',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'waste_type' => 'Jerami Padi',
            'status' => 'Menanti',
        ]);

        $response = $this->actingAs($petani)->post("/community-map/submissions/{$submission->id}/verify", [
            'verification_notes' => 'Catatan verifikasi tidak sah dari petani',
        ]);

        $response->assertForbidden();
    }

    public function test_komunitas_user_accessing_petani_history_is_forbidden(): void
    {
        $komunitas = User::factory()->create(['role' => 'komunitas']);

        $response = $this->actingAs($komunitas)->get('/petani/history');

        $response->assertForbidden();
    }

    public function test_unauthenticated_guest_accessing_petani_history_redirects_to_login(): void
    {
        $response = $this->get('/petani/history');

        $response->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_unauthenticated_guest_accessing_komunitas_status_update_redirects_to_login(): void
    {
        $response = $this->patch('/community-map/submissions/1/status', [
            'status' => 'Diterima',
        ]);

        $response->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_unauthenticated_guest_accessing_komunitas_verify_redirects_to_login(): void
    {
        $response = $this->post('/community-map/submissions/1/verify', []);

        $response->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_role_middleware_blocks_user_with_unrecognized_role(): void
    {
        $user = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($user)->get('/petani/history');

        $response->assertForbidden();
    }
}
