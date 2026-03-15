import { useState, useRef } from 'react'
import Nav from '../Nav'
import './ScanPage.css'

export default function ScanPage() {
  const [dragOver, setDragOver] = useState(false)
  const [state, setState] = useState('idle')
  const [result, setResult] = useState(null)
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState('')
  const fileRef = useRef()

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
  if (state === 'scanning') return (
    <>
      <Nav />
      <div className="sp-hero">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-inner">
          <h1>Memindai file kamu...</h1>
          <p>Mengecek virus, script tersembunyi, dan link mencurigakan</p>
        </div>
      </div>
      <div className="sp-wrap">
        <div className="scanning-screen">
          <div className="spinner" />
          <h2>Mengecek keamanan file</h2>
          <p>Memindai dengan 72 engine antivirus VirusTotal</p>
        </div>
      </div>
    </>
  )

  // ── DONE ──
  if (state === 'done' && result) {
    const isSafe = result.isSafe
    const vtFailed = result.vtFailed
    const vt = result.virusTotal
    const vtStats = vt?.stats || {}
    const vtDetections = vt?.detections || []
    const totalEngines = vt?.totalEngines || 0
    const maliciousCount = (vtStats.malicious || 0) + (vtStats.suspicious || 0)

    // 3 states: safe, danger, warning (VT failed)
    const heroClass = isSafe ? 'sp-hero--safe' : 'sp-hero--danger'
    const statusLabel = isSafe
      ? '✅ File Aman'
      : vtFailed
        ? '⚠️ Tidak Dapat Diverifikasi'
        : '⚠️ File Mencurigakan'

    return (
      <>
        <Nav />
        <div className={`sp-hero sp-hero--short ${heroClass}`}>
          <div className="hero-grid" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-inner">
            <div className="sp-status-badge">{statusLabel}</div>
            <h1>{isSafe
              ? 'File kamu aman!'
              : vtFailed
                ? 'Scan gagal — file tidak bisa diverifikasi'
                : 'File ini mencurigakan'
            }</h1>
            <p>{isSafe
              ? totalEngines > 0
                ? `Tidak ada ancaman terdeteksi dari ${totalEngines} engine antivirus.`
                : 'Bagikan kode di bawah ke penerima file.'
              : vtFailed
                ? 'VirusTotal tidak bisa memproses file ini. File dianggap tidak aman sampai bisa diverifikasi.'
                : totalEngines > 0
                  ? `${maliciousCount} dari ${totalEngines} engine mendeteksi ancaman.`
                  : 'Jangan kirim file ini ke siapapun.'
            }</p>
          </div>
        </div>
        <div className="sp-wrap">
          <a href="/scan" className="back-link" onClick={e => { e.preventDefault(); setState('idle'); setResult(null); setCode('') }}>← Scan file lain</a>
          <div className="result-card">
            <div className={`result-banner ${isSafe ? 'safe' : 'danger'}`}>
              <div className="banner-icon">{isSafe ? '✅' : '⚠️'}</div>
              <div className="banner-text">
                <h1>{isSafe ? 'File Ini Aman' : 'File Ini Mencurigakan'}</h1>
                <p><span className="file-badge">PDF</span> {result.fileName}</p>
              </div>
            </div>

            {/* VT Score Badge */}
            {totalEngines > 0 && (
              <div className="cl-vt-score">
                <div className={`cl-vt-score-circle ${maliciousCount > 0 ? 'danger' : 'safe'}`}>
                  <span className="cl-vt-score-num">{maliciousCount}</span>
                  <span className="cl-vt-score-sep">/</span>
                  <span className="cl-vt-score-total">{totalEngines}</span>
                </div>
                <div className="cl-vt-score-label">
                  {maliciousCount > 0
                    ? `${maliciousCount} engine mendeteksi ancaman pada file ini`
                    : 'Tidak ada engine yang mendeteksi ancaman'
                  }
                </div>
              </div>
            )}

            {/* VT Stats Breakdown */}
            {totalEngines > 0 && (
              <div className="cl-vt-stats">
                <div className="cl-vt-stat-item danger">
                  <span className="cl-vt-stat-num">{vtStats.malicious || 0}</span>
                  <span className="cl-vt-stat-label">Malicious</span>
                </div>
                <div className="cl-vt-stat-item warning">
                  <span className="cl-vt-stat-num">{vtStats.suspicious || 0}</span>
                  <span className="cl-vt-stat-label">Suspicious</span>
                </div>
                <div className="cl-vt-stat-item safe">
                  <span className="cl-vt-stat-num">{vtStats.harmless || 0}</span>
                  <span className="cl-vt-stat-label">Harmless</span>
                </div>
                <div className="cl-vt-stat-item neutral">
                  <span className="cl-vt-stat-num">{vtStats.undetected || 0}</span>
                  <span className="cl-vt-stat-label">Undetected</span>
                </div>
              </div>
            )}

            {/* Detection list if dangerous */}
            {vtDetections.length > 0 && (
              <div className="cl-detections">
                <h3>Engine yang mendeteksi ancaman:</h3>
                <div className="cl-detection-list">
                  {vtDetections.map(d => (
                    <div key={d.engine} className="cl-detection-item">
                      <span className="cl-detection-engine">{d.engine}</span>
                      <span className={`cl-detection-badge ${d.category}`}>
                        {d.result || d.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="result-details">
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`detail-value ${isSafe ? 'status-safe' : 'status-danger'}`}>
                  {isSafe ? '✓ Aman untuk didownload' : '✗ Tidak aman — jangan download'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">VirusTotal</span>
                <span className={`detail-value ${vtFailed ? 'status-danger' : maliciousCount > 0 ? 'status-danger' : 'status-safe'}`}>
                  {vtFailed
                    ? '✗ Scan gagal — tidak bisa memverifikasi file'
                    : maliciousCount > 0
                      ? `✗ ${maliciousCount} dari ${totalEngines} engine mendeteksi ancaman`
                      : `✓ ${totalEngines} engine — tidak ada ancaman`
                  }
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Script tersembunyi</span>
                <span className={`detail-value ${result.hasEmbeddedJS ? 'status-danger' : 'status-safe'}`}>
                  {result.hasEmbeddedJS ? '⚠️ Ditemukan' : '✓ Tidak ditemukan'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Link di dalam PDF</span>
                <span className="detail-value">
                  {result.totalURLs} link ditemukan
                  {result.maliciousURLs?.length > 0 && ` — ${result.maliciousURLs.length} berbahaya`}
                </span>
              </div>
              {result.maliciousURLs?.length > 0 && (
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
              {vt?.permalink && (
                <div className="detail-row">
                  <span className="detail-label">Lihat di VirusTotal</span>
                  <span className="detail-value">
                    <a href={vt.permalink} target="_blank" rel="noopener noreferrer" className="cl-vt-link">
                      Buka laporan lengkap →
                    </a>
                  </span>
                </div>
              )}
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
        </div>
      </>
    )
  }

  // ── IDLE ──
  return (
    <>
      <Nav />
      <div className="sp-hero">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-inner">
          <h1>Scan File PDF</h1>
          <p>Upload PDF kamu untuk dipindai dengan 72 engine antivirus VirusTotal dan Google Safe Browsing.</p>
        </div>
      </div>

      <div className="sp-wrap">
        <a href="/" className="back-link">← Kembali ke Beranda</a>

        <div
          className={`sp-dropzone ${dragOver ? 'dragover' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            hidden
            onChange={e => handleFile(e.target.files[0])}
          />
          <div className="sp-dropzone-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M12 18v-6"/>
              <path d="M9 15l3-3 3 3"/>
            </svg>
          </div>
          <h3>Drag & drop PDF di sini</h3>
          <p>atau klik untuk pilih file</p>
          <span className="sp-dropzone-hint">Maks. 20 MB · Hanya file PDF</span>
        </div>

        <div className="sp-info-cards">
          <div className="sp-info-card">
            <div className="sp-info-icon">🔍</div>
            <h4>72 Engine Antivirus</h4>
            <p>Dipindai oleh VirusTotal yang menggabungkan 72 engine antivirus terkemuka.</p>
          </div>
          <div className="sp-info-card">
            <div className="sp-info-icon">📜</div>
            <h4>Deteksi Script</h4>
            <p>Mendeteksi JavaScript tersembunyi dan macro berbahaya di dalam PDF.</p>
          </div>
          <div className="sp-info-card">
            <div className="sp-info-icon">🔗</div>
            <h4>Periksa Link</h4>
            <p>Semua link di dalam PDF dicek terhadap database phishing & malware.</p>
          </div>
        </div>
      </div>
    </>
  )
}
