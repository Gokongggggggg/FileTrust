import { useState, useRef, useEffect } from 'react'
import './HomePage.css'
import Nav from '../Nav'

function HeroParticles() {
  const ref = useRef()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div')
      p.className = 'particle'
      const sz = Math.random() * 3 + 1.5
      p.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;bottom:${Math.random()*30}%;animation-duration:${Math.random()*10+8}s;animation-delay:${Math.random()*10}s;opacity:${Math.random()*0.3+0.1}`
      el.appendChild(p)
    }
  }, [])
  return <div className="particles" ref={ref} />
}

function Hero() {
  return (
    <div className="hero">
      <div className="hero-grid" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />
      <HeroParticles />

      <div className="hero-cards">
        <div className="hcard hcard-1">
          <div className="hcard-icon green">✅</div>
          <div className="hcard-label">
            <strong>laporan_keuangan.pdf</strong>
            <span>Aman · 0 ancaman ditemukan</span>
          </div>
        </div>
        <div className="hcard hcard-2">
          <div className="hcard-icon blue">🔍</div>
          <div className="hcard-label">
            <strong>72 engine antivirus</strong>
            <span>VirusTotal · Memindai...</span>
          </div>
        </div>
        <div className="hcard hcard-3">
          <div className="hcard-icon red">⚠️</div>
          <div className="hcard-label">
            <strong>suspicious-link.com</strong>
            <span>Phishing terdeteksi</span>
          </div>
        </div>
        <div className="hcard hcard-4">
          <div className="hcard-icon green">🔑</div>
          <div className="hcard-label">
            <strong>Kode: ABCD-1234</strong>
            <span>Berlaku 24 jam</span>
          </div>
        </div>
      </div>

      <div className="hero-inner">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Platform keamanan file #1 di Indonesia
        </div>
        <h1>Verifikasi keamanan file,<br /><span>sebelum siapapun ragu.</span></h1>
        <p>Scan PDF atau cek link mencurigakan menggunakan 72 engine antivirus — gratis, instan, tanpa daftar.</p>
        <div className="hero-cta">
          <a href="/scan" className="hero-btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M9 15l2 2 4-4"/>
            </svg>
            Scan File PDF
          </a>
          <a href="/cek-link" className="hero-btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            Cek Link / URL
          </a>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item">
      <button className={`faq-q ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
        {q}
        <svg className="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  )
}

const FAQS = [
  { q: 'Apakah FileTrust benar-benar gratis?', a: 'Ya, FileTrust sepenuhnya gratis. Tidak perlu daftar akun, tidak ada biaya tersembunyi. Kamu bisa scan file dan cek link sebanyak yang kamu butuhkan.' },
  { q: 'Apakah FileTrust bisa membaca isi file saya?', a: 'FileTrust hanya menganalisis file untuk keamanan — bukan membaca kontennya. File dikirim ke VirusTotal untuk dipindai, lalu otomatis dihapus dari server kami setelah 24 jam.' },
  { q: 'Apa itu kode verifikasi dan bagaimana cara kerjanya?', a: 'Setelah scan selesai, kamu mendapat kode unik 8 karakter (contoh: ABCD-1234). Kirim kode ini ke penerima file. Mereka bisa masukkan kode di FileTrust untuk melihat hasil scan dan download file secara langsung.' },
  { q: 'Berapa lama file saya tersimpan di FileTrust?', a: 'File dan hasil scan tersimpan selama 24 jam sejak pertama kali diupload. Setelah itu, semua data dihapus otomatis dan permanen. Kode verifikasi juga otomatis tidak berlaku.' },
  { q: 'Format file apa saja yang didukung?', a: 'Saat ini FileTrust mendukung file PDF dengan ukuran maksimal 20 MB. Dukungan untuk format lain seperti DOCX dan ZIP sedang dalam pengembangan.' },
  { q: 'Apa bedanya scan file vs cek link?', a: 'Scan File PDF memindai keseluruhan file — termasuk script tersembunyi, malware, dan link di dalam PDF — menggunakan 72 engine antivirus VirusTotal. Cek Link memverifikasi apakah sebuah URL aman menggunakan Google Safe Browsing, cocok untuk link yang kamu terima lewat chat atau email.' },
]

