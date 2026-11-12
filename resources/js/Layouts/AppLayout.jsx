import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Camera,
    MapPin,
    Handshake,
    Flame,
    ShieldCheck,
} from 'lucide-react';

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

    return (
        <div className="min-h-screen flex flex-col bg-carbon-900 text-stone-100 selection:bg-emerald-600/30 selection:text-emerald-300 font-sans">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-carbon-900/90 backdrop-blur-md border-b border-carbon-700/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    {/* Brand Identity */}
                    <Link
                        className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
                        href="/"
                        aria-label="Beranda TaniArang"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-950/60 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-900/60 transition-colors">
                            <Flame className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <span className="font-extrabold text-xl tracking-tight text-white block leading-tight">
                                Tani<span className="text-emerald-400">Arang</span>
                            </span>
                            <span className="text-xs text-stone-400 block">
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
                                    : url.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                                        isActive
                                            ? 'bg-carbon-800 text-emerald-400'
                                            : 'text-stone-300 hover:text-white hover:bg-carbon-800/60'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-stone-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right CTA */}
                    <div className="hidden sm:flex items-center gap-3">
                        <Link
                            href="/scanner"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm min-h-[44px]"
                        >
                            <Camera className="w-4 h-4" />
                            <span>Pindai Limbah</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Navigation Bar */}
                <div
                    className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 border-t border-carbon-700/60 bg-carbon-900 scrollbar-none"
                    aria-label="Navigasi Mobile"
                >
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            item.href === '/'
                                ? url === '/'
                                : url.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[44px] ${
                                    isActive
                                        ? 'bg-carbon-800 text-emerald-400 font-semibold'
                                        : 'text-stone-300 hover:text-white hover:bg-carbon-800/50'
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-stone-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </header>

            {/* Flash Notification Banner */}
            {props?.flash?.success && (
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="rounded-xl p-4 bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-between text-emerald-200">
                        <div className="flex items-center gap-2.5 text-sm font-medium">
                            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
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
            <footer className="mt-20 border-t border-carbon-700/60 bg-carbon-950 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-stone-400">
                    <div>
                        <span className="font-bold text-white text-base block">TaniArang</span>
                        <p className="text-xs text-stone-400 mt-1">
                            Inisiatif edukasi & pengolahan residu biomassa pertanian menjadi biochar penyubur tanah.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-xs text-stone-400">
                        <span>Sumber Data: Balittanah • Kementan RI • BPS</span>
                        <span>Jawa Timur & Sulawesi Barat</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
