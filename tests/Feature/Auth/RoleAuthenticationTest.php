<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RoleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_petani_can_authenticate_and_is_redirected_to_scanner(): void
    {
        $user = User::factory()->create([
            'name' => 'Pak Joko Petani',
            'email' => 'joko.petani@taniarang.id',
            'password' => Hash::make('password'),
            'role' => 'petani',
        ]);

        $response = $this->post('/login', [
            'email' => 'joko.petani@taniarang.id',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('scanner', absolute: false));
    }

    public function test_komunitas_can_authenticate_and_is_redirected_to_community_map(): void
    {
        $user = User::factory()->create([
            'name' => 'Bank Biomassa Lamongan',
            'email' => 'komunitas.lamongan@taniarang.id',
            'password' => Hash::make('password'),
            'role' => 'komunitas',
        ]);

        $response = $this->post('/login', [
            'email' => 'komunitas.lamongan@taniarang.id',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('community-map', absolute: false));
    }

    public function test_demo_account_petani_can_authenticate_with_default_password(): void
    {
        $demoUser = User::factory()->create([
            'name' => 'Demo Petani Biochar',
            'email' => 'petani@taniarang.id',
            'password' => Hash::make('password'),
            'role' => 'petani',
        ]);

        $response = $this->post('/login', [
            'email' => 'petani@taniarang.id',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($demoUser);
        $response->assertRedirect(route('scanner', absolute: false));
    }

    public function test_demo_account_komunitas_can_authenticate_with_default_password(): void
    {
        $demoUser = User::factory()->create([
            'name' => 'Demo Komunitas Pengolah',
            'email' => 'komunitas@taniarang.id',
            'password' => Hash::make('password'),
            'role' => 'komunitas',
        ]);

        $response = $this->post('/login', [
            'email' => 'komunitas@taniarang.id',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($demoUser);
        $response->assertRedirect(route('community-map', absolute: false));
    }

    public function test_authentication_fails_with_invalid_credentials_and_returns_session_errors(): void
    {
        User::factory()->create([
            'email' => 'petani@taniarang.id',
            'password' => Hash::make('password'),
            'role' => 'petani',
        ]);

        $response = $this->post('/login', [
            'email' => 'petani@taniarang.id',
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_authenticated_user_can_logout_and_redirects_to_home(): void
    {
        $user = User::factory()->create(['role' => 'petani']);

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    public function test_login_validation_requires_email_and_password(): void
    {
        $response = $this->post('/login', [
            'email' => '',
            'password' => '',
        ]);

        $response->assertSessionHasErrors(['email', 'password']);
        $this->assertGuest();
    }
}
