<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Models\WasteFact;
use App\Models\WasteScan;
use App\Services\WasteVisionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaniArangController extends Controller
{
    public function dashboard()
    {
        $scans = WasteScan::latest()->get();

        // Regional chart data (East Java & West Sulawesi clusters)
        $regionalComparison = [
            ['region' => 'Lamongan (Jatim)', 'timbulan_ribu_ton' => 840, 'biochar_terolah_ribu_ton' => 310, 'cluster' => 'Jawa Timur'],
            ['region' => 'Ngawi (Jatim)', 'timbulan_ribu_ton' => 790, 'biochar_terolah_ribu_ton' => 295, 'cluster' => 'Jawa Timur'],
            ['region' => 'Malang (Jatim)', 'timbulan_ribu_ton' => 620, 'biochar_terolah_ribu_ton' => 240, 'cluster' => 'Jawa Timur'],
            ['region' => 'Majene (Sulbar)', 'timbulan_ribu_ton' => 195, 'biochar_terolah_ribu_ton' => 115, 'cluster' => 'Sulawesi Barat'],
            ['region' => 'Polman (Sulbar)', 'timbulan_ribu_ton' => 310, 'biochar_terolah_ribu_ton' => 178, 'cluster' => 'Sulawesi Barat'],
        ];

        // Waste distribution from recorded scans
        $distribution = [
            ['name' => 'Jerami Padi', 'value' => max(1, $scans->where('detected_waste_type', 'Jerami Padi (Oryza sativa)')->count()), 'color' => '#10B981'],
            ['name' => 'Kulit Kakao', 'value' => max(1, $scans->where('detected_waste_type', 'Kulit Buah Kakao (Theobroma cacao Pod Husk)')->count()), 'color' => '#F59E0B'],
            ['name' => 'Tongkol Jagung', 'value' => max(1, $scans->where('detected_waste_type', 'Tongkol Jagung (Zea mays Cob)')->count()), 'color' => '#06B6D4'],
            ['name' => 'Sekam Padi', 'value' => max(1, $scans->where('detected_waste_type', 'Sekam Padi (Rice Husk)')->count()), 'color' => '#34D399'],
        ];

        // Monthly open-burning reduction trend
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
        return Inertia::render('Scanner', [
            'presets' => $visionService->getDeterministicPresets(),
            'recentScansCount' => WasteScan::count(),
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
        $validated = $request->validate([
            'farmer_group_name' => 'required|string|max:140',
            'village_location' => 'required|string|max:160',
            'regency' => 'required|string|max:80',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'detected_waste_type' => 'required|string',
            'moisture_condition' => 'required|string',
            'ai_confidence' => 'required|numeric',
            'ai_summary_recommendation' => 'required|string',
            'ai_next_steps' => 'required|array',
        ]);

        $validated['image_path'] = '/demo/community-verified.webp';

        WasteScan::create($validated);

        return redirect()->route('community-map')->with('success', 'Dokumentasi pemindaian AI berhasil disimpan ke Peta & Log Kelompok Tani!');
    }

    public function communityMap()
    {
        return Inertia::render('CommunityMap', [
            'scans' => WasteScan::latest()->get(),
        ]);
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

        $validated['status'] = 'Terkirim — Diterima Koordinator Regional';

        ContactMessage::create($validated);

        return back()->with('success', 'Pesan kolaborasi berhasil tercatat di sistem TaniArang Hub!');
    }
}