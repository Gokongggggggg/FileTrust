import { useState, useRef } from 'react'

export default function UploadPage() {
  const [state, setState] = useState('idle') // idle | scanning | done | error
  const [result, setResult] = useState(null)
  const [code, setCode] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [copied, setCopied] = useState(false)
  const [checkCode, setCheckCode] = useState('')
  const fileRef = useRef()

  async function handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      alert('Hanya file PDF yang diizinkan')
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
    } catch (err) {
      console.error(err)
      setState('error')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/result/${code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function goCheck() {
    if (checkCode.trim()) {
      window.location.href = `/result/${checkCode.trim().toUpperCase()}`
    }
  }

  if (state === 'scanning') {
    return (
      <div className="container">
        <div className="header">
          <div className="logo">File<span>Trust</span></div>
        </div>
        <div className="scanning">
          <div className="spinner" />
          <h2>Sedang memindai file...</h2>
          <p>Mengecek virus, malware, dan link berbahaya</p>
        </div>
      </div>
    )
  }

  if (state === 'done' && result) {
    const isSafe = result.isSafe
    return (
      <div className="container">
        <div className="header">
          <div className="logo">File<span>Trust</span></div>
        </div>

        <div className="result-box">
          <div className={`result-header ${isSafe ? 'safe' : 'danger'}`}>
            <div className="result-icon">{isSafe ? '✅' : '⚠️'}</div>
            <div>
              <h2>{isSafe ? 'File Aman' : 'File Mencurigakan'}</h2>
              <p>{result.fileName}</p>
            </div>
          </div>

          <div className="result-body">
            <div className="result-item">
              <span className="label">Status</span>
              <span className={`value ${isSafe ? 'badge-safe' : 'badge-danger'}`}>
                {isSafe ? '✓ Aman untuk didownload' : '✗ Tidak aman'}
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
              <span className="label">Dipindai oleh</span>
              <span className="value">VirusTotal + Google Safe Browsing</span>
            </div>

            <div className="code-section">
              <div className="code-label">Kode untuk buyer</div>
              <div className="code-value">{code}</div>
              <div className="code-hint">Berlaku 24 jam · Share ke buyer</div>
              <button className="copy-btn" onClick={copyCode}>
                {copied ? '✓ Tersalin!' : 'Salin kode'}
              </button>
              <br />
              <button className="copy-btn" style={{ marginTop: 8 }} onClick={copyLink}>
                {copied ? '✓ Tersalin!' : '🔗 Salin link hasil scan'}
              </button>
            </div>

            {isSafe ? (
              <a className="download-btn" href={`/api/result/${code}/download`} download>
                ⬇️ Download File
              </a>
            ) : (
              <div className="download-disabled">Download dinonaktifkan — file berbahaya</div>
            )}
          </div>
        </div>

        <div className="trust-badges">
          <div className="badge">🔍 VirusTotal</div>
          <div className="badge">🛡️ Google Safe Browsing</div>
          <div className="badge">🗑️ Auto-hapus 24 jam</div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button className="upload-btn" onClick={() => setState('idle')}>
            Scan file lain
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <div className="logo">File<span>Trust</span></div>
        <p className="tagline">Buktikan file kamu aman — sebelum buyer ragu</p>
      </div>

      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div className="upload-icon">📄</div>
        <h2>Upload PDF kamu</h2>
        <p>Drag & drop atau klik untuk pilih file</p>
        <button className="upload-btn" onClick={(e) => { e.stopPropagation(); fileRef.current.click() }}>
          Pilih PDF
        </button>
      </div>

      <div className="check-section">
        <h3>🔍 Punya kode dari seller?</h3>
        <div className="code-input-row">
          <input
            className="code-input"
            placeholder="XXXX-XXXX"
            value={checkCode}
            onChange={(e) => setCheckCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && goCheck()}
            maxLength={9}
          />
          <button className="check-btn" onClick={goCheck}>Cek</button>
        </div>
      </div>

      <div className="trust-badges">
        <div className="badge">🔍 VirusTotal</div>
        <div className="badge">🛡️ Google Safe Browsing</div>
        <div className="badge">🗑️ Auto-hapus 24 jam</div>
        <div className="badge">🚫 Zero iklan</div>
      </div>
    </div>
  )
}
