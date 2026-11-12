import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import {
    Camera,
    UploadCloud,
    Cpu,
    CheckCircle2,
    AlertCircle,
    MapPin,
    Save,
    Layers,
    Zap,
    Leaf,
} from 'lucide-react';

const SAMPLE_BUTTONS = [
    {
        key: 'jerami_lamongan',
        label: 'Jerami Padi Lamongan',
        region: 'Jawa Timur',
        commodity: 'Jerami Padi',
    },
    {
        key: 'kakao_majene',
        label: 'Kulit Kakao Majene',
        region: 'Sulawesi Barat',
        commodity: 'Kulit Kakao',
    },
    {
        key: 'tongkol_malang',
        label: 'Tongkol Jagung Malang',
        region: 'Jawa Timur',
        commodity: 'Tongkol Jagung',
    },
    {
        key: 'sekam_ngawi',
        label: 'Sekam Padi Ngawi',
        region: 'Jawa Timur',
        commodity: 'Sekam Padi',
    },
];

const REGENCY_COORDS = {
    Lamongan: { lat: -7.1185, lng: 112.3328 },
    Ngawi: { lat: -7.4352, lng: 111.5311 },
    Malang: { lat: -8.1065, lng: 112.7302 },
    Majene: { lat: -3.0954, lng: 118.8872 },
    'Polewali Mandar': { lat: -3.4128, lng: 119.1645 },
};

