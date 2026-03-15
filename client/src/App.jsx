import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import ResultPage from './pages/ResultPage'
import ScanPage from './pages/ScanPage'
import CheckLinkPage from './pages/CheckLinkPage'
import PricingPage from './pages/PricingPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import LoginPage from './pages/LoginPage'

function getRoute() {
  const path = window.location.pathname
  const match = path.match(/^\/result\/([A-Z0-9]{4}-[A-Z0-9]{4})$/i)
  if (match) return { page: 'result', code: match[1].toUpperCase() }
  if (path === '/scan') return { page: 'scan' }
  if (path === '/cek-link') return { page: 'cek-link' }
  if (path === '/pricing') return { page: 'pricing' }
  if (path === '/payment/success') return { page: 'payment-success' }
  if (path === '/login') return { page: 'login' }
  return { page: 'home' }
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('ft_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function App() {
  const [route, setRoute] = useState(getRoute)
  const [user, setUser] = useState(getStoredUser)

  useEffect(() => {
    function onPop() { setRoute(getRoute()) }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function handleLogin(userData) {
    setUser(userData)
    window.history.pushState({}, '', '/')
    setRoute({ page: 'home' })
  }

  function handleLogout() {
    localStorage.removeItem('ft_token')
    localStorage.removeItem('ft_user')
    setUser(null)
  }

  if (route.page === 'login') return <LoginPage onLogin={handleLogin} />
  if (route.page === 'result') return <ResultPage code={route.code} user={user} onLogout={handleLogout} />
  if (route.page === 'scan') return <ScanPage user={user} onLogout={handleLogout} />
  if (route.page === 'cek-link') return <CheckLinkPage user={user} onLogout={handleLogout} />
  if (route.page === 'pricing') return <PricingPage user={user} onLogout={handleLogout} />
  if (route.page === 'payment-success') return <PaymentSuccessPage />
  return <HomePage user={user} onLogout={handleLogout} />
}
