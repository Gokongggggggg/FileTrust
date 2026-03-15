import { useState } from 'react'

export default function Nav({ minimal = false, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="nav">
      <div className="nav-left">
        <a href="/" className="logo">
          <span className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </span>
          <span className="logo-text">File<em>Trust</em></span>
        </a>
        {!minimal && (
          <>
            <div className="nav-links">
              <a href="/#cara-kerja" className="nav-link">Cara Kerja</a>
              <a href="/#kenapa" className="nav-link">Keunggulan</a>
              <a href="/pricing" className="nav-link">Harga</a>
              <a href="/#faq" className="nav-link">FAQ</a>
            </div>
          </>
        )}
      </div>
      <div className="nav-right">
        {!minimal && (
          <div className="nav-tool-links">
            <a href="/scan" className="nav-tool-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Scan PDF
            </a>
            <a href="/cek-link" className="nav-tool-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Cek Link
            </a>
          </div>
        )}

        {/* Auth section */}
        {user ? (
          <div className="nav-user" onClick={() => setMenuOpen(!menuOpen)}>
            {user.picture ? (
              <img src={user.picture} alt="" className="nav-user-avatar" referrerPolicy="no-referrer" />
            ) : (
              <div className="nav-user-avatar nav-user-avatar--placeholder">
                {user.name?.[0] || user.email?.[0] || '?'}
              </div>
            )}
            <span className="nav-user-name">{user.name?.split(' ')[0]}</span>
            {user.is_tester && <span className="nav-tester-badge">TESTER</span>}

            {menuOpen && (
              <div className="nav-dropdown">
                <div className="nav-dropdown-header">
                  <div className="nav-dropdown-name">{user.name}</div>
                  <div className="nav-dropdown-email">{user.email}</div>
                </div>
                <div className="nav-dropdown-divider" />
                <button className="nav-dropdown-item" onClick={(e) => { e.stopPropagation(); onLogout?.(); setMenuOpen(false) }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Keluar
                </button>
              </div>
            )}
          </div>
        ) : (
          <a href="/login" className="nav-login-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Masuk
          </a>
        )}
      </div>
    </nav>
  )
}
