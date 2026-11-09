import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Interactive3DCard from '@/Components/Interactive3DCard';
import {
    Flame,
    Sprout,
    ShieldAlert,
    CheckCircle2,
    MapPin,
    Layers,
    Camera,
    Sparkles,
} from 'lucide-react';

const COMPARISON_MATRIX = [
    {
        aspect: 'Polusi Udara & Emisi Gas Rumah Kaca',
        burned: 'Melepaskan asap pekat PM2.5, gas Karbon Monoksida (CO), dan Metana (CH4) yang memicu ISPA warga desa serta pemanasan global.',
        biochar: 'Pirolisis minim oksigen (Kon-Tiki/Drum) membakar habis gas asap menjadi panas bersih dan mengunci >75% karbon padat di dalam tanah selama >100 tahun.',
    },
    {
        aspect: 'Daya Simpan Air Tanah (Saat Kemarau)',
        burned: 'Panas pembakaran permukaan merusak struktur agregat tanah sehingga air hujan cepat menguap atau hanyut menjadi limpasan (run-off).',
        biochar: 'Struktur pori mikro-meso biochar bekerja seperti spons raksasa yang menyerap dan menahan air hingga 4–5 kali bobot keringnya di zona perakaran.',
    },
    {
        aspect: 'Habitat Mikroba Penyubur & Cacing Tanah',
        burned: 'Suhu api terbuka di permukaan memusnahkan mikroba pengikat Nitrogen dan jamur menguntungkan pada kedalaman 0–5 cm topsoil.',
        biochar: 'Jutaan pori mikroskopis menjadi "terumbu karang tanah" (rumah permanen) bagi koloni bakteri Rhizobium, Mycorrhiza, dan Trichoderma.',
    },
    {
        aspect: 'Ketahanan Penyakit Akar & Efisiensi Pupuk',
        burned: 'Abu pembakaran mudah tercuci air irigasi dalam 1–2 minggu; spora jamur patogen di kebun lembab tetap menyebar.',
        biochar: 'Meningkatkan Kapasitas Tukar Kation (KTK) hingga 38% (pupuk NPK tidak mudah hanyut) dan suhu pirolisis 450°C mensterilkan spora jamur Phytophthora.',
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
            <Head title="Pusat Fakta & Katalog Biomassa"/>

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-xs font-mono text-emerald-300 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400"/>
                        PUSAT EDUKASI ILMIAH & PANDUAN PRAKTIS PETANI
                    </div>
                    <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
                        Mengapa Limbah Panen Tidak Boleh Dibakar Terbuka?
                    </h1>
                    <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-3xl">
                        Perbandingan faktual berdasarkan riset Balai Penelitian Tanah (Kementan RI) dan IPCC antara pembakaran terbuka tradisional vs konversi Arang Pertanian (Biochar).
                    </p>
                </div>

                <Link className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-display font-bold text-sm hover:bg-emerald-400 transition" href="/scanner">
                    <Camera className="w-4 h-4"/>
                    Uji Foto Limbah dengan AI
                </Link>
            </div>

            {/* 1. Interactive Factual Comparison Matrix */}
            <section className="glass-panel rounded-3xl p-6 sm:p-8 mb-12 border border-emerald-500/30">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                        <span className="text-xs font-mono text-cyan-300 uppercase">
                            MATRIKS KOMPARASI DAMPAK EKOLOGIS & AGRONOMIS
                        </span>
                        <h2 className="font-display font-bold text-2xl text-white">
                            Dibakar Terbuka vs Diolah Jadi Arang Tani (Biochar)
                        </h2>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-xs font-mono uppercase">
                                <th className="py-4 px-4 text-slate-400 w-1/4">Parameter Dampak</th>
                                <th className="py-4 px-4 text-amber-400 bg-amber-500/5 rounded-tl-xl w-3/8">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-amber-400"/>
                                        Dibakar Terbuka / Dibiarkan Membusuk
                                    </div>
                                </th>
                                <th className="py-4 px-4 text-emerald-300 bg-emerald-500/10 rounded-tr-xl w-3/8">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400"/>
                                        Diolah Jadi Arang Tani (Biochar Pirolisis)
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 text-sm">
                            {COMPARISON_MATRIX.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-900/40 transition">
                                    <td className="py-4 px-4 font-display font-bold text-white align-top">
                                        {row.aspect}
                                    </td>
                                    <td className="py-4 px-4 text-amber-100/90 bg-amber-500/5 align-top leading-relaxed">
                                        {row.burned}
                                    </td>
                                    <td className="py-4 px-4 text-emerald-100 bg-emerald-500/10 align-top leading-relaxed font-medium">
                                        {row.biochar}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 2. 3D Tilt Biomass Reference Catalog (4 Commodities) */}
            <section>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <span className="text-xs font-mono text-emerald-400 uppercase">
                            KATALOG BIOMASSA UNGGULAN NUSANTARA
                        </span>
                        <h2 className="font-display font-bold text-2xl text-white">
                            4 Komoditas Limbah Panen & SOP 3-Langkah Pirolisis
                        </h2>
                    </div>

                    {/* Cluster Filter Buttons */}
                    <div className="flex items-center gap-2">
                        {['Semua', 'Jawa Timur', 'Sulawesi Barat'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedRegionFilter(filter)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition ${
                                    selectedRegionFilter === filter
                                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_18px_rgba(16,185,129,0.4)]'
                                        : 'bg-slate-900/80 text-slate-300 border border-slate-700 hover:border-emerald-400/50'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredFacts.map((fact) => (
                        <Interactive3DCard className="p-6 flex flex-col justify-between" intensity="{6}" key="{fact.id}">
                            <div>
                                {/* Top Card Header */}
                                <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                                    <div>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 mb-1">
                                            <MapPin className="w-3.5 h-3.5"/>
                                            Fokus Wilayah: {fact.region_focus}
                                        </span>
                                        <h3 className="font-display font-extrabold text-xl text-white">
                                            {fact.waste_name}
                                        </h3>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                                        {fact.annual_volume_fact.split('(')[0]}
                                    </span>
                                </div>

                                {/* Nutrient Badges Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                                    {Object.entries(fact.nutrient_facts || {}).map(([k, v]) => (
                                        <div
                                            key={k}
                                            className="p-2.5 rounded-xl bg-slate-950/75 border border-emerald-500/20"
                                        >
                                            <div className="text-[10px] font-mono text-slate-400">{k}</div>
                                            <div className="text-xs font-mono font-bold text-emerald-300 mt-0.5">
                                                {v}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Hazard vs Benefit Comparison Boxes */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                                        <div className="text-xs font-mono font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                                            <Flame className="w-3.5 h-3.5"/>
                                            Bahaya Dibakar / Dibuang:
                                        </div>
                                        <p className="text-xs text-slate-200 leading-relaxed">
                                            {fact.burning_hazard_fact}
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                                        <div className="text-xs font-mono font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                                            <Sprout className="w-3.5 h-3.5"/>
                                            Manfaat Diolah Jadi Biochar:
                                        </div>
                                        <p className="text-xs text-slate-200 leading-relaxed">
                                            {fact.biochar_benefit_fact}
                                        </p>
                                    </div>
                                </div>

                                {/* 3-Step Biochar Processing Guide */}
                                <div className="space-y-2">
                                    <div className="text-xs font-mono text-cyan-300 uppercase flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5"/>
                                        Panduan Praktis 3-Langkah Pembuatan Biochar:
                                    </div>
                                    {(fact.processing_steps || []).map((step, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200"
                                        >
                                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono font-bold flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            <span className="leading-relaxed">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Interactive3DCard>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}