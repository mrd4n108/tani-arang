/**
 * Penyimpanan Riwayat Pemindaian Biomassa (taniarang_scan_history_v1)
 * Berjalan sepenuhnya di sisi klien menggunakan LocalStorage.
 * Bebas dari tanda em dash sesuai pedoman anti-slop.
 */

const STORAGE_KEY = 'taniarang_scan_history_v1';

export function getScanHistory() {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('Gagal membaca riwayat pindai:', e);
        return [];
    }
}

export function saveScanRecord(record) {
    if (typeof window === 'undefined') return [];
    try {
        const existing = getScanHistory();
        // Pastikan record memiliki ID dan timestamp
        const finalRecord = {
            id: record.id || `scan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            timestamp: record.timestamp || new Date().toISOString(),
            dateFormatted: record.dateFormatted || formatIndonesianDate(new Date()),
            ...record,
        };

        // Simpan ke urutan terdepan, batasi hingga 40 entri agar tidak meluap
        const updated = [finalRecord, ...existing.filter((item) => item.id !== finalRecord.id)].slice(0, 40);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error('Gagal menyimpan rekam pindai:', e);
        return getScanHistory();
    }
}

export function deleteScanRecord(id) {
    if (typeof window === 'undefined') return [];
    try {
        const existing = getScanHistory();
        const updated = existing.filter((item) => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error('Gagal menghapus rekam pindai:', e);
        return getScanHistory();
    }
}

export function clearScanHistory() {
    if (typeof window === 'undefined') return [];
    try {
        localStorage.removeItem(STORAGE_KEY);
        return [];
    } catch (e) {
        console.error('Gagal membersihkan riwayat pindai:', e);
        return [];
    }
}

export function formatIndonesianDate(dateInput) {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'Hari ini';

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ];

    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${mins} WIB`;
}

export function seedDemoScanHistory() {
    const demoRecords = [
        {
            id: 'scan_demo_lamongan_01',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            dateFormatted: '13 Nov 2026, 14:15 WIB',
            detectedWasteType: 'Jerami Padi (Oryza sativa)',
            commodity: 'Jerami Padi',
            region: 'Kab. Lamongan, Jawa Timur',
            moistureCondition: 'Kering Siap Olah',
            isDryReady: true,
            aiConfidence: 96,
            destination: 'komunitas',
            destinationLabel: 'Setor ke Komunitas',
            community: {
                name: 'Sentra Biochar Poktan Makmur Sejahtera',
                regency: 'Lamongan',
                address: 'Jl. Raya Pertanian No. 45, Desa Sukodadi, Kec. Sukodadi, Kab. Lamongan, Jawa Timur',
                contactPerson: 'Pak Sugeng Riyadi',
                phone: '0812-3456-7891',
            },
            nutrientHighlights: {
                'Silika (SiO2)': '58 - 65% (Penguat Batang)',
                'Kalium (K2O)': '1.4 - 2.1% (Ketahanan Hama)',
                'Rasio C/N': '48:1 (Stabil)',
            },
            carbonPotential: {
                co2Avoidance: '1.45 ton CO2e/ton jerami',
                fixedCarbon: '44.8%',
                soilBenefit: 'Peningkatan kapasitas tukar kation (KTK) dan porositas aerasi perakaran padi sawah.',
            },
            summaryRecommendation: 'Biomassa berkadar air rendah, sangat optimal disetorkan ke sentra pirolisis komunitas untuk konversi biochar silika tinggi.',
            steps: [
                {
                    title: 'Langkah 1: Persiapan & Penimbangan',
                    badge: 'Kadar Air 14%',
                    instructions: 'Ikat jerami kering dalam bendel 10 kg, pastikan bebas tanah dan tali rafia sintetis.',
                    parameter: 'Target susut bobot < 5% saat pengiriman.',
                },
                {
                    title: 'Langkah 2: Penyetoran ke Sentra Sukodadi',
                    badge: 'Jam 08.00 - 16.00',
                    instructions: 'Kunjungi Sentra Biochar Poktan Makmur Sejahtera di Sukodadi untuk penimbangan resmi dan pencatatan tonase.',
                    parameter: 'Insentif penukaran: 25 kg biochar aktif per 100 kg jerami.',
                },
                {
                    title: 'Langkah 3: Penerimaan Biochar Teraktivasi',
                    badge: 'Inokulasi MOL',
                    instructions: 'Bawa pulang biochar berinokulasi Mikroorganisme Lokal untuk diaplikasikan saat olah tanah musim tanam berikutnya.',
                    parameter: 'Dosis rekomendasi: 1.5 - 2 ton/Ha.',
                },
            ],
        },
        {
            id: 'scan_demo_majene_02',
            timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
            dateFormatted: '13 Nov 2026, 08:30 WIB',
            detectedWasteType: 'Kulit Buah Kakao (Theobroma cacao)',
            commodity: 'Kulit Kakao',
            region: 'Kab. Majene, Sulawesi Barat',
            moistureCondition: 'Kering Siap Olah',
            isDryReady: true,
            aiConfidence: 93,
            destination: 'mandiri',
            destinationLabel: 'Olah Mandiri (Kon-Tiki)',
            community: null,
            nutrientHighlights: {
                'Kalium (K2O)': '3.8 - 4.9% (Tinggi)',
                'Fosfor (P2O5)': '0.6 - 0.9%',
                'pH Biochar': '8.6 (Alkalin Pembenah)',
            },
            carbonPotential: {
                co2Avoidance: '1.20 ton CO2e/ton kulit',
                fixedCarbon: '51.2%',
                soilBenefit: 'Menetralkan tanah masam kebun kakao dan meningkatkan serapan hara kalium tanaman buah.',
            },
            summaryRecommendation: 'Kulit kakao kaya kalium organik, sangat tepat diolah mandiri menggunakan metode tudung api Kon-Tiki.',
            steps: [
                {
                    title: 'Langkah 1: Perajangan & Pengeringan',
                    badge: 'Kadar Air < 18%',
                    instructions: 'Rajang kulit kakao menjadi potongan 3 - 5 cm, jemur di terpal transparan 2 hari hingga berbunyi renyah saat dipatahkan.',
                    parameter: 'Kadar air target: 15 - 18%.',
                },
                {
                    title: 'Langkah 2: Pembakaran Bersih Kon-Tiki',
                    badge: 'Suhu 550 - 650°C',
                    instructions: 'Gunakan tungku kerucut Kon-Tiki sudut 45 derajat. Nyalakan dari pucuk atas (Top-Lit Updraft), masukkan limbah bertahap saat lapisan bawah membara merah tanpa asap putih tebal.',
                    parameter: 'Tudung api keemasan bebas asap selama 45 menit.',
                },
                {
                    title: 'Langkah 3: Pemadaman & Aktivasi MOL',
                    badge: 'Quenching Nutrisi',
                    instructions: 'Saat bara mencapai 85% volume tungku sebelum jadi abu putih, siram dengan air cucian beras bercampur MOL. Tiriskan dan simpan di tempat teduh.',
                    parameter: 'Biochar dingin < 40°C siap tebar 2 ton/Ha.',
                },
            ],
        },
    ];

    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(demoRecords));
        } catch (e) {}
    }
    return demoRecords;
}
