import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import L from 'leaflet';
import AppLayout from '@/Layouts/AppLayout';
import ScanHistory from '@/Components/ScanHistory';
import KonTikiGuide from '@/Components/KonTikiGuide';
import { REGENCY_OPTIONS } from '@/data/communityRecords';
import {
    Camera,
    UploadCloud,
    CheckCircle2,
    AlertCircle,
    MapPin,
    Layers,
    Leaf,
    Crosshair,
    History,
    Building2,
    Flame,
    Clock,
    Phone,
    Check,
    ArrowRight,
    Sparkles,
    LogIn,
    Lock,
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

export default function Scanner({
    presets = {},
    scans = [],
    submissions = [],
    communities = [],
    recentScansCount = 0,
}) {
    const { url, props } = usePage();
    const { auth, errors = {} } = props;
    const user = auth?.user;
    const isPetani = user?.role === 'petani';
    const isGuest = !user;

    // Dual Tab Navigation State: 'scan' | 'history'
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined' && window.location.search.includes('tab=history')) {
            return 'history';
        }
        return 'scan';
    });

    const [isScanning, setIsScanning] = useState(false);
    const [activePresetKey, setActivePresetKey] = useState('jerami_lamongan');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(
        presets['jerami_lamongan'] || null
    );

    // Destination Flow State: 'mandiri' | 'komunitas'
    const [destinationMode, setDestinationMode] = useState('mandiri');
    const [selectedCommunityId, setSelectedCommunityId] = useState(communities[0]?.id || '');
    const [communityRegencyFilter, setCommunityRegencyFilter] = useState('Semua');

    // Form fields for Petani submissions
    const [estimatedWeight, setEstimatedWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [farmerGroup, setFarmerGroup] = useState(user?.name ? `Kelompok Tani ${user.name}` : 'Poktan Makmur Sejahtera Lamongan');
    const [villageLocation, setVillageLocation] = useState(user?.community_address || 'Desa Sukodadi, Kec. Sukodadi');
    const [regency, setRegency] = useState(user?.region || 'Lamongan');
    const [coords, setCoords] = useState(REGENCY_COORDS[user?.region] || REGENCY_COORDS.Lamongan);
    const [hasCustomCoords, setHasCustomCoords] = useState(false);

    const [gpsStatus, setGpsStatus] = useState('idle');
    const [gpsMessage, setGpsMessage] = useState('');
    const [showPinPicker, setShowPinPicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const pinMapContainerRef = useRef(null);
    const pinMapRef = useRef(null);
    const pinMarkerRef = useRef(null);

    // Synchronize tab state with URL query
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('tab') === 'history') {
                setActiveTab('history');
            } else if (params.get('tab') === 'scan') {
                setActiveTab('scan');
            }
        }
    }, [url]);

    // Set first community if not selected
    useEffect(() => {
        if (!selectedCommunityId && communities.length > 0) {
            setSelectedCommunityId(communities[0].id);
        }
    }, [communities, selectedCommunityId]);

    const handleTabChange = (nextTab) => {
        setActiveTab(nextTab);
        if (typeof window !== 'undefined') {
            const nextUrl = nextTab === 'history' ? '/scanner?tab=history' : '/scanner';
            window.history.replaceState(null, '', nextUrl);
        }
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && !user?.name) {
                const parsed = JSON.parse(saved);
                if (parsed.farmerGroup) setFarmerGroup(parsed.farmerGroup);
                if (parsed.villageLocation) setVillageLocation(parsed.villageLocation);
                if (parsed.regency && REGENCY_COORDS[parsed.regency]) {
                    setRegency(parsed.regency);
                    setCoords(REGENCY_COORDS[parsed.regency]);
                }
            }
        } catch {}
    }, [user]);

    // Map Pin Picker Init
    useEffect(() => {
        if (!showPinPicker || !pinMapContainerRef.current) return;

        if (!pinMapRef.current) {
            const isDark = document.documentElement.classList.contains('dark');
            const darkTile = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
            const lightTile = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

            const map = L.map(pinMapContainerRef.current, {
                center: [coords.lat, coords.lng],
                zoom: 12,
            });

            L.tileLayer(isDark ? darkTile : lightTile, {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                maxZoom: 18,
            }).addTo(map);

            const marker = L.circleMarker([coords.lat, coords.lng], {
                radius: 10,
                color: '#10B981',
                fillColor: '#16A34A',
                fillOpacity: 0.9,
                weight: 3,
            }).addTo(map);

            map.on('click', (e) => {
                const nextLat = Number(e.latlng.lat.toFixed(6));
                const nextLng = Number(e.latlng.lng.toFixed(6));
                setCoords({ lat: nextLat, lng: nextLng });
                setHasCustomCoords(true);
                marker.setLatLng([nextLat, nextLng]);
            });

            pinMapRef.current = map;
            pinMarkerRef.current = marker;
        } else {
            pinMapRef.current.setView([coords.lat, coords.lng], 12);
            if (pinMarkerRef.current) {
                pinMarkerRef.current.setLatLng([coords.lat, coords.lng]);
            }
        }

        setTimeout(() => {
            pinMapRef.current?.invalidateSize();
        }, 150);
    }, [showPinPicker, coords]);

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
            if (data.recommended_regency && REGENCY_COORDS[data.recommended_regency]) {
                setRegency(data.recommended_regency);
                setCommunityRegencyFilter(data.recommended_regency);
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

    // Unified Destination Submit Handler for Petani
    const handleSubmitDestination = (mode) => {
        if (!analysisResult) return;
        setIsSaving(true);

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    farmerGroup,
                    villageLocation,
                    regency,
                })
            );
        } catch {}

        const payload = {
            farmer_group_name: farmerGroup,
            village_location: villageLocation,
            regency: regency,
            latitude: coords.lat,
            longitude: coords.lng,
            image_base64: previewUrl,
            detected_waste_type: analysisResult.detected_waste_type,
            moisture_condition: analysisResult.moisture_condition,
            ai_confidence: analysisResult.ai_confidence,
            ai_summary_recommendation: analysisResult.ai_summary_recommendation,
            ai_next_steps: analysisResult.ai_next_steps || [
                'Sortir dan jemur residu hingga kadar air < 18%',
                'Pirolisis Kon-Tiki sudut 45 derajat',
                'Quenching larutan MOL nutrisi',
            ],
            destination_mode: mode,
        };

        if (mode === 'komunitas') {
            payload.community_id = selectedCommunityId;
            payload.estimated_weight_kg = estimatedWeight ? parseFloat(estimatedWeight) : 0;
            payload.notes = notes;
        }

        router.post('/scanner/store', payload, {
            onFinish: () => setIsSaving(false),
            onError: (err) => {
                console.error('Store scan failed:', err);
                setIsSaving(false);
            },
        });
    };

    // Filtered communities list by regency
    const filteredCommunities = communities.filter((hub) => {
        if (communityRegencyFilter === 'Semua') return true;
        return hub.region === communityRegencyFilter;
    });

    return (
        <AppLayout>
            <Head title="Pemindai AI & Pengolahan Residu Biomassa" />

            {/* Header Section */}
            <header className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Visi Komputer & Klasifikasi Biomassa
                        </span>
                        {recentScansCount > 0 && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                                {recentScansCount} Pemindaian Masuk
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                        Pemindai Residu Biomassa & Panduan Biochar
                    </h1>
                    <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
                        Unggah foto residu pertanian untuk mengidentifikasi jenis biomassa, estimasi kadar air, protokol pirolisis Kon-Tiki, atau alur setoran ke sentra komunitas terdekat.
                    </p>
                </div>
            </header>

            {/* Dual Tab Controller: Scanner vs History */}
            <div className="flex border-b border-stone-200 dark:border-carbon-700/80 mb-6 gap-2 sm:gap-4 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => handleTabChange('scan')}
                    className={`min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        activeTab === 'scan'
                            ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                            : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                    }`}
                >
                    <Camera className="w-4 h-4" />
                    <span>Pemindai AI & Alur Pengolahan</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleTabChange('history')}
                    className={`min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        activeTab === 'history'
                            ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                            : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                    }`}
                >
                    <History className="w-4 h-4" />
                    <span>Riwayat Pemindaian & Setoran</span>
                    {!isGuest && (
                        <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 dark:bg-carbon-800 text-stone-700 dark:text-stone-300">
                            {submissions.length + scans.filter((s) => s.destination_mode === 'mandiri').length}
                        </span>
                    )}
                </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'history' ? (
                <ScanHistory
                    scans={scans}
                    submissions={submissions}
                    isGuest={isGuest}
                    onSwitchToScanner={() => handleTabChange('scan')}
                />
            ) : (
                <div className="space-y-6">
                    {/* Guest Mode Informative Banner (R4) */}
                    {isGuest && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-carbon-850 border border-amber-300 dark:border-amber-800/60 shadow-sm transition-colors">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                                        Mode Tamu (Tanpa Login)
                                    </h4>
                                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                                        Hasil analisis AI dan panduan Kon-Tiki dapat dilihat langsung di bawah. Data pemindaian tidak disimpan ke database dan penyetoran limbah ke sentra komunitas memerlukan akun Petani.
                                    </p>
                                    <div className="pt-2">
                                        <Link
                                            href="/login"
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition min-h-[44px]"
                                        >
                                            <LogIn className="w-3.5 h-3.5" />
                                            <span>Masuk sebagai Petani</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Camera Upload & Presets Toolbar */}
                    <section className="bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>1. Unggah Foto atau Gunakan Sampel Uji Coba</span>
                            </h3>

                            <label className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-sm transition focus-within:ring-2 focus-within:ring-emerald-400">
                                <UploadCloud className="w-4 h-4" />
                                <span>Pilih Berkas Foto Residu</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="sr-only"
                                />
                            </label>
                        </div>

                        {/* Preset Buttons */}
                        <div>
                            <span className="text-xs text-stone-500 dark:text-stone-400 block mb-2">
                                Atau pilih cepat sampel spesimen residu pertanian:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {SAMPLE_BUTTONS.map((btn) => {
                                    const active = activePresetKey === btn.key;
                                    return (
                                        <button
                                            key={btn.key}
                                            type="button"
                                            onClick={() => triggerInstantPreset(btn.key)}
                                            className={`p-3 rounded-xl border text-left transition min-h-[56px] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                                active
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                                                    : 'bg-stone-50 dark:bg-carbon-900 border-stone-200 dark:border-carbon-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-carbon-800'
                                            }`}
                                        >
                                            <span className="text-xs font-bold leading-tight truncate">
                                                {btn.commodity}
                                            </span>
                                            <span className="text-[10px] text-stone-500 dark:text-stone-400">
                                                {btn.region}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* AI Analysis Result Card */}
                    {analysisResult && (
                        <section className="bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-100 dark:border-carbon-800">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                                            Akurasi Deteksi: {Math.round(analysisResult.ai_confidence)}%
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                                            {analysisResult.moisture_condition}
                                        </span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
                                        {analysisResult.detected_waste_type}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl">
                                        {analysisResult.ai_summary_recommendation}
                                    </p>
                                </div>

                                {previewUrl && (
                                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-stone-200 dark:border-carbon-800 shrink-0">
                                        <img
                                            src={previewUrl}
                                            alt="Pratinjau residu"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Section 2: Choose Destination Workflow */}
                            <div>
                                <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span>2. Pilih Alur Pengolahan Residu</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                                    {/* Option A: Olah Mandiri */}
                                    <div
                                        onClick={() => setDestinationMode('mandiri')}
                                        className={`p-4 rounded-xl border transition cursor-pointer select-none flex flex-col justify-between ${
                                            destinationMode === 'mandiri'
                                                ? 'bg-amber-50/70 dark:bg-carbon-900 border-amber-500 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                                                : 'bg-stone-50 dark:bg-carbon-900/60 border-stone-200 dark:border-carbon-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                                <Flame className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-stone-900 dark:text-white">
                                                    Olah Mandiri di Lahan
                                                </div>
                                                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                                                    Ikuti 3 protokol tungku Kon-Tiki langsung di sawah atau kebun untuk pemakaian pupuk hayati mandiri.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                            <span>Panduan Teknis Siap Pakai</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </div>
                                    </div>

                                    {/* Option B: Disetor ke Sentra Komunitas */}
                                    <div
                                        onClick={() => {
                                            if (!isGuest) setDestinationMode('komunitas');
                                        }}
                                        className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                                            isGuest
                                                ? 'opacity-70 bg-stone-100 dark:bg-carbon-900/40 border-stone-200 dark:border-carbon-800 cursor-not-allowed'
                                                : destinationMode === 'komunitas'
                                                ? 'bg-emerald-50/70 dark:bg-carbon-900 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20 cursor-pointer'
                                                : 'bg-stone-50 dark:bg-carbon-900/60 border-stone-200 dark:border-carbon-800 text-stone-700 dark:text-stone-300 hover:border-stone-300 cursor-pointer'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-stone-900 dark:text-white">
                                                        Disetor ke Sentra Komunitas
                                                    </span>
                                                    {isGuest && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                                                            <Lock className="w-2.5 h-2.5" />
                                                            <span>Perlu Login</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                                                    Kirim data residu ke akun sentra pirolisis komunitas terdekat untuk penjemputan, penimbangan, dan pengolahan bersama.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                            <span>Kirim Setoran & Dapatkan Status Alur</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Flow Details: Olah Mandiri vs Komunitas */}
                                {destinationMode === 'mandiri' && (
                                    <div className="space-y-4">
                                        <KonTikiGuide
                                            customSteps={analysisResult.ai_next_steps}
                                            wasteType={analysisResult.detected_waste_type}
                                        />

                                        {/* For Authenticated Petani: Option to save documentation */}
                                        {isPetani && (
                                            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 space-y-4">
                                                <div className="font-bold text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                                    Dokumentasikan Titik Lahan Olah Mandiri
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                                                            Nama Kelompok Tani *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={farmerGroup}
                                                            onChange={(e) => setFarmerGroup(e.target.value)}
                                                            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-carbon-850 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                                                            Desa / Lokasi Lahan *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={villageLocation}
                                                            onChange={(e) => setVillageLocation(e.target.value)}
                                                            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-carbon-850 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                                                            Kabupaten Sentra *
                                                        </label>
                                                        <select
                                                            value={regency}
                                                            onChange={(e) => handleRegencyChange(e.target.value)}
                                                            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-carbon-850 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                        >
                                                            {REGENCY_OPTIONS.map((reg) => (
                                                                <option key={reg} value={reg}>
                                                                    {reg}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={() => handleSubmitDestination('mandiri')}
                                                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50"
                                                >
                                                    <Flame className="w-4 h-4 shrink-0" />
                                                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Dokumentasi Olah Mandiri'}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {destinationMode === 'komunitas' && (
                                    <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <div className="font-bold text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                                    Pilih Sentra Komunitas Penerima
                                                </div>
                                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                                    Data setoran limbah akan dikirim ke akun sentra penerima terpilih.
                                                </p>
                                            </div>

                                            {/* Regency Filter for Communities */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-stone-500 dark:text-stone-400">Wilayah:</span>
                                                <select
                                                    value={communityRegencyFilter}
                                                    onChange={(e) => setCommunityRegencyFilter(e.target.value)}
                                                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white dark:bg-carbon-850 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                >
                                                    <option value="Semua">Semua Wilayah</option>
                                                    {REGENCY_OPTIONS.map((reg) => (
                                                        <option key={reg} value={reg}>
                                                            {reg}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Community Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {filteredCommunities.map((hub) => {
                                                const isSelected = selectedCommunityId === hub.id;
                                                return (
                                                    <div
                                                        key={hub.id}
                                                        onClick={() => setSelectedCommunityId(hub.id)}
                                                        className={`p-3.5 rounded-xl border transition cursor-pointer select-none ${
                                                            isSelected
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                                                                : 'bg-white dark:bg-carbon-850 border-stone-200 dark:border-carbon-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                                                                {hub.name}
                                                            </div>
                                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-carbon-800 text-stone-600 dark:text-stone-300">
                                                                {hub.region}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                                                            {hub.community_address || 'Sentra Biochar Terdaftar'}
                                                        </div>
                                                        {hub.phone && (
                                                            <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                                                                <Phone className="w-3 h-3" />
                                                                <span>{hub.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Setoran Specific Fields */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                            <div>
                                                <label htmlFor="estimated-weight-input" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                                    Estimasi Berat Residu (kg) *
                                                </label>
                                                <input
                                                    id="estimated-weight-input"
                                                    type="number"
                                                    min="1"
                                                    step="0.5"
                                                    required
                                                    value={estimatedWeight}
                                                    onChange={(e) => setEstimatedWeight(e.target.value)}
                                                    placeholder="Contoh: 150"
                                                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-carbon-850 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                />
                                                {errors.estimated_weight_kg && (
                                                    <p className="text-xs text-rose-500 mt-1">{errors.estimated_weight_kg}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="notes-input" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                                    Catatan untuk Sentra (Opsional)
                                                </label>
                                                <input
                                                    id="notes-input"
                                                    type="text"
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Contoh: 10 karung jerami kering di tepi jalan sawah"
                                                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-carbon-850 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                />
                                                {errors.notes && (
                                                    <p className="text-xs text-rose-500 mt-1">{errors.notes}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Petani Details & GPS */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                            <div>
                                                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                                                    Nama Kelompok Tani *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={farmerGroup}
                                                    onChange={(e) => setFarmerGroup(e.target.value)}
                                                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-carbon-850 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                                                    Desa Asal Residu *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={villageLocation}
                                                    onChange={(e) => setVillageLocation(e.target.value)}
                                                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-carbon-850 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                                                    Kabupaten *
                                                </label>
                                                <select
                                                    value={regency}
                                                    onChange={(e) => handleRegencyChange(e.target.value)}
                                                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-carbon-850 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                >
                                                    {REGENCY_OPTIONS.map((reg) => (
                                                        <option key={reg} value={reg}>
                                                            {reg}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isSaving || !selectedCommunityId}
                                            onClick={() => handleSubmitDestination('komunitas')}
                                            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
                                        >
                                            <Building2 className="w-4 h-4 shrink-0" />
                                            <span>{isSaving ? 'Mengirim Data...' : 'Kirim Setoran ke Sentra Komunitas'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
