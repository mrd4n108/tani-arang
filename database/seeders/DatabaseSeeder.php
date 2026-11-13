<?php

namespace Database\Seeders;

use App\Models\ContactMessage;
use App\Models\SubmissionNotification;
use App\Models\User;
use App\Models\WasteFact;
use App\Models\WasteScan;
use App\Models\WasteSubmission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Demo & Coordinator Users
        $petani = User::updateOrCreate(
            ['email' => 'petani@taniarang.id'],
            [
                'name' => 'Pak Joko (Petani Binaan Lamongan)',
                'password' => Hash::make('password'),
                'role' => 'petani',
                'region' => 'Lamongan',
                'phone' => '081234567890',
                'email_verified_at' => now(),
            ]
        );

        $komunitas = User::updateOrCreate(
            ['email' => 'komunitas@taniarang.id'],
            [
                'name' => 'Sentra Biochar Poktan Makmur',
                'password' => Hash::make('password'),
                'role' => 'komunitas',
                'region' => 'Lamongan',
                'community_address' => 'Jl. Raya Pertanian No. 45, Desa Sukodadi, Lamongan',
                'phone' => '081298765432',
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'jatim@taniarang.id'],
            [
                'name' => 'Ir. Bagus Pratama (Koordinator Hub Jatim)',
                'password' => Hash::make('logicodix2026'),
                'role' => 'regional_lead',
                'region' => 'Jawa Timur',
                'phone' => '081122334455',
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'sulbar@taniarang.id'],
            [
                'name' => 'Andi Tenri Rawe, S.P. (Koordinator Hub Sulbar)',
                'password' => Hash::make('logicodix2026'),
                'role' => 'regional_lead',
                'region' => 'Sulawesi Barat',
                'phone' => '081166778899',
                'email_verified_at' => now(),
            ]
        );

        // 2. Seed 4 Primary Agricultural Waste Facts
        $facts = [
            [
                'waste_name' => 'Jerami Padi (Oryza sativa)',
                'region_focus' => 'Lamongan & Ngawi (Jawa Timur)',
                'annual_volume_fact' => '5.5 – 7.2 Ton/Hektar setiap musim panen (~4.8 Juta Ton/Tahun di Jatim)',
                'burning_hazard_fact' => 'Pembakaran terbuka melepaskan 1.460 kg CO2, 60 kg CO, dan partikulat PM2.5 per ton jerami, serta mematikan mikroba pengikat nitrogen di lapisan topsoil 0–5 cm.',
                'biochar_benefit_fact' => 'Biochar jerami padi meningkatkan Kapasitas Tukar Kation (KTK) tanah hingga 38%, menahan air 4x bobotnya saat kemarau, dan mengembalikan Kalium alami pengganti pupuk KCl sintetis.',
                'processing_steps' => [
                    'Jemur jerami sisa panen di pematang selama 1–2 hari hingga kadar air di bawah 18% (batang patah berbunyi renyah).',
                    'Masukkan ke lubang Kon-Tiki atau tungku drum pirolisis berkapasitas 200L, nyalakan dari pucuk atas (Top-Lit Updraft) selama 45–60 menit tanpa oksigen berlebih.',
                    'Siram bara arang dengan air cucian beras/MOL (Mikroorganisme Lokal) saat warna abu putih mulai muncul 15%, lalu aplikasikan 1.5 ton/Ha bersama kompos.',
                ],
                'nutrient_facts' => [
                    'Kalium (K2O)' => '2.4% - 3.1%',
                    'Silika (SiO2)' => '13.5% (Penguat Batang)',
                    'pH Biochar' => '8.2 - 9.1 (Penetral Asam)',
                    'Retensi Karbon' => '> 100 Tahun Stabil',
                ],
            ],
            [
                'waste_name' => 'Sekam Padi (Rice Husk)',
                'region_focus' => 'Ngawi, Bojonegoro & Lamongan (Jawa Timur)',
                'annual_volume_fact' => '20% – 22% dari total bobot gabah kering giling (~1.1 Juta Ton/Tahun di penggilingan Jatim)',
                'burning_hazard_fact' => 'Tumpukan sekam yang dibakar lambat di pinggir penggilingan menghasilkan asap silika kristalin bebas dan gas metana (CH4) yang memicu ISPA warga sekitar.',
                'biochar_benefit_fact' => 'Arang sekam (Biochar Sekam) memiliki struktur pori mikro-meso ber-Silika tinggi yang menggemburkan tanah lempung berat dan menjadi rumah koloni Trichoderma.',
                'processing_steps' => [
                    'Pastikan sekam dari penggilingan padi bebas dari kerikil dan tidak basah terkena hujan (kadar air ideal <14%).',
                    'Gunakan cerobong kawat kasa silinder di tengah gundukan sekam, nyalakan bara di dasar cerobong dan balik sekam secara bertahap ketika menghitam merata.',
                    'Segera semprot kabut air hingga suhu turun di bawah 40°C agar tidak menjadi abu, lalu campurkan 20% arang sekam pada media semai atau bedengan.',
                ],
                'nutrient_facts' => [
                    'Silika Aktif (SiO2)' => '18.2% - 21.0%',
                    'Porositas Mikro' => '74% Volume Pori',
                    'pH Biochar' => '7.8 - 8.5',
                    'Fosfor (P2O5)' => '0.45% Tersedia',
                ],
            ],
            [
                'waste_name' => 'Tongkol Jagung (Zea mays Cob)',
                'region_focus' => 'Malang, Tuban & Kediri (Jawa Timur)',
                'annual_volume_fact' => '1.8 – 2.4 Ton/Hektar (~1.4 Juta Ton limbah tongkol per tahun di sentra jagung Jatim)',
                'burning_hazard_fact' => 'Lignin padat pada tongkol jagung yang dibakar terbuka menghasilkan jelaga karbon hitam (Black Carbon) pekat dan dioksin jika bercampur residu karung plastik.',
                'biochar_benefit_fact' => 'Karena kepadatan ligninnya tinggi, biochar tongkol jagung memiliki karbon tetap (Fixed Carbon >75%) yang mampu menyimpan cadangan air di lahan kering tadah hujan hingga 6 minggu.',
                'processing_steps' => [
                    'Pisahkan tongkol jagung dari kelobot basah, jemur di lantai jemur 2 hari hingga keras dan kering sempurna.',
                    'Susun tongkol jagung secara vertikal/melingkar di dalam drum Retort atau lubang tanah berbentuk kerucut (Kon-Tiki) dan bakar dengan nyala api bersih tanpa asap putih.',
                    'Lakukan quenching (pemadaman) dengan larutan pupuk kandang cair (slurry biogas/urin ternak) untuk mengaktifkan pori-pori biochar sebelum dihancurkan ukuran 2–5 mm.',
                ],
                'nutrient_facts' => [
                    'Karbon Tetap (C)' => '76.4% - 81.2%',
                    'Kalium (K2O)' => '1.85%',
                    'pH Biochar' => '8.4 - 9.0',
                    'Daya Simpan Air' => '480% dari Bobot Kering',
                ],
            ],
            [
                'waste_name' => 'Kulit Buah Kakao (Theobroma cacao Pod Husk)',
                'region_focus' => 'Majene, Polewali Mandar & Mamuju (Sulawesi Barat)',
                'annual_volume_fact' => '70% – 75% dari total berat buah kakao segar (~420 Ribu Ton/Tahun di klaster Sulbar)',
                'burning_hazard_fact' => 'Ditumpuk membusuk di kebun menjadi inang spora jamur Phytophthora palmivora (Busuk Buah); jika dibakar basah menghasilkan asap pekat asam organik dan gas CO tinggi.',
                'biochar_benefit_fact' => 'Pirolisis kulit kakao pada suhu 400–500°C memutus total siklus spora jamur busuk buah, menghasilkan biochar super-Kalium (hingga 5.2% K2O) yang menetralkan tanah masam kebun kakao.',
                'processing_steps' => [
                    'Cacah kulit buah kakao menjadi 3–4 bagian setelah panen, lalu jemur di atas terpal 3–4 hari hingga menyusut dan kering kecokelatan.',
                    'Masukkan ke tungku pirolisis Kon-Tiki kebun selama 60–75 menit hingga seluruh potongan kulit kakao membara merah merata tanpa asap.',
                    'Padamkan dengan air fermentasi trichoderma/kompos cair, lalu benamkan di piringan tajuk pohon kakao (2 kg per pohon) untuk mengunci nutrisi dan mencegah jamur akar.',
                ],
                'nutrient_facts' => [
                    'Kalium Super (K2O)' => '4.8% - 5.4% (Sangat Tinggi)',
                    'pH Biochar' => '9.2 - 9.8 (Anti Tanah Masam)',
                    'Sanitasi Patogen' => '100% Steril Phytophthora',
                    'Magnesium (MgO)' => '0.92%',
                ],
            ],
        ];

        foreach ($facts as $fact) {
            WasteFact::updateOrCreate(['waste_name' => $fact['waste_name']], $fact);
        }

        // 3. Seed Realistic Waste Scans (including Pak Joko's scans)
        $farmerScan1 = WasteScan::create([
            'user_id' => $petani->id,
            'farmer_group_name' => 'Poktan Makmur Sejahtera I',
            'village_location' => 'Desa Sukodadi, Kec. Sukodadi',
            'regency' => 'Lamongan',
            'latitude' => -7.1185,
            'longitude' => 112.3328,
            'image_path' => '/demo/jerami-lamongan.webp',
            'detected_waste_type' => 'Jerami Padi (Oryza sativa)',
            'moisture_condition' => 'Kering Siap Olah',
            'ai_confidence' => 98.4,
            'ai_summary_recommendation' => 'Tumpukan jerami padi terdeteksi kering optimal (<16% kadar air). Siap dipirolisis menggunakan metode Kon-Tiki lapangan.',
            'ai_next_steps' => [
                'Siapkan lubang Kon-Tiki diameter 1.5m di sudut petak sawah.',
                'Bakar dari bagian atas (Top-Lit) selama 45 menit hingga bebas asap.',
                'Padamkan dengan air saluran irigasi dan tebar merata sebelum olah tanah.',
            ],
            'processing_status' => 'Belum diolah',
            'destination_mode' => 'komunitas',
        ]);

        $farmerScan2 = WasteScan::create([
            'user_id' => $petani->id,
            'farmer_group_name' => 'Poktan Makmur Sejahtera I',
            'village_location' => 'Desa Karanggeneng, Kec. Karanggeneng',
            'regency' => 'Lamongan',
            'latitude' => -7.0154,
            'longitude' => 112.2712,
            'image_path' => '/demo/sekam-ngawi.webp',
            'detected_waste_type' => 'Sekam Padi (Rice Husk)',
            'moisture_condition' => 'Kering Siap Olah',
            'ai_confidence' => 97.2,
            'ai_summary_recommendation' => 'Sekam gilingan padi kering siap pirolisis menjadi biochar sekam silika tinggi.',
            'ai_next_steps' => [
                'Pasang cerobong silinder di tengah tumpukan sekam.',
                'Nyalakan bara di dasar cerobong.',
                'Semprot air kabut saat sekam menghitam.',
            ],
            'processing_status' => 'Diterima Sentra',
            'destination_mode' => 'komunitas',
        ]);

        $farmerScan3 = WasteScan::create([
            'user_id' => $petani->id,
            'farmer_group_name' => 'Poktan Makmur Sejahtera I',
            'village_location' => 'Desa Sukodadi, Kec. Sukodadi',
            'regency' => 'Lamongan',
            'latitude' => -7.1190,
            'longitude' => 112.3340,
            'image_path' => '/demo/tongkol-malang.webp',
            'detected_waste_type' => 'Tongkol Jagung (Zea mays Cob)',
            'moisture_condition' => 'Kering Siap Olah',
            'ai_confidence' => 96.8,
            'ai_summary_recommendation' => 'Tongkol jagung kering padat lignin, sangat baik untuk retensi kelembaban tanah.',
            'ai_next_steps' => [
                'Susun vertikal di tungku drum.',
                'Bakar nyala api bersih 60 menit.',
                'Quenching dengan cairan pupuk hayati.',
            ],
            'processing_status' => 'Sedang Diproses',
            'destination_mode' => 'komunitas',
        ]);

        $farmerScan4 = WasteScan::create([
            'user_id' => $petani->id,
            'farmer_group_name' => 'Poktan Makmur Sejahtera I',
            'village_location' => 'Desa Sukodadi, Kec. Sukodadi',
            'regency' => 'Lamongan',
            'latitude' => -7.1210,
            'longitude' => 112.3315,
            'image_path' => '/demo/jerami-lamongan-2.webp',
            'detected_waste_type' => 'Jerami Padi (Oryza sativa)',
            'moisture_condition' => 'Kering Siap Olah',
            'ai_confidence' => 95.5,
            'ai_summary_recommendation' => 'Jerami padi panen raya siap pirolisis terpusat.',
            'ai_next_steps' => [
                'Kirim ke sentra biochar komunitas.',
                'Pirolisis tungku Kon-Tiki komunitas.',
                'Distribusi kembali dalam bentuk biochar kaya kalium.',
            ],
            'processing_status' => 'Selesai',
            'destination_mode' => 'komunitas',
        ]);

        // Mandiri (Olah Sendiri) scan for Pak Joko
        WasteScan::create([
            'user_id' => $petani->id,
            'farmer_group_name' => 'Poktan Makmur Sejahtera I',
            'village_location' => 'Desa Sukodadi, Kec. Sukodadi',
            'regency' => 'Lamongan',
            'latitude' => -7.1170,
            'longitude' => 112.3300,
            'image_path' => '/demo/jerami-lamongan.webp',
            'detected_waste_type' => 'Jerami Padi (Oryza sativa)',
            'moisture_condition' => 'Kering Siap Olah',
            'ai_confidence' => 98.0,
            'ai_summary_recommendation' => 'Jerami siap olah mandiri di lahan dengan panduan Kon-Tiki.',
            'ai_next_steps' => [
                'Buat galian kerucut Kon-Tiki di sudut petak.',
                'Bakar bertahap dari atas ke bawah.',
                'Padamkan dengan air irigasi sawah.',
            ],
            'processing_status' => 'Selesai',
            'destination_mode' => 'mandiri',
        ]);

        // Additional Regional Scans
        $otherScans = [
            [
                'farmer_group_name' => 'Poktan Sumber Pangan Ngawi',
                'village_location' => 'Desa Pangkur, Kec. Pangkur',
                'regency' => 'Ngawi',
                'latitude' => -7.4352,
                'longitude' => 111.5311,
                'image_path' => '/demo/sekam-ngawi.webp',
                'detected_waste_type' => 'Sekam Padi (Rice Husk)',
                'moisture_condition' => 'Kering Siap Olah',
                'ai_confidence' => 97.9,
                'ai_summary_recommendation' => 'Sekam gilingan kering merata dengan kemurnian tinggi. Sangat ideal diolah menjadi Biochar Sekam kaya Silika (SiO2 >18%).',
                'ai_next_steps' => [
                    'Pasang cerobong kawat kasa vertikal di tengah gundukan 300 kg sekam.',
                    'Sulut bara di bagian tengah cerobong dan balik sekam saat menghitam.',
                    'Semprot air segera agar tidak berubah menjadi abu putih.',
                ],
                'processing_status' => 'Belum diolah',
                'destination_mode' => 'mandiri',
            ],
            [
                'farmer_group_name' => 'Poktan Harapan Jaya Malang',
                'village_location' => 'Desa Wajak, Kec. Wajak',
                'regency' => 'Malang',
                'latitude' => -8.1065,
                'longitude' => 112.7302,
                'image_path' => '/demo/tongkol-malang.webp',
                'detected_waste_type' => 'Tongkol Jagung (Zea mays Cob)',
                'moisture_condition' => 'Kering Siap Olah',
                'ai_confidence' => 98.1,
                'ai_summary_recommendation' => 'Tongkol jagung pasca-pipil terdeteksi kering keras. Kandungan lignin padat menghasilkan Biochar berpori makro dengan karbon tetap >78%.',
                'ai_next_steps' => [
                    'Susun tongkol di dalam drum pirolisis sistem TLUD.',
                    'Pertahankan nyala api kuning-kebiruan selama 60 menit.',
                    'Rendam arang panas ke dalam larutan MOL/urin kelinci dan tumbuk kasar.',
                ],
                'processing_status' => 'Belum diolah',
                'destination_mode' => 'mandiri',
            ],
            [
                'farmer_group_name' => 'Poktan Sipatuo Kakao',
                'village_location' => 'Desa Lombong, Kec. Malunda',
                'regency' => 'Majene',
                'latitude' => -3.0954,
                'longitude' => 118.8872,
                'image_path' => '/demo/kakao-majene.webp',
                'detected_waste_type' => 'Kulit Buah Kakao (Theobroma cacao Pod Husk)',
                'moisture_condition' => 'Basah - Perlu Jemur 2 Hari',
                'ai_confidence' => 97.5,
                'ai_summary_recommendation' => 'Kulit buah kakao segar terdeteksi memiliki kadar air tinggi (~75%) dan berisiko menjadi inang spora Phytophthora jika dibiarkan membusuk di kebun.',
                'ai_next_steps' => [
                    'Belah kulit kakao menjadi 4 bagian tipis dan jemur di atas terpal 3 hari.',
                    'Lakukan pirolisis suhu 450°C untuk mensterilkan spora jamur.',
                    'Taburkan biochar kaya Kalium (5% K2O) di piringan akar pohon kakao.',
                ],
                'processing_status' => 'Belum diolah',
                'destination_mode' => 'mandiri',
            ],
            [
                'farmer_group_name' => 'Gapoktan Masdar Mandar',
                'village_location' => 'Desa Mapilli, Kec. Mapilli',
                'regency' => 'Polewali Mandar',
                'latitude' => -3.4128,
                'longitude' => 119.1645,
                'image_path' => '/demo/kakao-polman.webp',
                'detected_waste_type' => 'Kulit Buah Kakao (Theobroma cacao Pod Husk)',
                'moisture_condition' => 'Kering Siap Olah',
                'ai_confidence' => 98.7,
                'ai_summary_recommendation' => 'Limbah kulit kakao klaster Mapilli dalam kondisi kering ideal. Konversi ke biochar menghemat kebutuhan pupuk KCl hingga 45%.',
                'ai_next_steps' => [
                    'Operasikan tungku pirolisis kelompok tani.',
                    'Haluskan arang kulit kakao hingga ukuran <5 mm.',
                    'Aplikasikan melingkar 50 cm dari batang utama kakao.',
                ],
                'processing_status' => 'Belum diolah',
                'destination_mode' => 'mandiri',
            ],
        ];

        foreach ($otherScans as $os) {
            WasteScan::create($os);
        }

        // 4. Seed Realistic Waste Submissions from Pak Joko to Sentra Poktan Makmur
        // 4.1 Submission: Menanti (with unread notification for Komunitas)
        $sub1 = WasteSubmission::create([
            'tracking_code' => 'STR-202611-0001',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'scan_id' => $farmerScan1->id,
            'waste_type' => 'Jerami Padi (Oryza sativa)',
            'estimated_weight_kg' => 120.00,
            'moisture_condition' => 'Kering Siap Olah',
            'destination_mode' => 'komunitas',
            'status' => 'Menanti',
            'notes' => 'Jerami sisa panen petak sawah timur, sudah dijemur 2 hari.',
            'photo_path' => '/demo/jerami-lamongan.webp',
            'created_at' => now()->subHours(2),
            'updated_at' => now()->subHours(2),
        ]);

        SubmissionNotification::create([
            'user_id' => $komunitas->id,
            'submission_id' => $sub1->id,
            'type' => 'new_submission',
            'title' => 'Setoran Limbah Baru Masuk',
            'message' => 'Pak Joko mengirim setoran 120 kg Jerami Padi (STR-202611-0001). Menunggu verifikasi penerimaan.',
            'is_read' => false,
            'created_at' => now()->subHours(2),
        ]);

        // 4.2 Submission: Diterima
        $sub2 = WasteSubmission::create([
            'tracking_code' => 'STR-202611-0002',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'scan_id' => $farmerScan2->id,
            'waste_type' => 'Sekam Padi (Rice Husk)',
            'estimated_weight_kg' => 85.50,
            'moisture_condition' => 'Kering Siap Olah',
            'destination_mode' => 'komunitas',
            'status' => 'Diterima',
            'notes' => 'Sekam gilingan padi kering karungan siap angkut.',
            'photo_path' => '/demo/sekam-ngawi.webp',
            'created_at' => now()->subDays(1),
            'updated_at' => now()->subHours(18),
        ]);

        SubmissionNotification::create([
            'user_id' => $petani->id,
            'submission_id' => $sub2->id,
            'type' => 'status_updated',
            'title' => 'Setoran Diterima Sentra',
            'message' => 'Setoran STR-202611-0002 telah diterima di Sentra Biochar Poktan Makmur.',
            'is_read' => true,
            'created_at' => now()->subHours(18),
        ]);

        // 4.3 Submission: Sedang Diolah
        $sub3 = WasteSubmission::create([
            'tracking_code' => 'STR-202611-0003',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'scan_id' => $farmerScan3->id,
            'waste_type' => 'Tongkol Jagung (Zea mays Cob)',
            'estimated_weight_kg' => 150.00,
            'moisture_condition' => 'Kering Siap Olah',
            'destination_mode' => 'komunitas',
            'status' => 'Sedang Diolah',
            'notes' => 'Tongkol jagung pipil kering bersih.',
            'photo_path' => '/demo/tongkol-malang.webp',
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subHours(6),
        ]);

        SubmissionNotification::create([
            'user_id' => $petani->id,
            'submission_id' => $sub3->id,
            'type' => 'status_updated',
            'title' => 'Setoran Sedang Diolah',
            'message' => 'Setoran STR-202611-0003 sedang dalam proses pirolisis tungku Kon-Tiki.',
            'is_read' => true,
            'created_at' => now()->subHours(6),
        ]);

        // 4.4 Submission: Selesai (with verification photo & notes)
        $sub4 = WasteSubmission::create([
            'tracking_code' => 'STR-202611-0004',
            'user_id' => $petani->id,
            'community_id' => $komunitas->id,
            'scan_id' => $farmerScan4->id,
            'waste_type' => 'Jerami Padi (Oryza sativa)',
            'estimated_weight_kg' => 200.00,
            'moisture_condition' => 'Kering Siap Olah',
            'destination_mode' => 'komunitas',
            'status' => 'Selesai',
            'notes' => 'Setoran panen raya musim kemarau.',
            'photo_path' => '/demo/jerami-lamongan-2.webp',
            'verification_photo_path' => '/demo/community-verified.webp',
            'verification_notes' => 'Telah dipirolisis sempurna menjadi 56 kg biochar berkualitas tinggi. Uji pori mikro dan KTK optimal.',
            'verified_at' => now()->subDay(),
            'created_at' => now()->subDays(4),
            'updated_at' => now()->subDay(),
        ]);

        SubmissionNotification::create([
            'user_id' => $petani->id,
            'submission_id' => $sub4->id,
            'type' => 'status_updated',
            'title' => 'Pengolahan Biochar Selesai',
            'message' => 'Setoran STR-202611-0004 selesai diolah. 56 kg biochar siap diambil atau disalurkan.',
            'is_read' => false,
            'created_at' => now()->subDay(),
        ]);

        // 5. Seed 3 Sample Contact & Partnership Messages
        $messages = [
            [
                'name' => 'H. Sudirman, S.Pt.',
                'organization' => 'Gapoktan Tani Makmur Sukodadi',
                'region' => 'Kab. Lamongan, Jawa Timur',
                'collaboration_type' => 'Pendampingan Petani',
                'message' => 'Kami memiliki luasan panen padi 140 Ha bulan depan. Mohon jadwal pelatihan langsung pembuatan tungku Kon-Tiki tanah bersama tim TaniArang Surabaya Hub.',
                'status' => 'Terjadwal Kunjungan Lapangan',
            ],
            [
                'name' => 'Dr. Eng. Ratna Pratiwi, M.Sc.',
                'organization' => 'Pusat Riset Biomassa & Agroekologi Kampus',
                'region' => 'Kota Malang, Jawa Timur',
                'collaboration_type' => 'Riset Kampus',
                'message' => 'Mengajukan kolaborasi uji laboratorium spektroskopi pori biochar tongkol jagung dan integrasi dataset lapangan TaniArang untuk publikasi bersama.',
                'status' => 'Dalam Review Tim Riset',
            ],
            [
                'name' => 'Reza Mahendra (Head of ESG Sustainability)',
                'organization' => 'PT Nusantara Hijau Lestari',
                'region' => 'Kab. Majene & Polman, Sulawesi Barat',
                'collaboration_type' => 'Dukungan CSR/Alat Pirolisis',
                'message' => 'Program CSR kami siap menyalurkan 25 unit tungku pirolisis baja tahan karat (Stainless Kon-Tiki) untuk kelompok tani kakao di Majene dan Polewali Mandar.',
                'status' => 'MoU Disetujui',
            ],
        ];

        foreach ($messages as $msg) {
            ContactMessage::create($msg);
        }
    }
}