export default function Scanner({ presets = {}, recentScansCount = 0 }) {
    const [isScanning, setIsScanning] = useState(false);
    const [activePresetKey, setActivePresetKey] = useState('jerami_lamongan');
    const [previewUrl, setPreviewUrl] = useState(null);

    const [analysisResult, setAnalysisResult] = useState(
        presets['jerami_lamongan'] || null
    );

    // Form State
    const [farmerGroup, setFarmerGroup] = useState('Poktan Makmur Sejahtera Lamongan');
    const [villageLocation, setVillageLocation] = useState('Desa Sukodadi, Kec. Sukodadi');
    const [regency, setRegency] = useState('Lamongan');
    const [isSaving, setIsSaving] = useState(false);

    // Client-side WebP Compressor
    const compressImageToWebP = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxDim = 768;
                    let width = img.width;
                    let height = img.height;

                    if (width > height && width > maxDim) {
                        height *= maxDim / width;
                        width = maxDim;
                    } else if (height > maxDim) {
                        width *= maxDim / height;
                        height = maxDim;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const webpDataUrl = canvas.toDataURL('image/webp', 0.72);
                    resolve(webpDataUrl);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setActivePresetKey('');
        const compressedBase64 = await compressImageToWebP(file);
        setPreviewUrl(compressedBase64);

        try {
            const res = await axios.post('/scanner/analyze', {
                image_base64: compressedBase64,
            });
            const data = res.data.analysis;
            setAnalysisResult(data);
            if (data.default_group) setFarmerGroup(data.default_group);
            if (data.default_village) setVillageLocation(data.default_village);
            if (data.recommended_regency) setRegency(data.recommended_regency);
        } catch {
            if (presets['jerami_lamongan']) {
                setAnalysisResult(presets['jerami_lamongan']);
            }
        } finally {
            setIsScanning(false);
        }
    };

    const triggerInstantPreset = async (presetKey) => {
        setIsScanning(true);
        setActivePresetKey(presetKey);
        setPreviewUrl(null);

        try {
            const res = await axios.post('/scanner/analyze', { preset_key: presetKey });
            const data = res.data.analysis;
            setAnalysisResult(data);
            setFarmerGroup(data.default_group || 'Poktan Mitra TaniArang');
            setVillageLocation(data.default_village || 'Desa Sentra Pertanian');
            setRegency(data.recommended_regency || 'Lamongan');
        } catch {
            const fallback = presets[presetKey];
            if (fallback) {
                setAnalysisResult(fallback);
                setFarmerGroup(fallback.default_group || 'Poktan Mitra TaniArang');
                setVillageLocation(fallback.default_village || 'Desa Sentra Pertanian');
                setRegency(fallback.recommended_regency || 'Lamongan');
            }
        } finally {
            setTimeout(() => setIsScanning(false), 300);
        }
    };

    const handleSaveToCommunityLog = (e) => {
        e.preventDefault();
        if (!analysisResult) return;
        setIsSaving(true);

        const coords = REGENCY_COORDS[regency] || REGENCY_COORDS.Lamongan;
        const jitterLat = Number((coords.lat + (Math.random() - 0.5) * 0.015).toFixed(6));
        const jitterLng = Number((coords.lng + (Math.random() - 0.5) * 0.015).toFixed(6));

        router.post(
            '/scanner/store',
            {
                farmer_group_name: farmerGroup,
                village_location: villageLocation,
                regency: regency,
                latitude: jitterLat,
                longitude: jitterLng,
                detected_waste_type: analysisResult.detected_waste_type,
                moisture_condition: analysisResult.moisture_condition,
                ai_confidence: analysisResult.ai_confidence,
                ai_summary_recommendation: analysisResult.ai_summary_recommendation,
                ai_next_steps: analysisResult.ai_next_steps,
            },
            {
                onFinish: () => setIsSaving(false),
            }
        );
    };

    const isDryReady = analysisResult?.moisture_condition?.toLowerCase().includes('kering');

    return (
        <AppLayout>
            <Head title="Pemindai Foto Limbah Panen" />

            {/* Header */}
            <header className="mb-8">
                <span className="text-sm font-semibold text-emerald-400 block mb-2">
                    Diagnostik Visual Biomassa
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Pemindai Foto Residu Panen
                </h1>
                <p className="text-stone-300 text-base mt-2 max-w-3xl leading-relaxed">
                    Unggah foto limbah dari lahan tani atau gunakan salah satu sampel uji lapangan berikut untuk memeriksa kadar kekeringan dan panduan 3 langkah pembuatan biochar.
                </p>
            </header>

            {/* 4 Instant Demo Preset Buttons */}
            <section className="bg-carbon-850 border border-carbon-700/60 rounded-2xl p-5 mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-sm font-semibold text-white">
                        Pilih Sampel Lapangan:
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {SAMPLE_BUTTONS.map((btn) => {
                        const isActive = activePresetKey === btn.key && !previewUrl;
                        return (
                            <button
                                key={btn.key}
                                type="button"
                                onClick={() => triggerInstantPreset(btn.key)}
                                className={`p-4 rounded-xl text-left transition-all border ${
                                    isActive
                                        ? 'bg-carbon-800 border-emerald-500 text-white'
                                        : 'bg-carbon-900 border-carbon-700/60 text-stone-300 hover:text-white hover:border-carbon-600'
                                }`}
                            >
                                <div className="text-xs text-stone-400">
                                    {btn.region} • {btn.commodity}
                                </div>
                                <div className="font-semibold text-sm text-white mt-1">
                                    {btn.label}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Main Scanner & Laboratory Card Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Left Column: Specimen Preview & Upload */}
                <div className="lg:col-span-5 space-y-5">
                    <section className="bg-carbon-850 border border-carbon-700/60 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-white flex items-center gap-2">
                                <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                                Foto Spesimen
                            </span>
                            <span className="text-xs text-stone-400">
                                Kompresi Otomatis
                            </span>
                        </div>

                        {/* Image Preview Box */}
                        <div className="relative h-64 rounded-xl bg-carbon-900 border border-dashed border-carbon-700 flex flex-col items-center justify-center p-4 text-center overflow-hidden mb-4">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview Foto Spesimen"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <div className="space-y-2 max-w-xs">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-950/60 flex items-center justify-center mx-auto text-emerald-400">
                                        <Cpu className="w-6 h-6" />
                                    </div>
                                    <div className="font-semibold text-sm text-white">
                                        {analysisResult?.detected_waste_type || 'Spesimen Terpilih'}
                                    </div>
                                    <p className="text-xs text-stone-400 leading-relaxed">
                                        Ambil foto tumpukan limbah di sawah/kebun atau pilih file gambar dari perangkat Anda.
                                    </p>
                                </div>
                            )}

                            {/* Loading State Overlay */}
                            {isScanning && (
                                <div className="absolute inset-0 bg-carbon-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30 p-4">
                                    <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                                    <span className="text-xs text-emerald-400 text-center font-medium">
                                        Menganalisis kondisi limbah...
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* File Upload Action */}
                        <label className="w-full min-h-[44px] cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-stone-200 hover:text-white text-xs font-semibold transition border border-carbon-700">
                            <UploadCloud className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Unggah Foto dari Perangkat</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="sr-only"
                            />
                        </label>
                    </section>
                </div>

                {/* Right Column: Analysis Result & Form */}
                <div className="lg:col-span-7 space-y-6">
                    {analysisResult && (
                        <section className="bg-carbon-850 border border-carbon-700/60 rounded-2xl p-6 sm:p-8">
                            {/* Badges: Confidence & Moisture */}
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300">
                                    Tingkat Akurasi: {Math.round(analysisResult.ai_confidence)}%
                                </span>

                                <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                        isDryReady
                                            ? 'bg-emerald-950/70 text-emerald-300'
                                            : 'bg-amber-950/70 text-amber-300'
                                    }`}
                                >
                                    {isDryReady ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    )}
                                    Kondisi: {analysisResult.moisture_condition}
                                </span>
                            </div>

                            {/* Detected Waste Name */}
                            <div className="mb-5">
                                <div className="text-xs text-stone-400">
                                    Hasil Identifikasi Biomassa:
                                </div>
                                <h2 className="font-extrabold text-2xl text-white mt-0.5">
                                    {analysisResult.detected_waste_type}
                                </h2>
                            </div>

                            {/* Nutrient Highlights Breakdown */}
                            {analysisResult.nutrient_highlights && (
                                <div className="grid grid-cols-3 gap-3 mb-5">
                                    {Object.entries(analysisResult.nutrient_highlights).map(([k, v]) => (
                                        <div
                                            key={k}
                                            className="p-3 rounded-xl bg-carbon-900 border border-carbon-700/50"
                                        >
                                            <div className="text-[11px] text-stone-400 truncate">{k}</div>
                                            <div className="text-sm font-bold text-emerald-400 mt-0.5">
                                                {v}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Agronomic Soil Benefit Summary */}
                            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 mb-6">
                                <div className="text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1.5">
                                    <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    Manfaat untuk Tanah:
                                </div>
                                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                                    {analysisResult.ai_summary_recommendation}
                                </p>
                            </div>

                            {/* 3-Step Biochar SOP Guide */}
                            <div className="space-y-2.5 mb-6">
                                <div className="text-xs text-stone-300 flex items-center gap-1.5 font-semibold">
                                    <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    3 Langkah Pengolahan Biochar:
                                </div>
                                {(analysisResult.ai_next_steps || []).map((step, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 p-3 rounded-xl bg-carbon-900 border border-carbon-700/50 text-xs sm:text-sm text-stone-200"
                                    >
                                        <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                                            {index + 1}
                                        </span>
                                        <span className="leading-relaxed">{step}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Persist Scan Form */}
                            <form
                                onSubmit={handleSaveToCommunityLog}
                                className="pt-6 border-t border-carbon-700/60 space-y-4"
                            >
                                <div className="text-sm font-bold text-white flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                                    Simpan Dokumentasi ke Peta Komunitas
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label htmlFor="farmer-group-input" className="block text-xs text-stone-300 mb-1">
                                            Nama Kelompok Tani *
                                        </label>
                                        <input
                                            id="farmer-group-input"
                                            type="text"
                                            required
                                            value={farmerGroup}
                                            onChange={(e) => setFarmerGroup(e.target.value)}
                                            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-xs text-white focus:border-emerald-500 focus:outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="village-input" className="block text-xs text-stone-300 mb-1">
                                            Desa & Kecamatan *
                                        </label>
                                        <input
                                            id="village-input"
                                            type="text"
                                            required
                                            value={villageLocation}
                                            onChange={(e) => setVillageLocation(e.target.value)}
                                            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-xs text-white focus:border-emerald-500 focus:outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="regency-select" className="block text-xs text-stone-300 mb-1">
                                            Kabupaten Sentra *
                                        </label>
                                        <select
                                            id="regency-select"
                                            value={regency}
                                            onChange={(e) => setRegency(e.target.value)}
                                            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-xs text-white focus:border-emerald-500 focus:outline-none transition"
                                        >
                                            <option value="Lamongan">Lamongan (Jatim)</option>
                                            <option value="Ngawi">Ngawi (Jatim)</option>
                                            <option value="Malang">Malang (Jatim)</option>
                                            <option value="Majene">Majene (Sulbar)</option>
                                            <option value="Polewali Mandar">Polewali Mandar (Sulbar)</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 shrink-0" />
                                    <span>
                                        {isSaving
                                            ? 'Menyimpan...'
                                            : 'Simpan ke Peta Komunitas'}
                                    </span>
                                </button>
                            </form>
                        </section>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
