# SafeSend – Project Context

## What is SafeSend?
SafeSend adalah platform yang membantu seller membuktikan keamanan file (PDF) kepada buyer dalam transaksi online (Facebook Marketplace, WhatsApp). Seller add bot SafeSend ke group chat dengan buyer — setiap PDF yang dikirim langsung di-scan otomatis, dan hasilnya muncul di chat yang sama. Karena bot menjadi "witness" di conversation yang sama, buyer tidak bisa curiga bahwa file yang di-scan berbeda dengan file yang dikirim.

## Core Problem
- Buyer takut download/buka PDF dari seller yang belum dikenal
- Seller tidak punya cara credible untuk buktikan file-nya aman
- Solusi existing (VirusTotal web, dll) terlalu technical & journey-nya terlalu panjang untuk orang awam
- Upload ke web app tidak cukup — buyer bisa curiga file yang di-scan beda dengan yang dikirim

## Core Insight
> Bot harus ada di conversation yang sama antara seller & buyer — sehingga file yang di-scan adalah file yang sama yang dikirim seller, witnessed secara real-time.

## User Roles
- **Seller**: Add bot ke group WA dengan buyer, kirim PDF → bot auto-scan
- **Buyer**: Lihat hasil scan langsung di chat — zero friction, zero install
- **Bot (SafeSend)**: Nomor WA via WhatsApp Cloud API, auto-detect & scan incoming PDF

## User Flow
```
Seller & Buyer dalam 1 group WA
→ Seller kirim PDF ke group
→ Bot SafeSend (member group) detect file masuk
→ Bot download file (in-memory, tidak disimpan)
→ Scan: extract URLs + detect embedded JS
→ Check URLs via VirusTotal API + Google Safe Browsing
→ Bot reply hasil scan di group chat (plain language, no jargon)
→ Buyer lihat hasil → confident untuk download & buka (atau tolak)
```

## Tech Stack
- **Backend**: Node.js + Express
- **WA Integration**: WhatsApp Cloud API (Meta) — *pending approval ~1 day*
- **PDF Parsing**: `pdf-parse` + `pdfjs-dist`
- **Threat Intel**: VirusTotal API v3 + Google Safe Browsing API
- **URL Unshorten**: Custom resolver (follow redirect chain)
- **Database**: Neon PostgreSQL (scan logs, result cache by file hash)
- **Hosting**: Railway

## Bot Reply Format

### Jika AMAN:
```
✅ File Aman — SafeSend

📄 nama-file.pdf
🔍 Tidak ditemukan script berbahaya
🔗 Tidak ditemukan link mencurigakan

Buyer bisa download file ini dengan tenang.
— SafeSend 🔒
```

### Jika MENCURIGAKAN:
```
⚠️ File Mencurigakan — SafeSend

📄 nama-file.pdf
🔗 Link berbahaya ditemukan:
   • bit.ly/xxx → terdeteksi phishing

Jangan download file ini.
— SafeSend 🔒
```

## Scan Scope (MVP)
1. Embedded JavaScript / action triggers dalam PDF
2. URL extraction dari seluruh isi PDF
3. URL check via VirusTotal API v3
4. URL unshorten (bit.ly, tinyurl, dll) sebelum di-check
5. Google Safe Browsing sebagai secondary check

## Out of Scope (MVP)
- Image steganography
- Office files (DOCX, XLSX)
- User accounts / dashboard
- Mayar payment integration
- Web upload interface (post-MVP)

## Environment Variables Needed
```
VIRUSTOTAL_API_KEY=your_key_here
GOOGLE_SAFE_BROWSING_API_KEY=your_key_here
WA_PHONE_NUMBER_ID=pending
WA_ACCESS_TOKEN=pending
WA_VERIFY_TOKEN=your_webhook_verify_token
DATABASE_URL=neon_postgres_url
PORT=3000
```

## Project Structure (Target)
```
safesend/
├── src/
│   ├── scanner/
│   │   ├── pdfParser.js       # Extract URLs + detect JS from PDF
│   │   ├── urlChecker.js      # VirusTotal + Safe Browsing + unshorten
│   │   └── index.js           # Main scan orchestrator
│   ├── bot/
│   │   ├── webhook.js         # WA Cloud API webhook handler
│   │   ├── messageHandler.js  # Detect incoming PDF, trigger scan
│   │   └── reply.js           # Format & send reply to WA group
│   ├── db/
│   │   └── cache.js           # Cache scan results by file hash
│   └── app.js                 # Express app entry point
├── .env
├── .env.example
├── package.json
└── CONTEXT.md
```

## Current Status
| Component | Status |
|---|---|
| VirusTotal API key | ✅ Ready |
| Google Safe Browsing API key | ⬜ Not yet |
| WA Cloud API (Meta) | ⏳ Pending (~1 day) |
| PDF scan logic | ⬜ Not started |
| Bot webhook handler | ⬜ Not started |
| Neon DB setup | ⬜ Not started |
| Railway deployment | ⬜ Not started |

## Priority Build Order
1. `src/scanner/` — core engine, no dependencies on WA API
2. `src/db/cache.js` — hash-based caching
3. `src/bot/webhook.js` + `messageHandler.js` — after WA API ready
4. `src/bot/reply.js` — format output
5. Deploy to Railway + connect webhook

## Competition Context
- **Event**: Mayar Vibecoding Competition Ramadan 2026
- **Deadline Submit**: 15 Maret 2026 (today)
- **Penjurian**: 17 Maret 2026
- **Prize**: Rp 5.000.000
- **Judging criteria bonus**: Integrasi pembayaran Mayar (opsional, post-MVP)
- **Stack rule**: Bebas, vibe coding with agentic AI encouraged
