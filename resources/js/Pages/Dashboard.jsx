import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import StatCard from '@/Components/StatCard';
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
    ShieldCheck,
    Layers,
    Wheat,
} from 'lucide-react';

const CustomCarbonTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-carbon-900 border border-carbon-700 rounded-xl p-3 text-xs shadow-xl text-stone-200">
                <p className="font-bold text-stone-100 mb-1">{label}</p>
                {payload.map((entry, idx) => (
                    <p key={idx} style={{ color: entry.color || '#22C55E' }}>
                        {entry.name}: <span className="font-bold text-stone-100">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const COMMODITY_MATRIX = [
    {
        name: 'Silika Sekam Padi',
        region: 'Ngawi & Lamongan',
        nutrient: 'SiO2 > 85% (Silika Aktif)',
        role: 'Memperkuat batang padi dan daya tahan serangan hama wereng',
        icon: Wheat,
        tag: 'Ketahanan Batang',
        tagVariant: 'foliage',
    },
    {
        name: 'Kalium Kulit Kakao',
        region: 'Majene & Polman',
        nutrient: 'K2O hingga 40% abu, pH 9.2',
        role: 'Memulihkan pH asam dan menekan jamur akar Phytophthora',
        icon: Flame,
        tag: 'Korektor pH & Hara',
        tagVariant: 'harvest',
    },
    {
        name: 'Karbon Tongkol Jagung',
        region: 'Malang & Lamongan',
        nutrient: 'Porositas Mikro Tinggi',
        role: 'Meningkatkan KTK tanah dan menahan cadangan air saat kemarau',
        icon: Layers,
        tag: 'Retensi Air',
        tagVariant: 'soil',
    },
    {
        name: 'Topsoil Jerami Padi',
        region: 'Lamongan & Ngawi',
        nutrient: 'C-Organik Humat Tanah',
        role: 'Menaikkan kandungan organik tanah sawah dari <2% ke >3%',
        icon: Sprout,
        tag: 'Rehabilitasi Tanah',
        tagVariant: 'terracotta',
    },
];

export default function Dashboard({
    totalScansCount = 10,
    recentScans = [],
    regionalComparison = [],
    wasteDistribution = [],
    monthlyTrend = [],
}) {
    const kpiCards = [
        {
            title: 'Potensi Residu Panen Jatim',
            value: '6.2 Juta Ton',
            subtitle: 'Sentra Lamongan, Ngawi, Malang (BPS & Kementan RI)',
            icon: Sprout,
            iconColor: 'text-emerald-400',
            iconBg: 'bg-emerald-950/60',
        },
        {
            title: 'Rasio Residu Kulit Kakao Sulbar',
            value: '72.5% Panen',
            subtitle: 'Sentra Majene & Polewali Mandar: Rawan Jamur',
            icon: Flame,
            iconColor: 'text-amber-400',
            iconBg: 'bg-amber-950/60',
        },
        {
            title: 'Lahan Kritis C-Organik (<2%)',
            value: '~70% Sawah',
            subtitle: 'Dampak pemupukan kimia intensif & bakar jerami',
            icon: AlertTriangle,
            iconColor: 'text-orange-400',
            iconBg: 'bg-orange-950/60',
        },
        {
            title: 'Titik Data Komunitas',
            value: `${totalScansCount} Lokasi`,
            subtitle: 'Dokumentasi pemindaian Kelompok Tani terverifikasi',
            icon: Database,
            iconColor: 'text-emerald-400',
            iconBg: 'bg-emerald-950/60',
        },
    ];

    return (
        <AppLayout>
            <Head title="Beranda & Dashboard Data Biochar" />

            {/* 1. Hero Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
                <div className="lg:col-span-7 space-y-5">
                    <span className="text-sm font-semibold text-emerald-400 block tracking-wide">
                        Inisiatif Biochar Pertanian Indonesia
                    </span>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                        Hentikan Pembakaran Terbuka,{' '}
                        <span className="text-emerald-400">
                            Ubah Residu Panen Jadi Biochar Tani.
                        </span>
                    </h1>

                    <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                        Platform data faktual dan pemindai foto berbasis AI untuk mendampingi petani di Jawa Timur dan Sulawesi Barat menghentikan pembakaran terbuka dan mengonversi jerami, sekam, tongkol jagung, serta kulit kakao menjadi arang aktif penyubur tanah.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Button
                            as={Link}
                            href="/scanner"
                            variant="primary"
                            size="lg"
                        >
                            <Camera className="w-5 h-5 mr-2" />
                            Pindai Foto Limbah
                            <ArrowUpRight className="w-4 h-4 ml-1.5" />
                        </Button>
                        <Button
                            as={Link}
                            href="/facts"
                            variant="secondary"
                            size="lg"
                        >
                            <BookOpen className="w-4 h-4 text-emerald-400 mr-2" />
                            Pelajari Fakta
                        </Button>
                        <Button
                            as={Link}
                            href="/community-map"
                            variant="outline"
                            size="lg"
                        >
                            <MapPin className="w-4 h-4 text-stone-400 mr-2" />
                            Peta Sebaran
                        </Button>
                    </div>

                    <div className="pt-2 flex items-center gap-6 text-xs text-stone-400">
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            Rujukan Balittanah & BPS RI
                        </span>
                        <span>Metode Pirolisis Bersih Kon-Tiki</span>
                    </div>
                </div>

                {/* 4 Commodities Grid */}
                <div className="lg:col-span-5">
                    <Card className="p-6">
                        <div className="mb-4 pb-3 border-b border-carbon-700/60">
                            <h2 className="font-bold text-base text-white">
                                Karakteristik 4 Komoditas Biochar
                            </h2>
                            <p className="text-xs text-stone-400 mt-0.5">
                                Potensi hara dan perbaikan struktur tanah per komoditas sentra
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {COMMODITY_MATRIX.map((item, idx) => {
                                const IconComponent = item.icon;
                                return (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-xl bg-carbon-900 border border-carbon-700/60 flex flex-col justify-between space-y-2"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-1 mb-1.5">
                                                <Badge variant={item.tagVariant} size="sm">
                                                    {item.tag}
                                                </Badge>
                                                <IconComponent className="w-4 h-4 text-stone-400" />
                                            </div>
                                            <h3 className="font-semibold text-sm text-stone-100">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-emerald-400 mt-0.5">
                                                {item.nutrient}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-carbon-800 text-xs text-stone-400 leading-snug">
                                            <p>{item.role}</p>
                                            <p className="mt-1 text-[11px] text-stone-500">
                                                Sentra: {item.region}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </section>

            {/* 2. 4 Telemetry KPI StatCards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {kpiCards.map((card, index) => (
                    <StatCard
                        key={index}
                        title={card.title}
                        value={card.value}
                        subtitle={card.subtitle}
                        icon={card.icon}
                        iconColor={card.iconColor}
                        iconBg={card.iconBg}
                    />
                ))}
            </section>

            {/* 3. Recharts Agricultural Cockpit Grid (Bar Chart + Donut Chart) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                {/* Bar Chart: Regional Waste Generation vs Biochar Conversion */}
                <Card className="lg:col-span-7 p-6">
                    <div className="mb-5">
                        <h3 className="font-bold text-lg text-white">
                            Timbulan Residu Panen vs Potensi Biochar
                        </h3>
                        <p className="text-xs text-stone-400 mt-0.5">
                            Data estimasi regional per kabupaten sentra (dalam Ribu Ton/Tahun)
                        </p>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionalComparison} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                <CartesianGrid stroke="#232E29" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="region" fontSize={12} stroke="#8B9B92" tickLine={false} />
                                <YAxis fontSize={12} stroke="#8B9B92" tickLine={false} />
                                <Tooltip content={<CustomCarbonTooltip />} />
                                <Legend
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                                    formatter={(value) => <span className="text-stone-300">{value}</span>}
                                />
                                <Bar
                                    dataKey="timbulan_ribu_ton"
                                    fill="#F59E0B"
                                    name="Timbulan Limbah (Ribu Ton)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="biochar_terolah_ribu_ton"
                                    fill="#22C55E"
                                    name="Konversi Biochar (Ribu Ton)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Donut Chart: Commodity Distribution */}
                <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
                    <div>
                        <div className="mb-4">
                            <h3 className="font-bold text-lg text-white">
                                Proporsi Jenis Residu Terdata
                            </h3>
                            <p className="text-xs text-stone-400 mt-0.5">
                                Sebaran komoditas limbah yang teridentifikasi di lapangan
                            </p>
                        </div>

                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        cx="50%"
                                        cy="50%"
                                        data={wasteDistribution}
                                        dataKey="value"
                                        innerRadius={50}
                                        nameKey="name"
                                        outerRadius={80}
                                        paddingAngle={4}
                                        stroke="#161E1A"
                                        strokeWidth={2}
                                    >
                                        {wasteDistribution.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomCarbonTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {wasteDistribution.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between px-3 py-2 rounded-xl bg-carbon-900 border border-carbon-700/60 text-xs"
                            >
                                <span className="flex items-center gap-2 text-stone-300 truncate mr-1">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="truncate">{item.name}</span>
                                </span>
                                <span className="font-semibold text-white shrink-0">
                                    {item.value} log
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </section>

            {/* 4. Area Chart Trend & Verified Recent Scans Feed */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Area Chart: Open Burning Reduction vs Biochar Adoption */}
                <Card className="lg:col-span-7 p-6">
                    <div className="mb-4">
                        <h3 className="font-bold text-lg text-white">
                            Tren Penurunan Lahan Pembakaran Terbuka
                        </h3>
                        <p className="text-xs text-stone-400 mt-0.5">
                            Luas lahan terdampak program substitusi biochar (Hektar)
                        </p>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="biocharGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#232E29" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="bulan" fontSize={12} stroke="#8B9B92" tickLine={false} />
                                <YAxis fontSize={12} stroke="#8B9B92" tickLine={false} />
                                <Tooltip content={<CustomCarbonTooltip />} />
                                <Legend
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                                    formatter={(value) => <span className="text-stone-300">{value}</span>}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="konversi_biochar_ha"
                                    fill="url(#biocharGrad)"
                                    fillOpacity={1}
                                    name="Lahan Biochar (Ha)"
                                    stroke="#22C55E"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="pembakaran_terbuka_ha"
                                    fill="url(#burnGrad)"
                                    fillOpacity={1}
                                    name="Pembakaran Terbuka (Ha)"
                                    stroke="#F97316"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Recent Verified Scans Snapshot */}
                <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-white">
                                    Dokumentasi Lapangan Terakhir
                                </h3>
                                <p className="text-xs text-stone-400 mt-0.5">
                                    Log verifikasi kelompok tani mitra
                                </p>
                            </div>
                            <Link
                                href="/community-map"
                                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                            >
                                Peta Lengkap <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {recentScans && recentScans.length > 0 ? (
                            <div className="space-y-3">
                                {recentScans.map((scan) => (
                                    <div
                                        key={scan.id}
                                        className="p-3 rounded-xl bg-carbon-900 border border-carbon-700/60 flex items-start justify-between gap-3"
                                    >
                                        <div className="min-w-0">
                                            <div className="font-semibold text-sm text-stone-100 flex items-center gap-1.5 truncate">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                                <span className="truncate">{scan.farmer_group_name}</span>
                                            </div>
                                            <div className="text-xs text-stone-400 flex items-center gap-1.5 mt-1">
                                                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                                                <span className="truncate">
                                                    {scan.regency} • {scan.detected_waste_type}
                                                </span>
                                            </div>
                                            {scan.moisture_condition && (
                                                <span className="inline-block mt-1 text-xs text-stone-400">
                                                    Kondisi: {scan.moisture_condition}
                                                </span>
                                            )}
                                        </div>
                                        <Badge variant="foliage" size="sm" className="shrink-0">
                                            {Math.round(scan.ai_confidence)}% Akurasi
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 px-4 rounded-xl bg-carbon-900 border border-carbon-700/60 text-center space-y-3">
                                <div className="w-10 h-10 rounded-full bg-carbon-800 mx-auto flex items-center justify-center text-stone-400">
                                    <Camera className="w-5 h-5" />
                                </div>
                                <p className="text-sm font-medium text-stone-300">
                                    Belum ada data dokumentasi
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-carbon-700/60 flex items-center justify-between text-xs text-stone-400">
                        <span>Punya foto tumpukan limbah panen?</span>
                        <Link
                            href="/scanner"
                            className="text-emerald-400 font-semibold hover:text-emerald-300"
                        >
                            Uji di Pemindai
                        </Link>
                    </div>
                </Card>
            </section>
        </AppLayout>
    );
}
