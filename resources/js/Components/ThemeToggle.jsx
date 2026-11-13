import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        const nextDark = !isDark;
        setIsDark(nextDark);
        if (nextDark) {
            document.documentElement.classList.add('dark');
            try {
                localStorage.setItem('theme', 'dark');
            } catch (e) {}
        } else {
            document.documentElement.classList.remove('dark');
            try {
                localStorage.setItem('theme', 'light');
            } catch (e) {}
        }
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center border border-stone-200 dark:border-carbon-700/60 bg-white dark:bg-carbon-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-carbon-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors select-none ${className}`}
            aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
        >
            {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
            ) : (
                <Moon className="w-5 h-5 text-emerald-700" />
            )}
        </button>
    );
}
