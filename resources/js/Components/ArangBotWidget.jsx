import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Sparkles, Camera, BarChart3, RefreshCw, X, Bot, MapPin, BookOpen } from 'lucide-react';

const BOT_MESSAGES = [
    {
        badge: 'FAKTA JERAMI JATIM #1',
        eyeMode: 'happy',
        text: 'Tahukah kamu? 1 Hektar sawah menghasilkan 5–7 ton jerami. Jangan dibakar! Ubah jadi Biochar untuk mengunci karbon ratusan tahun!',
    },
    {
        badge: 'PANDUAN JURI & DEMO #2',
        eyeMode: 'scan',
        text: 'Klik tab "Pemindai AI" untuk mencoba deteksi foto limbah panen otomatis dalam 2 detik — tersedia 4 tombol sampel instan tanpa perlu upload file!',
    },
    {
        badge: 'FAKTA KAKAO SULBAR #3',
        eyeMode: 'star',
        text: 'Fakta Sulbar: 72.5% berat buah kakao adalah limbah kulit. Jika dijadikan arang (Biochar), ia memutus siklus jamur akar Phytophthora!',
    },
    {
        badge: 'GREEN IT TELEMETRY #4',
        eyeMode: 'wink',
        text: 'Mode Hemat Energi Aktif: Halaman ini menggunakan kompresi WebP & arsitektur Green IT (< 0.02g CO2/load) untuk koneksi pedesaan.',
    },
    {
        badge: 'PSN SWASEMBADA PANGAN #5',
        eyeMode: 'happy',
        text: 'Sekitar 70% lahan pertanian intensif kita mengalami kritis bahan organik (<2%). Biochar meningkatkan daya ikat pupuk hingga 38%!',
    },
    {
        badge: 'BAHAYA BAKAR TERBUKA #6',
        eyeMode: 'scan',
        text: 'Membakar 1 ton jerami secara terbuka melepaskan 1.460 kg gas CO2 dan partikel PM2.5 yang merusak paru-paru petani serta membunuh mikroba topsoil.',
    },
    {
        badge: 'SILIKA SEKAM NGAWI #7',
        eyeMode: 'star',
        text: 'Arang sekam padi mengandung 18–21% Silika Aktif (SiO2) yang memperkuat dinding sel batang padi agar tahan rebah dan serangan wereng!',
    },
    {
        badge: 'TONGKOL JAGUNG MALANG #8',
        eyeMode: 'happy',
        text: 'Berkat lignin padat, biochar tongkol jagung memiliki karbon tetap >76% dan mampu menyimpan air hingga 4.8 kali bobot keringnya saat kemarau!',
    },
    {
        badge: 'TEKNIK KON-TIKI #9',
        eyeMode: 'wink',
        text: 'Tidak punya drum mahal? Petani bisa membuat lubang tanah kerucut "Kon-Tiki" dan menyalakan api dari pucuk atas (Top-Lit) bebas asap!',
    },
    {
        badge: 'KALIUM ALAMI #10',
        eyeMode: 'star',
        text: 'Biochar kulit buah kakao mengandung Kalium super tinggi (4.8%–5.4% K2O) dan pH 9.4 yang efektif menetralkan tanah kebun yang masam.',
    },
    {
        badge: 'PETA KOMUNITAS #11',
        eyeMode: 'scan',
        text: 'Cek menu "Peta & Log Kelompok Tani" untuk memantau sebaran titik pirolisis aktif di klaster Jawa Timur dan Sulawesi Barat secara interaktif!',
    },
    {
        badge: 'KOLABORASI MULTI-PIHAK #12',
        eyeMode: 'happy',
        text: 'Punya kelompok tani, riset kampus, atau program CSR alat pirolisis? Kirim pesan kolaborasi langsung di halaman Hubungi Kami!',
    },
];

