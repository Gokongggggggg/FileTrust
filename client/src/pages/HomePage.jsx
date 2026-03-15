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

      {/* ══ HERO ══ */}
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

          {/* Code check inline */}
          <div className="hero-code-check">
            <span className="hero-code-label">Punya kode verifikasi?</span>
            <div className="hero-code-form">
              <input
                type="text"
                className="hero-code-input"
                placeholder="XXXX-XXXX"
                value={checkCode}
                onChange={e => setCheckCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && goCheck()}
                maxLength={9}
              />
              <button className="hero-code-btn" onClick={goCheck} disabled={!checkCode.trim()}>
                Cek
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ TRUST BAR ══ */}
      <div className="trust-bar">
        <span className="trust-pill">🔍 72 Engine Antivirus</span>
        <span className="trust-pill">🛡️ Google Safe Browsing</span>
        <span className="trust-pill">⚠️ Deteksi Malware & Phishing</span>
        <span className="trust-pill">📄 Analisis PDF Mendalam</span>
      </div>

      {/* ══ PROBLEM STATEMENT ══ */}
      <div className="problem-section">
        <div className="problem-grid">
          <div className="problem-text">
            <span className="section-tag">Masalahnya</span>
            <h2>File digital bisa membawa ancaman tersembunyi.</h2>
            <p>
              Setiap hari, jutaan file PDF beredar lewat WhatsApp, email, dan chat.
              Di balik dokumen yang tampak biasa, bisa tersembunyi <strong>malware</strong>, <strong>phishing link</strong>, atau <strong>script berbahaya</strong> yang mencuri data pribadimu.
            </p>
            <p>
              Masalahnya? Kamu tidak bisa tahu hanya dengan membuka file-nya.
              Dan sekali dibuka, sudah terlambat.
            </p>
          </div>
          <div className="problem-stats">
            <div className="problem-stat">
              <div className="problem-stat-value">3.4<span>miliar</span></div>
              <div className="problem-stat-label">Email phishing dikirim setiap hari secara global</div>
            </div>
            <div className="problem-stat">
              <div className="problem-stat-value">92<span>%</span></div>
              <div className="problem-stat-label">Malware dikirim melalui file attachment</div>
            </div>
            <div className="problem-stat">
              <div className="problem-stat-value">1 dari 4</div>
              <div className="problem-stat-label">PDF yang beredar mengandung link mencurigakan</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ SOLUTION ══ */}
      <div className="solution-section">
        <div className="solution-inner">
          <span className="section-tag">Solusinya</span>
          <h2>FileTrust hadir untuk menghilangkan keraguan.</h2>
          <p>
            Kami membangun FileTrust agar siapapun — seller online, karyawan kantor, mahasiswa — bisa
            memverifikasi keamanan file <strong>sebelum</strong> mengirim atau membukanya.
            Cukup upload, scan, dan bagikan kode verifikasi ke penerima.
          </p>
          <div className="solution-cards">
            <div className="solution-card">
              <div className="solution-card-icon">📤</div>
              <h4>Untuk pengirim</h4>
              <p>Upload PDF, dapatkan hasil scan dan kode unik. Kirim kode ke penerima sebagai bukti file-mu aman.</p>
            </div>
            <div className="solution-card">
              <div className="solution-card-icon">📥</div>
              <h4>Untuk penerima</h4>
              <p>Masukkan kode verifikasi, lihat detail scan, dan download file yang sudah diverifikasi aman.</p>
            </div>
            <div className="solution-card">
              <div className="solution-card-icon">🔗</div>
              <h4>Cek link mencurigakan</h4>
              <p>Dapat link aneh dari chat? Tempel di sini, kami cek pakai VirusTotal dan Google Safe Browsing.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ HOW IT WORKS ══ */}
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

      {/* ══ VIRUSTOTAL SECTION ══ */}
      <div className="vt-section" id="teknologi">
        <div className="vt-inner">
          <div className="vt-content">
            <span className="section-tag">Teknologi di Balik FileTrust</span>
            <h2>Dipindai oleh VirusTotal — standar industri keamanan siber.</h2>
            <p>
              VirusTotal adalah platform milik <strong>Google</strong> yang digunakan oleh perusahaan keamanan
              dan pemerintah di seluruh dunia. Setiap file yang kamu upload dipindai secara paralel oleh
              <strong> 72 engine antivirus</strong> sekaligus — termasuk Kaspersky, McAfee, Avast, Bitdefender,
              dan puluhan lainnya.
            </p>
            <p>
              Selain itu, setiap URL di dalam PDF juga dicek menggunakan <strong>Google Safe Browsing</strong> —
              sistem yang sama yang melindungi miliaran pengguna Chrome dari situs phishing dan malware.
            </p>
          </div>
          <div className="vt-stats">
            <div className="vt-stat-grid">
              <div className="vt-stat">
                <div className="vt-stat-value">72</div>
                <div className="vt-stat-label">Engine Antivirus</div>
              </div>
              <div className="vt-stat">
                <div className="vt-stat-value">1<span>juta+</span></div>
                <div className="vt-stat-label">File discan per hari di VirusTotal</div>
              </div>
              <div className="vt-stat">
                <div className="vt-stat-value">Google</div>
                <div className="vt-stat-label">Safe Browsing untuk cek URL</div>
              </div>
              <div className="vt-stat">
                <div className="vt-stat-value">Real-time</div>
                <div className="vt-stat-label">Database ancaman terupdate</div>
              </div>
            </div>
            <div className="vt-engines">
              <span className="vt-engine">Kaspersky</span>
              <span className="vt-engine">McAfee</span>
              <span className="vt-engine">Avast</span>
              <span className="vt-engine">Bitdefender</span>
              <span className="vt-engine">ESET</span>
              <span className="vt-engine">Sophos</span>
              <span className="vt-engine">Malwarebytes</span>
              <span className="vt-engine">+65 lainnya</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ FEATURES ══ */}
      <div className="features-section" id="kenapa">
        <div style={{ textAlign: 'center' }}>
          <span className="section-tag">Keunggulan</span>
        </div>
        <div className="section-title">Kenapa FileTrust?</div>
        <div className="section-sub">Satu platform untuk buktikan file kamu benar-benar aman.</div>
        <div className="feature-grid">
          {[
            { icon: '🔗', title: 'Share via kode verifikasi', desc: 'Pengirim upload file, dapat kode unik 8 karakter. Penerima masukkan kode untuk lihat hasil scan dan download — tanpa perlu kirim file lewat chat yang bisa dipalsukan.', highlight: true },
            { icon: '🛡️', title: 'Download langsung dari FileTrust', desc: 'Penerima download file langsung dari web FileTrust — bukan dari chat atau email. File yang didownload dijamin persis file yang sudah lolos scan. Tidak bisa ditukar atau dimanipulasi.', highlight: true },
            { icon: '🚫', title: 'File berbahaya tidak bisa dibagikan', desc: 'Kalau file terdeteksi malware atau phishing, file TIDAK disimpan dan TIDAK mendapat kode. Hanya file yang lolos 72 engine antivirus yang bisa dibagikan.' },
            { icon: '🦠', title: 'Deteksi malware', desc: 'Mendeteksi trojan, ransomware, spyware, dan jenis malware lainnya yang tersembunyi di dalam file PDF.' },
            { icon: '🎣', title: 'Anti-phishing', desc: 'Semua URL di dalam PDF dicek — link login palsu, redirect berbahaya, dan situs penipuan langsung terdeteksi.' },
            { icon: '📊', title: 'Laporan detail', desc: 'Lihat engine mana yang mendeteksi ancaman, jenis ancaman apa, dan skor keamanan keseluruhan file.' },
          ].map(f => (
            <div key={f.title} className={`feature-card ${f.highlight ? 'feature-card--highlight' : ''}`}>
              <div className="feature-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ FAQ ══ */}
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

      {/* ══ CTA ══ */}
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
