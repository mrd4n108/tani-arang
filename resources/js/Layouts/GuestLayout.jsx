import React from 'react';
import { Link } from '@inertiajs/react';
import { Flame } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-carbon-900 text-stone-900 dark:text-stone-100 px-4 py-8 selection:bg-emerald-600/30 selection:text-emerald-300 transition-colors">
            {/* Top Bar with Brand & Theme Toggle */}
            <div className="w-full max-w-md flex items-center justify-between mb-6">
                <Link
                    href="/"
                    className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
                    aria-label="Kembali ke Beranda TaniArang"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/60 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-900/60 transition-colors">
                        <Flame className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <span className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white block leading-tight">
                            Tani<span className="text-emerald-500 dark:text-emerald-400">Arang</span>
                        </span>
                        <span className="text-xs text-stone-500 dark:text-stone-400 block">
                            Portal Biochar & Residu Pertanian
                        </span>
                    </div>
                </Link>

                <ThemeToggle />
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-md overflow-hidden bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 p-6 sm:p-8 shadow-sm rounded-2xl transition-colors">
                {children}
            </div>
        </div>
    );
}
