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
    Flame,
    Clock,
    Filter,
    Calendar,
    BookOpen,
    Check,
} from 'lucide-react';

const CLUSTER_VIEWS = {
    all: { label: 'Semua Wilayah', center: [-5.4, 115.6], zoom: 6 },
    jatim: { label: 'Jawa Timur', center: [-7.55, 112.15], zoom: 8 },
    sulbar: { label: 'Sulawesi Barat', center: [-3.32, 119.05], zoom: 9 },
};

const PROCESSING_STATUSES = ['Belum diolah', 'Diproses', 'Selesai'];

const SUBMISSION_STAGES = [
    { key: 'Menanti', label: 'Menanti', desc: 'Menunggu konfirmasi penerimaan di sentra' },
    { key: 'Diterima', label: 'Diterima', desc: 'Telah diverifikasi dan ditimbang di sentra' },
    { key: 'Sedang Diolah', label: 'Sedang Diolah', desc: 'Proses pirolisis tungku Kon-Tiki berlangsung' },
    { key: 'Selesai', label: 'Selesai', desc: 'Biochar siap diaplikasikan atau disalurkan' },
];

function getSubmissionBadgeClass(status) {
    if (status === 'Selesai') {
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
    if (status === 'Sedang Diolah') {
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-300 dark:border-orange-800';
    }
    if (status === 'Diterima') {
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-300 dark:border-sky-800';
    }
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateString;
    }
}

