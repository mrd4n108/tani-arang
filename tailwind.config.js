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
                display: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
                sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                carbon: {
                    950: '#0A0B0D',
                    900: '#121316',
                    850: '#18191D',
                    800: '#202227',
                    700: '#2D3037',
                    600: '#3F434D',
                },
                soil: {
                    950: '#15100D',
                    900: '#201814',
                    800: '#2D231E',
                    700: '#3E312A',
                    600: '#554339',
                    500: '#735C4E',
                },
                foliage: {
                    950: '#071A0B',
                    900: '#0E2E14',
                    800: '#1B5E20',
                    700: '#2E7D32',
                    600: '#388E3C',
                    500: '#4CAF50',
                    400: '#66BB6A',
                    300: '#81C784',
                },
                terracotta: {
                    900: '#43170B',
                    800: '#7C2D12',
                    700: '#9A3412',
                    600: '#C2410C',
                    500: '#EA580C',
                },
                harvest: {
                    600: '#D97706',
                    500: '#F59E0B',
                },
                obsidian: '#0F1012',
                bio: {
                    emerald: '#2E7D32',
                    teal: '#0E7490',
                    amber: '#D97706',
                },
            },
        },
    },
    plugins: [],
};
