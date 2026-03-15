# FileTrust – Project Context (Final)

## What is FileTrust?
FileTrust adalah platform web di mana seller bisa upload & scan file (PDF), lalu mendapatkan **kode unik** yang bisa diberikan ke buyer. Buyer buka FileTrust, input kode, lihat hasil scan, dan download file langsung dari platform — tanpa perlu download dari WA atau sumber lain.

## Core Problem
- Buyer takut download/buka PDF dari seller yang belum dikenal di WA/Facebook
- Seller tidak punya cara credible untuk buktikan file-nya aman
- File yang di-scan bisa berbeda dengan file yang dikirim (trust gap)

## Core Insight
> Buyer tidak perlu download file dari WA sama sekali. Seller upload ke FileTrust → dapat kode unik → buyer download langsung dari FileTrust. Platform jadi single source of truth — file yang di-scan = file yang didownload buyer.

## Final User Flow
```
SELLER:
Buka filetrustapp.com
→ Upload PDF
→ FileTrust scan otomatis (URL check + JS detection)
→ Dapat KODE UNIK (contoh: SAFE-4X9K)
→ Kirim kode ke buyer: "Cek keaslian file gua di filetrustapp.com, kodenya SAFE-4X9K"

BUYER:
Buka filetrustapp.com
→ Input kode unik dari seller
→ Lihat hasil scan: AMAN / MENCURIGAKAN
→ Download file langsung dari FileTrust (bukan dari WA)
→ Confident — file yang didownload = file yang di-scan
```

## Why This Works
- ✅ Buyer tidak perlu download dari WA — lebih trusted
- ✅ Kode unik = feels official, seperti kode resi pengiriman
- ✅ File yang buyer download = file yang sama yang di-scan (no swap possible)
- ✅ Zero friction untuk buyer — cukup input kode
- ✅ Seller punya incentive — close deal lebih cepat

## UI Philosophy
- **ilovepdf-style** — tool langsung keliatan, no scrolling needed to understand
- **No explicit role labels** — jangan sebut "seller" / "buyer" di UI
- User figure out sendiri mau ngapain
- Edukasi via passive note, bukan instruksi overwhelming

## Pages / Routes

### 1. Landing Page (`/`)
Dua elemen utama above the fold:
```
[ Masukkan kode unik... ] [ Cek ]

[ Upload PDF — drag & drop atau klik ]

─────────────────────────────────────
💡 Terima file dari seseorang?
   Minta dia upload di sini dulu.
   Nanti kamu bisa download langsung
   dari FileTrust kalau filenya aman.
```
- Trust signals: "Powered by VirusTotal & Google Safe Browsing"
- Info section di bawah — non-technical, cerita skenario nyata, cara kerja

### 2. Result Page (`/result/:code`)
- Load otomatis dari kode unik
- Tampilkan hasil scan + VirusTotal raw score (X/72)
- Link opsional ke laporan VirusTotal lengkap
- Jika AMAN: tombol download aktif
- Jika MENCURIGAKAN: download disabled, warning merah
- Immutable — tidak bisa diubah setelah scan

## Scan Result Display

### AMAN:
```
✅ File Ini Aman

📄 invoice-tagihan.pdf
🔐 Kode: SAFE-4X9K
🕐 Diperiksa: 15 Maret 2026, 10.30 WIB
🔍 Tidak ditemukan script berbahaya
🔗 Tidak ditemukan link mencurigakan

[⬇️ Download File]

Dipindai menggunakan VirusTotal & Google Safe Browsing
```

### MENCURIGAKAN:
```
⚠️ File Ini Mencurigakan

📄 invoice-tagihan.pdf  
🔐 Kode: SAFE-4X9K
🔗 Link berbahaya ditemukan:
   • bit.ly/xxx → terdeteksi phishing

❌ Download dinonaktifkan untuk keamanan kamu.

Tolak file ini dan laporkan pengirimnya.
```

## Trust Signals (Critical)
- Domain clean & professional
- Branding konsisten
- Badge: "Dipindai menggunakan VirusTotal & Google Safe Browsing"
- Timestamp spesifik di result — real-time, tidak bisa dipalsukan
- "File disimpan 24 jam lalu otomatis dihapus" — privacy-conscious
- Zero iklan, zero popup
- Footer: tentang kami, kontak

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| PDF Parsing | `pdf-parse` + `pdfjs-dist` |
| Threat Intel | VirusTotal API v3 + Google Safe Browsing API |
| URL Unshorten | Custom resolver |
| Storage | Neon PostgreSQL (scan results, file temp storage) |
| File Storage | In-memory / temp — dihapus setelah 24 jam |
| Hosting | Railway (sudah live: filetrust-production.up.railway.app) |

## Unique Code Format
- Format: `XXXX-YYYY` (4 huruf kapital + 4 angka, contoh: `SAFE-4X9K`)
- Generated server-side, stored di DB dengan expiry 24 jam
- Case-insensitive saat buyer input

## Database Schema
```sql
CREATE TABLE scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(9) UNIQUE NOT NULL,        -- e.g. SAFE-4X9K
  filename VARCHAR(255) NOT NULL,
  file_hash VARCHAR(64) NOT NULL,
  scan_status VARCHAR(20) NOT NULL,        -- 'clean' | 'suspicious'
  scan_details JSONB,
  file_data BYTEA,                         -- temp file storage
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,                    -- 24 jam dari created_at
  download_count INT DEFAULT 0
);
```

## Environment Variables
```
VIRUSTOTAL_API_KEY=✅ ready
GOOGLE_SAFE_BROWSING_API_KEY=✅ ready
DATABASE_URL=✅ ready (Neon)
PORT=8080
```

## Current Status
| Component | Status |
|---|---|
| Railway deployment | ✅ Live |
| Neon DB | ✅ Connected |
| PDF scan engine | ✅ Built |
| VirusTotal integration | ✅ Built |
| Google Safe Browsing | ✅ Ready |
| Upload page + kode unik | ⬜ TODO |
| Check/Result page | ⬜ TODO |
| Landing page | ⬜ TODO |
| File temp storage (24h) | ⬜ TODO |

## Priority Build Order
1. Backend: `POST /api/upload` → scan → generate kode → simpan ke DB
2. Backend: `GET /api/result/:code` → return scan result + file
3. Frontend: Upload page
4. Frontend: Check/Result page
5. Frontend: Landing page + trust signals polish
6. Test end-to-end: upload PDF → dapat kode → input kode → download

## Competition Context
- **Event**: Mayar Vibecoding Competition Ramadan 2026
- **App name**: FileTrust (ex-SafeSend)
- **Deadline Submit**: 15 Maret 2026 (HARI INI)
- **Penjurian**: 17 Maret 2026
- **Prize**: Rp 5.000.000
- **Deployed at**: filetrust-production.up.railway.app
