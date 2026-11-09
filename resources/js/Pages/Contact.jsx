import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Interactive3DCard from '@/Components/Interactive3DCard';
import {
    MessageSquareHandshake,
    Send,
    Building2,
    MapPin,
    PhoneCall,
    HelpCircle,
    ChevronDown,
    CheckCircle2,
    Sparkles,
} from 'lucide-react';

const FAQS = [
    {
        q: 'Apakah petani harus membeli alat pirolisis mahal untuk membuat Biochar?',
        a: 'Tidak perlu. Metode Kon-Tiki menggunakan lubang tanah berbentuk kerucut (diameter 1.5 meter) dengan teknik penyalaan api dari atas (Top-Lit Updraft) yang 100% gratis, bebas asap putih, dan menghasilkan biochar berkualitas tinggi dalam 45–60 menit.',
    },
    {
        q: 'Mengapa TaniArang tidak menggunakan kalkulator rumus rumit?',
        a: 'Berdasarkan riset lapangan bersama Kelompok Tani (Poktan) dan Penyuluh Pertanian (PPL), petani membutuhkan kepastian visual (apakah limbah sudah cukup kering dan bagaimana 3 langkah praktis mengolahnya), bukan memasukkan angka kalibrasi kimia yang menyulitkan.',
    },
    {
        q: 'Bagaimana skema kolaborasi untuk Kampus dan CSR Perusahaan?',
        a: 'Mitra CSR dapat menyalurkan bantuan tungku pirolisis portabel berbasis data titik timbulan limbah tertinggi di Peta TaniArang, sedangkan kampus dapat berkolaborasi dalam uji kualitas pori biochar dan pendampingan mahasiswa KKN Tematik.',
    },
];

