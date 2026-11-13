# TaniArang 🌱🪵

**Portal Data Residu Biomassa & Pemandu Konversi Biochar Pertanian Berbasis Multimodal AI Vision**

Inisiatif digital untuk mendampingi petani menghentikan pembakaran terbuka (*open burning*) residu panen dan mengonversinya menjadi **Biochar** (arang aktif pertanian) penyubur tanah di sentra pertanian Jawa Timur dan Sulawesi Barat.

Dikembangkan untuk ajang **LOGICODIX 2026** (Kategori Agritech / Green IT & Climate Resilience).

---

## 📌 Daftar Isi
- [Latar Belakang & Masalah](#-latar-belakang--masalah)
- [Solusi: TaniArang](#-solusi-taniarang)
- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem & Alur Kerja AI](#-arsitektur-sistem--alur-kerja-ai)
- [Prinsip Desain & Engineering](#-prinsip-desain--engineering)
- [Tech Stack](#-tech-stack)
- [Panduan Instalasi & Menjalankan Proyek](#-panduan-instalasi--menjalankan-proyek)
- [Pengujian (Testing)](#-pengujian-testing)
- [Struktur Direktori](#-struktur-direktori)
- [Lisensi](#-lisensi)

---

## 🌾 Latar Belakang & Masalah

Di sentra lumbung pangan Indonesia (seperti Jawa Timur dan Sulawesi Barat), puluhan juta ton residu pertanian pascapanen kerap dibakar terbuka langsung di atas lahan sawah dan kebun:

1. **Degradasi Kesuburan Tanah**: Sekitar 70% lahan sawah intensif mengalami krisis bahan organik dengan kadar C-Organik kritis (< 2%), memicu ketergantungan pupuk kimia anorganik yang mahal.
2. **Krisis Iklim & Polusi Udara**: Pembakaran terbuka melepaskan emisi Karbon Monoksida (CO), Metana (CH4), dan partikulat berbahaya PM2.5 yang memicu penyakit pernapasan (ISPA) warga desa.
3. **Ketidaktahuan Teknis di Lapangan**: Petani di lapangan kekurangan rujukan visual cepat mengenai apakah limbah panennya sudah cukup kering untuk diolah serta langkah praktis pembuatan arang aktif tanpa modal tungku mahal.

---

## 💡 Solusi: TaniArang

**TaniArang** hadir sebagai jembatan teknologi rendah-karbon (*low-bandwidth Green IT*) yang menggabungkan:
- **Vision AI Multimodal (Google Gemini Vision)** untuk mendiagnosis jenis residu, kesiapan kekeringan, dan menghasilkan panduan pirolisis 3 langkah.
- **Sistem Informasi Geografis (GIS Leaflet Dark Matter)** untuk memetakan sebaran tumpukan biomassa komunitas petani (Poktan) dan memantau status pengolahannya.
- **Kokpit Data Agronomi Terbuka (Recharts)** berbasis rujukan Badan Standardisasi Instrumen Pertanian (BSIP / Balittanah), Kementerian Pertanian RI, dan BPS.

---

## 🚀 Fitur Utama

### 1. Pemindai Foto Residu Panen AI (`/scanner`)
- **Multimodal AI Analysis**: Mengidentifikasi komoditas limbah pertanian (Jerami Padi, Sekam Padi, Tongkol Jagung, Kulit Buah Kakao) dan kondisi kadar air (*Kering Siap Olah*, *Lembab Perlu Dijemur*, *Basah*).
- **Green IT Image Compressor**: Kompresi gambar sisi klien (*client-side*) menjadi format WebP beresolusi teroptimasi (< 768px, quality 0.72) untuk menghemat bandwidth internet pedesaan dan beban komputasi server.
- **4 Sampel Uji Cepat Lapangan**: Presets instan dari sentra Lamongan, Majene, Malang, dan Ngawi untuk demonstrasi dan evaluasi cepat.
- **Panduan 3 Langkah Pirolisis Ramah Petani**: Menghasilkan instruksi terstruktur teknik tungku tanah Kon-Tiki (*Top-Lit Updraft*) yang minim asap dan tidak memerlukan alat mahal.
- **Tangkapan Geolocation GPS**: Pengambilan koordinat GPS otomatis dengan validasi batas wilayah Indonesia.

### 2. Peta Sebaran Komunitas GIS (`/community-map`)
- **Peta Interaktif Carto Dark Matter**: Visualisasi titik dokumentasi kelompok tani mitra dengan pin status pengolahan (*Belum diolah*, *Sedang diproses*, *Selesai*).
- **Pintasan Kluster Regional**: Navigasi cepat wilayah sentra Jawa Timur (Lamongan, Ngawi, Malang) dan Sulawesi Barat (Majene, Polewali Mandar).
- **Filter & Pencarian Terpadu**: Penyaringan berdasarkan nama Poktan, desa, kabupaten, maupun jenis residu.
- **Tabel Log Terintegrasi**: Sinkronisasi dua arah antara marker peta dan tabel data dengan kemampuan pembaruan status dan soft-delete / restore data.

### 3. Dashboard Telemetri & Analitik Agronomi (`/`)
- **4 Kartu Telemetri Faktual**: Potensi residu regional (6.2 Juta Ton Jatim), rasio residu kulit kakao Sulbar (72.5%), statistik sawah kritis C-Organik (<2%), dan titik data komunitas terdata.
- **Recharts Agricultural Cockpit**:
  - *Bar Chart*: Perbandingan timbulan limbah vs estimasi konversi biochar per kabupaten sentra.
  - *Donut Chart*: Proporsi jenis residu yang terdata di lapangan.
  - *Area Chart*: Tren penurunan lahan pembakaran terbuka vs adopsi lahan bersubsidi biochar.
- **Matriks 4 Karakteristik Komoditas**: Edukasi kandungan spesifik tiap residu (Silika sekam padi, Kalium kulit kakao, mikropori tongkol jagung, humat jerami padi).

### 4. Pusat Fakta & Katalog Biomassa (`/facts`)
- **Matriks Perbandingan Ilmiah**: Komparasi mendalam dampak pembakaran terbuka vs konversi biochar terhadap 4 aspek: Polusi udara, retensi air tanah kemarau, habitat mikroba penyubur, dan kapasitas tukar kation (KTK).
- **Katalog Spesifikasi Biomassa**: Filter wilayah untuk mengeksplorasi rasio konversi arang, kebutuhan suhu pirolisis, dan manfaat tanah per komoditas.

### 5. Portal Kemitraan & Kolaborasi (`/contact`)
- **Formulir Kemitraan**: Kanal khusus bagi Kelompok Tani (pendampingan), Kampus (riset laboratorium spektroskopi), dan CSR Perusahaan (penyaluran tungku pirolisis).
- **FAQ Interaktif**: Jawaban praktis seputar metode Kon-Tiki tanah, alasan pendekatan visual, dan bentuk kolaborasi.

---

## 🏗 Arsitektur Sistem & Alur Kerja AI

```mermaid
flowchart TD
    A["Petani / Penyuluh Lapangan"] -->|"Ambil Foto / Pilih Sampel"| B["Frontend React + WebP Compressor"]
    B -->|"Payload Ringan (<100KB) + Koordinat"| C["Laravel Backend Controller"]
    C -->|"Multimodal Prompt + Image Base64"| D["Google Gemini AI Vision Service"]
    D -->|"Structured JSON Diagnosis"| C
    C -->|"Simpan Data & Status"| E[("Database SQLite / MySQL")]
    E -->|"Inertia React Props"| F["Peta Komunitas Leaflet GIS"]
    E -->|"Inertia React Props"| G["Dashboard Analitik Recharts"]
```

---

## 🎨 Prinsip Desain & Engineering

Frontend TaniArang dibangun dengan disiplin tinggi menggunakan integrasi 5 standar craft antarmuka:

1. **`ponytail`**: Kode ringkas, minimal diff, zero bloatware, mengutamakan kapabilitas standar HTML5/CSS dan utility Tailwind CSS asli tanpa script berlebih.
2. **`frontend-design`**: Estetika berakar kuat pada ranah agro-ekologi dan biochar (palet warna arang alami, daun segar, tanah subur, dan jingga panen), bukan template SaaS generik.
3. **`ui-ux-pro-max`**: Standar aksesibilitas WCAG AA (kontras rasio teks > 4.5:1, target sentuh minimal 44x44px, status fokus navigasi keyboard yang jelas, responsif mulai 375px mobile).
4. **`impeccable`**: Polesan interaksi profesional, pemisahan mode scannable untuk dashboard, serta penanganan lengkap untuk kondisi *Loading*, *Empty*, dan *Success*.
5. **`anti-slop`**: Bebas dari klise desain AI (tanpa border teks yang mengganggu, tanpa neon glow berlebih, tanpa tanda hubung em dash pada salinan UI, tanpa kartu-dalam-kartu bertumpuk, dan tanpa metrik palsu).

---

## 💻 Tech Stack

| Layer | Teknologi |
| :--- | :--- |
| **Backend Framework** | Laravel 11 / 12 (PHP 8.3+) |
| **Frontend Adapter** | Inertia.js v2 (React) |
| **UI Library** | React 18, Tailwind CSS v3 |
| **Visualisasi Data** | Recharts (Responsive SVG Charts) |
| **Sistem Geospasial** | Leaflet.js (CARTO Dark Matter Tiles) |
| **Ikonografi** | Lucide React |
| **Tipografi** | Plus Jakarta Sans (Modern Geometric Sans) & JetBrains Mono |
| **AI Model** | Google Gemini Vision (`gemini-2.5-flash` / `gemini-1.5-flash`) |
| **Basis Data** | SQLite (Default Dev) / MySQL compatible |

---

## ⚙️ Panduan Instalasi & Menjalankan Proyek

### Prasyarat
Pastikan sistem Anda telah terpasang:
- **PHP** >= 8.2 (disarankan PHP 8.3 dengan ekstensi `pdo_sqlite`, `curl`, `mbstring`, `fileinfo`, `openssl`)
- **Composer** >= 2.x
- **Node.js** >= 18.x & **npm**

### Langkah Instalasi

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/mrd4n108/tani-arang.git
   cd tani-arang
   ```

2. **Instal Dependensi Backend (Composer)**:
   ```bash
   composer install
   ```

3. **Konfigurasi Environment**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Konfigurasi API Key Gemini (Opsional)**:
   Buka file `.env` dan masukkan API key Google Gemini Anda:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
   *(Catatan: Aplikasi tetap berfungsi penuh dengan 4 preset sampel bawaan meskipun tanpa API key)*.

5. **Migrasi & Seed Database**:
   ```bash
   touch database/database.sqlite
   php artisan migrate --seed
   ```

6. **Instal Dependensi Frontend & Build**:
   ```bash
   npm install
   npm run build
   ```

7. **Jalankan Server Lokal**:
   ```bash
   php artisan serve
   ```
   Buka peramban Anda di: **`http://127.0.0.1:8000`**

---

## 🧪 Pengujian (Testing)

Proyek ini dilengkapi dengan Feature Tests otomatis yang mencakup integrasi alur pemindai, validasi koordinat GPS, penyimpanan log, dan manajemen status peta komunitas:

```bash
php artisan test
```

Uji fitur yang dijalankan:
- `test_scanner_and_community_map_pages_render_successfully`
- `test_user_can_store_scan_log_and_redirect_to_community_map`
- `test_store_scan_validates_coordinates_and_required_fields`
- `test_can_update_processing_status_and_soft_delete_or_restore_scan`

---

## 📁 Struktur Direktori

```text
tani-arang/
├── app/
│   ├── Http/Controllers/
│   │   └── TaniArangController.php     # Controller utama (Dashboard, Scanner, Map, Contact)
│   ├── Models/
│   │   ├── WasteScan.php               # Model data log pemindaian & lokasi Poktan
│   │   ├── WasteFact.php               # Model data komparasi & fakta biomassa
│   │   └── ContactMessage.php          # Model pesan kemitraan Poktan/CSR/Kampus
│   └── Services/
│       └── WasteVisionService.php      # Integrasi multimodal Google Gemini Vision API
├── database/
│   ├── migrations/                     # Skema tabel users, scans, facts, contacts
│   └── seeders/                        # Data awal regional Jatim & Sulbar
├── resources/
│   ├── css/
│   │   └── app.css                     # Custom dark scrollbar & Leaflet dark popup styling
│   ├── js/
│   │   ├── Components/                 # Komponen UI modular (Badge, Button, Card, StatCard)
│   │   ├── Layouts/
│   │   │   └── AppLayout.jsx           # Layout utama, navigasi responsif, flash alert
│   │   └── Pages/
│   │       ├── Dashboard.jsx           # Beranda & cockpit analitik Recharts
│   │       ├── Facts.jsx               # Matriks edukasi sains & katalog biomassa
│   │       ├── Scanner.jsx             # Pemindai foto AI & alur WebP compressor
│   │       ├── CommunityMap.jsx        # Peta GIS interaktif Leaflet Dark Matter
│   │       └── Contact.jsx             # Formulir kolaborasi & FAQ accordion
│   └── views/
│       └── app.blade.php               # HTML root view, fonts Plus Jakarta Sans
├── routes/
│   └── web.php                         # Definisi route aplikasi
├── tests/
│   └── Feature/                        # Automated feature & integration tests
└── tailwind.config.js                  # Konfigurasi palet tema alam & tipografi
```

---

## 📄 Lisensi

Proyek ini dikembangkan di bawah lisensi terbuka [MIT License](LICENSE).
Inisiatif terbuka untuk mendukung keberlanjutan pertanian dan iklim Indonesia.
