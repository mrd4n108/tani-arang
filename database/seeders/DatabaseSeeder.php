<?php

namespace Database\Seeders;

use App\Models\ContactMessage;
use App\Models\WasteFact;
use App\Models\WasteScan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Coordinator Users
        DB::table('users')->insertOrIgnore([
            [
                'name' => 'Ir. Bagus Pratama (Koordinator Hub Jatim)',
                'email' => 'jatim@taniarang.id',
                'password' => Hash::make('logicodix2026'),
                'role' => 'regional_lead',
                'region' => 'Jawa Timur',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Andi Tenri Rawe, S.P. (Koordinator Hub Sulbar)',
                'email' => 'sulbar@taniarang.id',
                'password' => Hash::make('logicodix2026'),
                'role' => 'regional_lead',
                'region' => 'Sulawesi Barat',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

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
                    'Siram bara arang dengan air cucian beras/MOL (Mikroorganisme Lokal) saat warna abu putih mulai muncul 15%, lalu aplikasikan 1.5 ton/Ha bersama kompos.'
                ],
                'nutrient_facts' => [
                    'Kalium (K2O)' => '2.4% - 3.1%',
                    'Silika (SiO2)' => '13.5% (Penguat Batang)',
                    'pH Biochar' => '8.2 - 9.1 (Penetral Asam)',
                    'Retensi Karbon' => '> 100 Tahun Stabil'
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
                    'Segera semprot kabut air hingga suhu turun di bawah 40°C agar tidak menjadi abu, lalu campurkan 20% arang sekam pada media semai atau bedengan.'
                ],
                'nutrient_facts' => [
                    'Silika Aktif (SiO2)' => '18.2% - 21.0%',
                    'Porositas Mikro' => '74% Volume Pori',
                    'pH Biochar' => '7.8 - 8.5',
                    'Fosfor (P2O5)' => '0.45% Tersedia'
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
                    'Lakukan quenching (pemadaman) dengan larutan pupuk kandang cair (slurry biogas/urin ternak) untuk mengaktifkan pori-pori biochar sebelum dihancurkan ukuran 2–5 mm.'
                ],
                'nutrient_facts' => [
                    'Karbon Tetap (C)' => '76.4% - 81.2%',
                    'Kalium (K2O)' => '1.85%',
                    'pH Biochar' => '8.4 - 9.0',
                    'Daya Simpan Air' => '480% dari Bobot Kering'
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
                    'Padamkan dengan air fermentasi trichoderma/kompos cair, lalu benamkan di piringan tajuk pohon kakao (2 kg per pohon) untuk mengunci nutrisi dan mencegah jamur akar.'
                ],
                'nutrient_facts' => [
                    'Kalium Super (K2O)' => '4.8% - 5.4% (Sangat Tinggi)',
                    'pH Biochar' => '9.2 - 9.8 (Anti Tanah Masam)',
                    'Sanitasi Patogen' => '100% Steril Phytophthora',
                    'Magnesium (MgO)' => '0.92%'
                ],
            ],
        ];

        foreach ($facts as $fact) {
            WasteFact::updateOrCreate(['waste_name' => $fact['waste_name']], $fact);
        }

        // 3. Seed 12 Realistic Waste Scans across East Java & West Sulawesi
        $scans = [
            [
                'farmer_group_name' => 'Poktan Makmur Sejahtera I',
                'village_location' => 'Desa Sukodadi, Kec. Sukodadi',
                'regency' => 'Lamongan',
                'latitude' => -7.1185,
                'longitude' => 112.3328,
                'image_path' => '/demo/jerami-lamongan.webp',
                'detected_waste_type' => 'Jerami Padi (Oryza sativa)',
                'moisture_condition' => 'Kering Siap Olah',
                'ai_confidence' => 98.4,
                'ai_summary_recommendation' => 'Tumpukan jerami padi terdeteksi kering optimal (<16% kadar air). Siap dipirolisis menggunakan metode Kon-Tiki lapangan untuk mengembalikan silika & kalium sawah.',
                'ai_next_steps' => [
                    'Siapkan lubang Kon-Tiki diameter 1.5m di sudut petak sawah.',
                    'Bakar dari bagian atas (Top-Lit) selama 45 menit hingga bebas asap.',
                    'Padamkan dengan air saluran irigasi dan tebar merata sebelum olah tanah.'
                ],
            ],
            [
                'farmer_group_name' => 'Gapoktan Tani Mulyo',
                'village_location' => 'Desa Karanggeneng, Kec. Karanggeneng',
                'regency' => 'Lamongan',
                'latitude' => -7.0154,
                'longitude' => 112.2712,
                'image_path' => '/demo/jerami-lamongan-2.webp',
                'detected_waste_type' => 'Jerami Padi (Oryza sativa)',
                'moisture_condition' => 'Basah - Perlu Jemur 2 Hari',
                'ai_confidence' => 95.6,
                'ai_summary_recommendation' => 'Terdeteksi jerami baru panen dengan batang bagian bawah masih kehijauan/lembab. Hindari pembakaran langsung agar tidak memicu asap putih PM2.5.',
                'ai_next_steps' => [
                    'Angin-anginkan di pematang sawah selama 48 jam.',
                    'Balik tumpukan pada hari kedua pukul 11.00 WIB.',
                    'Lakukan pirolisis setelah batang renyah dipatahkan.'
                ],
            ],
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
                'ai_summary_recommendation' => 'Sekam gilingan kering merata dengan kemurnian tinggi. Sangat ideal diolah menjadi Biochar Sekam kaya Silika (SiO2 >18%) untuk pembenah tanah lempung.',
                'ai_next_steps' => [
                    'Pasang cerobong kawat kasa vertikal di tengah gundukan 300 kg sekam.',
                    'Sulut bara di bagian tengah cerobong dan balik sekam saat menghitam.',
                    'Semprot air segera agar tidak berubah menjadi abu putih.'
                ],
            ],
            [
                'farmer_group_name' => 'Poktan Sri Rejeki Geneng',
                'village_location' => 'Desa Tambakromo, Kec. Geneng',
                'regency' => 'Ngawi',
                'latitude' => -7.4820,
                'longitude' => 111.4329,
                'image_path' => '/demo/jerami-ngawi.webp',
                'detected_waste_type' => 'Jerami Padi (Oryza sativa)',
                'moisture_condition' => 'Kering Siap Olah',
                'ai_confidence' => 96.2,
                'ai_summary_recommendation' => 'Jerami kering musim kemarau dengan rasio C/N tinggi. Potensi konversi biochar mencapai 32% dari bobot awal.',
                'ai_next_steps' => [
                    'Kumpulkan jerami di dekat sumber air irigasi teknis.',
                    'Proses dengan drum pirolisis portabel selama 50 menit.',
                    'Campurkan dengan kompos kotoran sapi 1:1 sebelum aplikasi.'
                ],
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
                    'Rendam arang panas ke dalam larutan MOL/urin kelinci dan tumbuk kasar.'
                ],
            ],
            [
                'farmer_group_name' => 'Gapoktan Lereng Kawi',
                'village_location' => 'Desa Tumpang, Kec. Tumpang',
                'regency' => 'Malang',
                'latitude' => -8.0061,
                'longitude' => 112.7615,
                'image_path' => '/demo/tongkol-malang-2.webp',
                'detected_waste_type' => 'Tongkol Jagung (Zea mays Cob)',
                'moisture_condition' => 'Kering Siap Olah',
                'ai_confidence' => 94.8,
                'ai_summary_recommendation' => 'Limbah tongkol jagung hibrida siap pirolisis. Sangat efektif menahan kelembaban tanah di lahan kering lereng Malang Timur.',
                'ai_next_steps' => [
                    'Pastikan sisa kelobot basah sudah dipisahkan.',
                    'Proses pirolisis dalam lubang tanah kerucut.',
                    'Aplikasikan di lubang tanam cabai dan jagung musim berikutnya.'
                ],
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
                    'Taburkan biochar kaya Kalium (5% K2O) di piringan akar pohon kakao.'
                ],
            ],
            [
                'farmer_group_name' => 'Poktan Malaqbi Agro',
                'village_location' => 'Desa Pamboang, Kec. Pamboang',
                'regency' => 'Majene',
                'latitude' => -3.4922,
                'longitude' => 118.8941,
                'image_path' => '/demo/kakao-majene-2.webp',
                'detected_waste_type' => 'Kulit Buah Kakao (Theobroma cacao Pod Husk)',
                'moisture_condition' => 'Kering Siap Olah',
                'ai_confidence' => 96.9,
                'ai_summary_recommendation' => 'Cacahan kulit kakao telah dikeringkan matahari dan siap dipirolisis. Akan menghasilkan biochar pH 9.4 untuk menetralkan keasaman tanah kebun.',
                'ai_next_steps' => [
                    'Masukkan kulit kakao kering ke tungku Kon-Tiki kebun.',
                    'Jaga bara merata selama 65 menit tanpa kepulan asap.',
                    'Quenching dengan air rendaman Trichoderma dan benamkan 2 kg/pohon.'
                ],
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
                    'Aplikasikan melingkar 50 cm dari batang utama kakao.'
                ],
            ],
            [
                'farmer_group_name' => 'Poktan Синерги Wonomulyo',
                'village_location' => 'Desa Sidodadi, Kec. Wonomulyo',
                'regency' => 'Polewali Mandar',
                'latitude' => -3.4281,
                'longitude' => 119.2290,
                'image_path' => '/demo/sekam-polman.webp',
                'detected_waste_type' => 'Sekam Padi (Rice Husk)',
                'moisture_condition' => 'Kering Siap Olah',
                'ai_confidence' => 95.9,
                'ai_summary_recommendation' => 'Sekam padi dari sentra persawahan Wonomulyo siap diolah menjadi biochar untuk campuran pembibitan kakao dan padi sawah.',
                'ai_next_steps' => [
                    'Susun sekam mengelilingi cerobong pembakaran vertikal.',
                    'Balik sekam setiap 15 menit agar terkarbonisasi merata.',
                    'Dinginkan dengan air dan gunakan 30% pada polybag bibit.'
                ],
            ],
        ];

        foreach ($scans as $scan) {
            WasteScan::create($scan);
        }

        // 4. Seed 3 Sample Contact & Partnership Messages
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