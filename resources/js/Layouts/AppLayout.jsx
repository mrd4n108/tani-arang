import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Camera,
    MapPin,
    Handshake,
    Flame,
    ShieldCheck,
    History,
    Sprout,
    Users,
    LogIn,
    UserCheck,
} from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';

const NAV_ITEMS = [
    {
        name: 'Beranda',
        href: '/',
        icon: BarChart3,
    },
    {
        name: 'Fakta & Biomassa',
        href: '/facts',
        icon: BookOpen,
    },
    {
        name: 'Pemindai AI',
        href: '/scanner',
        icon: Camera,
    },
    {
        name: 'Riwayat Pindai',
        href: '/scanner?tab=history',
        icon: History,
    },
    {
        name: 'Peta Komunitas',
        href: '/community-map',
        icon: MapPin,
    },
    {
        name: 'Hubungi Kami',
        href: '/contact',
        icon: Handshake,
    },
];

export default function AppLayout({ children, title }) {
    const { url, props } = usePage();
    const [currentRole, setCurrentRole] = useState('petani');

    useEffect(() => {
        try {
            const savedRole = localStorage.getItem('taniarang_user_role');
            if (savedRole === 'komunitas' || savedRole === 'petani') {
                setCurrentRole(savedRole);
            }
        } catch (e) {}

        const handleStorageChange = () => {
            try {
                const updatedRole = localStorage.getItem('taniarang_user_role');
                if (updatedRole === 'komunitas' || updatedRole === 'petani') {
                    setCurrentRole(updatedRole);
                }
            } catch (e) {}
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const toggleRole = () => {
        const nextRole = currentRole === 'petani' ? 'komunitas' : 'petani';
        setCurrentRole(nextRole);
        try {
            localStorage.setItem('taniarang_user_role', nextRole);
        } catch (e) {}
    };

    return (
        <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-carbon-900 text-stone-900 dark:text-stone-100 selection:bg-emerald-600/30 selection:text-emerald-300 font-sans transition-colors duration-150">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-carbon-900/90 backdrop-blur-md border-b border-stone-200 dark:border-carbon-700/60 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    {/* Brand Identity */}
                    <Link
                        className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
                        href="/"
                        aria-label="Beranda TaniArang"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60 transition-colors">
                            <Flame className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <span className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white block leading-tight">
                                Tani<span className="text-emerald-600 dark:text-emerald-400">Arang</span>
                            </span>
                            <span className="text-xs text-stone-500 dark:text-stone-400 block">
                                Platform Biochar & Residu Pertanian
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi Utama">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                item.href === '/'
                                    ? url === '/'
                                    : item.href === '/scanner?tab=history'
                                    ? url.includes('tab=history')
                                    : item.href === '/scanner'
                                    ? (url.startsWith('/scanner') && !url.includes('tab=history'))
                                    : url.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                                        isActive
                                            ? 'bg-emerald-100/70 text-emerald-800 dark:bg-carbon-800 dark:text-emerald-400 font-semibold shadow-sm'
                                            : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-carbon-800/60'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Header Controls: Role Badge, ThemeToggle, CTA */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        {/* Interactive Role Switcher Pill */}
                        <button
                            type="button"
                            onClick={toggleRole}
                            title="Klik untuk beralih antara peran Petani dan Komunitas"
                            aria-label={`Peran aktif: ${currentRole === 'petani' ? 'Petani' : 'Komunitas'}. Klik untuk beralih.`}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 select-none ${
                                currentRole === 'komunitas'
                                    ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/50 dark:border-amber-700 dark:text-amber-300'
                                    : 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-300'
                            }`}
                        >
                            {currentRole === 'komunitas' ? (
                                <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            ) : (
                                <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            )}
                            <span className="hidden sm:inline">Peran:</span>
                            <span className="capitalize">{currentRole}</span>
                        </button>

                        {/* Theme Switcher Toggle */}
                        <ThemeToggle />

                        {/* Auth Link or User Info */}
                        {props?.auth?.user ? (
                            <Link
                                href="/profile"
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-stone-200 dark:border-carbon-700/60 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-carbon-800 min-h-[44px] transition"
                            >
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="max-w-[100px] truncate">{props.auth.user.name}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-stone-200 dark:border-carbon-700/60 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-carbon-800 min-h-[44px] transition"
                            >
                                <LogIn className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                                <span>Masuk</span>
                            </Link>
                        )}

                        {/* Scan CTA Button */}
                        <Link
                            href="/scanner"
                            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm min-h-[44px]"
                        >
                            <Camera className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">Pindai Limbah</span>
                            <span className="sm:hidden">Pindai</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Navigation Bar */}
                <div
                    className="lg:hidden flex items-center gap-1.5 overflow-x-auto px-4 py-2 border-t border-stone-200 dark:border-carbon-700/60 bg-white/95 dark:bg-carbon-900/95 scrollbar-none"
                    aria-label="Navigasi Mobile"
                >
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            item.href === '/'
                                ? url === '/'
                                : item.href === '/scanner?tab=history'
                                ? url.includes('tab=history')
                                : item.href === '/scanner'
                                ? (url.startsWith('/scanner') && !url.includes('tab=history'))
                                : url.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[44px] ${
                                    isActive
                                        ? 'bg-emerald-100/70 text-emerald-800 dark:bg-carbon-800 dark:text-emerald-400 font-semibold'
                                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-carbon-800/50'
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </header>

            {/* Flash Notification Banner */}
            {props?.flash?.success && (
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="rounded-xl p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-800/50 dark:text-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-sm font-medium">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{props.flash.success}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Page View */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Clean Footer */}
            <footer className="mt-20 border-t border-stone-200 dark:border-carbon-700/60 bg-stone-100 dark:bg-carbon-950 py-10 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-stone-600 dark:text-stone-400">
                    <div>
                        <span className="font-bold text-stone-900 dark:text-white text-base block">TaniArang</span>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            Inisiatif edukasi dan pengolahan residu biomassa pertanian menjadi biochar penyubur tanah.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-xs text-stone-500 dark:text-stone-400">
                        <span>Sumber Data: Balittanah • Kementan RI • BPS</span>
                        <span>Jawa Timur & Sulawesi Barat</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
