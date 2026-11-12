import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Flame,
    Sprout,
    ShieldAlert,
    CheckCircle2,
    MapPin,
    Layers,
    Camera,
    ArrowRight,
    AlertTriangle,
    RotateCcw,
} from 'lucide-react';

const COMPARISON_MATRIX = [
    {
        aspect: 'Polusi Udara & Emisi Gas Rumah Kaca',
        burned:
            'Melepaskan asap pekat PM2.5, gas Karbon Monoksida (CO), dan Metana (CH4) yang memicu ISPA warga desa serta mempercepat krisis iklim.',
        biochar:
            'Pirolisis minim oksigen membakar habis gas asap menjadi energi bersih dan mengunci lebih dari 75% karbon padat di dalam tanah selama ratusan tahun.',
    },
    {
        aspect: 'Daya Simpan Air Tanah (Saat Kemarau)',
        burned:
            'Panas api terbuka merusak struktur agregat tanah sehingga air hujan cepat menguap atau hanyut menjadi limpasan permukaan (run-off).',
        biochar:
            'Struktur pori mikro dan meso biochar bekerja seperti spons yang menyerap serta menahan air hingga 4 sampai 5 kali bobot keringnya di zona perakaran.',
    },
    {
        aspect: 'Habitat Mikroba Penyubur & Biota Tanah',
        burned:
            'Suhu pembakaran membunuh mikroba pengikat Nitrogen dan jamur mikoriza menguntungkan pada kedalaman 0 sampai 5 cm lapisan olah tanah.',
        biochar:
            'Jutaan pori mikroskopis berfungsi sebagai terumbu karang tanah (rumah perlindungan permanen) bagi koloni bakteri penyubur dan jamur Trichoderma.',
    },
    {
        aspect: 'Ketahanan Penyakit Akar & Efisiensi Pupuk',
        burned:
            'Abu pembakaran mudah terlarut dan hanyut oleh air irigasi dalam 1 sampai 2 minggu, sementara spora jamur patogen di tanah lembab tetap bertahan.',
        biochar:
            'Meningkatkan Kapasitas Tukar Kation (KTK) hingga 38% agar nutrisi pupuk tidak mudah tercuci, dan suhu pirolisis 450°C mensterilkan spora jamur patogen.',
    },
];

