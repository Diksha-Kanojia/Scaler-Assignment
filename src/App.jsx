import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import AuthCallback from './AuthCallback.jsx'
import Calendar from './Calendar.jsx'
import LandingPage from './landingPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App