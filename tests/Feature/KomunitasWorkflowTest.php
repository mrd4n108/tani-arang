<?php

namespace Tests\Feature;

use App\Models\SubmissionNotification;
use App\Models\User;
use App\Models\WasteSubmission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KomunitasWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_komunitas_views_incoming_submissions_scoped_to_own_community(): void
    {
        $komunitasA = User::factory()->create(['role' => 'komunitas', 'name' => 'Komunitas A']);
        $komunitasB = User::factory()->create(['role' => 'komunitas', 'name' => 'Komunitas B']);
        $petani = User::factory()->create(['role' => 'petani']);

        $submissionA = WasteSubmission::create([
            'tracking_code' => 'STR-202611-KOM01',
            'user_id' => $petani->id,
            'community_id' => $komunitasA->id,
            'waste_type' => 'Jerami Padi',
            'status' => 'Menanti',
            'notes' => 'Sub A',
        ]);
        $submissionB = WasteSubmission::create([
            'tracking_code' => 'STR-202611-KOM02',
            'user_id' => $petani->id,
            'community_id' => $komunitasB->id,
            'waste_type' => 'Sekam Padi',
            'status' => 'Menanti',
            'notes' => 'Sub B',
        ]);

        $response = $this->actingAs($komunitasA)->get('/community-map');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('submissions', 1)
            ->where('submissions.0.id', $submissionA->id)
            ->where('submissions.0.notes', 'Sub A')
        );
    }

    public function test_unread_notification_count_badge_reflects_pending_submissions(): void
    {
        $komunitas = User::factory()->create(['role' => 'komunitas']);
        $petani = User::factory()->create(['role' => 'petani']);

        $sub1 = WasteSubmission::create([
            'tracking_code' => 'STR-202611-KOM03',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'waste_type' => 'Jerami Padi',
            'status' => 'Menanti',
        ]);
        $sub2 = WasteSubmission::create([
            'tracking_code' => 'STR-202611-KOM04',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'waste_type' => 'Sekam Padi',
            'status' => 'Menanti',
        ]);

        SubmissionNotification::create([
            'user_id' => $komunitas->id,
            'submission_id' => $sub1->id,
            'type' => 'new_submission',
            'title' => 'Sub 1',
            'message' => 'Limbah jerami masuk',
            'is_read' => false,
        ]);
        SubmissionNotification::create([
            'user_id' => $komunitas->id,
            'submission_id' => $sub2->id,
            'type' => 'new_submission',
            'title' => 'Sub 2',
            'message' => 'Limbah sekam masuk',
            'is_read' => false,
        ]);

        $response = $this->actingAs($komunitas)->get('/community-map');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('unread_notifications_count', 2)
        );
    }

    public function test_komunitas_can_transition_submission_through_4_stage_lifecycle(): void
    {
        $komunitas = User::factory()->create(['role' => 'komunitas']);
        $petani = User::factory()->create(['role' => 'petani']);
        $submission = WasteSubmission::create([
            'tracking_code' => 'STR-202611-KOM05',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'waste_type' => 'Jerami Padi',
            'status' => 'Menanti',
        ]);

        // 1. Menanti -> Diterima
        $this->actingAs($komunitas)
            ->patch("/community-map/submissions/{$submission->id}/status", ['status' => 'Diterima'])
            ->assertRedirect();
        $this->assertDatabaseHas('waste_submissions', ['id' => $submission->id, 'status' => 'Diterima']);

        // 2. Diterima -> Sedang Diolah
        $this->actingAs($komunitas)
            ->patch("/community-map/submissions/{$submission->id}/status", ['status' => 'Sedang Diolah'])
            ->assertRedirect();
        $this->assertDatabaseHas('waste_submissions', ['id' => $submission->id, 'status' => 'Sedang Diolah']);

        // 3. Sedang Diolah -> Selesai
        $this->actingAs($komunitas)
            ->patch("/community-map/submissions/{$submission->id}/status", ['status' => 'Selesai'])
            ->assertRedirect();
        $this->assertDatabaseHas('waste_submissions', ['id' => $submission->id, 'status' => 'Selesai']);
    }

    public function test_komunitas_can_upload_reverification_photo_and_inspection_notes(): void
    {
        Storage::fake('public');
        $komunitas = User::factory()->create(['role' => 'komunitas']);
        $petani = User::factory()->create(['role' => 'petani']);
        $submission = WasteSubmission::create([
            'tracking_code' => 'STR-202611-KOM06',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'waste_type' => 'Jerami Padi',
            'status' => 'Diterima',
        ]);
        $photo = UploadedFile::fake()->create('verifikasi_kadar_air.jpg', 100, 'image/jpeg');

        $response = $this->actingAs($komunitas)->post("/community-map/submissions/{$submission->id}/verify", [
            'verification_photo' => $photo,
            'verification_notes' => 'Kadar air aktual 14%, biomassa kering optimal.',
        ]);

        $response->assertRedirect();
        $fresh = $submission->fresh();
        $this->assertNotNull($fresh->verification_photo_path);
        $this->assertEquals('Kadar air aktual 14%, biomassa kering optimal.', $fresh->verification_notes);
        $this->assertNotNull($fresh->verified_at);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $fresh->verification_photo_path));
    }

    public function test_komunitas_can_filter_submissions_by_status_and_date_range(): void
    {
        $komunitas = User::factory()->create(['role' => 'komunitas']);
        $petani = User::factory()->create(['role' => 'petani']);
        $sub1 = WasteSubmission::create([
            'tracking_code' => 'STR-202611-KOM07',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'waste_type' => 'Jerami Padi',
            'status' => 'Menanti',
            'created_at' => now()->subDays(5),
        ]);
        $sub2 = WasteSubmission::create([
            'tracking_code' => 'STR-202611-KOM08',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'waste_type' => 'Sekam Padi',
            'status' => 'Selesai',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($komunitas)->get('/community-map?status=Selesai');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('submissions', 1)
            ->where('submissions.0.id', $sub2->id)
        );
    }

    public function test_komunitas_cannot_mutate_another_community_submission_status(): void
    {
        $komunitasA = User::factory()->create(['role' => 'komunitas']);
        $komunitasB = User::factory()->create(['role' => 'komunitas']);
        $petani = User::factory()->create(['role' => 'petani']);
        $submissionB = WasteSubmission::create([
            'tracking_code' => 'STR-202611-KOM09',
            'user_id' => $petani->id,
            'community_id' => $komunitasB->id,
            'waste_type' => 'Jerami Padi',
            'status' => 'Menanti',
        ]);

        $response = $this->actingAs($komunitasA)->patch("/community-map/submissions/{$submissionB->id}/status", [
            'status' => 'Diterima',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('waste_submissions', [
            'id' => $submissionB->id,
            'status' => 'Menanti',
        ]);
    }

    public function test_komunitas_cannot_upload_verification_for_another_community_submission(): void
    {
        $komunitasA = User::factory()->create(['role' => 'komunitas']);
        $komunitasB = User::factory()->create(['role' => 'komunitas']);
        $petani = User::factory()->create(['role' => 'petani']);
        $submissionB = WasteSubmission::create([
            'tracking_code' => 'STR-202611-KOM10',
            'user_id' => $petani->id,
            'community_id' => $komunitasB->id,
            'waste_type' => 'Jerami Padi',
            'status' => 'Menanti',
        ]);

        $response = $this->actingAs($komunitasA)->post("/community-map/submissions/{$submissionB->id}/verify", [
            'verification_notes' => 'Infiltrasi ilegal',
        ]);

        $response->assertForbidden();
    }

    public function test_submission_status_update_fails_with_invalid_status_enum(): void
    {
        $komunitas = User::factory()->create(['role' => 'komunitas']);
        $petani = User::factory()->create(['role' => 'petani']);
        $submission = WasteSubmission::create([
            'tracking_code' => 'STR-202611-KOM11',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'waste_type' => 'Jerami Padi',
            'status' => 'Menanti',
        ]);

        $response = $this->actingAs($komunitas)->patch("/community-map/submissions/{$submission->id}/status", [
            'status' => 'StatusTidakValid',
        ]);

        $response->assertSessionHasErrors('status');
    }
}
