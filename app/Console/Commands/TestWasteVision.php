<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\WasteVisionService;

class TestWasteVision extends Command
{
    protected $signature = 'test:waste-vision {filename=jerami.jpg}';
    protected $description = 'Menguji Gemini Vision API memindai limbah';

    public function handle(WasteVisionService $service)
    {
        $filename = $this->argument('filename');
        $path = public_path('samples/' . $filename);

        if (!file_exists($path)) {
            $this->error("Gagal: Foto {$filename} tidak ditemukan di folder public/samples/");
            return;
        }

        $this->info("Mengubah gambar ke format Base64 dan mengirim ke Gemini API...");

        $mime = mime_content_type($path);
        $base64 = base64_encode(file_get_contents($path));
        $payload = "data:{$mime};base64,{$base64}";

        $result = $service->analyzeBiomass($payload);

        $this->line(json_encode($result, JSON_PRETTY_PRINT));
    }
}