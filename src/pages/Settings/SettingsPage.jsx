import { useWeather } from '../../contexts/WeatherContext'
import { useTheme } from '../../contexts/ThemeContext'
import './SettingsPage.css'

export default function SettingsPage() {
  const {
    units, toggleTempUnit, toggleWindUnit,
    savedLocations, saveCurrentLocation, removeSavedLocation,
    setLocationAndLoad, location, requestGps,
  } = useWeather()
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="page settings-page">
      <h2 style={{ paddingTop: 20, marginBottom: 24 }}>Settings</h2>

      {/* Units */}
      <div className="settings-section">
        <h3 className="settings-section-title">Units</h3>

        <div className="settings-row card">
          <div className="settings-row-info">
            <span className="settings-row-icon">🌡️</span>
            <div>
              <p className="settings-row-label">Temperature</p>
              <p className="settings-row-sub">Currently showing °{units.temp}</p>
            </div>
          </div>
          <div className="unit-toggle">
            <button
              className={`unit-btn ${units.temp === 'F' ? 'active' : ''}`}
              onClick={() => units.temp !== 'F' && toggleTempUnit()}
            >°F</button>
            <button
              className={`unit-btn ${units.temp === 'C' ? 'active' : ''}`}
              onClick={() => units.temp !== 'C' && toggleTempUnit()}
            >°C</button>
          </div>
        </div>

        <div className="settings-row card">
          <div className="settings-row-info">
            <span className="settings-row-icon">💨</span>
            <div>
              <p className="settings-row-label">Wind Speed</p>
              <p className="settings-row-sub">Currently showing {units.wind}</p>
            </div>
          </div>
          <div className="unit-toggle">
            <button
              className={`unit-btn ${units.wind === 'mph' ? 'active' : ''}`}
              onClick={() => units.wind !== 'mph' && toggleWindUnit()}
            >mph</button>
            <button
              className={`unit-btn ${units.wind === 'km/h' ? 'active' : ''}`}
              onClick={() => units.wind !== 'km/h' && toggleWindUnit()}
            >km/h</button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <h3 className="settings-section-title">Appearance</h3>

        <div className="settings-row card">
          <div className="settings-row-info">
            <span className="settings-row-icon">{isDark ? '🌙' : '☀️'}</span>
            <div>
              <p className="settings-row-label">Theme</p>
              <p className="settings-row-sub">{isDark ? 'Dark mode' : 'Light mode'}</p>
            </div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={isDark} onChange={toggleTheme} />
            <span className="switch-slider" />
          </label>
        </div>
      </div>

      {/* Location */}
      <div className="settings-section">
        <h3 className="settings-section-title">Location</h3>

        <button className="settings-row card settings-action" onClick={requestGps}>
          <span className="settings-row-icon">📍</span>
          <div>
            <p className="settings-row-label">Use My GPS Location</p>
            <p className="settings-row-sub">Auto-detect current location</p>
          </div>
          <span className="settings-row-chevron">→</span>
        </button>

        {location && (
          <button className="settings-row card settings-action" onClick={saveCurrentLocation}>
            <span className="settings-row-icon">🔖</span>
            <div>
              <p className="settings-row-label">Save Current Location</p>
              <p className="settings-row-sub">{location.name}</p>
            </div>
            <span className="settings-row-chevron">+</span>
          </button>
        )}
      </div>

      {/* Saved locations */}
      {savedLocations.length > 0 && (
        <div className="settings-section">
          <h3 className="settings-section-title">Saved Locations</h3>
          {savedLocations.map((loc, i) => (
            <div key={i} className="settings-row card">
              <button
                className="saved-loc-select"
                onClick={() => setLocationAndLoad(loc.lat, loc.lon, loc.name)}
              >
                <span className="settings-row-icon">🏙️</span>
                <div>
                  <p className="settings-row-label">{loc.name}</p>
                  <p className="settings-row-sub">{loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°</p>
                </div>
              </button>
              <button
                className="saved-loc-remove"
                onClick={() => removeSavedLocation(i)}
                title="Remove"
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* About */}
      <div className="settings-section">
        <h3 className="settings-section-title">About</h3>
        <div className="settings-row card">
          <span className="settings-row-icon">🌤️</span>
          <div>
            <p className="settings-row-label">Weather App</p>
            <p className="settings-row-sub">Powered by Open-Meteo · Free & no API key needed</p>
          </div>
        </div>
        <div className="settings-row card">
          <span className="settings-row-icon">📍</span>
          <div>
            <p className="settings-row-label">Geocoding</p>
            <p className="settings-row-sub">Reverse geocoding by Nominatim / OpenStreetMap</p>
          </div>
        </div>
      </div>
    </div>
  )
}
