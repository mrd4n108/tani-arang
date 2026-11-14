import React, { useState } from 'react';
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
    LogOut,
    UserCheck,
    ChevronDown,
} from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function AppLayout({ children, title }) {
    const { url, props } = usePage();
    const user = props?.auth?.user;
    const userRole = user?.role || 'guest';
    const unreadCount = props?.unread_notifications_count ?? user?.unread_notifications_count ?? 0;

    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    // Dynamic Role-Aware Navigation
    const navItems = (() => {
        if (userRole === 'petani') {
            return [
                { name: 'Beranda', href: '/', icon: BarChart3 },
                { name: 'Pemindai & Setor', href: '/scanner', icon: Camera },
                { name: 'Riwayat Saya', href: '/scanner?tab=history', icon: History },
                { name: 'Fakta & Biomassa', href: '/facts', icon: BookOpen },
                { name: 'Peta Sentra', href: '/community-map', icon: MapPin },
                { name: 'Hubungi Kami', href: '/contact', icon: Handshake },
            ];
        }

        if (userRole === 'komunitas') {
            return [
                {
                    name: 'Setoran Masuk',
                    href: '/community-map',
                    icon: MapPin,
                    badge: unreadCount > 0 ? unreadCount : null,
                },
                { name: 'Pemindai Verifikasi', href: '/scanner', icon: Camera },
                { name: 'Panduan Biochar', href: '/facts', icon: BookOpen },
                { name: 'Beranda Publik', href: '/', icon: BarChart3 },
                { name: 'Hubungi Kami', href: '/contact', icon: Handshake },
            ];
        }

        // Guest (Tamu) Navigation
        return [
            { name: 'Beranda', href: '/', icon: BarChart3 },
            { name: 'Fakta & Biomassa', href: '/facts', icon: BookOpen },
            { name: 'Pemindai AI', href: '/scanner', icon: Camera },
            { name: 'Peta Komunitas', href: '/community-map', icon: MapPin },
            { name: 'Hubungi Kami', href: '/contact', icon: Handshake },
        ];
    })();

    const isLinkActive = (itemHref) => {
        if (itemHref === '/') return url === '/';
        if (itemHref === '/scanner?tab=history') return url.includes('tab=history');
        if (itemHref === '/scanner') return url.startsWith('/scanner') && !url.includes('tab=history');
        return url.startsWith(itemHref);
    };

    return (
        <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-carbon-900 text-stone-900 dark:text-stone-100 selection:bg-emerald-600/30 selection:text-emerald-300 font-sans transition-colors duration-150">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/95 dark:bg-carbon-900/95 backdrop-blur-md border-b border-stone-200 dark:border-carbon-700/60 transition-colors">
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

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi Utama">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = isLinkActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                                        isActive
                                            ? 'bg-emerald-100/70 text-emerald-800 dark:bg-carbon-800 dark:text-emerald-400 font-semibold shadow-sm'
                                            : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-carbon-800/60'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-400'}`} />
                                    <span>{item.name}</span>
                                    {item.badge && (
                                        <span
                                            aria-label={`${item.badge} setoran baru menanti`}
                                            className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm animate-pulse"
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Header Controls */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Role Status Badge (Derived strictly from backend auth, not localStorage) */}
                        {userRole === 'petani' && (
                            <div
                                title="Masuk sebagai Petani Terdaftar"
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-semibold min-h-[44px]"
                            >
                                <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Petani</span>
                            </div>
                        )}

                        {userRole === 'komunitas' && (
                            <Link
                                href="/community-map"
                                title="Masuk sebagai Sentra Komunitas"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300 text-xs font-semibold min-h-[44px]"
                            >
                                <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span className="hidden sm:inline">Sentra Komunitas</span>
                                <span className="sm:hidden">Sentra</span>
                                {unreadCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {userRole === 'guest' && (
                            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-700 dark:border-carbon-700 dark:bg-carbon-800 dark:text-stone-300 text-xs font-medium min-h-[44px]">
                                <span>Mode Tamu</span>
                            </div>
                        )}

                        {/* Theme Switcher Toggle */}
                        <ThemeToggle />

                        {/* User Profile & Logout or Guest Login CTA */}
                        {user ? (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    aria-expanded={userDropdownOpen}
                                    aria-haspopup="true"
                                    aria-label="Menu pengguna"
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-stone-200 dark:border-carbon-700/60 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-carbon-800 min-h-[44px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                >
                                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span className="max-w-[110px] truncate">{user.name}</span>
                                    <ChevronDown className="w-3 h-3 text-stone-400" />
                                </button>

                                {userDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-30"
                                            onClick={() => setUserDropdownOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 shadow-lg p-2 z-40">
                                            <div className="px-3 py-2 border-b border-stone-100 dark:border-carbon-700/60 mb-1">
                                                <div className="text-xs font-bold text-stone-900 dark:text-white truncate">
                                                    {user.name}
                                                </div>
                                                <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                                                    {user.email}
                                                </div>
                                                <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase mt-0.5">
                                                    Peran: {userRole}
                                                </div>
                                            </div>

                                            <Link
                                                href="/profile"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-carbon-800 rounded-xl transition min-h-[44px]"
                                            >
                                                <UserCheck className="w-3.5 h-3.5 text-stone-500" />
                                                <span>Profil Akun</span>
                                            </Link>

                                            {userRole === 'petani' && (
                                                <Link
                                                    href="/scanner?tab=history"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-carbon-800 rounded-xl transition min-h-[44px]"
                                                >
                                                    <History className="w-3.5 h-3.5 text-stone-500" />
                                                    <span>Riwayat Setoran Saya</span>
                                                </Link>
                                            )}

                                            {userRole === 'komunitas' && (
                                                <Link
                                                    href="/community-map"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-carbon-800 rounded-xl transition min-h-[44px]"
                                                >
                                                    <MapPin className="w-3.5 h-3.5 text-stone-500" />
                                                    <span>Kelola Setoran Sentra</span>
                                                </Link>
                                            )}

                                            <div className="border-t border-stone-100 dark:border-carbon-700/60 my-1" />

                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition text-left min-h-[44px]"
                                            >
                                                <LogOut className="w-3.5 h-3.5" />
                                                <span>Keluar dari Akun</span>
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-stone-200 dark:border-carbon-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-carbon-800 min-h-[44px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                                <LogIn className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                                <span>Masuk</span>
                            </Link>
                        )}

                        {/* Primary Scan CTA Button */}
                        <Link
                            href="/scanner"
                            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
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
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isLinkActive(item.href);

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
                                <span>{item.name}</span>
                                {item.badge && (
                                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </header>

            {/* Flash Notification Banner */}
            {props?.flash?.success && (
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="rounded-xl p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-800/50 dark:text-emerald-200 flex items-center justify-between shadow-sm">
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
