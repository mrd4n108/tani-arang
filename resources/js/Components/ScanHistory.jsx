import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    Clock,
    Flame,
    Building2,
    Calendar,
    MapPin,
    Phone,
    Camera,
    CheckCircle2,
    Layers,
    Leaf,
    LogIn,
    ChevronDown,
    ChevronUp,
    Check,
} from 'lucide-react';
import Badge from '@/Components/Badge';

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

function getStatusBadge(status) {
    switch (status) {
        case 'Selesai':
            return {
                bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
                icon: Check,
            };
        case 'Sedang Diolah':
            return {
                bg: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-300 dark:border-orange-800',
                icon: Flame,
            };
        case 'Diterima':
            return {
                bg: 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-300 dark:border-sky-800',
                icon: CheckCircle2,
            };
        default:
            return {
                bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800',
                icon: Clock,
            };
    }
}

export default function ScanHistory({
    scans = [],
    submissions = [],
    onSwitchToScanner,
    isGuest = false,
}) {
    const [filter, setFilter] = useState('semua'); // 'semua' | 'komunitas' | 'mandiri'
    const [expandedScanId, setExpandedScanId] = useState(null);

    // Guest Mode Banner
    if (isGuest) {
        return (
            <div className="rounded-2xl border border-stone-200 dark:border-carbon-700/60 bg-white dark:bg-carbon-850 p-8 sm:p-12 text-center transition-colors shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-carbon-800 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4 border border-amber-200 dark:border-carbon-700">
                    <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white tracking-tight">
                    Riwayat Tersedia untuk Pengguna Terdaftar
                </h3>
                <p className="max-w-md mx-auto text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                    Saat ini Anda mengakses dalam Mode Tamu. Seluruh riwayat pemindaian dan pelacakan status setoran limbah hanya dicatat secara permanen untuk akun Petani terdaftar.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/login"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white min-h-[44px] transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>Masuk sebagai Petani</span>
                    </Link>
                    <button
                        type="button"
                        onClick={onSwitchToScanner}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-stone-300 dark:border-carbon-700 bg-stone-50 dark:bg-carbon-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 min-h-[44px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                        <Camera className="w-4 h-4" />
                        <span>Coba Pemindai Biomassa</span>
                    </button>
                </div>
            </div>
        );
    }

    const mandiriScans = scans.filter((s) => s.destination_mode === 'mandiri');
    const totalCount = submissions.length + mandiriScans.length;

    const showSubmissions = filter === 'semua' || filter === 'komunitas';
    const showMandiri = filter === 'semua' || filter === 'mandiri';

    return (
        <div className="space-y-6">
            {/* Filter Pills Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 shadow-sm transition-colors">
                <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter Riwayat Aktivitas">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={filter === 'semua'}
                        onClick={() => setFilter('semua')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                            filter === 'semua'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-stone-100 dark:bg-carbon-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-carbon-700'
                        }`}
                    >
                        Semua ({totalCount})
                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-selected={filter === 'komunitas'}
                        onClick={() => setFilter('komunitas')}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                            filter === 'komunitas'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-stone-100 dark:bg-carbon-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-carbon-700'
                        }`}
                    >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Setor ke Komunitas ({submissions.length})</span>
                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-selected={filter === 'mandiri'}
                        onClick={() => setFilter('mandiri')}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                            filter === 'mandiri'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-stone-100 dark:bg-carbon-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-carbon-700'
                        }`}
                    >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Olah Mandiri ({mandiriScans.length})</span>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onSwitchToScanner}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-carbon-800 hover:bg-stone-200 dark:hover:bg-carbon-700 text-stone-800 dark:text-white min-h-[44px] transition self-end sm:self-auto"
                >
                    <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Pindai Limbah Baru</span>
                </button>
            </div>

            {/* Empty State */}
            {totalCount === 0 && (
                <div className="rounded-2xl border border-stone-200 dark:border-carbon-700/60 bg-white dark:bg-carbon-850 p-8 sm:p-12 text-center transition-colors shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-carbon-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4 border border-emerald-100 dark:border-carbon-700">
                        <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white tracking-tight">
                        Belum Ada Riwayat Aktivitas
                    </h3>
                    <p className="max-w-md mx-auto text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                        Anda belum memiliki catatan setoran limbah ke komunitas maupun dokumentasi olah mandiri Kon-Tiki.
                    </p>
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={onSwitchToScanner}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white min-h-[44px] transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                            <Camera className="w-4 h-4" />
                            <span>Mulai Pemindaian Sekarang</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Submissions Section */}
            {showSubmissions && submissions.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-1">
                        Setoran Limbah ke Sentra Komunitas ({submissions.length})
                    </h3>

                    {submissions.map((sub) => {
                        const currentStatus = sub.status || 'Menanti';
                        const badgeCfg = getStatusBadge(currentStatus);
                        const StatusIcon = badgeCfg.icon;

                        return (
                            <div
                                key={sub.id}
                                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 shadow-sm transition hover:border-emerald-500/40"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-stone-100 dark:border-carbon-800">
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-carbon-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-carbon-800">
                                                {sub.tracking_code}
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeCfg.bg}`}
                                            >
                                                <StatusIcon className="w-3 h-3" />
                                                <span>{currentStatus}</span>
                                            </span>
                                            {sub.verified_at && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                                    <span>Terverifikasi Sentra</span>
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                                            {sub.waste_type}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{formatDate(sub.created_at)}</span>
                                            </span>
                                            <span>•</span>
                                            <span>Bobot: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{sub.estimated_weight_kg || 0} kg</strong></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Community Target Card */}
                                {sub.community && (
                                    <div className="mt-4 p-4 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 text-xs sm:text-sm">
                                        <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5 mb-1">
                                            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            <span>Sentra Tujuan: {sub.community.name}</span>
                                        </div>
                                        {sub.community.community_address && (
                                            <p className="text-stone-600 dark:text-stone-300 flex items-start gap-1.5 mt-1 leading-relaxed">
                                                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                                                <span>{sub.community.community_address}</span>
                                            </p>
                                        )}
                                        {sub.community.phone && (
                                            <p className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-1">
                                                <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                                <span>Kontak Sentra: {sub.community.phone}</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {sub.notes && (
                                    <p className="text-xs text-stone-600 dark:text-stone-400 italic mt-3 bg-stone-50 dark:bg-carbon-900/60 p-3 rounded-xl border border-stone-200/60 dark:border-carbon-800">
                                        Catatan Anda: "{sub.notes}"
                                    </p>
                                )}

                                {/* Verification Result Display */}
                                {sub.verification_notes && (
                                    <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-stone-700 dark:text-stone-300 space-y-2">
                                        <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            <span>Hasil Pemeriksaan Sentra Komunitas:</span>
                                        </div>
                                        <p className="leading-relaxed">{sub.verification_notes}</p>
                                        {sub.verification_photo_path && (
                                            <div className="mt-2">
                                                <img
                                                    src={sub.verification_photo_path}
                                                    alt="Foto verifikasi sentra"
                                                    className="w-24 h-24 object-cover rounded-lg border border-emerald-300 dark:border-emerald-700"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Mandiri Scans Section */}
            {showMandiri && mandiriScans.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-1">
                        Dokumentasi Olah Mandiri Kon-Tiki ({mandiriScans.length})
                    </h3>

                    {mandiriScans.map((scan) => {
                        const isExpanded = expandedScanId === scan.id;

                        return (
                            <div
                                key={scan.id}
                                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 shadow-sm transition hover:border-amber-500/40"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-stone-100 dark:border-carbon-800">
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <Badge variant="harvest" size="sm" dot>
                                                <Flame className="w-3 h-3 mr-1 inline" />
                                                Olah Mandiri Kon-Tiki
                                            </Badge>
                                            <Badge variant="carbon" size="sm">
                                                Akurasi {Math.round(scan.ai_confidence)}%
                                            </Badge>
                                            <Badge variant="foliage" size="sm">
                                                {scan.moisture_condition}
                                            </Badge>
                                        </div>

                                        <h4 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                                            {scan.detected_waste_type}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{formatDate(scan.created_at)}</span>
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{scan.village_location}, Kab. {scan.regency}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {scan.ai_summary_recommendation && (
                                    <div className="mt-3.5 p-3 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200/80 dark:border-carbon-800 flex items-start gap-2.5">
                                        <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                                            {scan.ai_summary_recommendation}
                                        </p>
                                    </div>
                                )}

                                {/* Expandable Steps */}
                                {Array.isArray(scan.ai_next_steps) && scan.ai_next_steps.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-carbon-800">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedScanId(isExpanded ? null : scan.id)}
                                            className="w-full flex items-center justify-between py-1 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 min-h-[44px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
                                            aria-expanded={isExpanded}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>{isExpanded ? 'Tutup Rincian Tahapan' : 'Lihat Rekomendasi Tahap Pirolisis'}</span>
                                            </span>
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </button>

                                        {isExpanded && (
                                            <ol className="space-y-2 pt-2">
                                                {scan.ai_next_steps.map((st, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="p-3 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2.5"
                                                    >
                                                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="leading-relaxed">{st}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
