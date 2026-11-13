<?php

namespace Tests\Feature;

use App\Models\SubmissionNotification;
use App\Models\User;
use App\Models\WasteScan;
use App\Models\WasteSubmission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PetaniWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_petani_can_analyze_waste_photo_and_receive_biochar_guidance(): void
    {
        $petani = User::factory()->create(['role' => 'petani']);

        $response = $this->actingAs($petani)->postJson('/scanner/analyze', [
            'preset_key' => 'jerami_lamongan',
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('analysis.detected_waste_type', 'Jerami Padi (Oryza sativa)')
            ->assertJsonStructure([
                'status',
                'analysis' => [
                    'detected_waste_type',
                    'moisture_condition',
                    'ai_confidence',
                    'ai_summary_recommendation',
                    'ai_next_steps',
                    'recommended_regency',
                    'nutrient_highlights',
                ],
            ]);
    }

    public function test_petani_choosing_olah_sendiri_persists_to_waste_scans_without_community_notification(): void
    {
        $petani = User::factory()->create(['role' => 'petani']);
        $payload = [
            'farmer_group_name' => 'Poktan Tani Subur',
            'village_location' => 'Desa Sukodadi',
            'regency' => 'Lamongan',
            'latitude' => -7.1185,
            'longitude' => 112.3328,
            'detected_waste_type' => 'Jerami Padi (Oryza sativa)',
            'moisture_condition' => 'Kering Siap Olah',
            'ai_confidence' => 98.4,
            'ai_summary_recommendation' => 'Jerami padi kering siap olah Kon-Tiki.',
            'ai_next_steps' => ['Bakar top-lit', 'Siram air saat bara merah'],
            'destination_mode' => 'mandiri',
        ];

        $response = $this->actingAs($petani)->post('/scanner/store', $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('waste_scans', [
            'user_id' => $petani->id,
            'farmer_group_name' => 'Poktan Tani Subur',
            'destination_mode' => 'mandiri',
        ]);
        $this->assertDatabaseCount('waste_submissions', 0);
        $this->assertDatabaseCount('submission_notifications', 0);
    }

    public function test_petani_choosing_disetor_creates_waste_submission_and_notifies_community(): void
    {
        $petani = User::factory()->create(['role' => 'petani']);
        $komunitas = User::factory()->create([
            'role' => 'komunitas',
            'name' => 'Bank Biomassa Ngawi',
        ]);

        $payload = [
            'farmer_group_name' => 'Poktan Sumber Pangan',
            'village_location' => 'Desa Pangkur',
            'regency' => 'Ngawi',
            'latitude' => -7.4352,
            'longitude' => 111.5311,
            'detected_waste_type' => 'Sekam Padi (Rice Husk)',
            'moisture_condition' => 'Kering Siap Olah',
            'ai_confidence' => 97.9,
            'ai_summary_recommendation' => 'Sekam padi kering siap olah biochar.',
            'ai_next_steps' => ['Kemas sekam', 'Kirim ke bank biomassa'],
            'destination_mode' => 'komunitas',
            'community_id' => $komunitas->id,
            'estimated_weight_kg' => 420.0,
            'notes' => 'Siap diangkut 12 karung',
        ];

        $response = $this->actingAs($petani)->post('/scanner/store', $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('waste_scans', [
            'user_id' => $petani->id,
            'destination_mode' => 'komunitas',
        ]);
        $this->assertDatabaseHas('waste_submissions', [
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'status' => 'Menanti',
            'estimated_weight_kg' => 420.0,
            'notes' => 'Siap diangkut 12 karung',
        ]);
        $this->assertDatabaseHas('submission_notifications', [
            'user_id' => $komunitas->id,
            'is_read' => false,
        ]);
    }

    public function test_petani_can_query_personal_scan_and_submission_history(): void
    {
        $petani1 = User::factory()->create(['role' => 'petani']);
        $petani2 = User::factory()->create(['role' => 'petani']);
        $komunitas = User::factory()->create(['role' => 'komunitas']);

        $scan1 = WasteScan::create([
            'user_id' => $petani1->id,
            'farmer_group_name' => 'Poktan Petani 1',
            'village_location' => 'Desa A',
            'regency' => 'Lamongan',
            'latitude' => -7.1,
            'longitude' => 112.3,
            'detected_waste_type' => 'Jerami Padi',
            'moisture_condition' => 'Kering',
            'ai_confidence' => 95,
            'ai_summary_recommendation' => 'Rec 1',
            'ai_next_steps' => ['Step 1'],
            'destination_mode' => 'mandiri',
        ]);

        $scan2 = WasteScan::create([
            'user_id' => $petani2->id,
            'farmer_group_name' => 'Poktan Petani 2',
            'village_location' => 'Desa B',
            'regency' => 'Ngawi',
            'latitude' => -7.4,
            'longitude' => 111.5,
            'detected_waste_type' => 'Sekam Padi',
            'moisture_condition' => 'Kering',
            'ai_confidence' => 90,
            'ai_summary_recommendation' => 'Rec 2',
            'ai_next_steps' => ['Step 2'],
            'destination_mode' => 'mandiri',
        ]);

        $submission1 = WasteSubmission::create([
            'tracking_code' => 'STR-202611-PET01',
            'user_id' => $petani1->id,
            'community_id' => $komunitas->id,
            'waste_type' => 'Jerami Padi',
            'destination_mode' => 'komunitas',
            'status' => 'Menanti',
        ]);

        $submission2 = WasteSubmission::create([
            'tracking_code' => 'STR-202611-PET02',
            'user_id' => $petani2->id,
            'community_id' => $komunitas->id,
            'waste_type' => 'Sekam Padi',
            'destination_mode' => 'komunitas',
            'status' => 'Menanti',
        ]);

        $response = $this->actingAs($petani1)->get('/petani/history');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('scans', 1)
            ->where('scans.0.id', $scan1->id)
            ->has('submissions', 1)
            ->where('submissions.0.id', $submission1->id)
        );
    }

    public function test_store_scan_fails_validation_when_community_mode_lacks_community_id(): void
    {
        $petani = User::factory()->create(['role' => 'petani']);

        $response = $this->actingAs($petani)->post('/scanner/store', [
            'farmer_group_name' => 'Poktan Uji',
            'village_location' => 'Desa A',
            'regency' => 'Lamongan',
            'latitude' => -7.1,
            'longitude' => 112.3,
            'detected_waste_type' => 'Jerami Padi',
            'moisture_condition' => 'Kering',
            'ai_confidence' => 95,
            'ai_summary_recommendation' => 'Rec',
            'ai_next_steps' => ['Step 1'],
            'destination_mode' => 'komunitas',
        ]);

        $response->assertSessionHasErrors('community_id');
        $this->assertDatabaseCount('waste_submissions', 0);
    }

    public function test_store_scan_fails_validation_with_nonexistent_community_id(): void
    {
        $petani = User::factory()->create(['role' => 'petani']);

        $response = $this->actingAs($petani)->post('/scanner/store', [
            'farmer_group_name' => 'Poktan Uji',
            'village_location' => 'Desa A',
            'regency' => 'Lamongan',
            'latitude' => -7.1,
            'longitude' => 112.3,
            'detected_waste_type' => 'Jerami Padi',
            'moisture_condition' => 'Kering',
            'ai_confidence' => 95,
            'ai_summary_recommendation' => 'Rec',
            'ai_next_steps' => ['Step 1'],
            'destination_mode' => 'komunitas',
            'community_id' => 999999,
        ]);

        $response->assertSessionHasErrors('community_id');
    }

    public function test_store_scan_fails_validation_with_invalid_destination_mode(): void
    {
        $petani = User::factory()->create(['role' => 'petani']);

        $response = $this->actingAs($petani)->post('/scanner/store', [
            'farmer_group_name' => 'Poktan Uji',
            'village_location' => 'Desa A',
            'regency' => 'Lamongan',
            'latitude' => -7.1,
            'longitude' => 112.3,
            'detected_waste_type' => 'Jerami Padi',
            'moisture_condition' => 'Kering',
            'ai_confidence' => 95,
            'ai_summary_recommendation' => 'Rec',
            'ai_next_steps' => ['Step 1'],
            'destination_mode' => 'invalid_mode',
        ]);

        $response->assertSessionHasErrors('destination_mode');
    }
}
