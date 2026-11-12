import React, { useEffect, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import L from 'leaflet';
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
    Crosshair,
    Map as MapIcon,
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

const STORAGE_KEY = 'taniarang_last_poktan_v1';

export default function Scanner({ presets = {} }) {
    const { errors = {} } = usePage().props;

    const [isScanning, setIsScanning] = useState(false);
    const [activePresetKey, setActivePresetKey] = useState('jerami_lamongan');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(
        presets['jerami_lamongan'] || null
    );

    const [farmerGroup, setFarmerGroup] = useState('Poktan Makmur Sejahtera Lamongan');
    const [villageLocation, setVillageLocation] = useState('Desa Sukodadi, Kec. Sukodadi');
    const [regency, setRegency] = useState('Lamongan');
    const [coords, setCoords] = useState(REGENCY_COORDS.Lamongan);
    const [hasCustomCoords, setHasCustomCoords] = useState(false);

    const [gpsStatus, setGpsStatus] = useState('idle');
    const [gpsMessage, setGpsMessage] = useState('');
    const [showPinPicker, setShowPinPicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const pinMapContainerRef = useRef(null);
    const pinMapRef = useRef(null);
    const pinMarkerRef = useRef(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.farmerGroup) setFarmerGroup(parsed.farmerGroup);
                if (parsed.villageLocation) setVillageLocation(parsed.villageLocation);
                if (parsed.regency && REGENCY_COORDS[parsed.regency]) {
                    setRegency(parsed.regency);
                    setCoords(REGENCY_COORDS[parsed.regency]);
                }
            }
        } catch {
            // Abaikan jika storage diblokir browser
        }
    }, []);

    useEffect(() => {
        if (!showPinPicker || !pinMapContainerRef.current) return;

        if (!pinMapRef.current) {
            const map = L.map(pinMapContainerRef.current, {
                center: [coords.lat, coords.lng],
                zoom: 13,
                scrollWheelZoom: true,
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                maxZoom: 18,
            }).addTo(map);

            const marker = L.circleMarker([coords.lat, coords.lng], {
                radius: 9,
                fillColor: '#10B981',
                color: '#ffffff',
                weight: 2,
                fillOpacity: 0.95,
            }).addTo(map);

            map.on('click', (event) => {
                const nextLat = Number(event.latlng.lat.toFixed(6));
                const nextLng = Number(event.latlng.lng.toFixed(6));
                setCoords({ lat: nextLat, lng: nextLng });
                setHasCustomCoords(true);
                setGpsStatus('success');
                setGpsMessage('Titik lokasi dipilih manual pada peta.');
                marker.setLatLng([nextLat, nextLng]);
            });

            pinMapRef.current = map;
            pinMarkerRef.current = marker;
        }

        return () => {
            if (pinMapRef.current) {
                pinMapRef.current.remove();
                pinMapRef.current = null;
                pinMarkerRef.current = null;
            }
        };
    }, [showPinPicker]);

    useEffect(() => {
        if (pinMapRef.current && pinMarkerRef.current) {
            pinMarkerRef.current.setLatLng([coords.lat, coords.lng]);
            pinMapRef.current.setView([coords.lat, coords.lng], pinMapRef.current.getZoom());
        }
    }, [coords]);

    const applySavedOrPresetLocation = (data) => {
        const hasLocal = Boolean(localStorage.getItem(STORAGE_KEY));
        if (!hasLocal) {
            if (data.default_group) setFarmerGroup(data.default_group);
            if (data.default_village) setVillageLocation(data.default_village);
        }
        if (data.recommended_regency && REGENCY_COORDS[data.recommended_regency]) {
            setRegency(data.recommended_regency);
            if (!hasCustomCoords) {
                setCoords(REGENCY_COORDS[data.recommended_regency]);
            }
        }
    };

    const handleRegencyChange = (nextRegency) => {
        setRegency(nextRegency);
        if (!hasCustomCoords && REGENCY_COORDS[nextRegency]) {
            setCoords(REGENCY_COORDS[nextRegency]);
        }
    };

    const handleDetectGps = () => {
        if (!navigator.geolocation) {
            setGpsStatus('error');
            setGpsMessage('Browser tidak mendukung GPS. Gunakan pemilih pin peta di bawah.');
            setShowPinPicker(true);
            return;
        }

        setGpsStatus('loading');
        setGpsMessage('Mengambil titik GPS perangkat...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const nextLat = Number(position.coords.latitude.toFixed(6));
                const nextLng = Number(position.coords.longitude.toFixed(6));
                const accuracy = Math.round(position.coords.accuracy);

                setCoords({ lat: nextLat, lng: nextLng });
                setHasCustomCoords(true);
                setGpsStatus('success');
                setGpsMessage(`Koordinat GPS terkunci (akurasi sekitar ${accuracy} m).`);
            },
            () => {
                const fallback = REGENCY_COORDS[regency] || REGENCY_COORDS.Lamongan;
                setCoords(fallback);
                setGpsStatus('error');
                setGpsMessage('Izin GPS ditolak atau sinyal lemah. Sesuaikan titik pin pada peta.');
                setShowPinPicker(true);
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    };

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
                    resolve(canvas.toDataURL('image/webp', 0.72));
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
            applySavedOrPresetLocation(data);
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
            if (data.default_group) setFarmerGroup(data.default_group);
            if (data.default_village) setVillageLocation(data.default_village);
            if (data.recommended_regency && REGENCY_COORDS[data.recommended_regency]) {
                setRegency(data.recommended_regency);
                setHasCustomCoords(false);
                setCoords(REGENCY_COORDS[data.recommended_regency]);
            }
        } catch {
            const fallback = presets[presetKey];
            if (fallback) {
                setAnalysisResult(fallback);
            }
        } finally {
            setTimeout(() => setIsScanning(false), 300);
        }
    };

    const handleSaveToCommunityLog = (e) => {
        e.preventDefault();
        if (!analysisResult) return;
        setIsSaving(true);

        const finalLat = hasCustomCoords
            ? coords.lat
            : Number((coords.lat + (Math.random() - 0.5) * 0.012).toFixed(6));
        const finalLng = hasCustomCoords
            ? coords.lng
            : Number((coords.lng + (Math.random() - 0.5) * 0.012).toFixed(6));

        router.post(
            '/scanner/store',
            {
                farmer_group_name: farmerGroup,
                village_location: villageLocation,
                regency: regency,
                latitude: finalLat,
                longitude: finalLng,
                image_base64: previewUrl,
                detected_waste_type: analysisResult.detected_waste_type,
                moisture_condition: analysisResult.moisture_condition,
                ai_confidence: analysisResult.ai_confidence,
                ai_summary_recommendation: analysisResult.ai_summary_recommendation,
                ai_next_steps: analysisResult.ai_next_steps,
            },
            {
                onSuccess: () => {
                    try {
                        localStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify({ farmerGroup, villageLocation, regency })
                        );
                    } catch {
                        // Abaikan jika storage penuh
                    }
                },
                onFinish: () => setIsSaving(false),
            }
        );
    };

    const isDryReady = analysisResult?.moisture_condition?.toLowerCase().includes('kering');

    return (
        <AppLayout>
            <Head title="Pemindai Foto Limbah Panen" />

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
                                className={`min-h-[44px] p-4 rounded-xl text-left transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                <div className="lg:col-span-5 space-y-5">
                    <section className="bg-carbon-850 border border-carbon-700/60 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-white flex items-center gap-2">
                                <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                                Foto Spesimen
                            </span>
                            <span className="text-xs text-stone-400">
                                Kompresi WebP Otomatis
                            </span>
                        </div>

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
                                        Ambil foto tumpukan limbah di sawah atau kebun, atau pilih file gambar dari perangkat Anda.
                                    </p>
                                </div>
                            )}

                            {isScanning && (
                                <div className="absolute inset-0 bg-carbon-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30 p-4">
                                    <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                                    <span className="text-xs text-emerald-400 text-center font-medium">
                                        Menganalisis kondisi limbah...
                                    </span>
                                </div>
                            )}
                        </div>

                        <label className="w-full min-h-[44px] cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-stone-200 hover:text-white text-xs font-semibold transition border border-carbon-700 focus-within:ring-2 focus-within:ring-emerald-500">
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

                <div className="lg:col-span-7 space-y-6">
                    {analysisResult && (
                        <section className="bg-carbon-850 border border-carbon-700/60 rounded-2xl p-6 sm:p-8">
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

                            <div className="mb-5">
                                <div className="text-xs text-stone-400">
                                    Hasil Identifikasi Biomassa:
                                </div>
                                <h2 className="font-extrabold text-2xl text-white mt-0.5">
                                    {analysisResult.detected_waste_type}
                                </h2>
                            </div>

                            {analysisResult.nutrient_highlights && (
                                <div className="grid grid-cols-3 gap-3 mb-5">
                                    {Object.entries(analysisResult.nutrient_highlights).map(([k, v]) => (
                                        <div
                                            key={k}
                                            className="p-3 rounded-xl bg-carbon-900"
                                        >
                                            <div className="text-[11px] text-stone-400 truncate">{k}</div>
                                            <div className="text-sm font-bold text-emerald-400 mt-0.5">
                                                {v}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-4 rounded-xl bg-emerald-950/30 mb-6">
                                <div className="text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1.5">
                                    <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    Manfaat untuk Tanah:
                                </div>
                                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                                    {analysisResult.ai_summary_recommendation}
                                </p>
                            </div>

                            <div className="space-y-2.5 mb-6">
                                <div className="text-xs text-stone-300 flex items-center gap-1.5 font-semibold">
                                    <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    3 Langkah Pengolahan Biochar:
                                </div>
                                {(analysisResult.ai_next_steps || []).map((step, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 p-3 rounded-xl bg-carbon-900 text-xs sm:text-sm text-stone-200"
                                    >
                                        <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                                            {index + 1}
                                        </span>
                                        <span className="leading-relaxed">{step}</span>
                                    </div>
                                ))}
                            </div>

                            <form
                                onSubmit={handleSaveToCommunityLog}
                                className="pt-6 border-t border-carbon-700/60 space-y-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="text-sm font-bold text-white flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                                        Simpan Dokumentasi ke Peta Komunitas
                                    </div>
                                    <span className="text-xs font-mono text-stone-400">
                                        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                                    </span>
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
                                            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
                                        />
                                        {errors.farmer_group_name && (
                                            <p className="text-xs text-amber-400 mt-1">{errors.farmer_group_name}</p>
                                        )}
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
                                            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
                                        />
                                        {errors.village_location && (
                                            <p className="text-xs text-amber-400 mt-1">{errors.village_location}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="regency-select" className="block text-xs text-stone-300 mb-1">
                                            Kabupaten Sentra *
                                        </label>
                                        <select
                                            id="regency-select"
                                            value={regency}
                                            onChange={(e) => handleRegencyChange(e.target.value)}
                                            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
                                        >
                                            <option value="Lamongan">Lamongan (Jatim)</option>
                                            <option value="Ngawi">Ngawi (Jatim)</option>
                                            <option value="Malang">Malang (Jatim)</option>
                                            <option value="Majene">Majene (Sulbar)</option>
                                            <option value="Polewali Mandar">Polewali Mandar (Sulbar)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5">
                                    <button
                                        type="button"
                                        onClick={handleDetectGps}
                                        disabled={gpsStatus === 'loading'}
                                        className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-carbon-900 hover:bg-carbon-800 border border-carbon-700 text-xs font-medium text-stone-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
                                    >
                                        <Crosshair className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <span>
                                            {gpsStatus === 'loading'
                                                ? 'Mencari GPS...'
                                                : 'Gunakan GPS Saat Ini'}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowPinPicker((prev) => !prev)}
                                        className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-carbon-900 hover:bg-carbon-800 border border-carbon-700 text-xs font-medium text-stone-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                    >
                                        <MapIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                        <span>
                                            {showPinPicker ? 'Sembunyikan Peta Pin' : 'Sesuaikan Pin Manual'}
                                        </span>
                                    </button>
                                </div>

                                {gpsMessage && (
                                    <p
                                        className={`text-xs ${
                                            gpsStatus === 'error' ? 'text-amber-300' : 'text-emerald-300'
                                        }`}
                                    >
                                        {gpsMessage}
                                    </p>
                                )}

                                {showPinPicker && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs text-stone-400">
                                            Klik langsung pada peta untuk memindahkan pin titik lokasi lahan:
                                        </p>
                                        <div
                                            ref={pinMapContainerRef}
                                            className="w-full h-52 rounded-xl overflow-hidden border border-carbon-700 z-10"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
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