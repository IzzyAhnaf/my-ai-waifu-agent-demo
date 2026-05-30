# 🎙️ AI Waifu Project - Microservice Architecture

Sistem asisten virtual (Waifu) berbasis kecerdasan buatan tingkat tinggi yang menggunakan arsitektur *distributed microservice*. Sistem ini dirancang untuk memproses input suara secara *in-memory*, menganalisis teks dengan *smart routing* multi-LLM, mempertahankan ingatan jangka panjang melalui basis data vektor lokal, dan mengalirkan audio balasan secara *real-time*.

## 🏗️ Arsitektur Sistem

Sistem ini membagi beban kerja ke dalam beberapa lapisan independen untuk menghemat konsumsi RAM lokal:

```text
[Aplikasi Flutter (Ponsel)]
       │ (Voice Input / Socket.IO)
       ▼
[Gateway Node (NestJS)] ───(Edge TTS)───► [Render Suara MP3 (RAM)]
       │ (HTTP Stream Multipart)
       ▼
[AI Service (FastAPI Python)] ───(RAG)───► [SQLite + ChromaDB]
```

1. **Frontend (Flutter)**: Antarmuka pengguna untuk merekam suara dari mikrofon ponsel dan memutar berkas audio balasan.
2. **API Gateway (NestJS)**: Manajer panggung untuk mengelola pipa *streaming* WebSocket (Socket.IO) ke ponsel, *forwarding data* ke Python, dan merender teks menjadi suara menggunakan Microsoft Edge TTS.
3. **Core AI Service (FastAPI Python)**: Jantung kognitif yang mengelola pengenalan suara otomatis (ASR), logika *Traffic Cop* LLM, serta manajemen memori RAG.

---

## 🚀 Fitur Utama

- **Organ Telinga (Faster-Whisper)**: Mengubah rekaman audio dari Node.js menjadi teks dalam waktu singkat secara lokal menggunakan model `base` terkuantisasi (`int8`).
- **Traffic Cop LLM Router (LiteLLM)**: 
  - **Analisis Berat & Koding**: Secara otomatis dialihkan ke raksasa **NVIDIA Nemotron 3 Super 120B**.
  - **Obrolan Santai**: Ditangani oleh **Gemini 2.5 Flash** untuk efisiensi latensi.
  - **Mode Offline**: Menggunakan model lokal **Qwen 2.5 1.5B** via Vulkan API pada GPU NVIDIA MX110.
- **Dual-Database RAG Memory**: 
  - **SQLite**: Menyimpan rekaman buku harian obrolan secara kronologis.
  - **ChromaDB**: Basis data vektor lokal untuk mempertahankan konteks ingatan masa lalu secara intuitif (*semantic search*).
- **Pita Suara Tanpa Batas**: Menggunakan `msedge-tts` untuk menghasilkan suara perempuan Indonesia (`id-ID-GadisNeural`) secara *streaming* langsung dari RAM tanpa menulis berkas fisik ke *hardisk*.

---

## 🛠️ Struktur Direktori

```text
ai-waifu-project/
├── gateway-node/               # Microservice 1: NestJS API Gateway
│   ├── src/
│   │   ├── chat/               # Module, Service, Controller, & Gateway Chat
│   │   └── main.ts
│   └── package.json
└── 2-ai-service-python/        # Microservice 2: Core AI Backend Python
    ├── main.py                 # FastAPI Router & Traffic Cop Logic
    ├── memory.py               # RAG Engine (ChromaDB + SQLite)
    └── requirements.txt
```

---

## 🏁 Panduan Memulai Cepat

### 1. Menjalankan Core AI Service (Python)
Masuk ke direktori Python, aktifkan *virtual environment*, pasang dependensi, dan nyalakan server:
```bash
cd 2-ai-service-python
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Menjalankan API Gateway (NestJS)
Buka terminal baru, masuk ke direktori Node, pasang paket modul, dan jalankan server *development*:
```bash
cd gateway-node
npm install
npm run start:dev
```

### 3. Pengujian Klien
Gunakan berkas simulasi HTML atau hubungkan aplikasi Flutter Anda ke alamat `http://localhost:3000` via Socket.IO untuk mulai berkomunikasi dengan Waifu Anda.

---

## 📄 Lisensi
Proyek ini dikembangkan untuk keperluan pengembangan pribadi dan riset arsitektur kecerdasan buatan lokal.