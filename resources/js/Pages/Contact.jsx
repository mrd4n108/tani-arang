import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Handshake,
    Send,
    Building2,
    MapPin,
    PhoneCall,
    Mail,
    HelpCircle,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Inbox,
} from 'lucide-react';

const FAQS = [
    {
        q: 'Apakah petani harus membeli tungku mahal untuk membuat Biochar?',
        a: 'Tidak perlu. Petani dapat menggunakan metode Kon-Tiki sederhana menggunakan lubang tanah kerucut (diameter 1.5 meter) dengan teknik penyalaan api dari atas (Top-Lit Updraft) yang praktis, minim asap, dan menghasilkan biochar berkualitas dalam 45 sampai 60 menit.',
    },
    {
        q: 'Mengapa TaniArang berfokus pada panduan visual praktis?',
        a: 'Berdasarkan pengalaman di lapangan bersama Kelompok Tani (Poktan) dan Penyuluh (PPL), petani membutuhkan kepastian visual mengenai kesiapan kekeringan limbah dan 3 langkah pengolahan praktis yang bisa langsung diterapkan tanpa perhitungan yang rumit.',
    },
    {
        q: 'Bagaimana bentuk kolaborasi untuk Kampus dan Mitra CSR?',
        a: 'Mitra CSR dapat menyalurkan bantuan tungku pirolisis portabel berbasis data titik timbulan limbah tertinggi di peta TaniArang, sedangkan kampus dapat berkolaborasi dalam uji mutu pori biochar dan pendampingan mahasiswa di desa sentra.',
    },
];

