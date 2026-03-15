import { useState, useEffect } from 'react'

function Nav() {
  return (
    <nav className="nav">
      <a href="/" className="logo">File<em>Trust</em></a>
      <span className="nav-badge">🔒 Powered by VirusTotal</span>
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
            <h2>Kode tidak ditemukan</h2>
            <p>Kode <strong>{code}</strong> sudah kedaluwarsa atau tidak valid.</p>
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

  // VirusTotal stats from first checked URL (if any)
  const vtResult = r.checkedURLs?.find(u => u.stats)
  const vtMalicious = r.maliciousURLs?.reduce((acc, u) => acc + (u.stats?.malicious || 0), 0) ?? 0

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
              <p>{fileName}</p>
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
              <span className="detail-value">{r.totalURLs} link</span>
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
              <span className="detail-label">Kode verifikasi</span>
              <span className="detail-value" style={{ fontFamily: 'monospace', letterSpacing: 2, fontSize: 16 }}>
                {code}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Diperiksa pukul</span>
              <span className="detail-value">{scannedDate} WIB</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Dipindai oleh</span>
              <span className="detail-value">VirusTotal · Google Safe Browsing</span>
            </div>
          </div>

          <div className="section-divider" />

          <div className="code-badge">
            <div className="code-badge-label">Kode verifikasi</div>
            <div className="code-badge-value">{code}</div>
            <div className="code-badge-sub">File dihapus otomatis pada {expiresDate}</div>
            <div className="copy-row">
              <button className="copy-btn" onClick={() => copy(code, 'code')}>
                {copied === 'code' ? '✓ Tersalin' : '📋 Salin kode'}
              </button>
              <button className="copy-btn" onClick={() => copy(window.location.href, 'link')}>
                {copied === 'link' ? '✓ Tersalin' : '🔗 Salin link'}
              </button>
            </div>
          </div>

          {isSafe ? (
            <a className="dl-btn" href={`/api/result/${code}/download`} download>
              ⬇️ Download File — Aman
            </a>
          ) : (
            <div className="dl-disabled">❌ Download dinonaktifkan — file berbahaya</div>
          )}

          {!isSafe && (
            <div style={{ textAlign: 'center', padding: '0 32px 24px', fontSize: 14, color: '#888' }}>
              Tolak file ini dan laporkan pengirimnya.
            </div>
          )}
        </div>

        <div className="trust-strip" style={{ marginTop: 20 }}>
          <span className="trust-item">🔍 VirusTotal</span>
          <span className="trust-item">🛡️ Google Safe Browsing</span>
          <span className="trust-item">🔒 Immutable — tidak bisa diubah</span>
        </div>

        <div className="result-footer">
          Dipindai menggunakan VirusTotal & Google Safe Browsing · FileTrust
        </div>
      </div>
    </>
  )
}
