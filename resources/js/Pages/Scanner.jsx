import React, { useEffect, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import L from 'leaflet';
import AppLayout from '@/Layouts/AppLayout';
import ScanHistory from '@/Components/ScanHistory';
import { MOCK_COMMUNITIES, REGENCY_OPTIONS } from '@/data/communityRecords';
import { saveScanRecord, getScanHistory } from '@/Utils/scanHistoryStorage';
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
    History,
    Building2,
    Flame,
    Clock,
    Phone,
    Check,
    ArrowRight,
    Sparkles,
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
    const { url } = usePage();
    const { errors = {} } = usePage().props;

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

    // R2 Destination Flow State
    const [destinationMode, setDestinationMode] = useState('komunitas'); // 'komunitas' | 'mandiri'
    const [selectedCommunityId, setSelectedCommunityId] = useState(MOCK_COMMUNITIES[0].id);
    const [communityRegencyFilter, setCommunityRegencyFilter] = useState('Semua');
    const [completedSteps, setCompletedSteps] = useState([1]);
    const [destinationToast, setDestinationToast] = useState('');

    // Community Map Pin State
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
            // Abaikan jika storage diblokir
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

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
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
            setCommunityRegencyFilter(data.recommended_regency);
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

    // Kon-Tiki Steps Checklist Toggle
    const toggleStep = (stepNum) => {
        setCompletedSteps((prev) =>
            prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum]
        );
    };

    // Save Destination to Scan History (R2 & R4)
    const handleConfirmDestination = (mode) => {
        if (!analysisResult) return;

        const selectedCommunity =
            mode === 'komunitas'
                ? MOCK_COMMUNITIES.find((c) => c.id === selectedCommunityId) || MOCK_COMMUNITIES[0]
                : null;

        const isDry = analysisResult.moisture_condition?.toLowerCase().includes('kering');

        const record = {
            id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            timestamp: new Date().toISOString(),
            detectedWasteType: analysisResult.detected_waste_type,
            commodity: analysisResult.detected_waste_type?.split('(')[0]?.trim() || 'Limbah Pertanian',
            region: `Kab. ${regency}, Jawa Timur`,
            moistureCondition: analysisResult.moisture_condition,
            isDryReady: isDry,
            aiConfidence: Math.round(analysisResult.ai_confidence || 95),
            destination: mode,
            destinationLabel: mode === 'komunitas' ? 'Setor ke Komunitas' : 'Olah Mandiri Kon-Tiki',
            community: selectedCommunity
                ? {
                      name: selectedCommunity.name,
                      regency: selectedCommunity.regency,
                      address: selectedCommunity.address,
                      contactPerson: selectedCommunity.contactPerson,
                      phone: selectedCommunity.phone,
                  }
                : null,
            nutrientHighlights: analysisResult.nutrient_highlights || {
                'Silika / Kalium': 'Tinggi',
                'Kadar Karbon': 'Optimal',
                'pH Biochar': '8.2 (Alkalin)',
            },
            carbonPotential: {
                co2Avoidance: '1.35 ton CO2e/ton residu',
                fixedCarbon: '48.5%',
                soilBenefit: analysisResult.ai_summary_recommendation || 'Penyubur tanah dan penyimpan hara jangka panjang.',
            },
            summaryRecommendation: analysisResult.ai_summary_recommendation,
            steps: [
                {
                    title: 'Langkah 1: Persiapan Biomassa',
                    badge: 'Kadar Air < 18%',
                    instructions:
                        'Sortir material asing (tanah, batu, plastik). Jemur di bawah sinar matahari 1-2 hari hingga berbunyi renyah patah saat ditekuk.',
                    parameter: 'Target kadar air di bawah 18%.',
                },
                {
                    title: 'Langkah 2: Pembakaran Terkendali Kon-Tiki',
                    badge: 'Suhu 500 - 650°C',
                    instructions:
                        'Gunakan tungku kerucut Kon-Tiki sudut 45 derajat. Nyalakan dari pucuk atas (Top-Lit Updraft). Masukkan limbah bertahap lapis demi lapis saat lapisan bawah membara merah tanpa asap putih tebal.',
                    parameter: 'Tudung api bersih keemasan-kebiruan, durasi 45 - 60 menit.',
                },
                {
                    title: 'Langkah 3: Pemadaman & Aktivasi Biochar',
                    badge: 'Quenching Nutrisi',
                    instructions:
                        'Padamkan saat bara memenuhi 85% volume tungku sebelum jadi abu putih. Siram larutan MOL / air cucian beras untuk aktivasi mikropori. Tiriskan 12 jam sebelum ditebar ke lahan.',
                    parameter: 'Biochar hitam mengkilap berpori, suhu dingin < 40°C.',
                },
            ],
        };

        saveScanRecord(record);

        // Auto-fill community map log if Komunitas is chosen
        if (mode === 'komunitas' && selectedCommunity) {
            setFarmerGroup(selectedCommunity.name);
            setVillageLocation(selectedCommunity.village);
            setRegency(selectedCommunity.regency);
            setCoords(selectedCommunity.coords);
            setHasCustomCoords(true);
            setDestinationToast(
                `Pilihan disetorkan ke "${selectedCommunity.name}" berhasil dicatat ke Riwayat Pindai dan formulir lokasi!`
            );
        } else {
            setDestinationToast(
                'Rencana pengolahan mandiri Kon-Tiki berhasil dicatat ke Riwayat Pindai!'
            );
        }

        setTimeout(() => setDestinationToast(''), 5000);
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
                        // Abaikan
                    }
                },
                onFinish: () => setIsSaving(false),
            }
        );
    };

    const isDryReady = analysisResult?.moisture_condition?.toLowerCase().includes('kering');

    const filteredCommunities = MOCK_COMMUNITIES.filter((hub) => {
        if (communityRegencyFilter === 'Semua') return true;
        return hub.regency.toLowerCase() === communityRegencyFilter.toLowerCase();
    });

    const activeCommunity =
        MOCK_COMMUNITIES.find((c) => c.id === selectedCommunityId) || MOCK_COMMUNITIES[0];

    return (
        <AppLayout>
            <Head title="Pemindai & Riwayat Limbah Panen" />

            {/* Header & Dual Tab Navigation (R4) */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                            Diagnostik Visual & Alur Pengolahan
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                            Pemindai Residu Pertanian & Riwayat
                        </h1>
                        <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                            Analisis kadar air biomassa, pilih sentra komunitas atau panduan Kon-Tiki mandiri, dan pantau seluruh riwayat pindaian lokal Anda.
                        </p>
                    </div>

                    {/* Dual Tab Buttons */}
                    <div
                        className="inline-flex p-1.5 rounded-2xl bg-stone-100 dark:bg-carbon-800 border border-stone-200 dark:border-carbon-700/60 self-start sm:self-auto shrink-0 shadow-sm"
                        role="tablist"
                        aria-label="Mode Pemindai dan Riwayat"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'scan'}
                            onClick={() => handleTabChange('scan')}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold min-h-[44px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 select-none ${
                                activeTab === 'scan'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-carbon-700/60'
                            }`}
                        >
                            <Camera className="w-4 h-4" />
                            <span>Pemindai Foto</span>
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'history'}
                            onClick={() => handleTabChange('history')}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold min-h-[44px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 select-none ${
                                activeTab === 'history'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-carbon-700/60'
                            }`}
                        >
                            <History className="w-4 h-4" />
                            <span>Riwayat Pindai</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* TAB VIEW 2: RIWAYAT PINDAI */}
            {activeTab === 'history' ? (
                <ScanHistory onSwitchToScanner={() => handleTabChange('scan')} />
            ) : (
                /* TAB VIEW 1: PEMINDAI FOTO & POST-SCAN DESTINATION FLOW */
                <div>
                    {/* Sample Buttons Section */}
                    <section className="bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 rounded-2xl p-5 mb-8 shadow-sm transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-sm font-semibold text-stone-900 dark:text-white">
                                Pilih Sampel Lapangan Cepat:
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
                                        className={`min-h-[44px] p-3.5 sm:p-4 rounded-xl text-left transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                            isActive
                                                ? 'bg-emerald-50 dark:bg-carbon-800 border-emerald-500 text-stone-900 dark:text-white ring-2 ring-emerald-500/20'
                                                : 'bg-stone-50 dark:bg-carbon-900 border-stone-200 dark:border-carbon-700/60 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:border-stone-300 dark:hover:border-carbon-600'
                                        }`}
                                    >
                                        <div className="text-xs text-stone-500 dark:text-stone-400">
                                            {btn.region} • {btn.commodity}
                                        </div>
                                        <div className="font-semibold text-sm text-stone-900 dark:text-white mt-1">
                                            {btn.label}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Main Scanner & Analysis Results Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                        {/* Left Column: Camera and Upload */}
                        <div className="lg:col-span-5 space-y-5">
                            <section className="bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 rounded-2xl p-6 shadow-sm transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                                        <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        Foto Spesimen
                                    </span>
                                    <span className="text-xs text-stone-500 dark:text-stone-400">
                                        Kompresi WebP Otomatis
                                    </span>
                                </div>

                                <div className="relative h-64 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-dashed border-stone-300 dark:border-carbon-700 flex flex-col items-center justify-center p-4 text-center overflow-hidden mb-4">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview Foto Spesimen"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="space-y-2 max-w-xs">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                                                <Cpu className="w-6 h-6" />
                                            </div>
                                            <div className="font-semibold text-sm text-stone-900 dark:text-white">
                                                {analysisResult?.detected_waste_type || 'Spesimen Terpilih'}
                                            </div>
                                            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                                Ambil foto tumpukan limbah di sawah atau kebun, atau pilih file gambar dari perangkat Anda.
                                            </p>
                                        </div>
                                    )}

                                    {isScanning && (
                                        <div className="absolute inset-0 bg-stone-900/80 dark:bg-carbon-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30 p-4">
                                            <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                                            <span className="text-xs text-emerald-300 text-center font-medium">
                                                Menganalisis kondisi limbah...
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <label className="w-full min-h-[44px] cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-carbon-800 hover:bg-stone-200 dark:hover:bg-carbon-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition border border-stone-300 dark:border-carbon-700 focus-within:ring-2 focus-within:ring-emerald-500">
                                    <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
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

                        {/* Right Column: Scan Analysis & Destination Flow */}
                        <div className="lg:col-span-7 space-y-6">
                            {analysisResult && (
                                <section className="bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
                                    {/* Badges Bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                                            Tingkat Akurasi: {Math.round(analysisResult.ai_confidence)}%
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                                isDryReady
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                                            }`}
                                        >
                                            {isDryReady ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            ) : (
                                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                            )}
                                            Kondisi: {analysisResult.moisture_condition}
                                        </span>
                                    </div>

                                    {/* Waste Identification Header */}
                                    <div className="mb-5">
                                        <div className="text-xs text-stone-500 dark:text-stone-400">
                                            Hasil Identifikasi Biomassa:
                                        </div>
                                        <h2 className="font-extrabold text-2xl text-stone-900 dark:text-white mt-0.5">
                                            {analysisResult.detected_waste_type}
                                        </h2>
                                    </div>

                                    {/* Nutrient Highlights */}
                                    {analysisResult.nutrient_highlights && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                                            {Object.entries(analysisResult.nutrient_highlights).map(([k, v]) => (
                                                <div
                                                    key={k}
                                                    className="p-3 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200/60 dark:border-carbon-800"
                                                >
                                                    <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{k}</div>
                                                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                                                        {v}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Soil Benefit Recommendation */}
                                    <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 mb-6">
                                        <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5 flex items-center gap-1.5">
                                            <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            Manfaat untuk Tanah:
                                        </div>
                                        <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                                            {analysisResult.ai_summary_recommendation}
                                        </p>
                                    </div>

                                    {/* DESTINATION SELECTION SECTION (R2) */}
                                    <div className="pt-6 border-t border-stone-200 dark:border-carbon-700/60 mb-6">
                                        <div className="mb-4">
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                                                Langkah Pasca-Pindai
                                            </span>
                                            <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                                                Tentukan Alur Tujuan Pengolahan Residu
                                            </h3>
                                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                                Pilih untuk menyetorkan biomassa ke sentra komunitas terdekat atau mengolahnya secara mandiri menggunakan metode kerucut Kon-Tiki.
                                            </p>
                                        </div>

                                        {/* Two Destination Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Alur Tujuan Pengolahan">
                                            {/* Choice 1: Setor ke Komunitas */}
                                            <button
                                                type="button"
                                                role="radio"
                                                aria-checked={destinationMode === 'komunitas'}
                                                onClick={() => setDestinationMode('komunitas')}
                                                className={`p-4 rounded-xl border text-left transition-all min-h-[52px] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                                    destinationMode === 'komunitas'
                                                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                                                        : 'border-stone-300 dark:border-carbon-700 bg-white dark:bg-carbon-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-carbon-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                        destinationMode === 'komunitas'
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-stone-200 dark:bg-carbon-800 text-stone-600 dark:text-stone-400'
                                                    }`}>
                                                        <Building2 className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-sm block">Setor ke Komunitas</span>
                                                        <span className="text-[11px] text-stone-500 dark:text-stone-400">Pusat & hub pirolisis</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-stone-600 dark:text-stone-300 mt-2.5 leading-relaxed">
                                                    Kirim limbah ke kelompok tani terdaftar untuk ditukar dengan biochar teraktivasi.
                                                </p>
                                            </button>

                                            {/* Choice 2: Olah Mandiri */}
                                            <button
                                                type="button"
                                                role="radio"
                                                aria-checked={destinationMode === 'mandiri'}
                                                onClick={() => setDestinationMode('mandiri')}
                                                className={`p-4 rounded-xl border text-left transition-all min-h-[52px] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                                    destinationMode === 'mandiri'
                                                        ? 'border-amber-600 bg-amber-50 text-amber-950 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200 ring-2 ring-amber-500/20'
                                                        : 'border-stone-300 dark:border-carbon-700 bg-white dark:bg-carbon-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-carbon-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                        destinationMode === 'mandiri'
                                                            ? 'bg-amber-600 text-white'
                                                            : 'bg-stone-200 dark:bg-carbon-800 text-stone-600 dark:text-stone-400'
                                                    }`}>
                                                        <Flame className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-sm block">Olah Mandiri</span>
                                                        <span className="text-[11px] text-stone-500 dark:text-stone-400">Metode Kon-Tiki di lahan</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-stone-600 dark:text-stone-300 mt-2.5 leading-relaxed">
                                                    Ikuti 3 tahapan teknis pembakaran tudung api terbuka bebas asap pekat.
                                                </p>
                                            </button>
                                        </div>

                                        {/* Toast Feedback */}
                                        {destinationToast && (
                                            <div className="mt-4 p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span>{destinationToast}</span>
                                            </div>
                                        )}

                                        {/* DETAIL VIEW A: SETOR KE KOMUNITAS */}
                                        {destinationMode === 'komunitas' && (
                                            <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 space-y-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                                                        <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                        Pilih Sentra Penerima Limbah:
                                                    </div>

                                                    {/* Regency Filter Pills */}
                                                    <div className="flex flex-wrap items-center gap-1">
                                                        {REGENCY_OPTIONS.map((regOption) => (
                                                            <button
                                                                key={regOption}
                                                                type="button"
                                                                onClick={() => setCommunityRegencyFilter(regOption)}
                                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition min-h-[32px] ${
                                                                    communityRegencyFilter === regOption
                                                                        ? 'bg-emerald-600 text-white'
                                                                        : 'bg-stone-200 dark:bg-carbon-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-carbon-700'
                                                                }`}
                                                            >
                                                                {regOption}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Communities List */}
                                                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                                    {filteredCommunities.map((hub) => {
                                                        const isSelected = selectedCommunityId === hub.id;
                                                        return (
                                                            <div
                                                                key={hub.id}
                                                                onClick={() => setSelectedCommunityId(hub.id)}
                                                                className={`p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                                                                    isSelected
                                                                        ? 'border-emerald-600 bg-white dark:bg-carbon-850 ring-2 ring-emerald-500/20'
                                                                        : 'border-stone-200 dark:border-carbon-700/60 bg-white/70 dark:bg-carbon-850/60 hover:bg-white dark:hover:bg-carbon-850'
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-stone-900 dark:text-white text-sm">
                                                                                {hub.name}
                                                                            </span>
                                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                                                {hub.regency}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-stone-600 dark:text-stone-400 mt-1 flex items-start gap-1">
                                                                            <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                                                                            <span>{hub.address}</span>
                                                                        </p>
                                                                    </div>

                                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                                                        isSelected
                                                                            ? 'border-emerald-600 bg-emerald-600 text-white'
                                                                            : 'border-stone-300 dark:border-carbon-600'
                                                                    }`}>
                                                                        {isSelected && <Check className="w-3 h-3" />}
                                                                    </div>
                                                                </div>

                                                                <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-carbon-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                                                                    <span className="flex items-center gap-1">
                                                                        <Phone className="w-3 h-3" />
                                                                        {hub.contactPerson} ({hub.phone})
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {hub.operatingHours}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Selected Hub Action Banner */}
                                                {activeCommunity && (
                                                    <div className="p-3.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                        <div>
                                                            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium block">
                                                                Sentra Terpilih:
                                                            </span>
                                                            <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                                                                {activeCommunity.name}
                                                            </span>
                                                            <span className="text-[11px] text-stone-600 dark:text-stone-300 block">
                                                                Insentif: {activeCommunity.incentive}
                                                            </span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleConfirmDestination('komunitas')}
                                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white min-h-[44px] transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                        >
                                                            <span>Konfirmasi Setor ke Komunitas Ini</span>
                                                            <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* DETAIL VIEW B: OLAH MANDIRI (3-STEP KON-TIKI GUIDE) */}
                                        {destinationMode === 'mandiri' && (
                                            <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-amber-50/50 dark:bg-carbon-900 border border-amber-200 dark:border-carbon-800 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                                                        <Flame className="w-4 h-4 text-amber-500" />
                                                        3 Langkah Pirolisis Mandiri Metode Kon-Tiki:
                                                    </div>
                                                    <span className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                                                        Tudung Api Terbuka Bebas Asap
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    {/* Step 1 */}
                                                    <div className="p-3.5 rounded-xl bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 text-xs sm:text-sm">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <div className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                                                                    1
                                                                </span>
                                                                <span>Persiapan Biomassa</span>
                                                            </div>
                                                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                                                                Kadar Air &lt; 18%
                                                            </span>
                                                        </div>
                                                        <p className="text-stone-600 dark:text-stone-300 ml-7 leading-relaxed">
                                                            Sortir material asing (tanah, batu, plastik). Jemur di bawah terik matahari 1-2 hari hingga berbunyi renyah patah saat ditekuk.
                                                        </p>
                                                        <div className="ml-7 mt-2 flex items-center justify-between">
                                                            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                                                                Parameter: Kadar air target &lt; 18%.
                                                            </span>
                                                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-emerald-700 dark:text-emerald-400 select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={completedSteps.includes(1)}
                                                                    onChange={() => toggleStep(1)}
                                                                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                                                />
                                                                <span>Bahan Siap</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Step 2 */}
                                                    <div className="p-3.5 rounded-xl bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 text-xs sm:text-sm">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <div className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                                                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">
                                                                    2
                                                                </span>
                                                                <span>Pembakaran Terkendali Kon-Tiki</span>
                                                            </div>
                                                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-medium">
                                                                Suhu 500 - 650°C
                                                            </span>
                                                        </div>
                                                        <p className="text-stone-600 dark:text-stone-300 ml-7 leading-relaxed">
                                                            Gunakan tungku kerucut Kon-Tiki sudut 45 derajat. Nyalakan dari pucuk atas (Top-Lit Updraft). Masukkan limbah bertahap lapis demi lapis saat lapisan bawah membara merah tanpa menimbulkan asap putih pekat.
                                                        </p>
                                                        <div className="ml-7 mt-2 flex items-center justify-between">
                                                            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                                                                Parameter: Tudung api bersih 45 - 60 menit.
                                                            </span>
                                                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-amber-700 dark:text-amber-400 select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={completedSteps.includes(2)}
                                                                    onChange={() => toggleStep(2)}
                                                                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                                                                />
                                                                <span>Pirolisis Tuntas</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Step 3 */}
                                                    <div className="p-3.5 rounded-xl bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 text-xs sm:text-sm">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <div className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                                                                    3
                                                                </span>
                                                                <span>Pemadaman & Aktivasi Biochar</span>
                                                            </div>
                                                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                                                                Quenching Nutrisi
                                                            </span>
                                                        </div>
                                                        <p className="text-stone-600 dark:text-stone-300 ml-7 leading-relaxed">
                                                            Lakukan pemadaman segera saat bara memenuhi 85% volume tungku sebelum jadi abu putih. Siram larutan MOL / air cucian beras untuk inokulasi mikropori. Tiriskan 12 jam sebelum diaplikasikan ke lahan.
                                                        </p>
                                                        <div className="ml-7 mt-2 flex items-center justify-between">
                                                            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                                                                Parameter: Biochar dingin &lt; 40°C, dosis 1.5 - 2 ton/Ha.
                                                            </span>
                                                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-emerald-700 dark:text-emerald-400 select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={completedSteps.includes(3)}
                                                                    onChange={() => toggleStep(3)}
                                                                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                                                />
                                                                <span>Aktivasi Selesai</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleConfirmDestination('mandiri')}
                                                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white min-h-[44px] transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                                >
                                                    <Flame className="w-4 h-4" />
                                                    <span>Simpan Rencana Olah Mandiri ke Riwayat</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Existing Community Map Documentation Form */}
                                    <form
                                        onSubmit={handleSaveToCommunityLog}
                                        className="pt-6 border-t border-stone-200 dark:border-carbon-700/60 space-y-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                Simpan Dokumentasi ke Peta Komunitas Publik
                                            </div>
                                            <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                                                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label htmlFor="farmer-group-input" className="block text-xs text-stone-700 dark:text-stone-300 mb-1 font-medium">
                                                    Nama Kelompok Tani *
                                                </label>
                                                <input
                                                    id="farmer-group-input"
                                                    type="text"
                                                    required
                                                    value={farmerGroup}
                                                    onChange={(e) => setFarmerGroup(e.target.value)}
                                                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-carbon-900 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
                                                />
                                                {errors.farmer_group_name && (
                                                    <p className="text-xs text-amber-500 mt-1">{errors.farmer_group_name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label htmlFor="village-input" className="block text-xs text-stone-700 dark:text-stone-300 mb-1 font-medium">
                                                    Desa & Kecamatan *
                                                </label>
                                                <input
                                                    id="village-input"
                                                    type="text"
                                                    required
                                                    value={villageLocation}
                                                    onChange={(e) => setVillageLocation(e.target.value)}
                                                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-carbon-900 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
                                                />
                                                {errors.village_location && (
                                                    <p className="text-xs text-amber-500 mt-1">{errors.village_location}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label htmlFor="regency-select" className="block text-xs text-stone-700 dark:text-stone-300 mb-1 font-medium">
                                                    Kabupaten Sentra *
                                                </label>
                                                <select
                                                    id="regency-select"
                                                    value={regency}
                                                    onChange={(e) => handleRegencyChange(e.target.value)}
                                                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-carbon-900 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
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
                                                className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-carbon-900 hover:bg-stone-100 dark:hover:bg-carbon-800 border border-stone-300 dark:border-carbon-700 text-xs font-medium text-stone-800 dark:text-stone-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
                                            >
                                                <Crosshair className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span>
                                                    {gpsStatus === 'loading'
                                                        ? 'Mencari GPS...'
                                                        : 'Gunakan GPS Saat Ini'}
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setShowPinPicker((prev) => !prev)}
                                                className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-carbon-900 hover:bg-stone-100 dark:hover:bg-carbon-800 border border-stone-300 dark:border-carbon-700 text-xs font-medium text-stone-800 dark:text-stone-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                            >
                                                <MapIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <span>
                                                    {showPinPicker ? 'Sembunyikan Peta Pin' : 'Sesuaikan Pin Manual'}
                                                </span>
                                            </button>
                                        </div>

                                        {gpsMessage && (
                                            <p
                                                className={`text-xs ${
                                                    gpsStatus === 'error' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                                                }`}
                                            >
                                                {gpsMessage}
                                            </p>
                                        )}

                                        {showPinPicker && (
                                            <div className="space-y-1.5">
                                                <p className="text-xs text-stone-600 dark:text-stone-400">
                                                    Klik langsung pada peta untuk memindahkan pin titik lokasi lahan:
                                                </p>
                                                <div
                                                    ref={pinMapContainerRef}
                                                    className="w-full h-52 rounded-xl overflow-hidden border border-stone-300 dark:border-carbon-700 z-10"
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
                </div>
            )}
        </AppLayout>
    );
}
