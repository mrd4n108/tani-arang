import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import L from 'leaflet';
import AppLayout from '@/Layouts/AppLayout';
import {
    MapPin,
    Search,
    CheckCircle2,
    AlertCircle,
    Camera,
    RotateCcw,
} from 'lucide-react';

const CLUSTER_VIEWS = {
    all: { label: 'Semua Wilayah', center: [-5.4, 115.6], zoom: 6 },
    jatim: { label: 'Jawa Timur', center: [-7.55, 112.15], zoom: 8 },
    sulbar: { label: 'Sulawesi Barat', center: [-3.32, 119.05], zoom: 9 },
};

export default function CommunityMap({ scans = [] }) {
    const { flash } = usePage().props;
    const [dismissFlash, setDismissFlash] = useState(false);

    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);

    const [activeCluster, setActiveCluster] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [wasteTypeFilter, setWasteTypeFilter] = useState('Semua');

    const filteredScans = scans.filter((scan) => {
        const matchesCluster =
            activeCluster === 'all' ||
            (activeCluster === 'jatim' &&
                ['Lamongan', 'Ngawi', 'Malang'].includes(scan.regency)) ||
            (activeCluster === 'sulbar' &&
                ['Majene', 'Polewali Mandar'].includes(scan.regency));

        const matchesWaste =
            wasteTypeFilter === 'Semua' ||
            scan.detected_waste_type.toLowerCase().includes(wasteTypeFilter.toLowerCase());

        const matchesSearch =
            scan.farmer_group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            scan.village_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            scan.regency.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCluster && matchesWaste && matchesSearch;
    });

    const resetFilters = () => {
        setSearchQuery('');
        setWasteTypeFilter('Semua');
        handleClusterChange('all');
    };

    // Initialize Dark Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: CLUSTER_VIEWS.all.center,
            zoom: CLUSTER_VIEWS.all.zoom,
            scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO Dark Matter',
            maxZoom: 18,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Update Map Markers
    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current) return;

        markersLayerRef.current.clearLayers();

        filteredScans.forEach((scan) => {
            const isDry = scan.moisture_condition.toLowerCase().includes('kering');
            const color = isDry ? '#22C55E' : '#F59E0B';

            const marker = L.circleMarker([scan.latitude, scan.longitude], {
                radius: 8,
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9,
            });

            marker.bindPopup(`
                <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 200px; color: #ffffff; padding: 4px;">
                    <div style="font-size: 11px; color: #4ADE80; font-weight: 600;">
                        ${scan.regency} • Akurasi ${Math.round(scan.ai_confidence)}%
                    </div>
                    <div style="font-weight: 700; font-size: 14px; margin-top: 3px; color: #ffffff;">
                        ${scan.farmer_group_name}
                    </div>
                    <div style="font-size: 12px; color: #A8A29E; margin-bottom: 6px;">
                        ${scan.village_location}
                    </div>
                    <div style="padding: 6px 8px; border-radius: 8px; background: rgba(34,197,94,0.15); font-size: 11px; color: #D1FAE5; line-height: 1.4;">
                        <strong>Limbah:</strong> ${scan.detected_waste_type}<br/>
                        <strong>Kondisi:</strong> ${scan.moisture_condition}
                    </div>
                </div>
            `);

            markersLayerRef.current.addLayer(marker);
        });
    }, [filteredScans]);

    const handleClusterChange = (clusterKey) => {
        setActiveCluster(clusterKey);
        if (mapInstanceRef.current && CLUSTER_VIEWS[clusterKey]) {
            mapInstanceRef.current.flyTo(
                CLUSTER_VIEWS[clusterKey].center,
                CLUSTER_VIEWS[clusterKey].zoom,
                { duration: 1.1 }
            );
        }
    };

    return (
        <AppLayout>
            <Head title="Peta Sebaran & Log Dokumentasi Kelompok Tani" />

            {/* Flash Feedback */}
            {flash?.success && !dismissFlash && (
                <div
                    role="alert"
                    className="mb-8 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-start justify-between gap-3 text-emerald-200"
                >
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <div className="font-bold text-sm text-white">
                                Data Berhasil Disimpan
                            </div>
                            <p className="text-xs text-emerald-300 mt-0.5">
                                {flash.success}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDismissFlash(true)}
                        className="text-xs text-emerald-300 hover:text-white px-2 py-1 rounded bg-emerald-900/60 transition"
                    >
                        Tutup
                    </button>
                </div>
            )}

            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-sm font-semibold text-emerald-400 block mb-2">
                        Pemetaan Lapangan Kelompok Tani
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Peta Sebaran & Log Komunitas
                    </h1>
                    <p className="text-stone-300 text-base mt-2 max-w-2xl leading-relaxed">
                        Pantau sebaran titik residu panen dan kesiapan pengolahan biochar di Lamongan, Ngawi, Malang, Majene, dan Polewali Mandar.
                    </p>
                </div>

                <Link
                    href="/scanner"
                    className="shrink-0 min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-sm"
                >
                    <Camera className="w-4 h-4 shrink-0" />
                    <span>+ Tambah Titik Baru</span>
                </Link>
            </header>

            {/* Cluster Switcher & Legend Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                    {Object.entries(CLUSTER_VIEWS).map(([key, cfg]) => {
                        const isActive = activeCluster === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleClusterChange(key)}
                                className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                                    isActive
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-carbon-850 border border-carbon-700/60 text-stone-300 hover:text-white hover:border-carbon-600'
                                }`}
                            >
                                {cfg.label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-300 bg-carbon-850 border border-carbon-700/60 px-4 py-2 rounded-xl">
                    <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        <span>Kering Siap Olah</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        <span>Basah (Perlu Dijemur)</span>
                    </span>
                </div>
            </div>

            {/* Interactive Leaflet Map Card */}
            <section className="bg-carbon-850 border border-carbon-700/60 rounded-2xl p-3 sm:p-4 mb-10">
                <div
                    ref={mapContainerRef}
                    className="w-full h-[440px] rounded-xl overflow-hidden z-10"
                />
            </section>

            {/* Searchable Data Table Section */}
            <section className="bg-carbon-850 border border-carbon-700/60 rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Log Dokumentasi Komunitas
                        </h2>
                        <p className="text-xs text-stone-400 mt-1">
                            {filteredScans.length} data pemindaian terekam di sistem
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[220px]">
                            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari Poktan, Desa, Kabupaten..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full min-h-[42px] pl-10 pr-4 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-xs text-white placeholder-stone-500 focus:border-emerald-500 focus:outline-none transition"
                            />
                        </div>

                        <select
                            value={wasteTypeFilter}
                            onChange={(e) => setWasteTypeFilter(e.target.value)}
                            className="min-h-[42px] px-3.5 py-2 rounded-xl bg-carbon-900 border border-carbon-700 text-xs text-white focus:border-emerald-500 focus:outline-none transition"
                        >
                            <option value="Semua">Semua Jenis Biomassa</option>
                            <option value="Jerami">Jerami Padi</option>
                            <option value="Sekam">Sekam Padi</option>
                            <option value="Tongkol">Tongkol Jagung</option>
                            <option value="Kakao">Kulit Buah Kakao</option>
                        </select>
                    </div>
                </div>

                {filteredScans.length === 0 ? (
                    <div className="p-8 rounded-xl bg-carbon-900 border border-carbon-700/60 text-center flex flex-col items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                        <div className="font-bold text-sm text-stone-200">
                            Tidak Ada Data yang Cocok
                        </div>
                        <p className="text-xs text-stone-400 max-w-sm mt-1 mb-4 leading-relaxed">
                            Tidak ditemukan rekaman pemindaian untuk kata kunci atau wilayah yang dipilih.
                        </p>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-white text-xs font-semibold transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Reset Semua Filter</span>
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-carbon-700/60">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-carbon-700/60 bg-carbon-900 text-xs text-stone-400 uppercase font-medium">
                                    <th className="py-3.5 px-4">Kelompok Tani & Lokasi</th>
                                    <th className="py-3.5 px-4">Kabupaten</th>
                                    <th className="py-3.5 px-4">Jenis Limbah</th>
                                    <th className="py-3.5 px-4">Kondisi</th>
                                    <th className="py-3.5 px-4">Akurasi</th>
                                    <th className="py-3.5 px-4">Rekomendasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-carbon-800 text-xs sm:text-sm bg-carbon-900/60">
                                {filteredScans.map((scan) => {
                                    const isDry = scan.moisture_condition
                                        .toLowerCase()
                                        .includes('kering');
                                    return (
                                        <tr key={scan.id} className="hover:bg-carbon-800/40 transition">
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-white">
                                                    {scan.farmer_group_name}
                                                </div>
                                                <div className="text-xs text-stone-400">
                                                    {scan.village_location}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-emerald-400 font-medium">
                                                {scan.regency}
                                            </td>
                                            <td className="py-3.5 px-4 text-stone-200">
                                                {scan.detected_waste_type}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        isDry
                                                            ? 'bg-emerald-950/70 text-emerald-300'
                                                            : 'bg-amber-950/70 text-amber-300'
                                                    }`}
                                                >
                                                    {isDry ? (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                    ) : (
                                                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                    )}
                                                    <span>{scan.moisture_condition}</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-emerald-400">
                                                {Math.round(scan.ai_confidence)}%
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-stone-300 max-w-xs leading-relaxed">
                                                {scan.ai_summary_recommendation}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AppLayout>
    );
}
