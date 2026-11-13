<?php

namespace Tests\Feature;

use App\Models\SubmissionNotification;
use App\Models\User;
use App\Models\WasteScan;
use App\Models\WasteSubmission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RoleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Register temporary test routes protected by role middleware
        Route::middleware(['web', 'auth', 'role:petani'])->get('/test/petani-only', function () {
            return response()->json(['message' => 'Halo Petani']);
        });

        Route::middleware(['web', 'auth', 'role:komunitas'])->get('/test/komunitas-only', function () {
            return response()->json(['message' => 'Halo Komunitas']);
        });

        Route::middleware(['web', 'auth', 'role:petani,komunitas'])->get('/test/multi-role', function () {
            return response()->json(['message' => 'Halo Multi']);
        });
    }

    public function test_unauthenticated_user_accessing_role_route_is_rejected(): void
    {
        $response = $this->get('/test/petani-only');
        $response->assertRedirect('/login');
    }

    public function test_petani_can_access_petani_route_but_forbidden_on_komunitas_route(): void
    {
        $petani = User::factory()->create([
            'role' => 'petani',
            'region' => 'Lamongan',
        ]);

        $this->actingAs($petani)
            ->get('/test/petani-only')
            ->assertOk()
            ->assertJson(['message' => 'Halo Petani']);

        $this->actingAs($petani)
            ->get('/test/komunitas-only')
            ->assertForbidden();
    }

    public function test_komunitas_can_access_komunitas_route_but_forbidden_on_petani_route(): void
    {
        $komunitas = User::factory()->create([
            'role' => 'komunitas',
            'region' => 'Lamongan',
            'community_address' => 'Jl. Pertanian No. 12',
        ]);

        $this->actingAs($komunitas)
            ->get('/test/komunitas-only')
            ->assertOk()
            ->assertJson(['message' => 'Halo Komunitas']);

        $this->actingAs($komunitas)
            ->get('/test/petani-only')
            ->assertForbidden();
    }

    public function test_multi_role_middleware_allows_both_roles(): void
    {
        $petani = User::factory()->create(['role' => 'petani']);
        $komunitas = User::factory()->create(['role' => 'komunitas']);
        $other = User::factory()->create(['role' => 'guest_role']);

        $this->actingAs($petani)->get('/test/multi-role')->assertOk();
        $this->actingAs($komunitas)->get('/test/multi-role')->assertOk();
        $this->actingAs($other)->get('/test/multi-role')->assertForbidden();
    }

    public function test_petani_login_redirects_to_scanner(): void
    {
        $petani = User::factory()->create([
            'email' => 'petani-test@taniarang.id',
            'role' => 'petani',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->post('/login', [
            'email' => 'petani-test@taniarang.id',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($petani);
        $response->assertRedirect(route('scanner'));
    }

    public function test_komunitas_login_redirects_to_community_map(): void
    {
        $komunitas = User::factory()->create([
            'email' => 'komunitas-test@taniarang.id',
            'role' => 'komunitas',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->post('/login', [
            'email' => 'komunitas-test@taniarang.id',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($komunitas);
        $response->assertRedirect(route('community-map'));
    }

    public function test_user_model_helpers_and_relationships(): void
    {
        $petani = User::factory()->create([
            'role' => 'petani',
            'phone' => '081234567890',
        ]);

        $komunitas = User::factory()->create([
            'role' => 'komunitas',
            'community_address' => 'Jl. Biochar No. 1',
        ]);

        $this->assertTrue($petani->isPetani());
        $this->assertFalse($petani->isKomunitas());
        $this->assertTrue($petani->hasRole('petani'));
        $this->assertTrue($petani->hasRole(['petani', 'komunitas']));
        $this->assertFalse($petani->hasRole('komunitas'));

        $this->assertTrue($komunitas->isKomunitas());
        $this->assertFalse($komunitas->isPetani());

        // Create scan
        $scan = WasteScan::create([
            'user_id' => $petani->id,
            'farmer_group_name' => 'Poktan Binaan',
            'village_location' => 'Desa Sukodadi',
            'regency' => 'Lamongan',
            'latitude' => -7.1185,
            'longitude' => 112.3328,
            'detected_waste_type' => 'Jerami Padi',
            'moisture_condition' => 'Kering',
            'ai_confidence' => 95.0,
            'ai_summary_recommendation' => 'Uji Kon-Tiki',
            'ai_next_steps' => ['Langkah 1'],
            'destination_mode' => 'komunitas',
        ]);

        $this->assertEquals($petani->id, $scan->user->id);
        $this->assertCount(1, $petani->scans);

        // Create submission
        $submission = WasteSubmission::create([
            'tracking_code' => 'STR-TEST-001',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'scan_id' => $scan->id,
            'waste_type' => 'Jerami Padi',
            'estimated_weight_kg' => 100.5,
            'moisture_condition' => 'Kering',
            'destination_mode' => 'komunitas',
            'status' => 'Menanti',
        ]);

        $this->assertEquals($petani->id, $submission->farmer->id);
        $this->assertEquals($komunitas->id, $submission->community->id);
        $this->assertEquals($scan->id, $submission->scan->id);

        $this->assertCount(1, $petani->submissions);
        $this->assertCount(1, $komunitas->receivedSubmissions);

        // Notifications
        $notif1 = SubmissionNotification::create([
            'user_id' => $komunitas->id,
            'submission_id' => $submission->id,
            'type' => 'new_submission',
            'title' => 'Setoran Baru',
            'message' => 'Limbah siap diverifikasi',
            'is_read' => false,
        ]);

        $notif2 = SubmissionNotification::create([
            'user_id' => $komunitas->id,
            'submission_id' => $submission->id,
            'type' => 'status_updated',
            'title' => 'Update Status',
            'message' => 'Status berubah',
            'is_read' => true,
        ]);

        $this->assertEquals(1, $komunitas->unreadNotificationsCount());
        $this->assertCount(2, $komunitas->notifications);
        $this->assertEquals($submission->id, $notif1->submission->id);
    }
}
