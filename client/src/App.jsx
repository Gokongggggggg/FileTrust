import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import ResultPage from './pages/ResultPage'
import ScanPage from './pages/ScanPage'
import CheckLinkPage from './pages/CheckLinkPage'
import PricingPage from './pages/PricingPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'

function getRoute() {
  const path = window.location.pathname
  const match = path.match(/^\/result\/([A-Z0-9]{4}-[A-Z0-9]{4})$/i)
  if (match) return { page: 'result', code: match[1].toUpperCase() }
  if (path === '/scan') return { page: 'scan' }
  if (path === '/cek-link') return { page: 'cek-link' }
  if (path === '/pricing') return { page: 'pricing' }
  if (path === '/payment/success') return { page: 'payment-success' }
  return { page: 'home' }
}

export default function App() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    function onPop() { setRoute(getRoute()) }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (route.page === 'result') return <ResultPage code={route.code} />
  if (route.page === 'scan') return <ScanPage />
  if (route.page === 'cek-link') return <CheckLinkPage />
  if (route.page === 'pricing') return <PricingPage />
  if (route.page === 'payment-success') return <PaymentSuccessPage />
  return <HomePage />
}