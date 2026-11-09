import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Syne"', ...defaultTheme.fontFamily.sans],
                sans: ['"Outfit"', ...defaultTheme.fontFamily.sans],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                obsidian: '#060B0E',
                bio: {
                    emerald: '#10B981',
                    teal: '#06B6D4',
                    amber: '#F59E0B',
                },
            },
            keyframes: {
                floatSlow: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-10px) rotate(1.5deg)' },
                },
                laserScan: {
                    '0%': { top: '0%', opacity: '0.2' },
                    '50%': { top: '96%', opacity: '1' },
                    '100%': { top: '0%', opacity: '0.2' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
                    '50%': { opacity: '0.85', transform: 'scale(1.06)' },
                },
                spinSlow: {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                }
            },
            animation: {
                'float-slow': 'floatSlow 4.5s ease-in-out infinite',
                'laser-scan': 'laserScan 2.6s ease-in-out infinite',
                'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
                'spin-slow': 'spinSlow 18s linear infinite',
            },
        },
    },
    plugins: [],
};