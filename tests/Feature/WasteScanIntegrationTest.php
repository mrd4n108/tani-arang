<?php

namespace Tests\Feature;

use App\Models\WasteScan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WasteScanIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_scanner_and_community_map_pages_render_successfully(): void
    {
        $this->get('/scanner')->assertStatus(200);
        $this->get('/community-map')->assertStatus(200);
    }

    public function test_user_can_store_scan_log_and_redirect_to_community_map(): void
    {
        $payload = [
            'farmer_group_name' => 'Poktan Tani Subur Lamongan',
            'village_location' => 'Desa Karanggeneng',
            'regency' => 'Lamongan',
            'latitude' => -7.015432,
            'longitude' => 112.312456,
            'detected_waste_type' => 'Jerami Padi (Oryza sativa)',
            'moisture_condition' => 'Kering Siap Olah',
            'ai_confidence' => 94.5,
            'ai_summary_recommendation' => 'Meningkatkan kapasitas tukar kation dan daya simpan air tanah.',
            'ai_next_steps' => [
                'Kumpulkan jerami kering di lubang pembakaran.',
                'Bakar dengan oksigen terbatas hingga menjadi arang.',
                'Siram air hingga dingin dan campurkan dengan kompos.',
            ],
        ];

        $response = $this->post('/scanner/store', $payload);

        $response->assertRedirect('/community-map');
        $this->assertDatabaseHas('waste_scans', [
            'farmer_group_name' => 'Poktan Tani Subur Lamongan',
            'processing_status' => 'Belum diolah',
        ]);
    }

    public function test_store_scan_validates_coordinates_and_required_fields(): void
    {
        $response = $this->post('/scanner/store', [
            'farmer_group_name' => '',
            'latitude' => 195.0,
        ]);

        $response->assertSessionHasErrors([
            'farmer_group_name',
            'village_location',
            'latitude',
            'longitude',
        ]);
    }

    public function test_can_update_processing_status_and_soft_delete_or_restore_scan(): void
    {
        $scan = WasteScan::create([
            'farmer_group_name' => 'Poktan Kakao Mandiri',
            'village_location' => 'Desa Banggae',
            'regency' => 'Majene',
            'latitude' => -3.0954,
            'longitude' => 118.8872,
            'image_path' => '/demo/community-verified.webp',
            'detected_waste_type' => 'Kulit Buah Kakao',
            'moisture_condition' => 'Basah - Perlu Dijemur',
            'ai_confidence' => 91.0,
            'ai_summary_recommendation' => 'Kaya kalium alami untuk tanaman kakao.',
            'ai_next_steps' => ['Jemur 2 hari', 'Pirolisis drum', 'Tabur di piringan akar'],
            'processing_status' => 'Belum diolah',
        ]);

        $this->patch("/community-map/scans/{$scan->id}/status", [
            'processing_status' => 'Selesai',
        ])->assertRedirect();

        $this->assertDatabaseHas('waste_scans', [
            'id' => $scan->id,
            'processing_status' => 'Selesai',
        ]);

        $this->delete("/community-map/scans/{$scan->id}")->assertRedirect();
        $this->assertSoftDeleted('waste_scans', ['id' => $scan->id]);

        $this->post("/community-map/scans/{$scan->id}/restore")->assertRedirect();
        $this->assertDatabaseHas('waste_scans', [
            'id' => $scan->id,
            'deleted_at' => null,
        ]);
    }
}