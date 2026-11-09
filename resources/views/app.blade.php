<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark scroll-smooth">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#060B0E">
    <meta name="description" content="TaniArang - Portal Data Limbah Panen & Panduan Arang Pertanian (Biochar) untuk LOGICODIX 2026">
    <title inertia>{{ config('app.name', 'TaniArang — Bioluminescent Agritech Portal') }}</title>

    <!-- Google Fonts: Syne (Display), Outfit (Sans), JetBrains Mono (Telemetry) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400..700;1,400..700&family=Outfit:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">

    <!-- Leaflet Dark Map Styles -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased bg-[#060B0E] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300 overflow-x-hidden">
    @inertia
</body>
</html>