export default function Contact({ messages = [] }) {
    const { flash } = usePage().props;
    const [openFaq, setOpenFaq] = useState(0);

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        organization: '',
        region: 'Kab. Lamongan, Jawa Timur',
        collaboration_type: 'Pendampingan Petani',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Hubungi Kami & Kolaborasi" />

            {/* Header */}
            <header className="mb-10">
                <span className="text-sm font-semibold text-emerald-400 block mb-2">
                    Jejaring Ekosistem Biochar Nusantara
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Hubungi Kami & Kolaborasi
                </h1>
                <p className="text-stone-300 text-base mt-2 max-w-3xl leading-relaxed">
                    Mari berkolaborasi menghentikan pembakaran residu panen terbuka dan memulihkan kesuburan tanah pertanian Indonesia.
                </p>
            </header>

            {/* Flash Feedback Notification */}
            {(flash?.success || recentlySuccessful) && (
                <div
                    role="alert"
                    className="mb-8 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-start gap-3 text-emerald-200"
                >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                        <div className="font-bold text-sm text-white">
                            Pesan Kolaborasi Berhasil Dikirim
                        </div>
                        <p className="text-xs text-emerald-300 mt-0.5">
                            {flash?.success || 'Terima kasih atas aspirasi Anda. Koordinator regional kami akan segera menindaklanjuti.'}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Left Column: Partnership Form */}
                <section className="lg:col-span-7 bg-carbon-850 border border-carbon-700/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 flex items-center justify-center text-emerald-400 shrink-0">
                                <Handshake className="w-5 h-5" />
                            </div>
                            <h2 className="font-bold text-xl text-white">
                                Formulir Kemitraan & Pelaporan Titik Limbah
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-400 mb-6 leading-relaxed">
                            Pesan Anda langsung tercatat di koordinasi posko lapangan regional TaniArang (Surabaya dan Majene).
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="contact-name" className="block text-xs text-stone-300 mb-1.5 font-medium">
                                        Nama Lengkap <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        required
                                        placeholder="Nama Anda"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-carbon-900 border border-carbon-700 text-sm text-white placeholder-stone-500 focus:border-emerald-500 focus:outline-none transition"
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="contact-org" className="block text-xs text-stone-300 mb-1.5 font-medium">
                                        Instansi / Kelompok Tani (Poktan) <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        id="contact-org"
                                        type="text"
                                        required
                                        placeholder="Nama Poktan / Lembaga"
                                        value={data.organization}
                                        onChange={(e) => setData('organization', e.target.value)}
                                        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-carbon-900 border border-carbon-700 text-sm text-white placeholder-stone-500 focus:border-emerald-500 focus:outline-none transition"
                                    />
                                    {errors.organization && (
                                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            {errors.organization}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="contact-region" className="block text-xs text-stone-300 mb-1.5 font-medium">
                                        Wilayah Daerah <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        id="contact-region"
                                        type="text"
                                        required
                                        placeholder="Contoh: Kab. Lamongan, Jawa Timur"
                                        value={data.region}
                                        onChange={(e) => setData('region', e.target.value)}
                                        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-carbon-900 border border-carbon-700 text-sm text-white placeholder-stone-500 focus:border-emerald-500 focus:outline-none transition"
                                    />
                                    {errors.region && (
                                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            {errors.region}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="contact-collab-type" className="block text-xs text-stone-300 mb-1.5 font-medium">
                                        Kategori Kolaborasi <span className="text-rose-400">*</span>
                                    </label>
                                    <select
                                        id="contact-collab-type"
                                        value={data.collaboration_type}
                                        onChange={(e) => setData('collaboration_type', e.target.value)}
                                        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-carbon-900 border border-carbon-700 text-sm text-white focus:border-emerald-500 focus:outline-none transition"
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
                                    {errors.collaboration_type && (
                                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            {errors.collaboration_type}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="contact-message" className="block text-xs text-stone-300 mb-1.5 font-medium">
                                    Pesan atau Rencana Kolaborasi <span className="text-rose-400">*</span>
                                </label>
                                <textarea
                                    id="contact-message"
                                    rows="4"
                                    required
                                    placeholder="Tuliskan detail desa, jenis limbah, atau bentuk kerja sama yang diharapkan..."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-carbon-900 border border-carbon-700 text-sm text-white placeholder-stone-500 focus:border-emerald-500 focus:outline-none transition"
                                />
                                {errors.message && (
                                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        {errors.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition disabled:opacity-50"
                            >
                                <Send className="w-4 h-4 shrink-0" />
                                <span>{processing ? 'Mengirim...' : 'Kirim Pesan Kolaborasi'}</span>
                            </button>
                        </form>
                    </div>
                </section>

                {/* Right Column: Regional Hubs & FAQ Accordion */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Regional Coordinator Hubs Card */}
                    <section className="bg-carbon-850 border border-carbon-700/60 rounded-2xl p-6">
                        <h3 className="font-bold text-lg text-white mb-4">
                            Koordinator Posko Regional
                        </h3>

                        <div className="space-y-3.5">
                            <div className="p-4 rounded-xl bg-carbon-900 border border-carbon-700/60">
                                <div className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    Jawa Timur Hub (Surabaya)
                                </div>
                                <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                                    Klaster Jerami & Jagung: Kab. Lamongan, Kab. Ngawi, dan Kab. Malang.
                                </p>
                                <div className="mt-2.5 pt-2 border-t border-carbon-800 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-stone-400">
                                    <a
                                        href="mailto:jatim@taniarang.id"
                                        className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition"
                                    >
                                        <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        jatim@taniarang.id
                                    </a>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-carbon-900 border border-carbon-700/60">
                                <div className="font-bold text-sm text-amber-400 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                                    Sulawesi Barat Hub (Majene)
                                </div>
                                <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                                    Klaster Kakao & Perkebunan: Kab. Majene dan Kab. Polewali Mandar.
                                </p>
                                <div className="mt-2.5 pt-2 border-t border-carbon-800 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-stone-400">
                                    <a
                                        href="mailto:sulbar@taniarang.id"
                                        className="inline-flex items-center gap-1.5 hover:text-amber-400 transition"
                                    >
                                        <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                        sulbar@taniarang.id
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ Accordion Card */}
                    <section className="bg-carbon-850 border border-carbon-700/60 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                            <h3 className="font-bold text-lg text-white">
                                Pertanyaan yang Sering Diajukan
                            </h3>
                        </div>
                        <div className="space-y-2.5">
                            {FAQS.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl bg-carbon-900 border border-carbon-700/60 overflow-hidden"
                                >
                                    <button
                                        type="button"
                                        aria-expanded={openFaq === idx}
                                        onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                                        className="w-full min-h-[44px] p-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-white hover:text-emerald-400 transition"
                                    >
                                        <span className="leading-snug">{item.q}</span>
                                        <ChevronDown
                                            className={`w-4 h-4 shrink-0 text-emerald-400 transition-transform duration-200 ${
                                                openFaq === idx ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                    {openFaq === idx && (
                                        <div className="px-3.5 pb-3.5 text-xs text-stone-300 leading-relaxed border-t border-carbon-800 pt-2.5">
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Community Collaboration Log */}
            <section className="bg-carbon-850 border border-carbon-700/60 rounded-2xl p-6 sm:p-8">
                <div className="mb-6">
                    <h2 className="font-bold text-xl text-white">
                        Aspirasi Kolaborasi Terakhir
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-400 mt-1">
                        Daftar pesan inisiatif yang masuk dari kelompok tani dan pendamping lapangan
                    </p>
                </div>

                {messages.length === 0 ? (
                    <div className="p-8 rounded-xl bg-carbon-900 border border-carbon-700/60 text-center flex flex-col items-center justify-center">
                        <Inbox className="w-8 h-8 text-stone-500 mb-2" />
                        <p className="text-xs text-stone-400">
                            Belum ada pesan kolaborasi tercatat
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className="p-4 rounded-xl bg-carbon-900 border border-carbon-700/60 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300">
                                            {msg.collaboration_type}
                                        </span>
                                        <span className="text-xs text-stone-400">
                                            {msg.region}
                                        </span>
                                    </div>
                                    <div className="font-bold text-sm text-white">
                                        {msg.name}
                                    </div>
                                    <div className="text-xs text-emerald-400 mb-2">
                                        {msg.organization}
                                    </div>
                                    <p className="text-xs text-stone-300 leading-relaxed">
                                        "{msg.message}"
                                    </p>
                                </div>
                                <div className="mt-3 pt-2.5 border-t border-carbon-800 flex items-center gap-1.5 text-xs text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>{msg.status ? msg.status.replace(/\u2014/g, ':') : 'Terkirim: Diterima Koordinator'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </AppLayout>
    );
}