export default function Contact({ messages = [] }) {
    const [openFaq, setOpenFaq] = useState(0);

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        organization: '',
        region: 'Kab. Lamongan, Jawa Timur',
        collaboration_type: 'Pendampingan Petani',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => reset('name', 'organization', 'message'),
        });
    };

    return (
        <AppLayout>
            <Head title="Hubungi Kami & Kolaborasi"/>

            {/* Header */}
            <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-xs font-mono text-emerald-300 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400"/>
                    JEJARING EKOSISTEM MULTI-PIHAK • POKTAN, PPL, KAMPUS & ESG/CSR
                </div>
                <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
                    Hubungi Kami & Kolaborasi Ekosistem Biochar
                </h1>
                <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-3xl">
                    Mari berkolaborasi menghentikan pembakaran limbah panen terbuka dan memulihkan kesuburan tanah pertanian Indonesia.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Left Column: Interactive Partnership Form */}
                <Interactive3DCard className="lg:col-span-7 p-6 sm:p-8" intensity="{4}">
                    <h2 className="font-display font-bold text-2xl text-white mb-2 flex items-center gap-2">
                        <MessageSquareHandshake className="w-6 h-6 text-emerald-400"/>
                        Formulir Kolaborasi & Pelaporan Titik Limbah
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mb-6">
                        Pesan Anda langsung tercatat di database koordinator regional TaniArang (Surabaya Hub & Majene Hub).
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                                    Nama Lengkap *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Bpk. Суdirman / Dr. Rina"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:border-emerald-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                                    Instansi / Kelompok Tani (Poktan) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Gapoktan Tani Mulyo / Univ..."
                                    value={data.organization}
                                    onChange={(e) => setData('organization', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:border-emerald-400 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                                    Wilayah Daerah *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.region}
                                    onChange={(e) => setData('region', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:border-emerald-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                                    Kategori Kolaborasi *
                                </label>
                                <select
                                    value={data.collaboration_type}
                                    onChange={(e) => setData('collaboration_type', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:border-emerald-400 focus:outline-none"
                                >
                                    <option value="Pendampingan Petani">Pendampingan Petani & Poktan</option>
                                    <option value="Riset Kampus">Riset Kampus & Uji Lab Tanah</option>
                                    <option value="Dukungan CSR/Alat Pirolisis">
                                        Dukungan CSR / Bantuan Alat Pirolisis
                                    </option>
                                    <option value="Pelaporan Titik Limbah">
                                        Pelaporan Titik Timbulan Limbah Panen
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-slate-300 mb-1.5">
                                Pesan atau Rencana Kolaborasi *
                            </label>
                            <textarea
                                rows="4"
                                required
                                placeholder="Tuliskan detail lokasi desa, estimasi luasan panen, atau bentuk sinergi yang diinginkan..."
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:border-emerald-400 focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-display font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-[1.01] transition"
                        >
                            <Send className="w-4 h-4"/>
                            {processing ? 'Mengirim Pesan...' : 'Kirim Pesan Kolaborasi'}
                        </button>
                    </form>
                </Interactive3DCard>

                {/* Right Column: Regional Coordinator Hubs & FAQ */}
                <div className="lg:col-span-5 space-y-6">
                    <Interactive3DCard className="p-6" intensity="{6}">
                        <div className="text-xs font-mono text-emerald-400 uppercase mb-2">
                            REGIONAL COORDINATOR HUBS
                        </div>
                        <h3 className="font-display font-bold text-xl text-white mb-4">
                            Posko Pendampingan Lapangan
                        </h3>

                        <div className="space-y-3">
                            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30">
                                <div className="font-display font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4"/>
                                    Surabaya & Jawa Timur Hub
                                </div>
                                <p className="text-xs text-slate-300 mt-1">
                                    Melayani Klaster Padi & Jagung: Kab. Lamongan, Kab. Ngawi, dan Kab. Malang.
                                </p>
                                <div className="text-[11px] font-mono text-slate-400 mt-1.5 flex items-center gap-2">
                                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400"/>
                                    jatim@taniarang.id • +62 812-3456-2026
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30">
                                <div className="font-display font-bold text-sm text-amber-300 flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4"/>
                                    Majene & Sulawesi Barat Hub
                                </div>
                                <p className="text-xs text-slate-300 mt-1">
                                    Melayani Klaster Perkebunan Kakao & Padi: Kab. Majene dan Kab. Polewali Mandar.
                                </p>
                                <div className="text-[11px] font-mono text-slate-400 mt-1.5 flex items-center gap-2">
                                    <PhoneCall className="w-3.5 h-3.5 text-amber-400"/>
                                    sulbar@taniarang.id • +62 813-9876-2026
                                </div>
                            </div>
                        </div>
                    </Interactive3DCard>

                    {/* FAQ Accordion */}
                    <Interactive3DCard className="p-6" intensity="{5}">
                        <h3 className="font-display font-bold text-lg text-white mb-3 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-cyan-400"/>
                            Pertanyaan Umum (FAQ Implementasi)
                        </h3>
                        <div className="space-y-2.5">
                            {FAQS.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl bg-slate-950/70 border border-slate-800 overflow-hidden"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                                        className="w-full p-3.5 text-left flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-white"
                                    >
                                        <span>{item.q}</span>
                                        <ChevronDown ${ '' 'rotate-180' : ? className="{`w-4" h-4 idx openFaq="==" shrink-0 text-emerald-400 transition-transform }`}/>
                                    </button>
                                    {openFaq === idx && (
                                        <div className="px-3.5 pb-3.5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2.5">
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Interactive3DCard>
                </div>
            </div>

            {/* Live Collaboration Feed from Database */}
            <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/30">
                <div className="mb-5">
                    <span className="text-xs font-mono text-emerald-400 uppercase">
                        LOG KOLABORASI TERDAFTAR ({messages.length} MITRA TERBARU)
                    </span>
                    <h3 className="font-display font-bold text-xl text-white">
                        Aspirasi & Dukungan Mitra TaniArang
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className="p-4 rounded-2xl bg-slate-950/75 border border-emerald-500/20 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                        {msg.collaboration_type}
                                    </span>
                                    <span className="text-[11px] font-mono text-cyan-300">
                                        {msg.region}
                                    </span>
                                </div>
                                <div className="font-display font-bold text-sm text-white">
                                    {msg.name}
                                </div>
                                <div className="text-xs text-emerald-300 mb-2">
                                    {msg.organization}
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    "{msg.message}"
                                </p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5"/>
                                {msg.status}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}