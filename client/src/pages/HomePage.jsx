import { useState, useRef } from 'react'

function Nav() {
  return (
    <nav className="nav">
      <div className="nav-left">
        <a href="/" className="logo">
          <span className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </span>
          File<em>Trust</em>
        </a>
        <div className="nav-links">
          <a href="#cara-kerja" className="nav-link">Cara Kerja</a>
          <a href="#kenapa" className="nav-link">Keunggulan</a>
        </div>
      </div>
      <div className="nav-right">
        <span className="nav-badge">Powered by VirusTotal</span>
      </div>
    </nav>
  )
}

export default function HomePage() {
  const [checkCode, setCheckCode] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [state, setState] = useState('idle')
  const [result, setResult] = useState(null)
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState('')
  const fileRef = useRef()

  function goCheck() {
    const c = checkCode.trim().toUpperCase()
    if (c) window.location.href = `/result/${c}`
  }

  async function handleFile(file) {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Hanya file PDF yang diterima')
      return
    }
    setState('scanning')
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result)
      setCode(data.code)
      setState('done')
    } catch {
      alert('Gagal scan file. Coba lagi.')
      setState('idle')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  // ── SCANNING ──
  if (state === 'scanning') {
    return (
      <>
        <Nav />
        <div className="hero-section">
          <div className="hero-inner"><h1>Memindai file kamu...</h1></div>
        </div>
        <div className="tools-section">
          <div className="scanning-screen">
            <div className="spinner" />
            <h2>Mengecek keamanan file</h2>
            <p>Memindai virus, script berbahaya, dan link mencurigakan</p>
          </div>
        </div>
      </>
    )
  }

  // ── DONE ──
  if (state === 'done' && result) {
    const isSafe = result.isSafe
    return (
      <>
        <Nav />
        <div className="hero-section" style={{ paddingBottom: 72 }}>
          <div className="hero-inner">
            <h1>{isSafe ? 'File kamu aman!' : 'File ini mencurigakan'}</h1>
            <p>{isSafe ? 'Bagikan kode di bawah ke penerima file.' : 'Jangan kirim file ini ke siapapun.'}</p>
          </div>
        </div>
        <div className="tools-section">
          <div className="result-card">
            <div className={`result-banner ${isSafe ? 'safe' : 'danger'}`}>
              <div className="banner-icon">{isSafe ? '✅' : '⚠️'}</div>
              <div className="banner-text">
                <h1>{isSafe ? 'File Ini Aman' : 'File Ini Mencurigakan'}</h1>
                <p><span className="file-badge">PDF</span> {result.fileName}</p>
              </div>
            </div>

            <div className="result-details">
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`detail-value ${isSafe ? 'status-safe' : 'status-danger'}`}>
                  {isSafe ? '✓ Aman untuk didownload' : '✗ Tidak aman — jangan download'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Script tersembunyi</span>
                <span className={`detail-value ${result.hasEmbeddedJS ? 'status-danger' : 'status-safe'}`}>
                  {result.hasEmbeddedJS ? '⚠️ Ditemukan' : '✓ Tidak ditemukan'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Link diperiksa</span>
                <span className="detail-value">{result.totalURLs} link ditemukan</span>
              </div>
              {!isSafe && result.maliciousURLs?.length > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Link berbahaya</span>
                  <div className="detail-value">
                    {result.maliciousURLs.map((u, i) => (
                      <div key={i} className="url-danger">⚠️ {u.url} — {u.reason}</div>
                    ))}
                  </div>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Waktu scan</span>
                <span className="detail-value">
                  {new Date(result.scannedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} WIB
                </span>
              </div>
            </div>

            <div className="section-divider" />

            <div className="code-badge">
              <div className="code-badge-label">Kode Verifikasi</div>
              <div className="code-badge-value">{code}</div>
              <div className="code-badge-sub">Berlaku 24 jam — kirim kode ini ke penerima file</div>
              <div className="copy-row">
                <button className={`copy-btn ${copied === 'code' ? 'copied' : ''}`} onClick={() => copy(code, 'code')}>
                  {copied === 'code' ? '✓ Tersalin' : '📋 Salin kode'}
                </button>
                <button className={`copy-btn ${copied === 'link' ? 'copied' : ''}`} onClick={() => copy(`${window.location.origin}/result/${code}`, 'link')}>
                  {copied === 'link' ? '✓ Tersalin' : '🔗 Salin link'}
                </button>
              </div>
            </div>

            {isSafe ? (
              <a className="dl-btn" href={`/api/result/${code}/download`} download>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download File
              </a>
            ) : (
              <div className="dl-disabled">Download dinonaktifkan untuk keamananmu</div>
            )}
          </div>

          <div className="trust-bar" style={{ marginTop: 20, padding: 0 }}>
            <span className="trust-pill">🔍 VirusTotal</span>
            <span className="trust-pill">🛡️ Safe Browsing</span>
            <span className="trust-pill">🗑️ Auto-hapus 24 jam</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button className="scan-another" onClick={() => { setState('idle'); setResult(null); setCode('') }}>
              ← Scan file lain
            </button>
          </div>
        </div>
      </>
    )
  }

  // ── IDLE (Landing) ──
  return (
    <>
      <Nav />

      {/* Hero */}
      <div className="hero-section">
        <div className="hero-inner">
          <h1>Verifikasi keamanan file,<br />sebelum siapapun ragu.</h1>
          <p>Upload PDF, dapatkan kode unik. Penerima bisa cek keamanan dan download file langsung dari sini.</p>
        </div>
      </div>

      {/* Tool Cards (overlap hero) */}
      <div className="tools-section">
        {/* Check code */}
        <div className="tool-card">
          <div className="check-card-inner">
            <div className="check-label">
              <span className="check-label-icon">🔑</span>
              Punya kode verifikasi? Cek keamanan file di sini.
            </div>
            <div className="check-row">
              <input
                className="check-input"
                placeholder="XXXX-XXXX"
                value={checkCode}
                maxLength={9}
                onChange={e => setCheckCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && goCheck()}
              />
              <button className="check-btn" onClick={goCheck}>Cek File</button>
            </div>
            <div className="check-hint">
              Kode diberikan oleh pengirim file setelah mereka upload di FileTrust.
            </div>
          </div>
        </div>

        {/* Upload */}
        <div className="tool-card">
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])} />
            <div className="upload-icon-wrap">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <h2>Upload PDF untuk dipindai</h2>
            <p>Drag & drop atau klik di sini — maks 20 MB</p>
          </div>
          <div className="upload-divider"><span>atau</span></div>
          <button className="upload-btn" onClick={() => fileRef.current.click()}>
            Pilih File PDF
          </button>
        </div>
      </div>

      {/* Trust bar */}
      <div className="trust-bar">
        <span className="trust-pill">🔍 VirusTotal</span>
        <span className="trust-pill">🛡️ Google Safe Browsing</span>
        <span className="trust-pill">🗑️ Auto-hapus 24 jam</span>
        <span className="trust-pill">🚫 Zero iklan</span>
      </div>

      {/* How it works */}
      <div className="how-section" id="cara-kerja">
        <h3>Cara Kerja</h3>
        <div className="steps">
          <div className="step-card">
            <div className="step-num">1</div>
            <span className="step-icon">📤</span>
            <h4>Upload file</h4>
            <p>Pengirim upload PDF ke FileTrust.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-num">2</div>
            <span className="step-icon">🔍</span>
            <h4>Scan otomatis</h4>
            <p>File dipindai 72 engine antivirus.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-num">3</div>
            <span className="step-icon">🔑</span>
            <h4>Dapat kode</h4>
            <p>Pengirim share kode ke penerima.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-num">4</div>
            <span className="step-icon">✅</span>
            <h4>Cek & download</h4>
            <p>Penerima input kode, lihat hasil, download aman.</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="features-section" id="kenapa">
        <h3>Kenapa FileTrust?</h3>
        <p>Satu platform untuk buktikan file kamu aman.</p>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h4>Anti manipulasi</h4>
            <p>File yang didownload = file yang dipindai. Tidak bisa di-swap.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Hasil instan</h4>
            <p>Scan selesai dalam detik. Langsung tahu aman atau tidak.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔎</div>
            <h4>72 engine antivirus</h4>
            <p>Dipindai VirusTotal dengan 72 engine antivirus sekaligus.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗑️</div>
            <h4>Privasi terjaga</h4>
            <p>File otomatis dihapus setelah 24 jam. Zero penyimpanan permanen.</p>
          </div>
        </div>
      </div>

      <footer className="footer">
        FileTrust — Verifikasi keamanan file untuk semua orang.
      </footer>
    </>
  )
}
