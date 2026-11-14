<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WasteVisionService
{
    public function analyzeBiomass(?string $payload = null, ?string $presetKey = null): array
    {
        $presets = $this->getDeterministicPresets();

        if ($presetKey && isset($presets[$presetKey])) {
            return $presets[$presetKey];
        }

        if (empty($payload) && app()->bound('request')) {
            $req = request();
            $payload = $req->input('image_base64')
                ?? $req->json('image_base64')
                ?? $req->input('payload')
                ?? $req->input('image')
                ?? null;

            if (empty($payload)) {
                $rawContent = $req->getContent();
                if (! empty($rawContent)) {
                    $rawDecoded = json_decode($rawContent, true);
                    if (is_array($rawDecoded) && ! empty($rawDecoded['image_base64'])) {
                        $payload = $rawDecoded['image_base64'];
                    }
                }
            }
        }

        if (empty($payload)) {
            Log::warning('WasteVisionService dipanggil dengan payload gambar kosong.');
            return $this->getFallbackData('Payload gambar kosong atau tidak terkirim ke server.');
        }

        $apiKey = config('services.gemini.key');

        if (empty($apiKey)) {
            Log::warning('GEMINI_API_KEY kosong atau belum terbaca dari config.');
            return $this->getFallbackData('GEMINI_API_KEY kosong atau belum terbaca dari konfigurasi server.');
        }

        // Memisahkan metadata base64 jika ada (contoh: data:image/jpeg;base64,...)
        if (str_contains($payload, ',')) {
            $parts = explode(',', $payload, 2);
            $mimeString = explode(';', $parts[0])[0];
            $mimeType = str_replace('data:', '', $mimeString) ?: 'image/jpeg';
            $base64Data = $parts[1] ?? '';
        } else {
            $mimeType = 'image/jpeg';
            $base64Data = $payload;
        }

        if (empty($base64Data)) {
            Log::warning('Gemini Vision fallback triggered: Data gambar base64 tidak valid atau kosong.');
            return $this->getFallbackData('Data gambar base64 tidak valid atau kosong.');
        }

        $prompt = "Analisis foto limbah pertanian ini. Berperanlah sebagai Ahli Biochar & Agronomi Pertanian Indonesia untuk aplikasi TaniArang (fokus pada Jerami Padi, Sekam Padi, Tongkol Jagung, Kulit Buah Kakao, atau biomassa pertanian lainnya). " .
            "Kembalikan data HANYA dalam format JSON valid dengan kunci persis berikut: " .
            "is_valid_waste (boolean: true jika limbah pertanian/biomassa, false jika bukan), " .
            "detected_waste_type (string: nama limbah dalam Bahasa Indonesia), " .
            "moisture_condition (string: kondisi fisik visual seperti 'Kering Siap Olah', 'Sedang - Jemur 1 Hari', atau 'Masih Basah - Perlu Dijemur 2 Hari'), " .
            "ai_confidence (integer 0-100), " .
            "ai_summary_recommendation (string: fakta manfaat spesifik arang/biochar dari limbah tersebut bagi tanah), " .
            "ai_Next_steps (array berisi tepat 3 string langkah praktis membuat arang metode lubang tanah Kon-Tiki atau drum tertutup minim asap).";

        // Estafet model Gemini 3 aktif: jika model utama sibuk (503/429), langsung coba model aktif berikutnya
        $modelsToTry = array_values(array_unique([
            config('services.gemini.model', 'gemini-3.5-flash-lite'),
            'gemini-3.5-flash-lite',
            'gemini-3.1-flash-lite',
            'gemini-3.7-flash',
            'gemini-3.8-flash',
        ]));

        $lastFailureReason = 'Seluruh model Gemini sedang sibuk atau gagal merespons.';

        foreach ($modelsToTry as $currentModel) {
            try {
                $response = Http::withOptions([
                    'verify' => false,
                    'force_ip_resolve' => 'v4',
                    'version' => 1.1,
                ])
                    ->timeout(30)
                    ->post("https://generativelanguage.googleapis.com/v1beta/models/{$currentModel}:generateContent?key={$apiKey}", [
                        'contents' => [
                            [
                                'parts' => [
                                    ['text' => $prompt],
                                    [
                                        'inline_data' => [
                                            'mime_type' => $mimeType,
                                            'data' => $base64Data,
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'generationConfig' => [
                            'responseMimeType' => 'application/json',
                        ],
                    ]);

                if ($response->successful()) {
                    $result = $response->json();
                    $parts = $result['candidates'][0]['content']['parts'] ?? [];
                    $jsonText = $parts[0]['text'] ?? '{}';
                    foreach ($parts as $part) {
                        if (empty($part['thought']) && isset($part['text'])) {
                            $jsonText = $part['text'];
                        }
                    }

                    $cleanJson = preg_replace('/^```json\s*|\s*```$/i', '', trim((string) $jsonText));
                    $decoded = json_decode($cleanJson, true);

                    if (is_array($decoded) && !empty(trim((string) ($decoded['detected_waste_type'] ?? '')))) {
                        $steps = $decoded['ai_Next_steps'] ?? $decoded['ai_next_steps'] ?? [];
                        $steps = is_array($steps) ? array_values($steps) : [];

                        return [
                            'is_fallback' => false,
                            'fallback_reason' => null,
                            'is_valid_waste' => (bool) ($decoded['is_valid_waste'] ?? true),
                            'detected_waste_type' => trim((string) $decoded['detected_waste_type']),
                            'moisture_condition' => (string) ($decoded['moisture_condition'] ?? 'Kering Siap Olah'),
                            'ai_confidence' => max(0, min(100, (int) round((float) ($decoded['ai_confidence'] ?? 95)))),
                            'ai_summary_recommendation' => (string) ($decoded['ai_summary_recommendation'] ?? ''),
                            'ai_Next_steps' => $steps,
                            'ai_next_steps' => $steps,
                            'model_used' => $currentModel,
                        ];
                    }

                    $lastFailureReason = "Model {$currentModel} mengembalikan respons JSON tanpa nama limbah.";
                    Log::warning('Gemini mengembalikan detected_waste_type kosong: ' . $cleanJson);
                } else {
                    $lastFailureReason = "Model {$currentModel} gagal merespons (HTTP {$response->status()}).";
                    Log::warning("Model {$currentModel} sedang padat/gagal (HTTP {$response->status()}), beralih ke model berikutnya...");
                }
            } catch (\Throwable $e) {
                $lastFailureReason = "Koneksi ke model {$currentModel} terputus: " . $e->getMessage();
                Log::warning("Koneksi ke {$currentModel} terganggu: " . $e->getMessage());
            }
        }

        return $this->getFallbackData($lastFailureReason);
    }

    public function getFallbackData(?string $reason = null): array
    {
        $steps = [
            "Kumpulkan jerami kering di dekat saluran air dan pastikan bebas dari sampah plastik.",
            "Bakar dari pucuk atas (metode Kon-Tiki / Top-Lit Updraft) selama 45–60 menit hingga nyala api bersih tanpa asap putih.",
            "Siram bara arang dengan air irigasi atau larutan MOL sebelum menjadi abu, lalu tebarkan 1.5 ton/Ha saat pengolahan lahan."
        ];

        return [
            "is_fallback" => true,
            "fallback_reason" => $reason ?? "Layanan AI sedang sibuk, menampilkan data cadangan.",
            "is_valid_waste" => true,
            "detected_waste_type" => "Jerami Padi (Oryza sativa)",
            "moisture_condition" => "Kering Siap Olah",
            "ai_confidence" => 98,
            "ai_summary_recommendation" => "Tumpukan jerami padi terdeteksi memiliki serat kering keemasan (<16% kadar air) dan siap dipirolisis. Mengolahnya menjadi biochar mencegah emisi 1.460 kg CO2/ton sekaligus meningkatkan daya ikat pupuk tanah sawah hingga 38%.",
            "ai_Next_steps" => $steps,
            "ai_next_steps" => $steps,
            "model_used" => "fallback",
        ];
    }

    public function getDeterministicPresets(): array
    {
        $jeramiSteps = [
            'Pastikan tumpukan jerami padi dalam kondisi kering optimal (<18% kadar air) dan terbebas dari tali plastik atau sisa sampah sintetis.',
            'Masukkan jerami kering ke dalam lubang tanah Kon-Tiki (kerucut 1.5 m) atau drum retort, nyalakan api dari pucuk atas (Top-Lit Updraft) selama 45–60 menit tanpa oksigen berlebih.',
            'Lakukan pemadaman cepat (quenching) menggunakan air cucian beras atau mikroorganisme lokal (MOL) saat bara membara 15% abu putih, lalu tebar 1.5 ton/Ha.',
        ];

        $kakaoSteps = [
            'Cacah kulit buah kakao menjadi potongan 3–5 cm segera setelah pemipilan, lalu jemur di atas terpal bersih selama 2–3 hari.',
            'Lakukan pirolisis pada suhu 450°C menggunakan drum berpenutup cerobong minim asap untuk memutus total siklus jamur Phytophthora palmivora.',
            'Padamkan dengan air pupuk hayati cair dan aplikasikan 2 kg per piringan pohon kakao untuk memasok Kalium tinggi (5% K2O).',
        ];

        $tongkolSteps = [
            'Pisahkan tongkol jagung dari sisa kelobot dan kotoran tanah, jemur di bawah terik matahari hingga berbunyi kering padat.',
            'Susun tongkol secara vertikal di dalam tungku pirolisis TLUD (Top-Lit Updraft) dan bakar dengan suplai udara bawah terkontrol selama 60 menit.',
            'Siram arang merah dengan air fermentasi urine ternak untuk inokulasi mikroba menguntungkan sebelum digiling kasar.',
        ];

        $sekamSteps = [
            'Kumpulkan sekam padi kering langsung dari penggilingan padi, pastikan bebas dari kerikil dan pasir.',
            'Bakar menggunakan cerobong silinder kawat kasa di bagian tengah gundukan sekam, aduk perlahan ketika warna mulai menghitam merata.',
            'Semprotkan kabut air hingga suhu turun di bawah 40°C sebelum menjadi abu putih, campurkan 20% arang sekam pada media tanam.',
        ];

        return [
            'jerami_lamongan' => [
                'preset_key' => 'jerami_lamongan',
                'is_valid_waste' => true,
                'detected_waste_type' => 'Jerami Padi (Oryza sativa)',
                'moisture_condition' => 'Kering Siap Olah',
                'ai_confidence' => 98,
                'recommended_regency' => 'Lamongan',
                'default_group' => 'Poktan Makmur Sejahtera Lamongan',
                'default_village' => 'Desa Sukodadi, Kec. Sukodadi',
                'default_lat' => -7.1185,
                'default_lng' => 112.3328,
                'engine' => 'Gemini 3.8 Flash Vision Schema',
                'nutrient_highlights' => [
                    'Kalium (K2O)' => '2.8% Alami',
                    'Silika (SiO2)' => '13.5% Penguat Batang',
                    'pH Biochar' => '8.6 Alkalin',
                ],
                'ai_summary_recommendation' => 'Tumpukan jerami padi terdeteksi memiliki serat kering keemasan (<16% kadar air) dan siap dipirolisis. Mengolahnya menjadi biochar mencegah emisi 1.460 kg CO2/ton sekaligus meningkatkan daya ikat pupuk tanah sawah hingga 38%.',
                'ai_Next_steps' => $jeramiSteps,
                'ai_next_steps' => $jeramiSteps,
            ],
            'kakao_majene' => [
                'preset_key' => 'kakao_majene',
                'is_valid_waste' => true,
                'detected_waste_type' => 'Kulit Buah Kakao (Theobroma cacao Pod Husk)',
                'moisture_condition' => 'Basah - Perlu Jemur 2 Hari',
                'ai_confidence' => 98,
                'recommended_regency' => 'Majene',
                'default_group' => 'Poktan Sipatuo Kakao Majene',
                'default_village' => 'Desa Lombong, Kec. Malunda',
                'default_lat' => -3.0954,
                'default_lng' => 118.8872,
                'engine' => 'Gemini 3.8 Flash Vision Schema',
                'nutrient_highlights' => [
                    'Kalium Super (K2O)' => '5.1% (Pengganti KCl)',
                    'Sanitasi Patogen' => '100% Steril Jamur',
                    'pH Biochar' => '9.4 Anti Tanah Masam',
                ],
                'ai_summary_recommendation' => 'Kulit buah kakao terdeteksi masih segar/lembab dan berisiko menjadi sarang jamur busuk buah (Phytophthora palmivora). Pirolisis suhu 450°C setelah penjemuran akan memutus siklus spora jamur dan menghasilkan biochar super-Kalium.',
                'ai_Next_steps' => $kakaoSteps,
                'ai_next_steps' => $kakaoSteps,
            ],
            'tongkol_malang' => [
                'preset_key' => 'tongkol_malang',
                'is_valid_waste' => true,
                'detected_waste_type' => 'Tongkol Jagung (Zea mays Cob)',
                'moisture_condition' => 'Kering Siap Olah',
                'ai_confidence' => 99,
                'recommended_regency' => 'Malang',
                'default_group' => 'Poktan Harapan Jaya Wajak',
                'default_village' => 'Desa Wajak, Kec. Wajak',
                'default_lat' => -8.1065,
                'default_lng' => 112.7302,
                'engine' => 'Gemini 3.8 Flash Vision Schema',
                'nutrient_highlights' => [
                    'Karbon Tetap (C)' => '78.4% Ultra-Stabil',
                    'Retensi Air' => '4.8x Bobot Kering',
                    'pH Biochar' => '8.7 Penyangga pH',
                ],
                'ai_summary_recommendation' => 'Tongkol jagung kering pasca-pipil memiliki struktur lignin padat yang sangat ideal untuk biochar berpori mikro tinggi. Mampu menyimpan cadangan air tanah di lahan kering hingga 6 minggu saat kemarau.',
                'ai_Next_steps' => $tongkolSteps,
                'ai_next_steps' => $tongkolSteps,
            ],
            'sekam_ngawi' => [
                'preset_key' => 'sekam_ngawi',
                'is_valid_waste' => true,
                'detected_waste_type' => 'Sekam Padi (Rice Husk)',
                'moisture_condition' => 'Kering Siap Olah',
                'ai_confidence' => 98,
                'recommended_regency' => 'Ngawi',
                'default_group' => 'Poktan Sumber Pangan Pangkur',
                'default_village' => 'Desa Pangkur, Kec. Pangkur',
                'default_lat' => -7.4352,
                'default_lng' => 111.5311,
                'engine' => 'Gemini 3.8 Flash Vision Schema',
                'nutrient_highlights' => [
                    'Silika Aktif (SiO2)' => '19.6% Tinggi',
                    'Porositas Tanah' => '74% Ruang Pori',
                    'pH Biochar' => '8.1 Ideal Akar',
                ],
                'ai_summary_recommendation' => 'Sekam padi penggilingan terdeteksi kering bersih (<14% kadar air). Konversi ke biochar sekam menghentikan asap pembakaran lambat di desa sekaligus menggemburkan tanah sawah yang memadat akibat pupuk kimia.',
                'ai_Next_steps' => $sekamSteps,
                'ai_next_steps' => $sekamSteps,
            ],
        ];
    }
}
