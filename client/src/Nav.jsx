export default function Nav({ minimal = false }) {
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
        {!minimal && (
          <div className="nav-links">
            <a href="/#cara-kerja" className="nav-link">Cara Kerja</a>
            <a href="/#kenapa" className="nav-link">Keunggulan</a>
            <a href="/#faq" className="nav-link">FAQ</a>
          </div>
        )}
      </div>
      <div className="nav-right">
        <span className="nav-badge">Powered by VirusTotal</span>
      </div>
    </nav>
  )
}