export default function ArangBotWidget() {
    const [messageIndex, setMessageIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(true);
    const [isJumping, setIsJumping] = useState(false);

    const currentMsg = BOT_MESSAGES[messageIndex];

    const triggerNextMessage = () => {
        setIsJumping(true);
        setIsOpen(true);
        setMessageIndex((prev) => (prev + 1) % BOT_MESSAGES.length);
        setTimeout(() => setIsJumping(false), 520);
    };

    const renderEyes = (mode) => {
        if (mode === 'scan') {
            return (
                <g>
                    <rect x="29" y="34" width="12" height="5" rx="2.5" fill="#06B6D4" />
                    <rect x="49" y="34" width="12" height="5" rx="2.5" fill="#06B6D4" />
                    <line x1="26" y1="36.5" x2="64" y2="36.5" stroke="#A7F3D0" strokeWidth="1.5" />
                </g>
            );
        }
        if (mode === 'star') {
            return (
                <g fill="#F59E0B">
                    <circle cx="35" cy="36" r="4.5" />
                    <circle cx="55" cy="36" r="4.5" />
                    <circle cx="35" cy="36" r="2" fill="#FEF3C7" />
                    <circle cx="55" cy="36" r="2" fill="#FEF3C7" />
                </g>
            );
        }
        if (mode === 'wink') {
            return (
                <g>
                    <circle cx="35" cy="36" r="4.2" fill="#10B981" />
                    <path d="M 49 36 Q 55 31 61 36" stroke="#10B981" strokeWidth="3" fill="none" strokeLinecap="round" />
                </g>
            );
        }
        // Default happy eyes
        return (
            <g>
                <circle cx="35" cy="36" r="4.5" fill="#10B981" />
                <circle cx="55" cy="36" r="4.5" fill="#10B981" />
                <circle cx="36.5" cy="34.5" r="1.5" fill="#ECFDF5" />
                <circle cx="56.5" cy="34.5" r="1.5" fill="#ECFDF5" />
            </g>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Interactive Glassmorphic Chat Bubble */}
            {isOpen && (
                <div className="mb-3 w-[310px] sm:w-[350px] glass-panel rounded-2xl p-4 border border-emerald-400/40 shadow-[0_12px_40px_rgba(16,185,129,0.28)] animate-fade-in">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            <Sparkles className="w-3 h-3 text-amber-400"/>
                            {currentMsg.badge} ({messageIndex + 1}/{BOT_MESSAGES.length})
                        </span>
                        <button
                            onClick={() => setIsOpen(false)}
                            title="Sembunyikan Balon Chat"
                            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800/60 transition"
                        >
                            <X className="w-3.5 h-3.5"/>
                        </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
                        "{currentMsg.text}"
                    </p>

                    {/* Quick Action Mini Buttons inside Bubble */}
                    <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex flex-wrap items-center gap-1.5">
                        <button
                            onClick={() => router.visit('/scanner')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-400/40 transition"
                        >
                            <Camera className="w-3 h-3"/>
                            Coba Scan AI Sekarang
                        </button>
                        <button
                            onClick={() => router.visit('/')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 transition"
                        >
                            <BarChart3 className="w-3 h-3"/>
                            Lihat Statistik
                        </button>
                        <button
                            onClick={triggerNextMessage}
                            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-400/40 transition"
                        >
                            Fakta Selanjutnya ↻
                        </button>
                    </div>
                </div>
            )}

            {/* 3D Floating Eco-Robot Mascot Button (ARANG-BOT v2.6) */}
            <button
                onClick={triggerNextMessage}
                aria-label="Interaksi dengan ARANG-BOT v2.6"
                className={`group relative flex items-center gap-2.5 p-2 pr-4 rounded-full glass-panel border-emerald-400/50 hover:border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all duration-300 ${
                    isJumping ? 'scale-110 -translate-y-3 rotate-6' : 'animate-float-slow hover:scale-105'
                }`}
            >
                {/* 3D Layered SVG Robot Avatar */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-md group-hover:bg-emerald-400/40 transition" />
                    <svg viewBox="0 0 90 90" className="w-14 h-14 relative z-10 overflow-visible">
                        <defs>
                            <linearGradient id="botBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0F172A" />
                                <stop offset="55%" stopColor="#1E293B" />
                                <stop offset="100%" stopColor="#064E3B" />
                            </linearGradient>
                            <linearGradient id="botTrimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10B981" />
                                <stop offset="50%" stopColor="#06B6D4" />
                                <stop offset="100%" stopColor="#F59E0B" />
                            </linearGradient>
                        </defs>

                        {/* 3D Bottom Shadow Disc */}
                        <ellipse cx="45" cy="82" rx="22" ry="4" fill="rgba(16, 185, 129, 0.35)" />

                        {/* Rotating Bioluminescent Antenna */}
                        <line x1="45" y1="8" x2="45" y2="18" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="45" cy="7" r="4.5" fill="#F59E0B" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                        <circle cx="45" cy="7" r="4" fill="#10B981" />

                        {/* Side Audio/Sensor Ears */}
                        <rect x="11" y="30" width="6" height="16" rx="3" fill="#06B6D4" />
                        <rect x="73" y="30" width="6" height="16" rx="3" fill="#06B6D4" />

                        {/* Main 3D Rounded Head Chassis */}
                        <rect
                            x="16"
                            y="18"
                            width="58"
                            height="42"
                            rx="16"
                            fill="url(#botBodyGrad)"
                            stroke="url(#botTrimGrad)"
                            strokeWidth="2.5"
                        />

                        {/* Glowing Visor Screen */}
                        <rect
                            x="23"
                            y="26"
                            width="44"
                            height="22"
                            rx="9"
                            fill="#020617"
                            stroke="#10B981"
                            strokeWidth="1.5"
                        />

                        {/* Dynamic Robot Eye Expressions */}
                        {renderEyes(currentMsg.eyeMode)}

                        {/* Smiling Mouth Wave */}
                        <path
                            d="M 38 43 Q 45 47 52 43"
                            stroke="#34D399"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                        />

                        {/* Floating Torso Core */}
                        <path
                            d="M 28 63 L 62 63 L 56 76 L 34 76 Z"
                            fill="url(#botBodyGrad)"
                            stroke="#10B981"
                            strokeWidth="2"
                        />
                        <circle cx="45" cy="69.5" r="3.5" fill="#10B981" />
                    </svg>
                </div>

                {/* Label & Click Prompt */}
                <div className="text-left">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="font-display font-bold text-xs tracking-tight text-white">
                            ARANG-BOT v2.6
                        </span>
                    </div>
                    <span className="block font-mono text-[10px] text-emerald-300">
                        Klik: Fakta & Panduan ({messageIndex + 1}/12)
                    </span>
                </div>
            </button>
        </div>
    );
}