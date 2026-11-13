<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Models\SubmissionNotification;
use App\Models\User;
use App\Models\WasteFact;
use App\Models\WasteScan;
use App\Models\WasteSubmission;
use App\Services\WasteVisionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TaniArangController extends Controller
{
    public function dashboard()
    {
        $scans = WasteScan::latest()->get();

        $regionalComparison = [
            ['region' => 'Lamongan (Jatim)', 'timbulan_ribu_ton' => 840, 'biochar_terolah_ribu_ton' => 310, 'cluster' => 'Jawa Timur'],
            ['region' => 'Ngawi (Jatim)', 'timbulan_ribu_ton' => 790, 'biochar_terolah_ribu_ton' => 295, 'cluster' => 'Jawa Timur'],
            ['region' => 'Malang (Jatim)', 'timbulan_ribu_ton' => 620, 'biochar_terolah_ribu_ton' => 240, 'cluster' => 'Jawa Timur'],
            ['region' => 'Majene (Sulbar)', 'timbulan_ribu_ton' => 195, 'biochar_terolah_ribu_ton' => 115, 'cluster' => 'Sulawesi Barat'],
            ['region' => 'Polman (Sulbar)', 'timbulan_ribu_ton' => 310, 'biochar_terolah_ribu_ton' => 178, 'cluster' => 'Sulawesi Barat'],
        ];

        $distribution = [
            ['name' => 'Jerami Padi', 'value' => max(1, $scans->where('detected_waste_type', 'Jerami Padi (Oryza sativa)')->count()), 'color' => '#10B981'],
            ['name' => 'Kulit Kakao', 'value' => max(1, $scans->where('detected_waste_type', 'Kulit Buah Kakao (Theobroma cacao Pod Husk)')->count()), 'color' => '#F59E0B'],
            ['name' => 'Tongkol Jagung', 'value' => max(1, $scans->where('detected_waste_type', 'Tongkol Jagung (Zea mays Cob)')->count()), 'color' => '#06B6D4'],
            ['name' => 'Sekam Padi', 'value' => max(1, $scans->where('detected_waste_type', 'Sekam Padi (Rice Husk)')->count()), 'color' => '#34D399'],
        ];

        $monthlyTrend = [
            ['bulan' => 'Jun', 'pembakaran_terbuka_ha' => 420, 'konversi_biochar_ha' => 95],
            ['bulan' => 'Jul', 'pembakaran_terbuka_ha' => 365, 'konversi_biochar_ha' => 160],
            ['bulan' => 'Agu', 'pembakaran_terbuka_ha' => 290, 'konversi_biochar_ha' => 245],
            ['bulan' => 'Sep', 'pembakaran_terbuka_ha' => 210, 'konversi_biochar_ha' => 340],
            ['bulan' => 'Okt', 'pembakaran_terbuka_ha' => 135, 'konversi_biochar_ha' => 465],
            ['bulan' => 'Nov', 'pembakaran_terbuka_ha' => 75, 'konversi_biochar_ha' => 590],
        ];

        return Inertia::render('Dashboard', [
            'totalScansCount' => $scans->count(),
            'recentScans' => $scans->take(4),
            'regionalComparison' => $regionalComparison,
            'wasteDistribution' => $distribution,
            'monthlyTrend' => $monthlyTrend,
        ]);
    }

    public function facts()
    {
        return Inertia::render('Facts', [
            'wasteFacts' => WasteFact::all(),
        ]);
    }

    public function scanner(WasteVisionService $visionService)
    {
        $userId = auth()->id();
        $scans = $userId ? WasteScan::where('user_id', $userId)->latest()->get() : collect();
        $submissions = $userId ? WasteSubmission::where('user_id', $userId)->with('community')->latest()->get() : collect();
        $communities = User::where('role', 'komunitas')->select('id', 'name', 'region', 'community_address', 'phone')->get();

        return Inertia::render('Scanner', [
            'presets' => $visionService->getDeterministicPresets(),
            'recentScansCount' => WasteScan::count(),
            'scans' => $scans,
            'submissions' => $submissions,
            'communities' => $communities,
        ]);
    }

    public function petaniHistory(WasteVisionService $visionService)
    {
        $userId = auth()->id();
        $scans = WasteScan::where('user_id', $userId)->latest()->get();
        $submissions = WasteSubmission::where('user_id', $userId)->with('community')->latest()->get();
        $communities = User::where('role', 'komunitas')->select('id', 'name', 'region', 'community_address', 'phone')->get();

        return Inertia::render('Scanner', [
            'presets' => $visionService->getDeterministicPresets(),
            'recentScansCount' => WasteScan::count(),
            'scans' => $scans,
            'submissions' => $submissions,
            'communities' => $communities,
        ]);
    }

    public function analyzeScan(Request $request, WasteVisionService $visionService)
    {
        $request->validate([
            'image_base64' => 'nullable|string',
            'preset_key' => 'nullable|string',
        ]);

        $result = $visionService->analyzeBiomass(
            $request->input('image_base64'),
            $request->input('preset_key')
        );

        return response()->json([
            'status' => 'success',
            'analysis' => $result,
        ]);
    }

    public function storeScan(Request $request)
    {
        if (! auth()->check()) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'farmer_group_name' => 'required|string|max:140',
            'village_location' => 'required|string|max:160',
            'regency' => 'required|string|max:80',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'image_base64' => 'nullable|string',
            'detected_waste_type' => 'required|string|max:160',
            'moisture_condition' => 'required|string|max:120',
            'ai_confidence' => 'required|numeric|min:0|max:100',
            'ai_summary_recommendation' => 'required|string',
            'ai_next_steps' => 'required|array|min:1',
            'processing_status' => 'nullable|in:Belum diolah,Diproses,Selesai',
            'destination_mode' => 'nullable|in:mandiri,komunitas',
            'community_id' => [
                'nullable',
                'required_if:destination_mode,komunitas',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->where('role', 'komunitas');
                }),
            ],
            'estimated_weight_kg' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $imagePath = '/demo/community-verified.webp';

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('scans', 'public');
            $imagePath = '/storage/' . $path;
        } elseif (!empty($validated['image_base64']) && preg_match('/^data:image\/(\w+);base64,/', $validated['image_base64'], $matches)) {
            $extension = strtolower($matches[1]) === 'jpeg' ? 'jpg' : strtolower($matches[1]);
            $rawData = substr($validated['image_base64'], strpos($validated['image_base64'], ',') + 1);
            $decoded = base64_decode($rawData, true);

            if ($decoded !== false) {
                $filename = 'scans/' . now()->format('Ymd_His') . '_' . Str::random(8) . '.' . $extension;
                Storage::disk('public')->put($filename, $decoded);
                $imagePath = '/storage/' . $filename;
            }
        }

        $destinationMode = $validated['destination_mode'] ?? 'mandiri';

        $scan = WasteScan::create([
            'user_id' => auth()->id(),
            'farmer_group_name' => $validated['farmer_group_name'],
            'village_location' => $validated['village_location'],
            'regency' => $validated['regency'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'image_path' => $imagePath,
            'detected_waste_type' => $validated['detected_waste_type'],
            'moisture_condition' => $validated['moisture_condition'],
            'ai_confidence' => $validated['ai_confidence'],
            'ai_summary_recommendation' => $validated['ai_summary_recommendation'],
            'ai_next_steps' => $validated['ai_next_steps'],
            'processing_status' => $validated['processing_status'] ?? 'Belum diolah',
            'destination_mode' => $destinationMode,
        ]);

        if ($destinationMode === 'komunitas') {
            $trackingCode = 'TRK-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5));

            $submission = WasteSubmission::create([
                'tracking_code' => $trackingCode,
                'user_id' => auth()->id(),
                'community_id' => $validated['community_id'],
                'scan_id' => $scan->id,
                'waste_type' => $validated['detected_waste_type'],
                'estimated_weight_kg' => $request->input('estimated_weight_kg'),
                'moisture_condition' => $validated['moisture_condition'],
                'destination_mode' => 'komunitas',
                'status' => 'Menanti',
                'notes' => $request->input('notes'),
                'photo_path' => $imagePath,
            ]);

            $senderName = auth()->user()->name ?? $validated['farmer_group_name'];
            SubmissionNotification::create([
                'user_id' => $validated['community_id'],
                'submission_id' => $submission->id,
                'type' => 'new_submission',
                'title' => 'Setoran Limbah Baru dari ' . $senderName,
                'message' => 'Setoran ' . $validated['detected_waste_type'] . ' seberat ' . ($request->input('estimated_weight_kg') ?? 0) . ' kg telah terkirim dan menanti konfirmasi Anda.',
                'is_read' => false,
            ]);

            return redirect()
                ->route('community-map')
                ->with('success', "Setoran biomassa berhasil dikirim dengan kode #{$trackingCode}. Sentra komunitas telah dinotifikasi.");
        }

        return redirect()
            ->route('community-map')
            ->with('success', 'Dokumentasi pemindaian AI berhasil disimpan ke Peta dan Log Kelompok Tani.');
    }

    public function communityMap(Request $request)
    {
        $user = auth()->user();
        $submissionsQuery = WasteSubmission::with(['user', 'community', 'farmer']);

        if ($user && $user->role === 'komunitas') {
            $submissionsQuery->where('community_id', $user->id);
        } elseif ($user && $user->role === 'petani') {
            $submissionsQuery->where('user_id', $user->id);
        } else {
            $submissionsQuery->whereRaw('1 = 0');
        }

        if ($request->filled('status')) {
            $submissionsQuery->where('status', $request->input('status'));
        }

        if ($request->filled('date_from')) {
            $submissionsQuery->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $submissionsQuery->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $submissions = $submissionsQuery->latest()->get();

        $unreadNotificationsCount = 0;
        if ($user) {
            $unreadNotificationsCount = SubmissionNotification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();
        }

        return Inertia::render('CommunityMap', [
            'scans' => WasteScan::latest()->get(),
            'trashedScans' => WasteScan::onlyTrashed()->latest()->take(20)->get(),
            'submissions' => $submissions,
            'unread_notifications_count' => $unreadNotificationsCount,
            'filters' => $request->only(['status', 'date_from', 'date_to']),
            'communities' => User::where('role', 'komunitas')->get(['id', 'name', 'region', 'community_address', 'phone']),
        ]);
    }

    public function updateSubmissionStatus(Request $request, $id)
    {
        $submission = WasteSubmission::findOrFail($id);

        if ($submission->community_id !== auth()->id()) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang atas setoran komunitas ini.');
        }

        $validated = $request->validate([
            'status' => 'required|in:Menanti,Diterima,Sedang Diolah,Selesai',
        ]);

        $submission->update([
            'status' => $validated['status'],
        ]);

        SubmissionNotification::where('submission_id', $submission->id)
            ->where('user_id', auth()->id())
            ->update(['is_read' => true]);

        return back()->with('success', "Status setoran #{$submission->tracking_code} berhasil diperbarui menjadi {$validated['status']}.");
    }

    public function verifySubmission(Request $request, $id)
    {
        $submission = WasteSubmission::findOrFail($id);

        if ($submission->community_id !== auth()->id()) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang atas setoran komunitas ini.');
        }

        $validated = $request->validate([
            'verification_photo' => 'nullable|file|image|max:10240',
            'verification_notes' => 'nullable|string|max:1000',
        ]);

        if ($request->hasFile('verification_photo')) {
            $path = $request->file('verification_photo')->store('verifications', 'public');
            $submission->verification_photo_path = '/storage/' . $path;
        }

        if ($request->filled('verification_notes')) {
            $submission->verification_notes = $validated['verification_notes'];
        }

        $submission->verified_at = now();
        $submission->save();

        return back()->with('success', "Verifikasi setoran #{$submission->tracking_code} berhasil diperbarui.");
    }

    public function updateScanStatus(Request $request, WasteScan $scan)
    {
        $validated = $request->validate([
            'processing_status' => 'required|in:Belum diolah,Diproses,Selesai',
        ]);

        $scan->update([
            'processing_status' => $validated['processing_status'],
        ]);

        return back()->with('success', "Status pengolahan {$scan->farmer_group_name} diperbarui menjadi {$validated['processing_status']}.");
    }

    public function destroyScan(WasteScan $scan)
    {
        $groupName = $scan->farmer_group_name;
        $scan->delete();

        return back()->with('success', "Dokumentasi {$groupName} dipindahkan ke arsip terhapus.");
    }

    public function restoreScan(int $id)
    {
        $scan = WasteScan::onlyTrashed()->findOrFail($id);
        $scan->restore();

        return back()->with('success', "Dokumentasi {$scan->farmer_group_name} berhasil dipulihkan ke peta dan tabel.");
    }

    public function contact()
    {
        return Inertia::render('Contact', [
            'messages' => ContactMessage::latest()->take(6)->get(),
        ]);
    }

    public function storeContact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'organization' => 'required|string|max:150',
            'region' => 'required|string|max:120',
            'collaboration_type' => 'required|string|max:100',
            'message' => 'required|string|max:1500',
        ]);

        $validated['status'] = 'Terkirim - Diterima Koordinator Regional';
        ContactMessage::create($validated);

        return back()->with('success', 'Pesan kolaborasi berhasil tercatat di sistem TaniArang Hub!');
    }
}