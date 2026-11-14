<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark scroll-smooth">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#121316">
    <meta name="description" content="TaniArang - Portal Data Limbah Panen & Panduan Arang Pertanian (Biochar) untuk LOGICODIX 2026">
    <title inertia>{{ config('app.name', 'TaniArang | Portal Data Limbah Panen & Biochar Tani') }}</title>

    <!-- Google Fonts: Plus Jakarta Sans & JetBrains Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <!-- Leaflet Dark Map Styles -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />

    <!-- Theme Initialization to Prevent FOUT -->
    <script>
        (function() {
            try {
                var theme = localStorage.getItem('theme');
                if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                } else if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                }
            } catch (e) {}
        })();
    </script>

    <!-- Ziggy Named Routes -->
    @routes

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased bg-stone-50 text-stone-900 dark:bg-carbon-900 dark:text-stone-100 selection:bg-foliage-700/30 selection:text-foliage-300 overflow-x-hidden transition-colors duration-150">
    @inertia
    <script>
        (function() {
            var el = document.getElementById('app');
            var script = document.querySelector('script[data-page="app"]');
            if (el && script && !el.dataset.page) {
                el.dataset.page = script.textContent;
            }
        })();
    </script>
</body>
</html>
