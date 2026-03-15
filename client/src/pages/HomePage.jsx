import { useState, useRef } from 'react'

function Nav() {
  return (
    <nav className="nav">
      <a href="/" className="logo">File<em>Trust</em></a>
      <span className="nav-badge">🔒 Powered by VirusTotal</span>
    </nav>
  )
}

export default function HomePage() {
  const [checkCode, setCheckCode] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [state, setState] = useState('idle') // idle | scanning | done
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
    } catch (e) {
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

  if (state === 'scanning') {
    return (
      <>
        <Nav />
        <div className="page">
          <div className="scanning-screen">
            <div className="spinner" />
            <h2>Sedang memindai file...</h2>
            <p>Mengecek virus, script berbahaya, dan link mencurigakan</p>
          </div>
        </div>
      </>
    )
  }

  if (state === 'done' && result) {
    const isSafe = result.isSafe
    const vtStats = result.checkedURLs?.[0]?.stats
    const totalEngines = 72
    const maliciousCount = result.maliciousURLs?.length ?? 0

    return (
      <>
        <Nav />
        <div className="page upload-result">
          <div className="result-card">
            <div className={`result-banner ${isSafe ? 'safe' : 'danger'}`}>
              <div className="banner-icon">{isSafe ? '✅' : '⚠️'}</div>
              <div className="banner-text">
                <h1>{isSafe ? 'File Ini Aman' : 'File Ini Mencurigakan'}</h1>
                <p>{result.fileName}</p>
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
                <span className="detail-value">{result.totalURLs} link</span>
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
                <span className="detail-label">Diperiksa pukul</span>
                <span className="detail-value">
                  {new Date(result.scannedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} WIB
                </span>
              </div>
            </div>

            <div className="section-divider" />

            <div className="code-badge">
              <div className="code-badge-label">Kode verifikasi</div>
              <div className="code-badge-value">{code}</div>
              <div className="code-badge-sub">Berlaku 24 jam · Share ke penerima file</div>
              <div className="copy-row">
                <button className="copy-btn" onClick={() => copy(code, 'code')}>
                  {copied === 'code' ? '✓ Tersalin' : '📋 Salin kode'}
                </button>
                <button className="copy-btn" onClick={() => copy(`${window.location.origin}/result/${code}`, 'link')}>
                  {copied === 'link' ? '✓ Tersalin' : '🔗 Salin link'}
                </button>
              </div>
            </div>

            {isSafe ? (
              <a className="dl-btn" href={`/api/result/${code}/download`} download>
                ⬇️ Download File
              </a>
            ) : (
              <div className="dl-disabled">❌ Download dinonaktifkan untuk keamanamu</div>
            )}
          </div>

          <div className="trust-strip" style={{ marginTop: 20 }}>
            <span className="trust-item">🔍 VirusTotal</span>
            <span className="trust-item">🛡️ Google Safe Browsing</span>
            <span className="trust-item">🗑️ Auto-hapus 24 jam</span>
            <span className="trust-item">🚫 Zero iklan</span>
          </div>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button className="copy-btn" style={{ fontSize: 14 }} onClick={() => setState('idle')}>
              ← Scan file lain
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className="page">
        {/* Check code */}
        <div className="check-section">
          <div className="check-row">
            <input
              className="check-input"
              placeholder="Masukkan kode · · · ·"
              value={checkCode}
              maxLength={9}
              onChange={e => setCheckCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && goCheck()}
              autoFocus
            />
            <button className="check-btn" onClick={goCheck}>Cek File</button>
          </div>
        </div>

        {/* Upload */}
        <div className="upload-section">
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])} />
            <span className="upload-icon">📄</span>
            <h2>Upload PDF untuk dipindai</h2>
            <p>Drag & drop atau klik di sini · Maks 20MB</p>
          </div>
          <div className="upload-or">atau</div>
          <button className="upload-cta-btn" onClick={() => fileRef.current.click()}>
            Pilih File PDF
          </button>
        </div>

        {/* Passive edu note */}
        <div className="edu-note">
          💡 <strong>Terima file dari seseorang?</strong> Minta dia upload file-nya di sini dulu.
          Kamu bisa download langsung dari FileTrust — file yang kamu download
          dijamin sama persis dengan file yang sudah dipindai.
        </div>

        {/* Trust signals */}
        <div className="trust-strip">
          <span className="trust-item">🔍 VirusTotal</span>
          <span className="trust-item">🛡️ Google Safe Browsing</span>
          <span className="trust-item">🗑️ Auto-hapus 24 jam</span>
          <span className="trust-item">🚫 Zero iklan</span>
        </div>

        {/* Info section */}
        <div className="info-section">
          <h3>Kenapa FileTrust?</h3>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-card-icon">🔐</div>
              <h4>Tidak bisa dimanipulasi</h4>
              <p>File yang kamu download adalah file yang sama persis yang sudah dipindai. Tidak ada celah untuk swap.</p>
            </div>
            <div className="info-card">
              <div className="info-card-icon">⚡</div>
              <h4>Hasil instan</h4>
              <p>Scan selesai dalam hitungan detik. Langsung tahu aman atau tidak sebelum download.</p>
            </div>
            <div className="info-card">
              <div className="info-card-icon">🔎</div>
              <h4>72 engine antivirus</h4>
              <p>Dipindai menggunakan VirusTotal yang menggunakan 72 engine antivirus sekaligus.</p>
            </div>
            <div className="info-card">
              <div className="info-card-icon">🗑️</div>
              <h4>Privasi terjaga</h4>
              <p>File otomatis dihapus setelah 24 jam. Kami tidak menyimpan dokumenmu selamanya.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
