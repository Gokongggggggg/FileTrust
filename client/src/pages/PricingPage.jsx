import { useState, useEffect } from 'react'
import Nav from '../Nav'
import './PricingPage.css'

const PLANS = [
  { id: '10credits', name: '10 Scan', price: 15000, credits: 10, popular: false, desc: 'Cocok untuk coba-coba atau kebutuhan sesekali.' },
  { id: '50credits', name: '50 Scan', price: 50000, credits: 50, popular: true, desc: 'Paling hemat untuk pengguna aktif.' },
  { id: '100credits', name: '100 Scan', price: 85000, credits: 100, popular: false, desc: 'Untuk tim atau kebutuhan scan intensif.' },
  { id: 'unlimited', name: 'Unlimited', price: 99000, credits: -1, popular: false, desc: 'Scan tanpa batas selama 30 hari.', monthly: true },
]

function formatRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function PricingPage({ user, onLogout }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(null)
  const [quota, setQuota] = useState(null)

  useEffect(() => {
    const headers = {}
    const token = localStorage.getItem('ft_token')
    if (token) headers['Authorization'] = `Bearer ${token}`
    fetch('/api/quota', { headers }).then(r => r.json()).then(setQuota).catch(() => {})
    if (user?.email) setEmail(user.email)
  }, [])

  async function handleBuy(planId) {
    if (!email.trim()) {
      alert('Masukkan email kamu dulu')
      return
    }
    setLoading(planId)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Redirect to Mayar checkout
      window.location.href = data.paymentUrl
    } catch (err) {
      alert(err.message || 'Gagal membuat pembayaran')
      setLoading(null)
    }
  }

  return (
    <>
      <Nav user={user} onLogout={onLogout} />
      <div className="pr-hero">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-inner">
          <h1>Upgrade Scan Kamu</h1>
          <p>Gratis 3 scan per hari. Butuh lebih? Pilih paket yang sesuai.</p>
        </div>
      </div>

      <div className="pr-wrap">
        <a href="/" className="back-link">← Kembali ke Beranda</a>

        {/* Current quota */}
        {quota && (
          <div className="pr-current">
            <div className="pr-current-label">Kuota kamu saat ini</div>
            <div className="pr-current-value">
              {quota.plan === 'unlimited'
                ? 'Unlimited'
                : quota.plan === 'free'
                  ? `${quota.remaining} / ${quota.dailyLimit} scan gratis hari ini`
                  : `${quota.credits} kredit tersisa`
              }
            </div>
            <div className="pr-current-plan">
              Plan: <strong>{quota.plan === 'free' ? 'Gratis' : quota.plan === 'unlimited' ? 'Unlimited' : 'Kredit'}</strong>
            </div>
          </div>
        )}

        {/* Email input */}
        <div className="pr-email-section">
          <label className="pr-email-label">Email untuk pembayaran</label>
          <input
            type="email"
            className="pr-email-input"
            placeholder="email@kamu.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <p className="pr-email-hint">Kredit akan ditambahkan ke akun dengan email ini setelah pembayaran.</p>
        </div>

        {/* Plan cards */}
        <div className="pr-grid">
          {PLANS.map(plan => (
            <div key={plan.id} className={`pr-card ${plan.popular ? 'pr-card--popular' : ''}`}>
              {plan.popular && <div className="pr-popular-badge">Paling Populer</div>}
              <div className="pr-card-name">{plan.name}</div>
              <div className="pr-card-price">
                <span className="pr-price-amount">{formatRupiah(plan.price)}</span>
                {plan.monthly && <span className="pr-price-period">/bulan</span>}
              </div>
              <p className="pr-card-desc">{plan.desc}</p>
              <ul className="pr-card-features">
                <li>{plan.credits > 0 ? `${plan.credits} scan file & cek link` : 'Scan tanpa batas'}</li>
                <li>72 engine VirusTotal</li>
                <li>Google Safe Browsing</li>
                <li>Hasil detail + laporan</li>
                {plan.credits === -1 && <li>Berlaku 30 hari</li>}
              </ul>
              <button
                className={`pr-card-btn ${plan.popular ? 'pr-card-btn--primary' : ''}`}
                onClick={() => handleBuy(plan.id)}
                disabled={loading === plan.id}
              >
                {loading === plan.id ? 'Memproses...' : 'Beli Sekarang'}
              </button>
            </div>
          ))}
        </div>

        {/* Free tier info */}
        <div className="pr-free-info">
          <h3>Paket Gratis</h3>
          <p>Semua pengguna mendapat <strong>3 scan gratis per hari</strong> — tanpa daftar, tanpa kartu kredit. Upgrade kapanpun kamu butuh lebih.</p>
        </div>

        {/* Payment methods */}
        <div className="pr-payment-methods">
          <h4>Metode Pembayaran</h4>
          <div className="pr-methods-list">
            <span className="pr-method">QRIS</span>
            <span className="pr-method">Bank Transfer</span>
            <span className="pr-method">GoPay</span>
            <span className="pr-method">OVO</span>
            <span className="pr-method">Dana</span>
            <span className="pr-method">ShopeePay</span>
            <span className="pr-method">Kartu Kredit</span>
          </div>
          <p className="pr-powered">Pembayaran diproses oleh <strong>Mayar</strong></p>
        </div>
      </div>
    </>
  )
}
