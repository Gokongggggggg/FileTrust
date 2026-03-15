# PRD – FileTrust
**Vibe Coding Competition – Mayar Ramadan 2026**
**Version:** 1.0 FINAL
**Last Updated:** 15 Maret 2026

---

## 1. Overview

### Problem Statement
Transaksi online antar personal (Facebook Marketplace, WA) sering gagal bukan karena produknya bermasalah — tapi karena buyer tidak percaya pada file yang dikirim seller. Di sisi lain, seller yang jujur pun tidak punya cara yang credible untuk membuktikan file mereka aman.

### Solution
**FileTrust** adalah platform web di mana seller upload PDF, mendapat kode unik, dan buyer bisa verifikasi + download file langsung dari platform — bukan dari WA. FileTrust menjadi **single source of truth**: file yang di-scan = file yang didownload buyer. Tidak ada kemungkinan file di-swap.

---

## 2. User Roles

**Seller:** Upload PDF → dapat kode unik → share kode ke buyer
**Buyer:** Input kode di FileTrust → lihat hasil scan → download file

---

## 3. User Flow

```
SELLER:
Buka filetrustapp.com → Upload PDF
→ Scan otomatis
→ Dapat kode unik (SAFE-4X9K)
→ Kirim kode ke buyer di WA

BUYER:
Buka filetrustapp.com → Input kode
→ Lihat hasil scan
→ Download file (jika aman)
```

---

## 4. Features (MVP)

### 4.1 Upload & Scan (Seller)
- Upload PDF via drag & drop atau tap
- Scan: embedded JS detection + URL extraction + VirusTotal + Google Safe Browsing
- Generate kode unik format `XXXX-YYYY` (e.g. `SAFE-4X9K`)
- Kode berlaku 24 jam

### 4.2 Check & Download (Buyer)
- Input kode unik → lihat hasil scan
- Jika AMAN: tombol download aktif
- Jika MENCURIGAKAN: download disabled, warning ditampilkan
- Result page public: `filetrustapp.com/result/SAFE-4X9K`

### 4.3 Trust Signals
- Badge: "Dipindai menggunakan VirusTotal & Google Safe Browsing"
- Timestamp real-time di setiap result
- "File otomatis dihapus setelah 24 jam"
- Zero iklan, zero popup
- Desain bersih & professional

---

## 5. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| PDF Parsing | pdf-parse + pdfjs-dist |
| Threat Intel | VirusTotal API v3 + Google Safe Browsing |
| Database | Neon PostgreSQL |
| Hosting | Railway (live) |

---

## 6. Out of Scope (MVP)
- WA Bot integration
- User accounts
- Office files (DOCX, XLSX)
- Mayar payment integration

---

## 7. Timeline

| Waktu | Milestone |
|---|---|
| Sekarang | CONTEXT.md updated, Claude Code pivot |
| +2 jam | Backend API upload + result done |
| +4 jam | Frontend upload + check page done |
| +6 jam | Landing page + polish |
| 17 Mar | Demo & penjurian |

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| VirusTotal rate limit | Cache per file hash |
| Buyer tidak percaya platform | Trust signals section |
| File storage cost | 24 jam auto-delete |
