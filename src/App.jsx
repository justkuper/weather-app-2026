import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import BottomNav from './components/Layout/BottomNav'
import Sidebar from './components/Layout/Sidebar'

import HomePage from './pages/Home/HomePage'
import ForecastPage from './pages/Forecast/ForecastPage'
import HourlyPage from './pages/Hourly/HourlyPage'
import SettingsPage from './pages/Settings/SettingsPage'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = e => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

const AppRoutes = () => (
  <Routes>
    <Route path="/"         element={<HomePage />} />
    <Route path="/forecast" element={<ForecastPage />} />
    <Route path="/hourly"   element={<HourlyPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="*"         element={<Navigate to="/" replace />} />
  </Routes>
)

function AppLayout() {
  const isDesktop = useIsDesktop()
  const [mobileView, setMobileView] = useState(
    () => localStorage.getItem('wa-mobile-view') === 'true'
  )

  const toggleMobileView = () => {
    setMobileView(v => {
      localStorage.setItem('wa-mobile-view', String(!v))
      return !v
    })
  }

  if (!isDesktop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppRoutes />
        <BottomNav />
      </div>
    )
  }

  return (
    <>
      <Sidebar mobileView={mobileView} onToggleMobileView={toggleMobileView} />
      <div className={`desktop-main${mobileView ? ' mobile-view' : ''}`}>
        <AppRoutes />
      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
