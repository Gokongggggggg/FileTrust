import { useState } from 'react'
import Nav from '../Nav'
import './LoginPage.css'

export default function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false)

  async function handleDemoLogin() {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      localStorage.setItem('ft_token', data.token)
      localStorage.setItem('ft_user', JSON.stringify(data.user))

      if (onLogin) onLogin(data.user)
    } catch (err) {
      console.error('[Login] Error:', err.message)
      alert('Login gagal. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <>
      <Nav minimal />
      <div className="login-hero">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-inner">
          <h1>Masuk ke FileTrust</h1>
          <p>Login untuk mendapatkan akses scan tanpa batas.</p>
        </div>
      </div>

      <div className="login-wrap">
        <div className="login-card">
          <div className="login-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2>Akun Demo</h2>
          <p className="login-card-sub">Gunakan akun demo untuk mencoba semua fitur FileTrust dengan kuota unlimited.</p>

          <div className="login-demo-info">
            <div className="login-demo-row">
              <span className="login-demo-label">Email</span>
              <span className="login-demo-value">demo@filetrust.id</span>
            </div>
            <div className="login-demo-row">
              <span className="login-demo-label">Kuota</span>
              <span className="login-demo-value login-demo-unlimited">Unlimited</span>
            </div>
          </div>

          <button className="login-demo-btn" onClick={handleDemoLogin} disabled={loading}>
            {loading ? (
              <>
                <span className="login-btn-spinner" />
                Memproses...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Masuk sebagai Demo
              </>
            )}
          </button>

          <div className="login-features">
            <div className="login-feature">
              <span className="login-feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Scan file PDF tanpa batas
            </div>
            <div className="login-feature">
              <span className="login-feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Cek link tanpa batas
            </div>
            <div className="login-feature">
              <span className="login-feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              72 engine antivirus VirusTotal
            </div>
          </div>

          <a href="/" className="login-skip">Lanjutkan tanpa login →</a>
        </div>
      </div>
    </>
  )
}
