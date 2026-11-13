<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_access_scanner_page(): void
    {
        $response = $this->get('/scanner');

        $response->assertOk();
        $this->assertGuest();
    }

    public function test_guest_can_upload_photo_and_receive_instant_ai_analysis_and_guidelines(): void
    {
        $response = $this->postJson('/scanner/analyze', [
            'preset_key' => 'tongkol_malang',
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('analysis.detected_waste_type', 'Tongkol Jagung (Zea mays Cob)')
            ->assertJsonStructure([
                'status',
                'analysis' => [
                    'detected_waste_type',
                    'moisture_condition',
                    'ai_confidence',
                    'ai_summary_recommendation',
                    'ai_next_steps',
                    'nutrient_highlights',
                ],
            ]);

        $this->assertGuest();
    }

    public function test_guest_ai_analysis_leaves_database_completely_clean(): void
    {
        $this->postJson('/scanner/analyze', [
            'preset_key' => 'kakao_majene',
        ]);

        $this->assertDatabaseCount('waste_scans', 0);
        $this->assertDatabaseCount('waste_submissions', 0);
        $this->assertDatabaseCount('submission_notifications', 0);
    }

    public function test_guest_cannot_persist_scan_and_is_redirected_to_login(): void
    {
        $response = $this->post('/scanner/store', [
            'farmer_group_name' => 'Tamu Anonim',
            'village_location' => 'Desa A',
            'regency' => 'Lamongan',
            'latitude' => -7.1,
            'longitude' => 112.3,
            'detected_waste_type' => 'Jerami Padi',
            'moisture_condition' => 'Kering',
            'ai_confidence' => 95,
            'ai_summary_recommendation' => 'Rec',
            'ai_next_steps' => ['Step 1'],
            'destination_mode' => 'mandiri',
        ]);

        $response->assertRedirect('/login');
        $this->assertDatabaseCount('waste_scans', 0);
    }

    public function test_guest_cannot_submit_setoran_to_community_and_is_redirected_to_login(): void
    {
        $komunitas = User::factory()->create(['role' => 'komunitas']);

        $response = $this->post('/scanner/store', [
            'farmer_group_name' => 'Tamu Anonim',
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
            'community_id' => $komunitas->id,
            'estimated_weight_kg' => 100,
        ]);

        $response->assertRedirect('/login');
        $this->assertDatabaseCount('waste_submissions', 0);
        $this->assertDatabaseCount('submission_notifications', 0);
    }

    public function test_guest_cannot_access_protected_management_endpoints(): void
    {
        $this->get('/petani/history')->assertRedirect('/login');
        $this->patch('/community-map/submissions/1/status', ['status' => 'Diterima'])->assertRedirect('/login');
        $this->post('/community-map/submissions/1/verify', [])->assertRedirect('/login');
        $this->assertGuest();
    }
}
