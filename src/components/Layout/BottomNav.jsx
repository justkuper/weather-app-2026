import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const navItems = [
  { to: '/',         icon: '🌡️', label: 'Now'      },
  { to: '/forecast', icon: '📅', label: 'Forecast'  },
  { to: '/hourly',   icon: '📈', label: 'Hourly'    },
  { to: '/settings', icon: '⚙️', label: 'Settings'  },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
