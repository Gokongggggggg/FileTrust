import { useState } from 'react'
import Nav from '../Nav'
import './CheckLinkPage.css'

export default function CheckLinkPage() {
  const [url, setUrl] = useState('')
  const [state, setState] = useState('idle')
  const [result, setResult] = useState(null)

  async function handleCheck(e) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return

    setState('checking')
    try {
      const res = await fetch('/api/check-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setState('done')
    } catch (err) {
      alert(err.message || 'Gagal memeriksa URL. Coba lagi.')
      setState('idle')
    }
  }

  // ── CHECKING ──
  if (state === 'checking') return (
    <>
      <Nav />
      <div className="cl-hero">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-inner">
          <h1>Memeriksa URL...</h1>
          <p>Mengecek keamanan link menggunakan VirusTotal & Google Safe Browsing</p>
        </div>
      </div>
      <div className="cl-wrap">
        <div className="scanning-screen">
          <div className="spinner" />
          <h2>Memeriksa keamanan URL</h2>
          <p>{url}</p>
        </div>
      </div>
    </>
  )

  // ── DONE ──
  if (state === 'done' && result) {
    const isSafe = result.isSafe
    return (
      <>
        <Nav />
        <div className={`cl-hero cl-hero--short ${isSafe ? 'cl-hero--safe' : 'cl-hero--danger'}`}>
          <div className="hero-grid" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-inner">
            <div className="cl-status-badge">
              {isSafe ? '✅ URL Aman' : '⚠️ URL Berbahaya'}
            </div>
            <h1>{isSafe ? 'Link ini aman' : 'Link ini berbahaya!'}</h1>
            <p>{isSafe
              ? 'URL sudah diverifikasi aman oleh VirusTotal dan Google Safe Browsing.'
              : 'Jangan klik atau bagikan link ini ke siapapun.'
            }</p>
          </div>
        </div>
        <div className="cl-wrap">
          <a href="/cek-link" className="back-link" onClick={e => { e.preventDefault(); setState('idle'); setResult(null); setUrl('') }}>← Cek link lain</a>

          <div className="result-card">
            <div className={`result-banner ${isSafe ? 'safe' : 'danger'}`}>
              <div className="banner-icon">{isSafe ? '✅' : '⚠️'}</div>
              <div className="banner-text">
                <h1>{isSafe ? 'URL Ini Aman' : 'URL Ini Berbahaya'}</h1>
                <p><span className="file-badge">URL</span> Hasil pemeriksaan link</p>
              </div>
            </div>

            <div className="result-details">
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`detail-value ${isSafe ? 'status-safe' : 'status-danger'}`}>
                  {isSafe ? '✓ Aman untuk dikunjungi' : '✗ Tidak aman — jangan kunjungi'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">URL diperiksa</span>
                <span className="detail-value cl-url-value">{result.url}</span>
              </div>
              {result.shortened && (
                <div className="detail-row">
                  <span className="detail-label">URL tujuan akhir</span>
                  <span className="detail-value cl-url-value">{result.finalUrl}</span>
                </div>
              )}
              {result.shortened && (
                <div className="detail-row">
                  <span className="detail-label">Shortened link</span>
                  <span className="detail-value status-danger">⚠️ URL ini menggunakan redirect</span>
                </div>
              )}
              {!isSafe && result.reason && (
                <div className="detail-row">
                  <span className="detail-label">Alasan</span>
                  <span className="detail-value status-danger">⚠️ {result.reason}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Waktu pemeriksaan</span>
                <span className="detail-value">
                  {new Date(result.checkedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} WIB
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Diperiksa oleh</span>
                <span className="detail-value">VirusTotal + Google Safe Browsing</span>
              </div>
            </div>
          </div>

          <div className="trust-bar" style={{ marginTop: 20, padding: 0 }}>
            <span className="trust-pill">🔍 VirusTotal</span>
            <span className="trust-pill">🛡️ Google Safe Browsing</span>
          </div>
        </div>
      </>
    )
  }

  // ── IDLE ──
  return (
    <>
      <Nav />
      <div className="cl-hero">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-inner">
          <h1>Cek Keamanan Link</h1>
          <p>Tempel URL yang mencurigakan untuk diperiksa secara real-time menggunakan VirusTotal dan Google Safe Browsing.</p>
        </div>
      </div>

      <div className="cl-wrap">
        <a href="/" className="back-link">← Kembali ke Beranda</a>

        <form className="cl-form" onSubmit={handleCheck}>
          <div className="cl-input-wrap">
            <svg className="cl-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <input
              type="text"
              className="cl-input"
              placeholder="Tempel URL di sini, contoh: https://example.com/suspicious-link"
              value={url}
              onChange={e => setUrl(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="cl-submit" disabled={!url.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Periksa URL
          </button>
        </form>

        <div className="cl-info-cards">
          <div className="cl-info-card">
            <div className="cl-info-icon">🔍</div>
            <h4>VirusTotal</h4>
            <p>Diperiksa menggunakan database 72 engine antivirus secara real-time.</p>
          </div>
          <div className="cl-info-card">
            <div className="cl-info-icon">🛡️</div>
            <h4>Google Safe Browsing</h4>
            <p>Dicek terhadap daftar situs phishing, malware, dan software berbahaya dari Google.</p>
          </div>
          <div className="cl-info-card">
            <div className="cl-info-icon">🔗</div>
            <h4>Deteksi Redirect</h4>
            <p>Shortened URL otomatis di-unshorten untuk mengungkap tujuan sebenarnya.</p>
          </div>
        </div>

        <div className="cl-examples">
          <h4>Contoh URL yang bisa kamu cek:</h4>
          <div className="cl-example-list">
            <button className="cl-example" onClick={() => setUrl('https://google.com')}>google.com</button>
            <button className="cl-example" onClick={() => setUrl('https://bit.ly/test123')}>bit.ly/test123</button>
            <button className="cl-example" onClick={() => setUrl('https://github.com')}>github.com</button>
          </div>
        </div>
      </div>
    </>
  )
}
