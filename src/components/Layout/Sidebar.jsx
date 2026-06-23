import { NavLink } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useWeather } from '../../contexts/WeatherContext'
import './Sidebar.css'

const navItems = [
  { to: '/',         icon: '🌡️', label: 'Now'      },
  { to: '/forecast', icon: '📅', label: 'Forecast'  },
  { to: '/hourly',   icon: '📈', label: 'Hourly'    },
  { to: '/settings', icon: '⚙️', label: 'Settings'  },
]

export default function Sidebar({ mobileView, onToggleMobileView }) {
  const { isDark, toggleTheme } = useTheme()
  const { location, units } = useWeather()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">⛅</span>
        <span className="sidebar-logo-text">Weather</span>
      </div>

      {/* Location */}
      {location && (
        <div className="sidebar-location">
          <span className="sidebar-location-pin">📍</span>
          <span className="sidebar-location-name">{location.name}</span>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Controls */}
      <div className="sidebar-controls">
        <button
          className={`sidebar-control-btn ${mobileView ? 'active' : ''}`}
          onClick={onToggleMobileView}
          title={mobileView ? 'Desktop view' : 'Mobile view'}
        >
          <span>📱</span>
          <span>{mobileView ? 'Desktop view' : 'Mobile view'}</span>
        </button>

        <button className="sidebar-control-btn" onClick={toggleTheme}>
          <span>{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>

      {/* Units badge */}
      <div className="sidebar-units">
        <span>°{units.temp}</span>
        <span className="sidebar-units-sep">·</span>
        <span>{units.wind}</span>
      </div>
    </aside>
  )
}
