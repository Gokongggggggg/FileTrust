import { useState, useEffect } from 'react'
import Nav from '../Nav'
import './ResultPage.css'

export default function ResultPage({ code }) {
  const [state, setState] = useState('loading')
  const [data, setData] = useState(null)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    fetch(`/api/result/${code}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setState('notfound')
        else { setData(d); setState('done') }
      })
      .catch(() => setState('notfound'))
  }, [code])

  function copy(text, key) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  // ── LOADING ──
  if (state === 'loading') return (
    <>
      <Nav minimal />
      <div className="rp-hero">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-inner">
          <h1>Memuat hasil scan...</h1>
        </div>
      </div>
      <div className="rp-wrap">
        <div className="scanning-screen">
          <div className="spinner" />
          <h2>Mengambil data hasil scan</h2>
          <p>Sebentar ya...</p>
        </div>
      </div>
    </>
  )

  // ── NOT FOUND ──
  if (state === 'notfound') return (
    <>
      <Nav minimal />
      <div className="rp-hero rp-hero--short">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-inner">
          <h1>Kode tidak ditemukan</h1>
          <p>Kode sudah kedaluwarsa atau tidak valid.</p>
        </div>
      </div>
      <div className="rp-wrap">
        <div className="error-card">
          <div className="error-icon">🔍</div>
          <h2>Kode <span className="code-inline">{code}</span> tidak valid</h2>
          <p>Kode verifikasi berlaku selama 24 jam sejak file diupload. Minta pengirim untuk upload ulang file-nya.</p>
          <a href="/" className="btn-primary">← Kembali ke Beranda</a>
        </div>
      </div>
    </>
  )

  // ── DONE ──
  const { scanResult: r, fileName, expiresAt } = data
  const isSafe = r.isSafe
  const expiresDate = new Date(expiresAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
  const scannedDate = new Date(r.scannedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })

  return (
    <>
      <Nav minimal />

      <div className={`rp-hero rp-hero--short ${isSafe ? 'rp-hero--safe' : 'rp-hero--danger'}`}>
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-inner">
          <div className="rp-status-badge">
            {isSafe ? '✅ File Aman' : '⚠️ File Mencurigakan'}
          </div>
          <h1>{fileName}</h1>
          <p>{isSafe
            ? 'File ini sudah diverifikasi aman. Kamu bisa download dengan tenang.'
            : 'File ini terindikasi berbahaya. Jangan download atau buka file ini.'
          }</p>
        </div>
      </div>

      <div className="rp-wrap">
        <a href="/" className="back-link">← Scan file lain</a>

        <div className="result-card">

          {/* Banner */}
          <div className={`result-banner ${isSafe ? 'safe' : 'danger'}`}>
            <div className="banner-icon">{isSafe ? '✅' : '⚠️'}</div>
            <div className="banner-text">
              <h1>{isSafe ? 'File Ini Aman' : 'File Ini Mencurigakan'}</h1>
              <p><span className="file-badge">PDF</span> {fileName}</p>
            </div>
          </div>

          {/* Detail rows */}
          <div className="result-details">
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className={`detail-value ${isSafe ? 'status-safe' : 'status-danger'}`}>
                {isSafe ? '✓ Aman untuk didownload' : '✗ Tidak aman — tolak file ini'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Script tersembunyi</span>
              <span className={`detail-value ${r.hasEmbeddedJS ? 'status-danger' : 'status-safe'}`}>
                {r.hasEmbeddedJS ? '⚠️ Ditemukan' : '✓ Tidak ditemukan'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Link diperiksa</span>
              <span className="detail-value">{r.totalURLs} link ditemukan</span>
            </div>
            {!isSafe && r.maliciousURLs?.length > 0 && (
              <div className="detail-row">
                <span className="detail-label">Link berbahaya</span>
                <div className="detail-value">
                  {r.maliciousURLs.map((u, i) => (
                    <div key={i} className="url-danger">⚠️ {u.url} — {u.reason}</div>
                  ))}
                </div>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Waktu scan</span>
              <span className="detail-value">{scannedDate} WIB</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Dipindai oleh</span>
              <span className="detail-value">VirusTotal + Google Safe Browsing</span>
            </div>
          </div>

          <div className="section-divider" />

          {/* Code badge */}
          <div className="code-badge">
            <div className="code-badge-label">Kode Verifikasi</div>
            <div className="code-badge-value">{code}</div>
            <div className="code-badge-sub">File akan dihapus otomatis pada {expiresDate}</div>
            <div className="copy-row">
              <button className={`copy-btn ${copied === 'code' ? 'copied' : ''}`} onClick={() => copy(code, 'code')}>
                {copied === 'code' ? '✓ Tersalin' : '📋 Salin kode'}
              </button>
              <button className={`copy-btn ${copied === 'link' ? 'copied' : ''}`} onClick={() => copy(window.location.href, 'link')}>
                {copied === 'link' ? '✓ Tersalin' : '🔗 Salin link'}
              </button>
            </div>
          </div>

          {/* Download */}
          {isSafe ? (
            <a className="dl-btn" href={`/api/result/${code}/download`} download>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download File — Aman
            </a>
          ) : (
            <>
              <div className="dl-disabled">Download dinonaktifkan — file berbahaya</div>
              <p className="dl-warn">Tolak file ini dan laporkan pengirimnya.</p>
            </>
          )}
        </div>

        {/* Trust bar */}
        <div className="trust-bar" style={{ marginTop: 16, padding: 0, maxWidth: 'none' }}>
          <span className="trust-pill">🔍 VirusTotal</span>
          <span className="trust-pill">🛡️ Google Safe Browsing</span>
          <span className="trust-pill">🔒 Immutable</span>
        </div>

        <div className="result-footer">
          Dipindai menggunakan VirusTotal &amp; Google Safe Browsing<br />
          FileTrust — Verifikasi keamanan file untuk semua orang
        </div>
      </div>
    </>
  )
}