import { useState, useEffect } from 'react'

export default function ResultPage({ code }) {
  const [state, setState] = useState('loading')
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`/api/result/${code}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setState('notfound')
        else { setData(d); setState('done') }
      })
      .catch(() => setState('notfound'))
  }, [code])

  if (state === 'loading') {
    return (
      <div className="container">
        <div className="header"><div className="logo">File<span>Trust</span></div></div>
        <div className="scanning">
          <div className="spinner" />
          <h2>Memuat hasil scan...</h2>
        </div>
      </div>
    )
  }

  if (state === 'notfound') {
    return (
      <div className="container">
        <div className="header"><div className="logo">File<span>Trust</span></div></div>
        <a className="back-link" href="/">← Kembali</a>
        <div className="error-box">
          <h2>Kode tidak ditemukan</h2>
          <p>Kode sudah kedaluwarsa atau tidak valid.</p>
          <br />
          <a className="new-scan-btn" href="/">Scan file baru</a>
        </div>
      </div>
    )
  }

  const { scanResult: result, fileName, expiresAt } = data
  const isSafe = result.isSafe
  const expiresDate = new Date(expiresAt).toLocaleString('id-ID')

  return (
    <div className="container">
      <div className="header"><div className="logo">File<span>Trust</span></div></div>
      <a className="back-link" href="/">← Scan file lain</a>

      <div className="result-box">
        <div className={`result-header ${isSafe ? 'safe' : 'danger'}`}>
          <div className="result-icon">{isSafe ? '✅' : '⚠️'}</div>
          <div>
            <h2>{isSafe ? 'File Aman' : 'File Mencurigakan'}</h2>
            <p>{fileName}</p>
          </div>
        </div>

        <div className="result-body">
          <div className="result-item">
            <span className="label">Status</span>
            <span className={`value ${isSafe ? 'badge-safe' : 'badge-danger'}`}>
              {isSafe ? '✓ Aman untuk didownload' : '✗ Tidak aman — jangan download'}
            </span>
          </div>
          <div className="result-item">
            <span className="label">Script tersembunyi</span>
            <span className={`value ${result.hasEmbeddedJS ? 'badge-danger' : 'badge-safe'}`}>
              {result.hasEmbeddedJS ? 'Ditemukan ⚠️' : 'Tidak ditemukan ✓'}
            </span>
          </div>
          <div className="result-item">
            <span className="label">Link ditemukan</span>
            <span className="value">{result.totalURLs} link</span>
          </div>
          {result.maliciousURLs?.length > 0 && (
            <div className="result-item">
              <span className="label">Link berbahaya</span>
              <div className="value">
                {result.maliciousURLs.map((u, i) => (
                  <div key={i} className="url-item">⚠️ {u.url} — {u.reason}</div>
                ))}
              </div>
            </div>
          )}
          <div className="result-item">
            <span className="label">Kode verifikasi</span>
            <span className="value" style={{ fontFamily: 'monospace', letterSpacing: 2 }}>{code}</span>
          </div>
          <div className="result-item">
            <span className="label">Dipindai oleh</span>
            <span className="value">VirusTotal + Google Safe Browsing</span>
          </div>

          {isSafe ? (
            <a className="download-btn" href={`/api/result/${code}/download`} download>
              ⬇️ Download File — Aman
            </a>
          ) : (
            <div className="download-disabled">Download dinonaktifkan — file berbahaya</div>
          )}
        </div>
      </div>

      <p className="expires-note">🗑️ File otomatis dihapus pada {expiresDate}</p>

      <div className="trust-badges" style={{ marginTop: 20 }}>
        <div className="badge">🔍 VirusTotal</div>
        <div className="badge">🛡️ Google Safe Browsing</div>
        <div className="badge">🚫 Zero iklan</div>
      </div>
    </div>
  )
}
