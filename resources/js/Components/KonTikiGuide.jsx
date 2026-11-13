import React, { useState } from 'react';
import { Flame, Check, Sparkles, Layers, ShieldCheck, ThermometerSun, Droplets } from 'lucide-react';

const DEFAULT_KONTIKI_STEPS = [
    {
        number: 1,
        title: 'Persiapan & Pengeringan Biomassa',
        badge: 'Kadar Air < 18%',
        icon: ThermometerSun,
        instruction:
            'Sortir material asing (batu, plastik, kawat, tali rafia). Jemur di bawah terik matahari 1-2 hari hingga batang atau cangkang berbunyi renyah patah saat ditekuk.',
        parameter: 'Kadar air target di bawah 18% agar pembakaran cepat mencapai suhu pirolisis tanpa asap putih pekat.',
    },
    {
        number: 2,
        title: 'Pembakaran Terkendali Kon-Tiki (TLUD)',
        badge: 'Suhu 500 - 650°C',
        icon: Flame,
        instruction:
            'Gunakan wadah kerucut Kon-Tiki dengan sudut dinding 45 derajat. Nyalakan api dari pucuk atas (Top-Lit Updraft / TLUD). Masukkan biomassa secara bertahap lapis demi lapis saat lapisan bawah mulai membara merah.',
        parameter: 'Pertahankan tudung api keemasan bersih di permukaan. Durasi karbonisasi 45 - 60 menit.',
    },
    {
        number: 3,
        title: 'Pemadaman Cepat (Quenching) & Aktivasi Nutrisi',
        badge: 'Quenching Nutrisi',
        icon: Droplets,
        instruction:
            'Segera siram dan padamkan saat bara mencapai 85% volume wadah sebelum menjadi abu putih. Gunakan air biasa atau larutan pupuk hayati MOL / air cucian beras untuk menginokulasi mikroba penyubur tanah ke dalam mikropori biochar.',
        parameter: 'Hasil akhir biochar hitam pekat mengkilap berpori dengan stabilitas karbon tinggi di dalam tanah.',
    },
];

export default function KonTikiGuide({
    customSteps = null,
    wasteType = 'Biomassa Pertanian',
    showAction = false,
    onConfirm = null,
}) {
    const [completedSteps, setCompletedSteps] = useState([1]);

    const toggleStep = (stepNumber) => {
        setCompletedSteps((prev) =>
            prev.includes(stepNumber)
                ? prev.filter((s) => s !== stepNumber)
                : [...prev, stepNumber]
        );
    };

    return (
        <div className="rounded-2xl bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 p-5 sm:p-6 shadow-sm space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-carbon-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Flame className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                            Protokol 3 Tahap Kon-Tiki di Lahan
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                            Panduan pirolisis ramah lingkungan untuk material: <strong className="text-emerald-700 dark:text-emerald-400">{wasteType}</strong>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-carbon-900 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-carbon-800">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Langkah Selesai: {completedSteps.length} / 3</span>
                </div>
            </div>

            <div className="space-y-3.5">
                {DEFAULT_KONTIKI_STEPS.map((step) => {
                    const isDone = completedSteps.includes(step.number);
                    const StepIcon = step.icon;

                    return (
                        <div
                            key={step.number}
                            onClick={() => toggleStep(step.number)}
                            className={`p-4 rounded-xl border transition cursor-pointer select-none ${
                                isDone
                                    ? 'bg-emerald-50/50 dark:bg-carbon-900 border-emerald-300 dark:border-emerald-800/60'
                                    : 'bg-stone-50/60 dark:bg-carbon-900/60 border-stone-200 dark:border-carbon-800 hover:border-stone-300'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <button
                                    type="button"
                                    aria-label={`Tandai langkah ${step.number} selesai`}
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition ${
                                        isDone
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-stone-200 dark:bg-carbon-800 text-stone-600 dark:text-stone-400'
                                    }`}
                                >
                                    {isDone ? <Check className="w-3.5 h-3.5" /> : step.number}
                                </button>

                                <div className="space-y-1 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                                            Tahap {step.number}: {step.title}
                                        </span>
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                            {step.badge}
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                                        {step.instruction}
                                    </p>
                                    <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-1 pt-1 border-t border-stone-200/50 dark:border-carbon-800">
                                        {step.parameter}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Custom AI Steps if provided */}
            {Array.isArray(customSteps) && customSteps.length > 0 && (
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-carbon-900 border border-stone-200 dark:border-carbon-800 space-y-2">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Catatan Khusus dari Hasil Analisis AI:
                    </span>
                    <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-1 list-disc list-inside">
                        {customSteps.map((s, idx) => (
                            <li key={idx} className="leading-relaxed">{s}</li>
                        ))}
                    </ul>
                </div>
            )}

            {showAction && onConfirm && (
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                        <Flame className="w-4 h-4 shrink-0" />
                        <span>Konfirmasi Rencana Olah Mandiri</span>
                    </button>
                </div>
            )}
        </div>
    );
}
