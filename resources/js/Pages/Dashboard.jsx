import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Interactive3DCard from '@/Components/Interactive3DCard';
import Biochar3DMoleculeHero from '@/Components/Biochar3DMoleculeHero';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    Legend,
} from 'recharts';
import {
    Camera,
    BookOpen,
    Sprout,
    Flame,
    AlertTriangle,
    Database,
    ArrowUpRight,
    CheckCircle2,
    MapPin,
} from 'lucide-react';

const CustomGlassTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel rounded-xl p-3 border border-emerald-400/50 text-xs font-mono shadow-2xl">
                <p className="font-bold text-white mb-1">{label}</p>
                {payload.map((entry, idx) => (
                    <p key={idx} style={{ color: entry.color || '#10B981' }}>
                        {entry.name}: <span className="font-bold">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard({
    totalScansCount = 10,
    recentScans = [],
    regionalComparison = [],
    wasteDistribution = [],
    monthlyTrend = [],
}) {
    const kpiCards = [
        {
            title: 'Potensi Limbah Padi & Jagung Jatim',
            value: '6.2 Juta Ton/Thn',
            subtitle: 'Fakta BPS & Kementan RI (Sentra Lamongan, Ngawi, Malang)',
            badge: 'SUMBER KARBON',
            icon: Sprout,
            accent: 'text-emerald-400',
            glow: 'rgba(16, 185, 129, 0.28)',
        },
        {
            title: 'Rasio Limbah Kulit Kakao Sulbar',
            value: '72.5% Bobot Panen',
            subtitle: 'Sentra Majene & Polewali Mandar — Rawan Jamur Phytophthora',
            badge: 'POTENSI KALIUM',
            icon: Flame,
            accent: 'text-amber-400',
            glow: 'rgba(245, 158, 11, 0.25)',
        },
        {
            title: 'Lahan Kritis Bahan Organik (<2%)',
            value: '~70% Lahan Intensif',
            subtitle: 'Dampak pemupukan sintetis jangka panjang & pembakaran jerami',
            badge: 'DARURAT TANAH',
            icon: AlertTriangle,
            accent: 'text-cyan-400',
            glow: 'rgba(6, 182, 212, 0.25)',
        },
        {
            title: 'Total Dokumentasi Komunitas TaniArang',
            value: `${totalScansCount} Titik Terverifikasi`,
            subtitle: 'Data real-time hasil pemindaian AI Kelompok Tani mitra',
            badge: 'LIVE DATABASE',
            icon: Database,
            accent: 'text-emerald-300',
            glow: 'rgba(16, 185, 129, 0.3)',
        },
    ];

    return (
        <AppLayout>
            <Head title="Beranda & Dashboard Statistik" />

            {/* 1. Futuristic 3D Hero Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
                <div className="lg:col-span-7 space-y-5">
                    <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-xs font-mono text-emerald-300">
                        <span>PSN SWASEMBADA PANGAN</span>
                        <span>•</span>
                        <span>SDGs 12, 13 & 15</span>
                        <span>•</span>
                        <span className="text-amber-300">TANPA KALKULATOR RUMIT</span>
                    </div>

                    <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-[52px] leading-[1.08] tracking-tight text-white">
                        Hentikan Asap Pembakaran.{' '}
                        <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
                            Ubah Limbah Panen Jadi Emas Hitam Biochar.
                        </span>
                    </h1>

                    <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                        Portal data faktual dan pemindai visual berbasis AI untuk membantu Kelompok Tani di{' '}
                        <strong className="text-emerald-300">Jawa Timur</strong> dan{' '}
                        <strong className="text-amber-300">Sulawesi Barat</strong> mengolah limbah jerami, sekam, tongkol jagung, dan kulit kakao menjadi arang pertanian penyubur tanah.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Link
                            href="/scanner"
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-display font-bold text-sm shadow-[0_0_30px_rgba(16,185,129,0.45)] hover:scale-[1.02] transition"
                        >
                            <Camera className="w-5 h-5" />
                            Pindai Foto Limbah Sekarang
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/facts"
                            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl glass-panel text-slate-100 hover:text-emerald-300 font-medium text-sm"
                        >
                            <BookOpen className="w-4 h-4 text-emerald-400" />
                            Bandingkan: Dibakar vs Biochar
                        </Link>
                    </div>
                </div>

                {/* Interactive 3D Rotating Molecular Sphere / Carbon Matrix */}
                <div className="lg:col-span-5">
                    <Biochar3DMoleculeHero />
                </div>
            </section>

            {/* 2. 4 3D-Tilt KPI Cards (Bento Grid Row 1) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {kpiCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <Interactive3DCard key={index} className="p-5" glowColor={card.glow}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-800/90 text-slate-300 border border-slate-700">
                                    {card.badge}
                                </span>
                                <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-emerald-500/30 flex items-center justify-center">
                                    <Icon className={`w-5 h-5 ${card.accent}`} />
                                </div>
                            </div>
                            <div className={`font-mono font-bold text-2xl sm:text-3xl ${card.accent} mb-1`}>
                                {card.value}
                            </div>
                            <h2 className="font-display font-bold text-sm text-white mb-1">
                                {card.title}
                            </h2>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                {card.subtitle}
                            </p>
                        </Interactive3DCard>
                    );
                })}
            </section>

            {/* 3. Interactive Recharts Bento Grid (Bar Chart + Donut Chart) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                {/* Bar Chart: Timbulan Limbah vs Pemanfaatan Arang Tani */}
                <Interactive3DCard className="lg:col-span-7 p-6" intensity={4}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                        <div>
                            <span className="text-xs font-mono text-emerald-400 uppercase">
                                ANALISIS KLASTER DAERAH (RIBU TON/TAHUN)
                            </span>
                            <h3 className="font-display font-bold text-lg text-white">
                                Timbulan Limbah Panen vs Konversi Arang Tani
                            </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-300">
                            Jatim & Sulbar
                        </span>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionalComparison}>
                                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
                                <XAxis dataKey="region" fontSize={11} stroke="#94a3b8" tickLine={false} />
                                <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} />
                                <Tooltip content={<CustomGlassTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar
                                    dataKey="timbulan_ribu_ton"
                                    fill="#06B6D4"
                                    name="Total Timbulan Limbah (Ribu Ton)"
                                    radius={[6, 6, 0, 0]}
                                />
                                <Bar
                                    dataKey="biochar_terolah_ribu_ton"
                                    fill="#10B981"
                                    name="Potensi & Realisasi Biochar (Ribu Ton)"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Interactive3DCard>

                {/* Donut Chart: Distribusi Jenis Limbah Terdeteksi AI */}
                <Interactive3DCard className="lg:col-span-5 p-6" intensity={5}>
                    <div className="mb-4">
                        <span className="text-xs font-mono text-amber-400 uppercase">
                            TELEMETRI PEMINDAI AI
                        </span>
                        <h3 className="font-display font-bold text-lg text-white">
                            Distribusi Biomassa Terdeteksi Komunitas
                        </h3>
                    </div>

                    <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    cx="50%"
                                    cy="50%"
                                    data={wasteDistribution}
                                    dataKey="value"
                                    innerRadius={55}
                                    nameKey="name"
                                    outerRadius={85}
                                    paddingAngle={4}
                                >
                                    {wasteDistribution.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomGlassTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {wasteDistribution.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                            >
                                <span className="flex items-center gap-2 text-slate-300">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    {item.name}
                                </span>
                                <span className="font-mono font-bold text-white">
                                    {item.value} log
                                </span>
                            </div>
                        ))}
                    </div>
                </Interactive3DCard>
            </section>

            {/* 4. Area Chart Trend & Live Recent Community Logs */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Area Chart: Tren Pengurangan Pembakaran Terbuka */}
                <Interactive3DCard className="lg:col-span-7 p-6" intensity={4}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div>
                            <span className="text-xs font-mono text-cyan-400 uppercase">
                                DAMPAK LINGKUNGAN (HEKTAR LAHAN MITRA)
                            </span>
                            <h3 className="font-display font-bold text-lg text-white">
                                Tren Penurunan Pembakaran Terbuka vs Adopsi Biochar
                            </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-mono text-xs">
                            -82% Asap PM2.5
                        </span>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyTrend}>
                                <defs>
                                    <linearGradient id="biocharGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.55} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.45} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
                                <XAxis dataKey="bulan" fontSize={11} stroke="#94a3b8" />
                                <YAxis fontSize={11} stroke="#94a3b8" />
                                <Tooltip content={<CustomGlassTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Area
                                    type="monotone"
                                    dataKey="konversi_biochar_ha"
                                    fill="url(#biocharGrad)"
                                    fillOpacity={1}
                                    name="Lahan Aplikasi Biochar (Ha)"
                                    stroke="#10B981"
                                    strokeWidth={2.5}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="pembakaran_terbuka_ha"
                                    fill="url(#burnGrad)"
                                    fillOpacity={1}
                                    name="Kasus Pembakaran Terbuka (Ha)"
                                    stroke="#F59E0B"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Interactive3DCard>

                {/* Recent Verified Scans Snapshot */}
                <Interactive3DCard className="lg:col-span-5 p-6 flex flex-col justify-between" intensity={5}>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="text-xs font-mono text-emerald-400 uppercase">
                                    AKTIVITAS LAPANGAN TERBARU
                                </span>
                                <h3 className="font-display font-bold text-lg text-white">
                                    Log Dokumentasi Kelompok Tani
                                </h3>
                            </div>
                            <Link
                                href="/community-map"
                                className="text-xs font-mono text-emerald-300 hover:underline flex items-center gap-1"
                            >
                                Lihat Peta <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentScans.map((scan) => (
                                <div
                                    key={scan.id}
                                    className="p-3 rounded-xl bg-slate-950/65 border border-emerald-500/20 flex items-start justify-between gap-3"
                                >
                                    <div>
                                        <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            {scan.farmer_group_name}
                                        </div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-3 h-3 text-cyan-400" />
                                            {scan.regency} • {scan.detected_waste_type}
                                        </div>
                                    </div>
                                    <span className="shrink-0 px-2 py-0.5 rounded-md font-mono text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                        {scan.ai_confidence}% AI
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs text-slate-400">
                        <span>Ingin menambahkan dokumentasi Poktan Anda?</span>
                        <Link
                            href="/scanner"
                            className="font-mono text-emerald-300 font-semibold hover:text-emerald-200"
                        >
                            + Pindai Baru →
                        </Link>
                    </div>
                </Interactive3DCard>
            </section>
        </AppLayout>
    );
}