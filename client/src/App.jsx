import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import ResultPage from './pages/ResultPage'

function getRoute() {
  const path = window.location.pathname
  const match = path.match(/^\/result\/([A-Z0-9]{4}-[A-Z0-9]{4})$/i)
  if (match) return { page: 'result', code: match[1].toUpperCase() }
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
  return <HomePage />
}