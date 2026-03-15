import Nav from '../Nav'

export default function PaymentSuccessPage() {
  return (
    <>
      <Nav />
      <div className="sp-hero sp-hero--safe">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-inner">
          <h1>Pembayaran Berhasil!</h1>
          <p>Kredit scan kamu sudah ditambahkan. Terima kasih!</p>
        </div>
      </div>
      <div className="sp-wrap" style={{ textAlign: 'center', paddingTop: 20 }}>
        <div className="result-card" style={{ padding: '48px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>Terima kasih!</h2>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 32px' }}>
            Pembayaran kamu sudah kami terima. Kredit scan sudah otomatis ditambahkan ke akun email kamu.
            Kamu bisa langsung mulai scan sekarang.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/scan" className="hero-btn-primary" style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: '#fff' }}>
              Scan File PDF
            </a>
            <a href="/cek-link" className="hero-btn-secondary" style={{ color: '#1e293b', borderColor: '#e2e8f0' }}>
              Cek Link / URL
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