export default function CommunityMap({
    scans = [],
    trashedScans = [],
    submissions = [],
    unread_notifications_count = 0,
    filters = {},
    communities = [],
}) {
    const { auth, flash } = usePage().props;
    const isKomunitas = auth?.user?.role === 'komunitas';
    const isPetani = auth?.user?.role === 'petani';

    const [dismissFlash, setDismissFlash] = useState(false);
    const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' | 'map' | 'guidelines'

    // Submissions filter state (initialized from props or URL query)
    const [subStatusFilter, setSubStatusFilter] = useState(() => {
        if (filters?.status) return filters.status;
        if (typeof window !== 'undefined') {
            const p = new URLSearchParams(window.location.search);
            return p.get('status') || 'Semua';
        }
        return 'Semua';
    });
    const [dateFrom, setDateFrom] = useState(() => {
        if (filters?.date_from) return filters.date_from;
        if (typeof window !== 'undefined') {
            const p = new URLSearchParams(window.location.search);
            return p.get('date_from') || '';
        }
        return '';
    });
    const [dateTo, setDateTo] = useState(() => {
        if (filters?.date_to) return filters.date_to;
        if (typeof window !== 'undefined') {
            const p = new URLSearchParams(window.location.search);
            return p.get('date_to') || '';
        }
        return '';
    });
    const [subSearchQuery, setSubSearchQuery] = useState('');

    // Mutation states
    const [mutatingSubId, setMutatingSubId] = useState(null);

    // Re-verification modal state
    const verifyDialogRef = useRef(null);
    const [verifySub, setVerifySub] = useState(null);
    const [verifyPhotoFile, setVerifyPhotoFile] = useState(null);
    const [verifyPhotoPreview, setVerifyPhotoPreview] = useState(null);
    const [verifyNotes, setVerifyNotes] = useState('');
    const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);
    const [verifyErrors, setVerifyErrors] = useState({});

    // Submission detail modal state
    const subDetailDialogRef = useRef(null);
    const [selectedSubDetail, setSelectedSubDetail] = useState(null);

    // Guidelines drawer / modal state
    const guidelinesDialogRef = useRef(null);

    // Map & Scans State
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const markerByIdRef = useRef({});
    const rowByIdRef = useRef({});

    const detailDialogRef = useRef(null);
    const archiveDialogRef = useRef(null);

    const [activeCluster, setActiveCluster] = useState('all');
    const [scanSearchQuery, setScanSearchQuery] = useState('');
    const [wasteTypeFilter, setWasteTypeFilter] = useState('Semua');
    const [scanStatusFilter, setScanStatusFilter] = useState('Semua');

    const [selectedScanId, setSelectedScanId] = useState(null);
    const [modalScan, setModalScan] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [isScanMutating, setIsScanMutating] = useState(false);

    // Filtered submissions (client-side text search over server-filtered submissions)
    const filteredSubmissions = submissions.filter((sub) => {
        if (!subSearchQuery.trim()) return true;
        const q = subSearchQuery.toLowerCase();
        const code = (sub.tracking_code || '').toLowerCase();
        const farmerName = (sub.user?.name || sub.farmer?.name || '').toLowerCase();
        const wasteType = (sub.waste_type || '').toLowerCase();
        const notes = (sub.notes || '').toLowerCase();
        return code.includes(q) || farmerName.includes(q) || wasteType.includes(q) || notes.includes(q);
    });

    // Submissions filter handlers
    const handleApplyFilters = (overrideStatus, overrideFrom, overrideTo) => {
        const nextStatus = overrideStatus !== undefined ? overrideStatus : subStatusFilter;
        const nextFrom = overrideFrom !== undefined ? overrideFrom : dateFrom;
        const nextTo = overrideTo !== undefined ? overrideTo : dateTo;

        const query = {};
        if (nextStatus && nextStatus !== 'Semua') {
            query.status = nextStatus;
        }
        if (nextFrom) {
            query.date_from = nextFrom;
        }
        if (nextTo) {
            query.date_to = nextTo;
        }

        router.get('/community-map', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleResetFilters = () => {
        setSubStatusFilter('Semua');
        setDateFrom('');
        setDateTo('');
        setSubSearchQuery('');
        router.get('/community-map', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Submissions 4-Stage Lifecycle handler
    const handleUpdateSubmissionStatus = (submissionId, nextStatus) => {
        setMutatingSubId(submissionId);
        setDismissFlash(false);
        router.patch(
            `/community-map/submissions/${submissionId}/status`,
            { status: nextStatus },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setMutatingSubId(null),
            }
        );
    };

    // Re-verification Modal Handlers
    const openVerifyModal = (submission) => {
        setVerifySub(submission);
        setVerifyPhotoFile(null);
        setVerifyPhotoPreview(submission.verification_photo_path || null);
        setVerifyNotes(submission.verification_notes || '');
        setVerifyErrors({});
        if (verifyDialogRef.current && !verifyDialogRef.current.open) {
            verifyDialogRef.current.showModal();
        }
    };

    const closeVerifyModal = () => {
        if (verifyDialogRef.current?.open) {
            verifyDialogRef.current.close();
        }
        setVerifySub(null);
        setVerifyPhotoFile(null);
        setVerifyPhotoPreview(null);
        setVerifyNotes('');
        setVerifyErrors({});
    };

    const handleVerifyPhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setVerifyPhotoFile(file);
            const preview = URL.createObjectURL(file);
            setVerifyPhotoPreview(preview);
        }
    };

    const handleSubmitVerification = (e) => {
        e.preventDefault();
        if (!verifySub) return;

        setIsSubmittingVerify(true);
        setDismissFlash(false);

        const formData = new FormData();
        if (verifyPhotoFile) {
            formData.append('verification_photo', verifyPhotoFile);
        }
        if (verifyNotes) {
            formData.append('verification_notes', verifyNotes);
        }

        router.post(`/community-map/submissions/${verifySub.id}/verify`, formData, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                closeVerifyModal();
            },
            onError: (errs) => {
                setVerifyErrors(errs);
            },
            onFinish: () => setIsSubmittingVerify(false),
        });
    };

    // Submission Detail Modal Handlers
    const openSubDetailModal = (submission) => {
        setSelectedSubDetail(submission);
        if (subDetailDialogRef.current && !subDetailDialogRef.current.open) {
            subDetailDialogRef.current.showModal();
        }
    };

    const closeSubDetailModal = () => {
        if (subDetailDialogRef.current?.open) {
            subDetailDialogRef.current.close();
        }
        setSelectedSubDetail(null);
    };

    // Guidelines Drawer Handlers
    const openGuidelinesModal = () => {
        if (guidelinesDialogRef.current && !guidelinesDialogRef.current.open) {
            guidelinesDialogRef.current.showModal();
        }
    };

    const closeGuidelinesModal = () => {
        if (guidelinesDialogRef.current?.open) {
            guidelinesDialogRef.current.close();
        }
    };

    // Map & Scans logic
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
            scanStatusFilter === 'Semua' || currentStatus === scanStatusFilter;
        const matchesSearch =
            scan.farmer_group_name.toLowerCase().includes(scanSearchQuery.toLowerCase()) ||
            scan.village_location.toLowerCase().includes(scanSearchQuery.toLowerCase()) ||
            scan.regency.toLowerCase().includes(scanSearchQuery.toLowerCase());

        return matchesCluster && matchesWaste && matchesStatus && matchesSearch;
    });

    // Leaflet map initialization
    useEffect(() => {
        if (activeTab !== 'map') return;
        if (!mapContainerRef.current || mapInstanceRef.current) {
            if (mapInstanceRef.current) {
                setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
            }
            return;
        }

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
    }, [activeTab]);

    // Update map markers
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

    const openScanDetailModal = (scan) => {
        setModalScan(scan);
        setConfirmDeleteId(null);
        if (detailDialogRef.current && !detailDialogRef.current.open) {
            detailDialogRef.current.showModal();
        }
    };

    const closeScanDetailModal = () => {
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

    const handleScanStatusUpdate = (scanId, nextStatus) => {
        setIsScanMutating(true);
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
                onFinish: () => setIsScanMutating(false),
            }
        );
    };

    const handleSoftDeleteScan = (scanId) => {
        setIsScanMutating(true);
        setDismissFlash(false);
        router.delete(`/community-map/scans/${scanId}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedScanId === scanId) setSelectedScanId(null);
                closeScanDetailModal();
            },
            onFinish: () => setIsScanMutating(false),
        });
    };

    const handleRestoreScan = (scanId) => {
        setIsScanMutating(true);
        setDismissFlash(false);
        router.post(
            `/community-map/scans/${scanId}/restore`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsScanMutating(false),
            }
        );
    };

    return (
        <AppLayout>
            <Head title="Sentra Komunitas & Peta Sebaran Biomassa" />

            {/* Flash Success Notification */}
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

            {/* Header Section */}
            <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Pusat Operasional Komunitas
                        </span>
                        {unread_notifications_count > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse shadow-sm">
                                <Clock className="w-3 h-3" />
                                <span>{unread_notifications_count} Setoran Baru</span>
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                        Sentra Komunitas & Peta Biomassa
                    </h1>
                    <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
                        Kelola antrean setoran limbah petani, pembaruan status pengolahan biochar, verifikasi foto mutu, dan pemetaan sebaran residu pertanian.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                        type="button"
                        onClick={openGuidelinesModal}
                        className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-carbon-850 hover:bg-stone-100 dark:hover:bg-carbon-800 border border-stone-200 dark:border-carbon-700 text-stone-700 dark:text-stone-200 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                        <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Panduan Biochar Sentra</span>
                    </button>

                    <Link
                        href="/scanner"
                        className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                        <Camera className="w-4 h-4 shrink-0" />
                        <span>Tambah Titik Residu</span>
                    </Link>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex border-b border-stone-200 dark:border-carbon-700/80 mb-6 gap-2 sm:gap-4 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setActiveTab('submissions')}
                    className={`min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        activeTab === 'submissions'
                            ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                            : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>Setoran Masuk Petani</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 dark:bg-carbon-800 text-stone-700 dark:text-stone-300">
                        {submissions.length}
                    </span>
                    {unread_notifications_count > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('map')}
                    className={`min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        activeTab === 'map'
                            ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                            : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                    }`}
                >
                    <MapPin className="w-4 h-4" />
                    <span>Peta & Titik Sebaran Lapangan</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 dark:bg-carbon-800 text-stone-700 dark:text-stone-300">
                        {scans.length}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('guidelines')}
                    className={`min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        activeTab === 'guidelines'
                            ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                            : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                    }`}
                >
                    <Leaf className="w-4 h-4" />
                    <span>SOP & Panduan Biochar Sentra</span>
                </button>
            </div>

            {/* TAB 1: INCOMING SUBMISSIONS (SETORAN MASUK) */}
            {activeTab === 'submissions' && (
                <div className="space-y-6">
                    {/* Filters & Search Toolbar */}
                    <section className="bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1 mr-1">
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>Status:</span>
                                </span>
                                {['Semua', 'Menanti', 'Diterima', 'Sedang Diolah', 'Selesai'].map((st) => {
                                    const active = subStatusFilter === st;
                                    return (
                                        <button
                                            key={st}
                                            type="button"
                                            onClick={() => {
                                                setSubStatusFilter(st);
                                                handleApplyFilters(st, dateFrom, dateTo);
                                            }}
                                            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                                active
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'bg-stone-100 hover:bg-stone-200 dark:bg-carbon-900 dark:hover:bg-carbon-800 text-stone-700 dark:text-stone-300'
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
                                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                    <span>Dari:</span>
                                    <input
                                        type="date"
                                        aria-label="Filter tanggal mulai setoran"
                                        value={dateFrom}
                                        onChange={(e) => {
                                            setDateFrom(e.target.value);
                                            handleApplyFilters(subStatusFilter, e.target.value, dateTo);
                                        }}
                                        className="min-h-[40px] px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                    />
                                    <span>Sampai:</span>
                                    <input
                                        type="date"
                                        aria-label="Filter tanggal akhir setoran"
                                        value={dateTo}
                                        onChange={(e) => {
                                            setDateTo(e.target.value);
                                            handleApplyFilters(subStatusFilter, dateFrom, e.target.value);
                                        }}
                                        className="min-h-[40px] px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                    />
                                </div>

                                {(subStatusFilter !== 'Semua' || dateFrom || dateTo) && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-carbon-800 dark:hover:bg-carbon-700 text-stone-800 dark:text-white text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                    >
                                        <RotateCcw className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        <span>Reset</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-carbon-800 flex items-center justify-between gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    aria-label="Cari kode setoran, nama petani, atau jenis limbah"
                                    placeholder="Cari kode setoran (STR-...), nama petani, limbah..."
                                    value={subSearchQuery}
                                    onChange={(e) => setSubSearchQuery(e.target.value)}
                                    className="w-full min-h-[42px] pl-10 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
                                />
                            </div>
                            <div className="text-xs text-stone-500 dark:text-stone-400">
                                Menampilkan <strong className="text-stone-900 dark:text-white">{filteredSubmissions.length}</strong> setoran
                            </div>
                        </div>
                    </section>

                    {/* Submissions List */}
                    {filteredSubmissions.length === 0 ? (
                        <div className="p-12 rounded-2xl bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 text-center flex flex-col items-center justify-center shadow-sm">
                            <AlertCircle className="w-12 h-12 text-amber-500 dark:text-amber-400 mb-3" />
                            <h3 className="font-bold text-base text-stone-900 dark:text-white">
                                Belum Ada Setoran Limbah yang Cocok
                            </h3>
                            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mt-1 mb-5 leading-relaxed">
                                {subStatusFilter !== 'Semua' || dateFrom || dateTo
                                    ? 'Tidak ditemukan data setoran dengan filter aktif. Coba ubah atau reset filter status dan tanggal.'
                                    : 'Sentra komunitas Anda belum menerima kiriman setoran biomassa dari petani binaan.'}
                            </p>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-carbon-800 dark:hover:bg-carbon-700 text-stone-800 dark:text-white text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                                <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Reset Filter Pencarian</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredSubmissions.map((sub) => {
                                const currentStatus = sub.status || 'Menanti';
                                const isMenanti = currentStatus === 'Menanti';
                                const isDiterima = currentStatus === 'Diterima';
                                const isSedangDiolah = currentStatus === 'Sedang Diolah';
                                const isSelesai = currentStatus === 'Selesai';
                                const isMutating = mutatingSubId === sub.id;
                                const farmerName = sub.user?.name || sub.farmer?.name || 'Petani Binaan';

                                return (
                                    <div
                                        key={sub.id}
                                        className="bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-colors"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                                            {/* Left Column: Core Info */}
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-stone-100 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 overflow-hidden shrink-0 flex items-center justify-center">
                                                    <img
                                                        src={sub.photo_path || '/demo/jerami-lamongan.webp'}
                                                        alt={`Foto limbah ${sub.waste_type}`}
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/demo/community-verified.webp';
                                                        }}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-carbon-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-carbon-800">
                                                            {sub.tracking_code}
                                                        </span>
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSubmissionBadgeClass(
                                                                currentStatus
                                                            )}`}
                                                        >
                                                            {isSelesai && <Check className="w-3 h-3" />}
                                                            {isSedangDiolah && <Flame className="w-3 h-3 text-orange-500" />}
                                                            {isMenanti && <Clock className="w-3 h-3 text-amber-500" />}
                                                            <span>{currentStatus}</span>
                                                        </span>

                                                        {sub.verified_at && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                                                <span>Terverifikasi Sentra</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h4 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white truncate">
                                                        {sub.waste_type}
                                                    </h4>

                                                    <div className="text-xs text-stone-600 dark:text-stone-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                                                        <span>Petani: <strong className="text-stone-900 dark:text-white">{farmerName}</strong></span>
                                                        <span>•</span>
                                                        <span>Estimasi Bobot: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{sub.estimated_weight_kg || 0} kg</strong></span>
                                                        <span>•</span>
                                                        <span>Kondisi: <strong>{sub.moisture_condition || 'Standar'}</strong></span>
                                                        <span>•</span>
                                                        <span>Tanggal: {formatDate(sub.created_at)}</span>
                                                    </div>

                                                    {sub.notes && (
                                                        <p className="text-xs text-stone-500 dark:text-stone-400 italic line-clamp-2 mt-1">
                                                            Catatan petani: "{sub.notes}"
                                                        </p>
                                                    )}

                                                    {sub.verification_notes && (
                                                        <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                            <div>
                                                                <span className="font-semibold text-emerald-800 dark:text-emerald-300">Hasil Verifikasi:</span>{' '}
                                                                {sub.verification_notes}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Column: 4-Stage Controls & Modals */}
                                            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-200 dark:border-carbon-800">
                                                {/* Sequential Lifecycle Transition Button */}
                                                {isKomunitas && (
                                                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                                                        {isMenanti && (
                                                            <button
                                                                type="button"
                                                                disabled={isMutating}
                                                                onClick={() => handleUpdateSubmissionStatus(sub.id, 'Diterima')}
                                                                className="min-h-[44px] flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                                                            >
                                                                <Check className="w-4 h-4 shrink-0" />
                                                                <span>{isMutating ? 'Memperbarui...' : 'Terima Setoran'}</span>
                                                            </button>
                                                        )}

                                                        {isDiterima && (
                                                            <button
                                                                type="button"
                                                                disabled={isMutating}
                                                                onClick={() => handleUpdateSubmissionStatus(sub.id, 'Sedang Diolah')}
                                                                className="min-h-[44px] flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                                                            >
                                                                <Flame className="w-4 h-4 shrink-0" />
                                                                <span>{isMutating ? 'Memperbarui...' : 'Mulai Pengolahan'}</span>
                                                            </button>
                                                        )}

                                                        {isSedangDiolah && (
                                                            <button
                                                                type="button"
                                                                disabled={isMutating}
                                                                onClick={() => handleUpdateSubmissionStatus(sub.id, 'Selesai')}
                                                                className="min-h-[44px] flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                                <span>{isMutating ? 'Memperbarui...' : 'Selesaikan Pengolahan'}</span>
                                                            </button>
                                                        )}

                                                        {isSelesai && (
                                                            <span className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
                                                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                <span>Selesai Diproses</span>
                                                            </span>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => openVerifyModal(sub)}
                                                            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-carbon-800 dark:hover:bg-carbon-700 text-stone-800 dark:text-white text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                        >
                                                            <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                            <span>{sub.verification_photo_path ? 'Perbarui Verifikasi' : 'Verifikasi Foto'}</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => openSubDetailModal(sub)}
                                                            aria-label={`Lihat rincian lengkap setoran ${sub.tracking_code}`}
                                                            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-carbon-800 dark:hover:bg-carbon-700 text-stone-700 dark:text-stone-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}

                                                {!isKomunitas && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openSubDetailModal(sub)}
                                                        className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-carbon-800 dark:hover:bg-carbon-700 text-stone-800 dark:text-white text-xs font-semibold transition"
                                                    >
                                                        <Eye className="w-4 h-4 text-emerald-600" />
                                                        <span>Lihat Rincian</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stepper Indicator */}
                                        <div className="mt-5 pt-4 border-t border-stone-100 dark:border-carbon-800/80">
                                            <div className="grid grid-cols-4 gap-2 text-center">
                                                {SUBMISSION_STAGES.map((stage, idx) => {
                                                    const stageIdx = SUBMISSION_STAGES.findIndex((s) => s.key === currentStatus);
                                                    const isPassed = idx <= stageIdx;
                                                    const isCurrent = stage.key === currentStatus;

                                                    return (
                                                        <div key={stage.key} className="flex flex-col items-center">
                                                            <div className="w-full flex items-center justify-center">
                                                                <div
                                                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                                                        isCurrent
                                                                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                                                                            : isPassed
                                                                            ? 'bg-emerald-500 text-white'
                                                                            : 'bg-stone-200 dark:bg-carbon-800 text-stone-400'
                                                                    }`}
                                                                >
                                                                    {isPassed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                                                </div>
                                                            </div>
                                                            <span
                                                                className={`text-[11px] font-semibold mt-1.5 truncate max-w-full ${
                                                                    isCurrent
                                                                        ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                                                                        : isPassed
                                                                        ? 'text-stone-700 dark:text-stone-300'
                                                                        : 'text-stone-400 dark:text-stone-600'
                                                                }`}
                                                            >
                                                                {stage.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: FIELD MAP & SCAN LOGS */}
            {activeTab === 'map' && (
                <div className="space-y-6">
                    {/* Cluster Views Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
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

                    {/* Leaflet Map Canvas */}
                    <section className="bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 rounded-2xl p-3 sm:p-4 shadow-sm transition-colors">
                        <div
                            ref={mapContainerRef}
                            className="w-full h-[460px] rounded-xl overflow-hidden z-10"
                        />
                    </section>

                    {/* Field Scan Logs Table */}
                    <section className="bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                                    Log Dokumentasi Pemindaian Lapangan
                                </h2>
                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                    {filteredScans.length} data pemindaian tampil • Klik baris untuk mengarahkan peta ke titik lokasi
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {trashedScans.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={openArchiveModal}
                                        className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-carbon-850 hover:bg-stone-100 dark:hover:bg-carbon-800 border border-stone-200 dark:border-carbon-700 text-stone-700 dark:text-stone-200 text-xs font-semibold shadow-sm transition"
                                    >
                                        <ArchiveRestore className="w-4 h-4 text-amber-500 shrink-0" />
                                        <span>Arsip Terhapus ({trashedScans.length})</span>
                                    </button>
                                )}

                                <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        aria-label="Cari kelompok tani atau desa"
                                        placeholder="Cari Poktan, Desa, Kabupaten..."
                                        value={scanSearchQuery}
                                        onChange={(e) => setScanSearchQuery(e.target.value)}
                                        className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {filteredScans.length === 0 ? (
                            <p className="text-stone-500 dark:text-stone-400 text-xs py-8 text-center">
                                Tidak ada data pemindaian yang cocok dengan pencarian.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300 border-collapse">
                                    <thead>
                                        <tr className="border-b border-stone-200 dark:border-carbon-700 font-semibold text-stone-500 dark:text-stone-400">
                                            <th className="py-3 px-4">Kelompok Tani</th>
                                            <th className="py-3 px-4">Limbah Terdeteksi</th>
                                            <th className="py-3 px-4">Wilayah</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4">Akurasi</th>
                                            <th className="py-3 px-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 dark:divide-carbon-800">
                                        {filteredScans.map((scan) => {
                                            const isSelected = scan.id === selectedScanId;
                                            const currentStatus = scan.processing_status || 'Belum diolah';

                                            return (
                                                <tr
                                                    key={scan.id}
                                                    ref={(el) => (rowByIdRef.current[scan.id] = el)}
                                                    onClick={() => handleFocusOnMap(scan)}
                                                    className={`cursor-pointer transition ${
                                                        isSelected
                                                            ? 'bg-emerald-50/70 dark:bg-carbon-800 font-medium'
                                                            : 'hover:bg-stone-50 dark:hover:bg-carbon-800/40'
                                                    }`}
                                                >
                                                    <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                                                        {scan.farmer_group_name}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        {scan.detected_waste_type}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        {scan.village_location}, {scan.regency}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-carbon-900 text-stone-700 dark:text-stone-300">
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
                                                                onClick={() => openScanDetailModal(scan)}
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
                </div>
            )}

            {/* TAB 3: GUIDELINES & TECHNICAL SOP */}
            {activeTab === 'guidelines' && (
                <div className="space-y-6">
                    <section className="bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 rounded-2xl p-6 sm:p-8 shadow-sm">
                        <div className="max-w-3xl">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                                Standar Operasional Prosedur Sentra
                            </span>
                            <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white">
                                Panduan Pengolahan Biochar Sentra Komunitas
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300 text-sm mt-2 leading-relaxed">
                                Pedoman teknis operasional bagi operator sentra dalam memvalidasi bahan baku limbah petani, menjalankan pirolisis tungku Kon-Tiki, melakukan pemadaman pendinginan (quenching), serta standardisasi mutu biochar sebelum didistribusikan.
                            </p>
                        </div>

                        {/* SOP Steps Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <div className="p-5 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200/80 dark:border-carbon-800 space-y-2.5">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                                    <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-xs">1</span>
                                    <span>Penerimaan & Verifikasi Fisik</span>
                                </div>
                                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                                    Pastikan kadar air limbah di bawah 20% (batang patah renyah). Jika terdeteksi basah (&gt;25%), kelompokkan di lantai jemur terpal selama 2-3 hari. Bersihkan residu dari kontaminan plastik, tali rafia, atau kawat.
                                </p>
                            </div>

                            <div className="p-5 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200/80 dark:border-carbon-800 space-y-2.5">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                                    <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-xs">2</span>
                                    <span>Pemuatan Tungku Kon-Tiki</span>
                                </div>
                                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                                    Mulai penyulutan api dari pucuk atas (Top-Lit Updraft / TLUD) menggunakan sedikit ranting kering. Pertahankan nyala api bersih tanpa asap putih tebal. Masukkan biomassa secara bertahap setiap 10-15 menit saat lapisan bawah mulai membara.
                                </p>
                            </div>

                            <div className="p-5 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200/80 dark:border-carbon-800 space-y-2.5">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                                    <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-xs">3</span>
                                    <span>Pirolisis Suhu Optimal (500 - 700°C)</span>
                                </div>
                                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                                    Suhu pirolisis dijaga pada rentang 500-700°C untuk memaksimalkan pembentukan pori mikro dan stabilitas karbon aromatik (&gt;100 tahun di tanah). Jangan biarkan api padam menjadi abu putih tebal.
                                </p>
                            </div>

                            <div className="p-5 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200/80 dark:border-carbon-800 space-y-2.5">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                                    <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-xs">4</span>
                                    <span>Quenching & Inokulasi Nutrisi</span>
                                </div>
                                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                                    Segera semprot kabut air atau larutan MOL (Mikroorganisme Lokal)/slurry biogas saat bara mencapai 85% volume tungku. Pemadaman mendadak mengunci rongga pori dan mencegah biochar habis menjadi abu.
                                </p>
                            </div>
                        </div>

                        {/* 4 Commodity Details */}
                        <div className="mt-10 pt-8 border-t border-stone-200 dark:border-carbon-800">
                            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">
                                Karakteristik 4 Komoditas Residu Utama
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800">
                                    <div className="font-bold text-sm text-stone-900 dark:text-white">Jerami Padi</div>
                                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Lamongan & Ngawi</div>
                                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                                        Kaya Kalium (K2O 2.4-3.1%) dan Silika (13.5%). Sangat efektif menaikkan KTK tanah sawah dan menghemat pupuk sintetis KCl.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800">
                                    <div className="font-bold text-sm text-stone-900 dark:text-white">Sekam Padi</div>
                                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Ngawi & Bojonegoro</div>
                                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                                        Silika aktif (SiO2 18-21%) dengan porositas mikro 74%. Menggemburkan tanah lempung berat dan memperkuat perakaran bibit.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800">
                                    <div className="font-bold text-sm text-stone-900 dark:text-white">Tongkol Jagung</div>
                                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Malang & Kediri</div>
                                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                                        Karbon tetap &gt;76% dengan retensi air 4x bobot kering. Penyelamat tanaman jagung di lahan kering tadah hujan saat kemarau.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800">
                                    <div className="font-bold text-sm text-stone-900 dark:text-white">Kulit Buah Kakao</div>
                                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Majene & Polman</div>
                                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                                        Kalium super (K2O hingga 5.4%), menetralkan tanah masam kebun kakao dan 100% mensterilkan spora busuk buah Phytophthora.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* RE-VERIFICATION PHOTO UPLOAD MODAL */}
            <dialog
                ref={verifyDialogRef}
                onClose={closeVerifyModal}
                className="backdrop:bg-stone-900/50 dark:backdrop:bg-carbon-950/80 bg-white dark:bg-carbon-850 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-carbon-700/80 rounded-2xl max-w-xl w-[calc(100%-2rem)] p-0 shadow-2xl"
            >
                {verifySub && (
                    <form onSubmit={handleSubmitVerification} className="p-6 sm:p-7 space-y-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">
                                    Verifikasi Mutu & Fisik Sentra
                                </span>
                                <h3 className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                                    Setoran #{verifySub.tracking_code}
                                </h3>
                                <p className="text-xs text-stone-500 dark:text-stone-400">
                                    {verifySub.waste_type} • {verifySub.estimated_weight_kg || 0} kg dari {verifySub.user?.name || verifySub.farmer?.name}
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Tutup modal verifikasi"
                                onClick={closeVerifyModal}
                                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-carbon-900 dark:hover:bg-carbon-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {verifySub.verified_at && (
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Telah diverifikasi sebelumnya pada {formatDate(verifySub.verified_at)}. Anda dapat memperbarui foto atau catatan inspeksi.</span>
                            </div>
                        )}

                        {/* Photo Comparison Section */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Foto Petani:</div>
                                <div className="h-28 rounded-xl bg-stone-100 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 overflow-hidden flex items-center justify-center">
                                    <img
                                        src={verifySub.photo_path || '/demo/jerami-lamongan.webp'}
                                        alt="Foto dari petani"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Foto Verifikasi Sentra:</div>
                                <div className="h-28 rounded-xl bg-stone-100 dark:bg-carbon-900 border border-dashed border-stone-300 dark:border-carbon-700 overflow-hidden flex items-center justify-center relative">
                                    {verifyPhotoPreview ? (
                                        <img
                                            src={verifyPhotoPreview}
                                            alt="Pratinjau verifikasi sentra"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center p-2 text-stone-400">
                                            <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                                            <span className="text-[10px] block">Belum ada foto</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* File Upload Input */}
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                                Unggah Foto Residu Terverifikasi (Opsional):
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleVerifyPhotoChange}
                                className="w-full text-xs text-stone-600 dark:text-stone-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950 dark:file:text-emerald-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            />
                            {verifyErrors.verification_photo && (
                                <p className="text-xs text-red-600 mt-1">{verifyErrors.verification_photo}</p>
                            )}
                        </div>

                        {/* Inspection Notes */}
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                                Catatan Hasil Pemeriksaan & Validasi:
                            </label>
                            <textarea
                                rows={3}
                                value={verifyNotes}
                                onChange={(e) => setVerifyNotes(e.target.value)}
                                placeholder="Contoh: Kadar air aktual 15%, biomassa bersih dari kontaminan, bobot bersih timbangan sentra 118 kg."
                                className="w-full p-3 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-300 dark:border-carbon-700 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
                            />
                            {verifyErrors.verification_notes && (
                                <p className="text-xs text-red-600 mt-1">{verifyErrors.verification_notes}</p>
                            )}
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="pt-3 border-t border-stone-200 dark:border-carbon-700 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={closeVerifyModal}
                                className="min-h-[44px] px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-carbon-900 dark:hover:bg-carbon-800 text-stone-700 dark:text-stone-300 text-xs font-semibold transition"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmittingVerify}
                                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                            >
                                <Check className="w-4 h-4 shrink-0" />
                                <span>{isSubmittingVerify ? 'Menyimpan...' : 'Simpan Hasil Verifikasi'}</span>
                            </button>
                        </div>
                    </form>
                )}
            </dialog>

            {/* SUBMISSION DETAIL MODAL */}
            <dialog
                ref={subDetailDialogRef}
                onClose={closeSubDetailModal}
                className="backdrop:bg-stone-900/50 dark:backdrop:bg-carbon-950/80 bg-white dark:bg-carbon-850 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-carbon-700/80 rounded-2xl max-w-lg w-[calc(100%-2rem)] p-0 shadow-2xl"
            >
                {selectedSubDetail && (
                    <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    {selectedSubDetail.tracking_code}
                                </span>
                                <h3 className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                                    {selectedSubDetail.waste_type}
                                </h3>
                            </div>
                            <button
                                type="button"
                                aria-label="Tutup rincian setoran"
                                onClick={closeSubDetailModal}
                                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-carbon-900 dark:hover:bg-carbon-800 text-stone-600 dark:text-stone-300 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="h-44 rounded-xl bg-stone-100 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 overflow-hidden flex items-center justify-center">
                            <img
                                src={selectedSubDetail.photo_path || '/demo/jerami-lamongan.webp'}
                                alt="Foto setoran limbah"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-stone-100 dark:border-carbon-800">
                                <span className="text-stone-500 dark:text-stone-400">Pengirim (Petani):</span>
                                <strong className="text-stone-900 dark:text-white">{selectedSubDetail.user?.name || selectedSubDetail.farmer?.name || '-'}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-stone-100 dark:border-carbon-800">
                                <span className="text-stone-500 dark:text-stone-400">Estimasi Bobot:</span>
                                <strong className="font-mono text-emerald-600 dark:text-emerald-400">{selectedSubDetail.estimated_weight_kg || 0} kg</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-stone-100 dark:border-carbon-800">
                                <span className="text-stone-500 dark:text-stone-400">Status Alur:</span>
                                <strong className="text-stone-900 dark:text-white">{selectedSubDetail.status}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-stone-100 dark:border-carbon-800">
                                <span className="text-stone-500 dark:text-stone-400">Kondisi Kadar Air:</span>
                                <strong>{selectedSubDetail.moisture_condition || '-'}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-stone-100 dark:border-carbon-800">
                                <span className="text-stone-500 dark:text-stone-400">Waktu Pengiriman:</span>
                                <span>{formatDate(selectedSubDetail.created_at)}</span>
                            </div>

                            {selectedSubDetail.notes && (
                                <div className="pt-2">
                                    <span className="text-stone-500 dark:text-stone-400 block mb-1">Catatan Petani:</span>
                                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800">
                                        {selectedSubDetail.notes}
                                    </div>
                                </div>
                            )}

                            {selectedSubDetail.verification_notes && (
                                <div className="pt-2">
                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold block mb-1">Catatan Verifikasi Sentra:</span>
                                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                                        {selectedSubDetail.verification_notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </dialog>

            {/* GUIDELINES DRAWER / MODAL */}
            <dialog
                ref={guidelinesDialogRef}
                onClose={closeGuidelinesModal}
                className="backdrop:bg-stone-900/50 dark:backdrop:bg-carbon-950/80 bg-white dark:bg-carbon-850 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-carbon-700/80 rounded-2xl max-w-2xl w-[calc(100%-2rem)] p-0 shadow-2xl"
            >
                <div className="p-6 sm:p-7 space-y-5 max-h-[85vh] overflow-y-auto">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">
                                SOP Teknis Komunitas
                            </span>
                            <h3 className="text-xl font-bold text-stone-900 dark:text-white mt-0.5">
                                Panduan Pengolahan Biochar Sentra
                            </h3>
                        </div>
                        <button
                            type="button"
                            aria-label="Tutup panduan biochar"
                            onClick={closeGuidelinesModal}
                            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-carbon-900 dark:hover:bg-carbon-800 text-stone-600 dark:text-stone-300 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 mb-1 flex items-center gap-1.5">
                                <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Prinsip Utama Pirolisis Kon-Tiki</span>
                            </h4>
                            <p className="leading-relaxed">
                                Pengolahan biochar ramah lingkungan menggunakan prinsip Top-Lit Updraft (TLUD) di mana api menyala dari bagian atas. Lapisan nyala api mengonsumsi oksigen dan membakar gas pirolisis yang naik dari biomassa di bawahnya, sehingga pembakaran berlangsung bersih bebas asap putih.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-bold text-stone-900 dark:text-white">Alur 4 Langkah Sentra:</h4>
                            <ol className="space-y-2.5">
                                <li className="p-3 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 flex items-start gap-3">
                                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                                    <div>
                                        <strong className="text-stone-900 dark:text-white block">Uji Kadar Air Residu:</strong>
                                        Limbah harus kering (kadar air &lt; 20%). Jerami/sekam yang basah harus dijemur sebelum masuk tungku.
                                    </div>
                                </li>
                                <li className="p-3 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 flex items-start gap-3">
                                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                                    <div>
                                        <strong className="text-stone-900 dark:text-white block">Penyulutan Atas & Pemuatan Bertahap:</strong>
                                        Nyalakan api di puncak tungku. Tambahkan biomassa baru sedikit demi sedikit tiap kali lapisan bawah membara merah merata.
                                    </div>
                                </li>
                                <li className="p-3 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 flex items-start gap-3">
                                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                                    <div>
                                        <strong className="text-stone-900 dark:text-white block">Pengendalian Suhu 500 - 700°C:</strong>
                                        Pertahankan suhu optimal selama 45-75 menit untuk memastikan karbonisasi tuntas tanpa membiarkan biomassa berubah menjadi abu putih.
                                    </div>
                                </li>
                                <li className="p-3 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 flex items-start gap-3">
                                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                                    <div>
                                        <strong className="text-stone-900 dark:text-white block">Quenching (Pemadaman Air/MOL):</strong>
                                        Padamkan bara panas dengan semprotan air atau cairan pupuk hayati (MOL/slurry) saat 15% abu mulai terbentuk di permukaan.
                                    </div>
                                </li>
                            </ol>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-stone-200 dark:border-carbon-700 flex justify-end">
                        <button
                            type="button"
                            onClick={closeGuidelinesModal}
                            className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                        >
                            Tutup Panduan
                        </button>
                    </div>
                </div>
            </dialog>

            {/* SCAN DETAIL MODAL */}
            <dialog
                ref={detailDialogRef}
                onClose={closeScanDetailModal}
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
                                aria-label="Tutup dialog detail scan"
                                onClick={closeScanDetailModal}
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
                                <span>Manfaat Agronomi Biochar:</span>
                            </div>
                            <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                                {modalScan.ai_summary_recommendation}
                            </p>
                        </div>

                        {Array.isArray(modalScan.ai_next_steps) && modalScan.ai_next_steps.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>Langkah Pengolahan Arang Pertanian:</span>
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
                                                disabled={isScanMutating}
                                                onClick={() =>
                                                    handleScanStatusUpdate(modalScan.id, statusOption)
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
                                            disabled={isScanMutating}
                                            onClick={() => handleSoftDeleteScan(modalScan.id)}
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

            {/* SCAN ARCHIVE MODAL */}
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
                            aria-label="Tutup dialog arsip scan"
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
                                        disabled={isScanMutating}
                                        onClick={() => handleRestoreScan(item.id)}
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