export default function HomePage() {
  const [checkCode, setCheckCode] = useState('')

  function goCheck() {
    const c = checkCode.trim().toUpperCase()
    if (c) window.location.href = `/result/${c}`
  }

  return (
    <>
      <Nav />
      <Hero />

      {/* Tool Cards */}
      <div className="tools-wrap">
        <div className="tool-grid">
          <a href="/scan" className="tool-card">
            <div className="tool-icon-wrap blue">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M9 15l2 2 4-4"/>
              </svg>
            </div>
            <h3>Scan File PDF</h3>
            <p>Upload PDF kamu, kami pindai dengan 72 engine antivirus dan berikan kode verifikasi unik yang bisa kamu share ke penerima.</p>
            <span className="tool-cta">Mulai scan
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </a>
          <a href="/cek-link" className="tool-card">
            <div className="tool-icon-wrap teal">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <h3>Cek Link / URL</h3>
            <p>Tempel URL yang mencurigakan, kami cek apakah aman menggunakan VirusTotal dan Google Safe Browsing secara real-time.</p>
            <span className="tool-cta">Cek sekarang
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </a>
        </div>

        {/* Code Check */}
        <div className="code-check-card">
          <div className="code-check-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3>Punya Kode Verifikasi?</h3>
          <p>Masukkan kode 8 karakter dari pengirim file untuk lihat hasil scan dan download dengan aman.</p>
          <div className="code-check-form">
            <input
              type="text"
              className="code-check-input"
              placeholder="XXXX-XXXX"
              value={checkCode}
              onChange={e => setCheckCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && goCheck()}
              maxLength={9}
            />
            <button className="code-check-btn" onClick={goCheck} disabled={!checkCode.trim()}>
              Cek Hasil
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="trust-bar">
        <span className="trust-pill">🔍 VirusTotal</span>
        <span className="trust-pill">🛡️ Google Safe Browsing</span>
        <span className="trust-pill">🗑️ Auto-hapus 24 jam</span>
        <span className="trust-pill">🚫 Zero iklan</span>
        <span className="trust-pill">🔒 Tanpa daftar</span>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-value"><span className="stat-accent">72</span></div>
            <div className="stat-label">Engine Antivirus</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">24<span className="stat-accent">jam</span></div>
            <div className="stat-label">Auto Hapus</div>
          </div>
          <div className="stat-item">
            <div className="stat-value"><span className="stat-accent">0</span></div>
            <div className="stat-label">Data Disimpan</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">100<span className="stat-accent">%</span></div>
            <div className="stat-label">Gratis</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="how-section" id="cara-kerja">
        <div style={{ textAlign: 'center' }}>
          <span className="section-tag">Cara Kerja</span>
        </div>
        <div className="section-title">Simpel, cepat, aman.</div>
        <div className="section-sub">Empat langkah dari upload sampai penerima yakin file aman.</div>
        <div className="steps">
          <div className="step-card">
            <div className="step-num">1</div>
            <span className="step-icon">📤</span>
            <h4>Upload file</h4>
            <p>Upload PDF atau tempel URL yang ingin kamu verifikasi.</p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <span className="step-icon">🔍</span>
            <h4>Scan otomatis</h4>
            <p>Dipindai 72 engine antivirus dan Google Safe Browsing.</p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <span className="step-icon">🔑</span>
            <h4>Dapat kode unik</h4>
            <p>Pengirim dapat kode 8 karakter untuk dibagikan.</p>
          </div>
          <div className="step-card">
            <div className="step-num">4</div>
            <span className="step-icon">✅</span>
            <h4>Cek & download</h4>
            <p>Penerima input kode, lihat scan, dan download aman.</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="features-section" id="kenapa">
        <div style={{ textAlign: 'center' }}>
          <span className="section-tag">Keunggulan</span>
        </div>
        <div className="section-title">Kenapa FileTrust?</div>
        <div className="section-sub">Satu platform untuk buktikan file kamu benar-benar aman.</div>
        <div className="feature-grid">
          {[
            { icon: '🔐', title: 'Anti manipulasi', desc: 'File yang didownload adalah persis file yang sudah dipindai. Tidak bisa di-swap oleh siapapun.' },
            { icon: '⚡', title: 'Hasil instan', desc: 'Scan selesai dalam hitungan detik. Kamu langsung tahu apakah file aman atau berbahaya.' },
            { icon: '🔎', title: '72 engine antivirus', desc: 'Dipindai menggunakan VirusTotal yang menggabungkan 72 engine antivirus terkemuka sekaligus.' },
            { icon: '🗑️', title: 'Privasi terjaga', desc: 'File otomatis dihapus permanen setelah 24 jam. Tidak ada penyimpanan jangka panjang.' },
            { icon: '🔗', title: 'Share via kode', desc: 'Cukup kirim kode 8 karakter ke penerima. Mereka bisa verifikasi dan download langsung.' },
            { icon: '🚫', title: 'Zero iklan & tracking', desc: 'Tidak ada iklan, tidak ada tracker. Fokus pada satu hal: keamanan file kamu.' },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="faq-section" id="faq">
        <div style={{ textAlign: 'center' }}>
          <span className="section-tag">FAQ</span>
        </div>
        <div className="section-title">Pertanyaan Umum</div>
        <div className="section-sub">Hal-hal yang sering ditanyakan tentang FileTrust.</div>
        <div className="faq-list">
          {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="cta-section">
        <div className="cta-banner">
          <h2>Siap verifikasi file kamu?</h2>
          <p>Gratis selamanya. Tidak perlu daftar. Mulai dalam 10 detik.</p>
          <div className="cta-btns">
            <a href="/scan" className="cta-btn-primary">Scan File PDF</a>
            <a href="/cek-link" className="cta-btn-secondary">Cek Link / URL</a>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-brand-name">File<em>Trust</em></div>
            <p>Platform verifikasi keamanan file untuk semua orang. Dipindai oleh VirusTotal dan Google Safe Browsing.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h5>Alat</h5>
              <a href="/scan">Scan File PDF</a>
              <a href="/cek-link">Cek Link / URL</a>
            </div>
            <div className="footer-col">
              <h5>Info</h5>
              <a href="/#cara-kerja">Cara Kerja</a>
              <a href="/#kenapa">Keunggulan</a>
              <a href="/#faq">FAQ</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2026 FileTrust. Dibuat untuk Mayar Vibecoding Competition Ramadan 2026.
        </div>
      </footer>
    </>
  )
}
