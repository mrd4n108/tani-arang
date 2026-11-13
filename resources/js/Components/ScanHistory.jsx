import React, { useState, useEffect } from 'react';
import {
    Clock,
    Flame,
    Building2,
    Calendar,
    MapPin,
    Phone,
    Trash2,
    ChevronDown,
    ChevronUp,
    Camera,
    Sparkles,
    CheckCircle2,
    Layers,
    Leaf,
    ShieldAlert,
} from 'lucide-react';
import {
    getScanHistory,
    deleteScanRecord,
    clearScanHistory,
    seedDemoScanHistory,
} from '@/Utils/scanHistoryStorage';
import Badge from '@/Components/Badge';

export default function ScanHistory({ onSwitchToScanner }) {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('semua'); // 'semua' | 'komunitas' | 'mandiri'
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    const loadRecords = () => {
        const data = getScanHistory();
        setRecords(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadRecords();
    }, []);

    const handleDelete = (id) => {
        const updated = deleteScanRecord(id);
        setRecords(updated);
    };

    const handleClearAll = () => {
        clearScanHistory();
        setRecords([]);
        setShowConfirmClear(false);
    };

    const handleSeedDemo = () => {
        const seeded = seedDemoScanHistory();
        setRecords(seeded);
    };

    const filteredRecords = records.filter((rec) => {
        if (filter === 'semua') return true;
        if (filter === 'komunitas') return rec.destination === 'komunitas';
        if (filter === 'mandiri') return rec.destination === 'mandiri';
        return true;
    });

    if (isLoading) {
        return (
            <div className="space-y-4 py-8">
                {[1, 2, 3].map((n) => (
                    <div
                        key={n}
                        className="p-6 rounded-2xl bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 animate-pulse h-40"
                    />
                ))}
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="rounded-2xl border border-stone-200 dark:border-carbon-700/60 bg-white dark:bg-carbon-850 p-8 sm:p-12 text-center transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-carbon-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4 border border-emerald-100 dark:border-carbon-700">
                    <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white tracking-tight">
                    Belum Ada Riwayat Pindai
                </h3>
                <p className="max-w-md mx-auto text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                    Setiap pemindaian limbah biomassa dan pemilihan alur (Setor ke Komunitas atau Olah Mandiri Kon-Tiki) akan otomatis tersimpan di sini.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={onSwitchToScanner}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white min-h-[44px] transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                        <Camera className="w-4 h-4" />
                        <span>Mulai Pemindaian Sekarang</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleSeedDemo}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-stone-300 dark:border-carbon-700 bg-stone-50 dark:bg-carbon-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-carbon-700 min-h-[44px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Muat Contoh Sampel Riwayat</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter and Summary Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 shadow-sm transition-colors">
                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter Riwayat Pindai">
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
                        Semua ({records.length})
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
                        <span>Setor Komunitas ({records.filter((r) => r.destination === 'komunitas').length})</span>
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
                        <span>Olah Mandiri ({records.filter((r) => r.destination === 'mandiri').length})</span>
                    </button>
                </div>

                {/* Clear & Add More Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                    {showConfirmClear ? (
                        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/60 p-1.5 rounded-xl border border-rose-300 dark:border-rose-800">
                            <span className="text-xs text-rose-800 dark:text-rose-200 font-medium px-2">Hapus semua?</span>
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 min-h-[36px]"
                            >
                                Ya, Bersihkan
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowConfirmClear(false)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-200 dark:bg-carbon-700 text-stone-700 dark:text-stone-200 min-h-[36px]"
                            >
                                Batal
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowConfirmClear(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 border border-stone-200 dark:border-carbon-700 hover:border-rose-300 dark:hover:border-rose-800 min-h-[44px] transition"
                            title="Bersihkan semua riwayat penyimpanan lokal"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Bersihkan Riwayat</span>
                        </button>
                    )}
                </div>
            </div>

            {/* List of History Records */}
            {filteredRecords.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 text-stone-500 dark:text-stone-400 text-sm">
                    Tidak ada rekaman untuk filter terpilih.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRecords.map((record) => {
                        const isExpanded = expandedCardId === record.id;
                        const isKomunitas = record.destination === 'komunitas';

                        return (
                            <div
                                key={record.id}
                                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 shadow-sm transition-all hover:border-stone-300 dark:hover:border-carbon-600"
                            >
                                {/* Card Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-stone-100 dark:border-carbon-700/60">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            {/* Destination Badge */}
                                            {isKomunitas ? (
                                                <Badge variant="foliage" size="sm" dot>
                                                    <Building2 className="w-3 h-3 mr-1 inline" />
                                                    Setor ke Komunitas
                                                </Badge>
                                            ) : (
                                                <Badge variant="harvest" size="sm" dot>
                                                    <Flame className="w-3 h-3 mr-1 inline" />
                                                    Olah Mandiri Kon-Tiki
                                                </Badge>
                                            )}

                                            {/* Accuracy & Moisture */}
                                            <Badge variant="carbon" size="sm">
                                                {record.aiConfidence || 95}% Akurat
                                            </Badge>
                                            <Badge variant={record.isDryReady ? 'foliage' : 'terracotta'} size="sm">
                                                {record.moistureCondition || 'Kering Siap Olah'}
                                            </Badge>
                                        </div>

                                        <h4 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white tracking-tight">
                                            {record.detectedWasteType || record.commodity}
                                        </h4>
                                        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {record.dateFormatted || 'Baru saja'}
                                            </span>
                                            {record.region && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {record.region}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(record.id)}
                                            className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition"
                                            aria-label={`Hapus rekaman ${record.detectedWasteType}`}
                                            title="Hapus rekaman ini"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Community Hub Destination Information (if Komunitas) */}
                                {isKomunitas && record.community && (
                                    <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 dark:bg-carbon-900 border border-emerald-200/80 dark:border-carbon-700/80 text-xs sm:text-sm">
                                        <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                                            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            <span>Sentra Tujuan: {record.community.name}</span>
                                        </div>
                                        <p className="text-stone-700 dark:text-stone-300 flex items-start gap-1.5 mt-1 leading-relaxed">
                                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                                            <span>{record.community.address}</span>
                                        </p>
                                        {(record.community.contactPerson || record.community.phone) && (
                                            <p className="text-stone-600 dark:text-stone-400 flex items-center gap-1.5 mt-1">
                                                <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                                <span>Kontak: {record.community.contactPerson} ({record.community.phone})</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Nutrient Highlights */}
                                {record.nutrientHighlights && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                                        {Object.entries(record.nutrientHighlights).map(([k, v]) => (
                                            <div
                                                key={k}
                                                className="p-3 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200/60 dark:border-carbon-800"
                                            >
                                                <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 truncate">{k}</div>
                                                <div className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                                                    {v}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Summary Recommendation */}
                                {record.summaryRecommendation && (
                                    <div className="mt-4 p-3.5 rounded-xl bg-stone-50 dark:bg-carbon-900/60 border border-stone-200/60 dark:border-carbon-800 flex items-start gap-2.5">
                                        <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                                            {record.summaryRecommendation}
                                        </p>
                                    </div>
                                )}

                                {/* Carbon Potential Highlights */}
                                {record.carbonPotential && (
                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                                        <span className="font-semibold text-stone-800 dark:text-stone-200">Potensi Karbon:</span>
                                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-carbon-800 text-emerald-700 dark:text-emerald-400 font-medium">
                                            {record.carbonPotential.co2Avoidance}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-carbon-800 text-stone-700 dark:text-stone-300 font-medium">
                                            Fixed C: {record.carbonPotential.fixedCarbon}
                                        </span>
                                    </div>
                                )}

                                {/* Expandable 3-Step Kon-Tiki Guide Accordion */}
                                {record.steps && record.steps.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-carbon-700/60">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedCardId(isExpanded ? null : record.id)}
                                            className="w-full flex items-center justify-between py-2 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 min-h-[44px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
                                            aria-expanded={isExpanded}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>{isExpanded ? 'Tutup 3 Langkah Panduan' : 'Lihat 3 Langkah Panduan Terjadwal'}</span>
                                            </span>
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </button>

                                        {isExpanded && (
                                            <div className="space-y-3 pt-2">
                                                {record.steps.map((st, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3.5 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200/60 dark:border-carbon-800 text-xs sm:text-sm"
                                                    >
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <div className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                                                                    {idx + 1}
                                                                </span>
                                                                <span>{st.title}</span>
                                                            </div>
                                                            {st.badge && (
                                                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">
                                                                    {st.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-stone-600 dark:text-stone-300 ml-7 leading-relaxed">
                                                            {st.instructions}
                                                        </p>
                                                        {st.parameter && (
                                                            <div className="ml-7 mt-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                                                                Parameter: {st.parameter}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
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
