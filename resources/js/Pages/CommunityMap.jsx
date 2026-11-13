import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import L from 'leaflet';
import AppLayout from '@/Layouts/AppLayout';
import {
    MapPin,
    Search,
    CheckCircle2,
    AlertCircle,
    Camera,
    RotateCcw,
    Eye,
    Trash2,
    ArchiveRestore,
    X,
    Layers,
    Leaf,
} from 'lucide-react';

const CLUSTER_VIEWS = {
    all: { label: 'Semua Wilayah', center: [-5.4, 115.6], zoom: 6 },
    jatim: { label: 'Jawa Timur', center: [-7.55, 112.15], zoom: 8 },
    sulbar: { label: 'Sulawesi Barat', center: [-3.32, 119.05], zoom: 9 },
};

const PROCESSING_STATUSES = ['Belum diolah', 'Diproses', 'Selesai'];

function getStatusBadgeClass(status) {
    if (status === 'Selesai') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300';
    if (status === 'Diproses') return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300';
    return 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300';
}

export default function CommunityMap({ scans = [], trashedScans = [] }) {
    const { flash } = usePage().props;
    const [dismissFlash, setDismissFlash] = useState(false);

    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const markerByIdRef = useRef({});
    const rowByIdRef = useRef({});

    const detailDialogRef = useRef(null);
    const archiveDialogRef = useRef(null);

    const [activeCluster, setActiveCluster] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [wasteTypeFilter, setWasteTypeFilter] = useState('Semua');
    const [statusFilter, setStatusFilter] = useState('Semua');

    const [selectedScanId, setSelectedScanId] = useState(null);
    const [modalScan, setModalScan] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [isMutating, setIsMutating] = useState(false);

    const filteredScans = scans.filter((scan) => {
        const currentStatus = scan.processing_status || 'Belum diolah';
        const matchesCluster =
            activeCluster === 'all' ||
            (activeCluster === 'jatim' &&
                ['Lamongan', 'Ngawi', 'Malang'].includes(scan.regency)) ||
            (activeCluster === 'sulbar' &&
                ['Majene', 'Polewali Mandar'].includes(scan.regency));
        const matchesWaste =
            wasteTypeFilter === 'Semua' ||
            scan.detected_waste_type.toLowerCase().includes(wasteTypeFilter.toLowerCase());
        const matchesStatus =
            statusFilter === 'Semua' || currentStatus === statusFilter;
        const matchesSearch =
            scan.farmer_group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            scan.village_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            scan.regency.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCluster && matchesWaste && matchesStatus && matchesSearch;
    });

    const resetFilters = () => {
        setSearchQuery('');
        setWasteTypeFilter('Semua');
        setStatusFilter('Semua');
        setSelectedScanId(null);
        handleClusterChange('all');
    };

    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const isDarkInitial = document.documentElement.classList.contains('dark');
        const darkTile = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        const lightTile = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        const map = L.map(mapContainerRef.current, {
            center: CLUSTER_VIEWS.all.center,
            zoom: CLUSTER_VIEWS.all.zoom,
            scrollWheelZoom: true,
        });

        const tileLayer = L.tileLayer(isDarkInitial ? darkTile : lightTile, {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 18,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        const observer = new MutationObserver(() => {
            const isDarkNow = document.documentElement.classList.contains('dark');
            tileLayer.setUrl(isDarkNow ? darkTile : lightTile);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => {
            observer.disconnect();
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current) return;

        markersLayerRef.current.clearLayers();
        markerByIdRef.current = {};

        filteredScans.forEach((scan) => {
            const isDry = scan.moisture_condition.toLowerCase().includes('kering');
            const isSelected = scan.id === selectedScanId;
            const color = isDry ? '#16A34A' : '#D97706';
            const statusText = scan.processing_status || 'Belum diolah';

            const marker = L.circleMarker([scan.latitude, scan.longitude], {
                radius: isSelected ? 11 : 8,
                fillColor: color,
                color: isSelected ? '#10B981' : '#ffffff',
                weight: isSelected ? 3 : 2,
                opacity: 1,
                fillOpacity: 0.92,
            });

            marker.bindPopup(`
                <div style="font-family: inherit; min-width: 215px; padding: 2px;">
                    <div style="font-size: 11px; font-weight: 700; color: #16A34A;">
                        ${scan.regency} • Akurasi ${Math.round(scan.ai_confidence)}%
                    </div>
                    <div style="font-weight: 700; font-size: 14px; margin-top: 3px;" class="popup-title">
                        ${scan.farmer_group_name}
                    </div>
                    <div style="font-size: 12px; margin-bottom: 6px; opacity: 0.75;">
                        ${scan.village_location}
                    </div>
                    <div style="padding: 6px 8px; border-radius: 8px; font-size: 11px; line-height: 1.45; background: rgba(22,163,74,0.12); border: 1px solid rgba(22,163,74,0.25);">
                        <strong>Limbah:</strong> ${scan.detected_waste_type}<br/>
                        <strong>Kondisi:</strong> ${scan.moisture_condition}<br/>
                        <strong>Status:</strong> ${statusText}
                    </div>
                </div>
            `);

            marker.on('click', () => {
                setSelectedScanId(scan.id);
                const rowEl = rowByIdRef.current[scan.id];
                if (rowEl) {
                    rowEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });

            markersLayerRef.current.addLayer(marker);
            markerByIdRef.current[scan.id] = marker;
        });

        if (selectedScanId && markerByIdRef.current[selectedScanId]) {
            markerByIdRef.current[selectedScanId].openPopup();
        }
    }, [filteredScans, selectedScanId]);

    const handleClusterChange = (clusterKey) => {
        setActiveCluster(clusterKey);
        if (mapInstanceRef.current && CLUSTER_VIEWS[clusterKey]) {
            mapInstanceRef.current.flyTo(
                CLUSTER_VIEWS[clusterKey].center,
                CLUSTER_VIEWS[clusterKey].zoom,
                { duration: 1.0 }
            );
        }
    };

    const handleFocusOnMap = (scan) => {
        setSelectedScanId(scan.id);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([scan.latitude, scan.longitude], 14, {
                duration: 1.0,
            });
            const marker = markerByIdRef.current[scan.id];
            if (marker) {
                marker.openPopup();
            }
        }
    };

    const openDetailModal = (scan) => {
        setModalScan(scan);
        setConfirmDeleteId(null);
        if (detailDialogRef.current && !detailDialogRef.current.open) {
            detailDialogRef.current.showModal();
        }
    };

    const closeDetailModal = () => {
        if (detailDialogRef.current?.open) {
            detailDialogRef.current.close();
        }
        setModalScan(null);
        setConfirmDeleteId(null);
    };

    const openArchiveModal = () => {
        if (archiveDialogRef.current && !archiveDialogRef.current.open) {
            archiveDialogRef.current.showModal();
        }
    };

    const closeArchiveModal = () => {
        if (archiveDialogRef.current?.open) {
            archiveDialogRef.current.close();
        }
    };

    const handleStatusUpdate = (scanId, nextStatus) => {
        setIsMutating(true);
        setDismissFlash(false);
        router.patch(
            `/community-map/scans/${scanId}/status`,
            { processing_status: nextStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setModalScan((prev) =>
                        prev && prev.id === scanId
                            ? { ...prev, processing_status: nextStatus }
                            : prev
                    );
                },
                onFinish: () => setIsMutating(false),
            }
        );
    };

    const handleSoftDelete = (scanId) => {
        setIsMutating(true);
        setDismissFlash(false);
        router.delete(`/community-map/scans/${scanId}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedScanId === scanId) setSelectedScanId(null);
                closeDetailModal();
            },
            onFinish: () => setIsMutating(false),
        });
    };

    const handleRestore = (scanId) => {
        setIsMutating(true);
        setDismissFlash(false);
        router.post(
            `/community-map/scans/${scanId}/restore`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsMutating(false),
            }
        );
    };

    return (
        <AppLayout>
            <Head title="Peta Sebaran & Log Dokumentasi Kelompok Tani" />

            {flash?.success && !dismissFlash && (
                <div
                    role="alert"
                    className="mb-8 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-800/60 dark:text-emerald-200 flex items-start justify-between gap-3 shadow-sm"
                >
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <div className="font-bold text-sm text-stone-900 dark:text-white">
                                Pembaruan Berhasil
                            </div>
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                                {flash.success}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDismissFlash(true)}
                        className="min-h-[36px] text-xs text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                        Tutup
                    </button>
                </div>
            )}

            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 block mb-2">
                        Pemetaan Lapangan Kelompok Tani
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                        Peta Sebaran & Log Komunitas
                    </h1>
                    <p className="text-stone-600 dark:text-stone-300 text-base mt-2 max-w-2xl leading-relaxed">
                        Pantau sebaran titik residu panen dan kesiapan pengolahan biochar di Lamongan, Ngawi, Malang, Majene, dan Polewali Mandar.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {trashedScans.length > 0 && (
                        <button
                            type="button"
                            onClick={openArchiveModal}
                            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-carbon-850 hover:bg-stone-100 dark:hover:bg-carbon-800 border border-stone-200 dark:border-carbon-700 text-stone-700 dark:text-stone-200 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                            <ArchiveRestore className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                            <span>Arsip Terhapus ({trashedScans.length})</span>
                        </button>
                    )}
                    <Link
                        href="/scanner"
                        className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                        <Camera className="w-4 h-4 shrink-0" />
                        <span>Tambah Titik Baru</span>
                    </Link>
                </div>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                    {Object.entries(CLUSTER_VIEWS).map(([key, cfg]) => {
                        const isActive = activeCluster === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleClusterChange(key)}
                                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                    isActive
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:text-white hover:border-stone-300 dark:hover:border-carbon-600 shadow-sm'
                                }`}
                            >
                                {cfg.label}
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-4 text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 px-4 py-2.5 rounded-xl shadow-sm">
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

            <section className="bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 rounded-2xl p-3 sm:p-4 mb-10 shadow-sm transition-colors">
                <div
                    ref={mapContainerRef}
                    className="w-full h-[440px] rounded-xl overflow-hidden z-10"
                />
            </section>

            <section className="bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                            Log Dokumentasi Komunitas
                        </h2>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            {filteredScans.length} data pemindaian tampil • Klik baris untuk mengarahkan peta ke lokasi
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                aria-label="Cari kelompok tani atau desa"
                                placeholder="Cari Poktan, Desa, Kabupaten..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
                            />
                        </div>
                        <select
                            aria-label="Filter jenis biomassa"
                            value={wasteTypeFilter}
                            onChange={(e) => setWasteTypeFilter(e.target.value)}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
                        >
                            <option value="Semua">Semua Biomassa</option>
                            <option value="Jerami">Jerami Padi</option>
                            <option value="Sekam">Sekam Padi</option>
                            <option value="Tongkol">Tongkol Jagung</option>
                            <option value="Kakao">Kulit Buah Kakao</option>
                        </select>
                        <select
                            aria-label="Filter status pengolahan"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
                        >
                            <option value="Semua">Semua Status</option>
                            {PROCESSING_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {filteredScans.length === 0 ? (
                    <div className="p-8 rounded-xl bg-stone-50 dark:bg-carbon-900 text-center flex flex-col items-center justify-center border border-stone-200 dark:border-carbon-800">
                        <AlertCircle className="w-10 h-10 text-amber-500 dark:text-amber-400 mb-2" />
                        <div className="font-bold text-sm text-stone-900 dark:text-stone-200">
                            Tidak Ada Data yang Cocok
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mt-1 mb-4 leading-relaxed">
                            Tidak ditemukan rekaman pemindaian untuk kata kunci, status, atau wilayah yang dipilih.
                        </p>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-carbon-800 dark:hover:bg-carbon-700 text-stone-800 dark:text-white text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Reset Semua Filter</span>
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-carbon-700/60">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-stone-200 dark:border-carbon-700/60 bg-stone-100 dark:bg-carbon-900 text-xs text-stone-700 dark:text-stone-400 font-semibold">
                                    <th className="py-3.5 px-4">Kelompok Tani & Lokasi</th>
                                    <th className="py-3.5 px-4">Jenis Limbah</th>
                                    <th className="py-3.5 px-4">Kondisi</th>
                                    <th className="py-3.5 px-4">Status Biochar</th>
                                    <th className="py-3.5 px-4">Akurasi</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200 dark:divide-carbon-800 text-xs sm:text-sm bg-white dark:bg-carbon-900/60">
                                {filteredScans.map((scan) => {
                                    const isDry = scan.moisture_condition
                                        .toLowerCase()
                                        .includes('kering');
                                    const isSelected = scan.id === selectedScanId;
                                    const currentStatus = scan.processing_status || 'Belum diolah';

                                    return (
                                        <tr
                                            key={scan.id}
                                            ref={(el) => {
                                                rowByIdRef.current[scan.id] = el;
                                            }}
                                            onClick={() => handleFocusOnMap(scan)}
                                            className={`cursor-pointer transition ${
                                                isSelected
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/40'
                                                    : 'hover:bg-stone-50 dark:hover:bg-carbon-800/50'
                                            }`}
                                        >
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                                                    <span>{scan.farmer_group_name}</span>
                                                </div>
                                                <div className="text-xs text-stone-500 dark:text-stone-400">
                                                    {scan.village_location} •{' '}
                                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                                        {scan.regency}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-stone-800 dark:text-stone-200 font-medium">
                                                {scan.detected_waste_type}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        isDry
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                                                    }`}
                                                >
                                                    {isDry ? (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                    ) : (
                                                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                    )}
                                                    <span>{scan.moisture_condition}</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                                        currentStatus
                                                    )}`}
                                                >
                                                    {currentStatus}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                                {Math.round(scan.ai_confidence)}%
                                            </td>
                                            <td
                                                className="py-3.5 px-4 text-right"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="inline-flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        aria-label={`Fokus peta ke ${scan.farmer_group_name}`}
                                                        onClick={() => handleFocusOnMap(scan)}
                                                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-carbon-800 dark:hover:bg-carbon-700 text-stone-700 dark:text-stone-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                    >
                                                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openDetailModal(scan)}
                                                        className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-carbon-800 dark:hover:bg-carbon-700 text-stone-800 dark:text-white text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                        <span>Detail</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <dialog
                ref={detailDialogRef}
                onClose={closeDetailModal}
                className="backdrop:bg-stone-900/40 dark:backdrop:bg-carbon-950/80 bg-white dark:bg-carbon-850 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-carbon-700/80 rounded-2xl max-w-2xl w-[calc(100%-2rem)] p-0 shadow-2xl"
            >
                {modalScan && (
                    <div className="p-6 sm:p-8 space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">
                                    Dokumentasi Lapangan • {modalScan.regency}
                                </span>
                                <h3 className="text-xl font-extrabold text-stone-900 dark:text-white mt-0.5">
                                    {modalScan.farmer_group_name}
                                </h3>
                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                    {modalScan.village_location}
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Tutup dialog detail"
                                onClick={closeDetailModal}
                                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-carbon-900 dark:hover:bg-carbon-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                            <div className="sm:col-span-5 h-40 rounded-xl bg-stone-100 dark:bg-carbon-900 overflow-hidden flex items-center justify-center border border-stone-200 dark:border-carbon-800">
                                <img
                                    src={modalScan.image_path || '/demo/community-verified.webp'}
                                    alt={`Foto spesimen ${modalScan.detected_waste_type}`}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="sm:col-span-7 space-y-2.5">
                                <div>
                                    <div className="text-xs text-stone-500 dark:text-stone-400">Jenis Limbah Terdeteksi</div>
                                    <div className="text-base font-bold text-stone-900 dark:text-white">
                                        {modalScan.detected_waste_type}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                                        Akurasi: {Math.round(modalScan.ai_confidence)}%
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                                        {modalScan.moisture_condition}
                                    </span>
                                </div>
                                <div className="text-xs font-mono text-stone-500 dark:text-stone-400">
                                    Koordinat: {Number(modalScan.latitude).toFixed(6)},{' '}
                                    {Number(modalScan.longitude).toFixed(6)}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                                <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                Manfaat Agronomi Biochar:
                            </div>
                            <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                                {modalScan.ai_summary_recommendation}
                            </p>
                        </div>

                        {Array.isArray(modalScan.ai_next_steps) && modalScan.ai_next_steps.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    Langkah Pengolahan Arang Pertanian:
                                </div>
                                <ol className="space-y-2">
                                    {modalScan.ai_next_steps.map((step, idx) => (
                                        <li
                                            key={idx}
                                            className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200/70 dark:border-carbon-800 text-xs text-stone-800 dark:text-stone-200"
                                        >
                                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            <span className="leading-relaxed">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        <div className="pt-4 border-t border-stone-200 dark:border-carbon-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                                    Perbarui Status Pengolahan:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {PROCESSING_STATUSES.map((statusOption) => {
                                        const active =
                                            (modalScan.processing_status || 'Belum diolah') ===
                                            statusOption;
                                        return (
                                            <button
                                                key={statusOption}
                                                type="button"
                                                disabled={isMutating}
                                                onClick={() =>
                                                    handleStatusUpdate(modalScan.id, statusOption)
                                                }
                                                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                                    active
                                                        ? 'bg-emerald-600 text-white shadow-sm'
                                                        : 'bg-stone-100 hover:bg-stone-200 dark:bg-carbon-900 dark:hover:bg-carbon-800 text-stone-700 dark:text-stone-300'
                                                }`}
                                            >
                                                {statusOption}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="self-end">
                                {confirmDeleteId === modalScan.id ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={isMutating}
                                            onClick={() => handleSoftDelete(modalScan.id)}
                                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition"
                                        >
                                            Ya, Arsipkan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="min-h-[44px] px-3 py-2 rounded-xl bg-stone-100 dark:bg-carbon-900 text-stone-700 dark:text-stone-300 text-xs font-semibold"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(modalScan.id)}
                                        className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-red-50 dark:bg-carbon-900 dark:hover:bg-red-950/60 text-red-600 dark:text-red-300 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                        <span>Hapus Log</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </dialog>

            <dialog
                ref={archiveDialogRef}
                onClose={closeArchiveModal}
                className="backdrop:bg-stone-900/40 dark:backdrop:bg-carbon-950/80 bg-white dark:bg-carbon-850 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-carbon-700/80 rounded-2xl max-w-xl w-[calc(100%-2rem)] p-0 shadow-2xl"
            >
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                                Arsip Dokumentasi Terhapus
                            </h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                Data yang dihapus sementara dapat dipulihkan kembali ke peta sebaran.
                            </p>
                        </div>
                        <button
                            type="button"
                            aria-label="Tutup dialog arsip"
                            onClick={closeArchiveModal}
                            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-carbon-900 dark:hover:bg-carbon-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {trashedScans.length === 0 ? (
                        <p className="text-xs text-stone-500 dark:text-stone-400 py-6 text-center">
                            Tidak ada data di arsip terhapus.
                        </p>
                    ) : (
                        <div className="space-y-2.5 max-h-80 overflow-y-auto">
                            {trashedScans.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3.5 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 flex items-center justify-between gap-3"
                                >
                                    <div>
                                        <div className="text-sm font-bold text-stone-900 dark:text-white">
                                            {item.farmer_group_name}
                                        </div>
                                        <div className="text-xs text-stone-500 dark:text-stone-400">
                                            {item.detected_waste_type} • {item.regency}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isMutating}
                                        onClick={() => handleRestore(item.id)}
                                        className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shrink-0 shadow-sm"
                                    >
                                        <ArchiveRestore className="w-3.5 h-3.5 shrink-0" />
                                        <span>Pulihkan</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </dialog>
        </AppLayout>
    );
}