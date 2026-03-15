import { useState, useEffect } from 'react'

function Nav() {
  return (
    <nav className="nav">
      <a href="/" className="logo">
        <svg className="logo-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4" stroke="#2563eb" />
        </svg>
        File<em>Trust</em>
      </a>
      <span className="nav-tag">Powered by VirusTotal</span>
    </nav>
  )
}

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

  if (state === 'loading') {
    return (
      <>
        <Nav />
        <div className="result-page">
          <div className="scanning-screen">
            <div className="spinner" />
            <h2>Memuat hasil scan...</h2>
          </div>
        </div>
      </>
    )
  }

  if (state === 'notfound') {
    return (
      <>
        <Nav />
        <div className="result-page">
          <a href="/" className="back-link">← Kembali</a>
          <div className="error-card">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h2>Kode tidak ditemukan</h2>
            <p>Kode <strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>{code}</strong> sudah kedaluwarsa atau tidak valid.</p>
            <a href="/" className="btn-primary">Scan File Baru</a>
          </div>
        </div>
      </>
    )
  }

  const { scanResult: r, fileName, expiresAt } = data
  const isSafe = r.isSafe
  const expiresDate = new Date(expiresAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
  const scannedDate = new Date(r.scannedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })

  return (
    <>
      <Nav />
      <div className="result-page">
        <a href="/" className="back-link">← Scan file lain</a>

        <div className="result-card">
          <div className={`result-banner ${isSafe ? 'safe' : 'danger'}`}>
            <div className="banner-icon">{isSafe ? '✅' : '⚠️'}</div>
            <div className="banner-text">
              <h1>{isSafe ? 'File Ini Aman' : 'File Ini Mencurigakan'}</h1>
              <p><span className="file-badge">PDF</span> {fileName}</p>
            </div>
          </div>

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

          {isSafe ? (
            <a className="dl-btn" href={`/api/result/${code}/download`} download>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download File — Aman
            </a>
          ) : (
            <>
              <div className="dl-disabled">Download dinonaktifkan — file berbahaya</div>
              <div style={{ textAlign: 'center', padding: '0 32px 24px', fontSize: 13, color: 'var(--text-muted)' }}>
                Tolak file ini dan laporkan pengirimnya.
              </div>
            </>
          )}
        </div>

        <div className="trust-row" style={{ marginTop: 16 }}>
          <span className="trust-pill">🔍 VirusTotal</span>
          <span className="trust-pill">🛡️ Google Safe Browsing</span>
          <span className="trust-pill">🔒 Immutable</span>
        </div>

        <div className="result-footer">
          Dipindai menggunakan VirusTotal & Google Safe Browsing<br />
          FileTrust — Verifikasi keamanan file untuk semua orang
        </div>
      </div>
    </>
  )
}