export default function Facts({ wasteFacts = [] }) {
    const [selectedRegionFilter, setSelectedRegionFilter] = useState('Semua');

    const filteredFacts = wasteFacts.filter((item) => {
        if (selectedRegionFilter === 'Semua') return true;
        if (selectedRegionFilter === 'Jawa Timur') {
            return item.region_focus.toLowerCase().includes('jawa timur');
        }
        return item.region_focus.toLowerCase().includes('sulawesi barat');
    });

    return (
        <AppLayout>
            <Head title="Pusat Fakta & Katalog Biomassa" />

            {/* Header & Direct CTA to Scanner */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-sm font-semibold text-emerald-400 block mb-2">
                        Pusat Edukasi Ilmiah & Panduan Lapangan Petani
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Mengapa Limbah Panen Tidak Boleh Dibakar Terbuka?
                    </h1>
                    <p className="text-stone-300 text-base mt-2 max-w-3xl leading-relaxed">
                        Perbandingan faktual berbasis riset agronomi dan sains iklim antara pembakaran terbuka tradisional vs konversi Arang Pertanian (Biochar).
                    </p>
                </div>

                <Link
                    href="/scanner"
                    className="shrink-0 min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-sm"
                >
                    <Camera className="w-4 h-4 shrink-0" />
                    <span>Uji Foto di Pemindai</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>
            </header>

            {/* 1. Ecological & Agronomical Comparison Matrix */}
            <section className="bg-carbon-850 border border-carbon-700/60 rounded-2xl p-6 sm:p-8 mb-12">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">
                        Dibakar Terbuka vs Diolah Menjadi Biochar
                    </h2>
                    <p className="text-xs text-stone-400 mt-1">
                        Matriks perbandingan dampak ekologis dan agronomis berdasarkan rujukan Balittanah & IPCC
                    </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-carbon-700/60">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-carbon-700/60 bg-carbon-900 text-xs uppercase font-medium">
                                <th className="py-4 px-4 text-stone-400 w-1/4">
                                    Parameter Dampak
                                </th>
                                <th className="py-4 px-4 text-amber-300 bg-amber-950/30 w-3/8">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                                        <span>Dibakar Terbuka di Lahan</span>
                                    </div>
                                </th>
                                <th className="py-4 px-4 text-emerald-300 bg-emerald-950/30 w-3/8">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <span>Diolah Menjadi Biochar</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-carbon-800 text-xs sm:text-sm bg-carbon-900/60">
                            {COMPARISON_MATRIX.map((row, idx) => (
                                <tr key={idx} className="hover:bg-carbon-800/40 transition">
                                    <td className="py-4 px-4 font-semibold text-white align-top">
                                        {row.aspect}
                                    </td>
                                    <td className="py-4 px-4 text-stone-300 bg-amber-950/10 align-top leading-relaxed">
                                        {row.burned}
                                    </td>
                                    <td className="py-4 px-4 text-emerald-100 bg-emerald-950/20 align-top leading-relaxed font-medium">
                                        {row.biochar}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 2. Biomass Catalog (4 Commodities) */}
            <section className="mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Katalog Biomassa & SOP Pengolahan
                        </h2>
                        <p className="text-xs text-stone-400 mt-1">
                            Karakteristik 4 jenis limbah pertanian utama di Jawa Timur dan Sulawesi Barat
                        </p>
                    </div>

                    {/* Cluster Filter Tabs */}
                    <div className="flex items-center gap-2">
                        {['Semua', 'Jawa Timur', 'Sulawesi Barat'].map((filter) => {
                            const isActive = selectedRegionFilter === filter;
                            return (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setSelectedRegionFilter(filter)}
                                    className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                                        isActive
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-carbon-800 text-stone-300 hover:text-white hover:bg-carbon-700'
                                    }`}
                                >
                                    {filter}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {filteredFacts.length === 0 ? (
                    <div className="p-8 rounded-xl bg-carbon-850 border border-carbon-700/60 text-center flex flex-col items-center justify-center">
                        <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
                        <div className="font-bold text-sm text-stone-200">
                            Tidak Ada Komoditas untuk Wilayah Ini
                        </div>
                        <p className="text-xs text-stone-400 max-w-sm mt-1 mb-4">
                            Silakan pilih filter wilayah lain untuk melihat katalog biomassa.
                        </p>
                        <button
                            type="button"
                            onClick={() => setSelectedRegionFilter('Semua')}
                            className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-white text-xs font-semibold transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tampilkan Semua Wilayah</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredFacts.map((fact) => (
                            <article
                                key={fact.id}
                                className="bg-carbon-850 border border-carbon-700/60 rounded-2xl p-6 sm:p-7 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top Card Header */}
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                                        <div>
                                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 mb-1">
                                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                <span>Fokus Wilayah: {fact.region_focus}</span>
                                            </span>
                                            <h3 className="font-bold text-xl text-white">
                                                {fact.waste_name}
                                            </h3>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-950/60 text-emerald-300 font-medium">
                                            {fact.annual_volume_fact ? fact.annual_volume_fact.split('(')[0] : 'Potensi Signifikan'}
                                        </span>
                                    </div>

                                    {/* Nutrient Badges Grid */}
                                    {fact.nutrient_facts && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                                            {Object.entries(fact.nutrient_facts).map(([k, v]) => (
                                                <div
                                                    key={k}
                                                    className="p-2.5 rounded-xl bg-carbon-900 border border-carbon-700/50"
                                                >
                                                    <div className="text-[11px] text-stone-400 truncate">{k}</div>
                                                    <div className="text-xs font-bold text-emerald-400 mt-0.5">
                                                        {v}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Hazard vs Benefit Comparison Boxes */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40">
                                            <div className="text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                                                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                <span>Dampak Negatif Dibakar:</span>
                                            </div>
                                            <p className="text-xs text-stone-300 leading-relaxed">
                                                {fact.burning_hazard_fact}
                                            </p>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                                            <div className="text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1.5">
                                                <Sprout className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                <span>Manfaat Jadi Biochar:</span>
                                            </div>
                                            <p className="text-xs text-stone-300 leading-relaxed">
                                                {fact.biochar_benefit_fact}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 3-Step Biochar Processing Guide */}
                                    <div className="space-y-2">
                                        <div className="text-xs text-stone-300 flex items-center gap-1.5 font-semibold">
                                            <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                            <span>Panduan 3 Langkah Pengolahan:</span>
                                        </div>
                                        {(fact.processing_steps || []).map((step, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-carbon-900 border border-carbon-700/50 text-xs text-stone-200"
                                            >
                                                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                                                    {idx + 1}
                                                </span>
                                                <span className="leading-relaxed">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </AppLayout>
    );
}
