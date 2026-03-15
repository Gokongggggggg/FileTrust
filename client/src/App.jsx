import './App.css'
import HomePage from './pages/HomePage'
import ResultPage from './pages/ResultPage'

export default function App() {
  const path = window.location.pathname
  if (path.startsWith('/result/')) {
    const code = path.split('/result/')[1]?.toUpperCase()
    return <ResultPage code={code} />
  }
  return <HomePage />
}
