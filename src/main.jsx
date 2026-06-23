import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/global.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { WeatherProvider } from './contexts/WeatherContext'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <WeatherProvider>
        <App />
      </WeatherProvider>
    </ThemeProvider>
  </React.StrictMode>
)
