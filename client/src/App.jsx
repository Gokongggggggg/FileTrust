import UploadPage from './pages/UploadPage'
import ResultPage from './pages/ResultPage'
import './App.css'

export default function App() {
  const path = window.location.pathname

  if (path.startsWith('/result/')) {
    const code = path.split('/result/')[1]
    return <ResultPage code={code} />
  }

  return <UploadPage />
}
