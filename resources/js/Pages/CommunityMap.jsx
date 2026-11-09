import React, { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import L from 'leaflet';
import AppLayout from '@/Layouts/AppLayout';
import Interactive3DCard from '@/Components/Interactive3DCard';
import {
    MapPin,
    Search,
    CheckCircle2,
    AlertCircle,
    Camera,
    Sparkles,
    Globe,
} from 'lucide-react';

const CLUSTER_VIEWS = {
    all: { label: 'Semua Wilayah (Nasional)', center: [-5.4, 115.6], zoom: 6 },
    jatim: { label: 'Klaster Jawa Timur (Lamongan, Ngawi, Malang)', center: [-7.55, 112.15], zoom: 8 },
    sulbar: { label: 'Klaster Sulawesi Barat (Majene & Polman)', center: [-3.32, 119.05], zoom: 9 },
};

export default function CommunityMap({ scans = [] }) {
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

    // Initialize Dark-Mode Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: CLUSTER_VIEWS.all.center,
            zoom: CLUSTER_VIEWS.all.zoom,
            scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO Dark Matter',
            maxZoom: 18,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Update Map Markers whenever filteredScans changes
    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current) return;

        markersLayerRef.current.clearLayers();

        filteredScans.forEach((scan) => {
            const isDry = scan.moisture_condition.toLowerCase().includes('kering');
            const color = isDry ? '#10B981' : '#F59E0B';

            const marker = L.circleMarker([scan.latitude, scan.longitude], {
                radius: 9,
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.88,
            });

            marker.bindPopup(`
                <div style="font-family: Outfit, sans-serif; min-width: 210px;">
                    <div style="font-size: 10px; font-family: JetBrains Mono, monospace; color: #34D399; text-transform: uppercase;">
                        ${scan.regency} • AI ${scan.ai_confidence}%
                    </div>
                    <div style="font-weight: 700; font-size: 14px; margin-top: 2px; color: #ffffff;">
                        ${scan.farmer_group_name}
                    </div>
                    <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 6px;">
                        ${scan.village_location}
                    </div>
                    <div style="padding: 6px; border-radius: 8px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.35); font-size: 11px; color: #a7f3d0;">
                        <strong>Limbah:</strong> ${scan.detected_waste_type}<br/>
                        <strong>Status:</strong> ${scan.moisture_condition}
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
                { duration: 1.2 }
            );
        }
    };

    return (
        <AppLayout>
            <Head title="Peta & Log Dokumentasi Kelompok Tani"/>

            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-xs font-mono text-emerald-300 mb-3">
                        <Globe className="w-3.5 h-3.5 text-cyan-400"/>
                        GIS SPATIAL TELEMETRY • JAWA TIMUR & SULAWESI BARAT
                    </div>
                    <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
                        Peta Sebaran & Log Dokumentasi Kelompok Tani
                    </h1>
                    <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-2xl">
                        Pantau titik pemindaian limbah panen dan kesiapan pengolahan biochar secara spasial di klaster Lamongan, Ngawi, Malang, Majene, dan Polewali Mandar.
                    </p>
                </div>

                <Link className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-display font-bold text-sm hover:bg-emerald-400 transition" href="/scanner">
                    <Camera className="w-4 h-4"/>
                    + Tambah Titik Dokumentasi
                </Link>
            </div>

            {/* Cluster Jump Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                    {Object.entries(CLUSTER_VIEWS).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => handleClusterChange(key)}
                            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition ${
                                activeCluster === key
                                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                    : 'glass-panel text-slate-300 hover:text-white'
                            }`}
                        >
                            {cfg.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                        Kering Siap Olah
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                        Basah (Perlu Jemur)
                    </span>
                </div>
            </div>

            {/* Interactive Dark-Mode Leaflet Map Card */}
            <div className="glass-panel rounded-3xl p-3 mb-10 border border-emerald-500/30">
                <div
                    ref={mapContainerRef}
                    className="w-full h-[420px] rounded-2xl overflow-hidden z-10"
                />
            </div>

            {/* Searchable & Filterable Community Activity Data Table */}
            <Interactive3DCard className="p-6 sm:p-8" intensity="{3}">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <span className="text-xs font-mono text-emerald-400 uppercase">
                            DATABASE LOG KOMUNITAS ({filteredScans.length} REKAMAN)
                        </span>
                        <h2 className="font-display font-bold text-2xl text-white">
                            Tabel Aktivitas Pemindaian Limbah Kelompok Tani
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                            <input
                                type="text"
                                placeholder="Cari Poktan, Desa, Kabupaten..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-xl bg-slate-950/90 border border-slate-700 text-xs text-white focus:border-emerald-400 focus:outline-none"
                            />
                        </div>

                        <select
                            value={wasteTypeFilter}
                            onChange={(e) => setWasteTypeFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-700 text-xs text-white focus:border-emerald-400 focus:outline-none font-mono"
                        >
                            <option value="Semua">Semua Jenis Biomassa</option>
                            <option value="Jerami">Jerami Padi</option>
                            <option value="Sekam">Sekam Padi</option>
                            <option value="Tongkol">Tongkol Jagung</option>
                            <option value="Kakao">Kulit Buah Kakao</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                                <th className="py-3.5 px-4">Kelompok Tani & Lokasi</th>
                                <th className="py-3.5 px-4">Kabupaten</th>
                                <th className="py-3.5 px-4">Jenis Limbah Terdeteksi</th>
                                <th className="py-3.5 px-4">Kondisi Kelembaban</th>
                                <th className="py-3.5 px-4">Akurasi AI</th>
                                <th className="py-3.5 px-4">Rekomendasi Biochar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70 text-xs sm:text-sm">
                            {filteredScans.map((scan) => {
                                const isDry = scan.moisture_condition
                                    .toLowerCase()
                                    .includes('kering');
                                return (
                                    <tr key={scan.id} className="hover:bg-slate-900/50 transition">
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-white">
                                                {scan.farmer_group_name}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {scan.village_location}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-xs text-cyan-300">
                                            {scan.regency}
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-emerald-200">
                                            {scan.detected_waste_type}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold ${
                                                    isDry
                                                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                                }`}
                                            >
                                                {isDry ? (
                                                    <CheckCircle2 className="w-3 h-3"/>
                                                ) : (
                                                    <AlertCircle className="w-3 h-3"/>
                                                )}
                                                {scan.moisture_condition}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-300">
                                            {scan.ai_confidence}%
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs">
                                            {scan.ai_summary_recommendation}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Interactive3DCard>
        </AppLayout>
    );
}