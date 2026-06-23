import { useState, useCallback } from 'react'
import { useWeather, getWmo, windDir, searchCities } from '../../contexts/WeatherContext'
import { format } from 'date-fns'
import './HomePage.css'

function SearchModal({ onClose }) {
  const { setLocationAndLoad } = useWeather()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  const handleSearch = useCallback(async (q) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    const cities = await searchCities(q)
    setResults(cities)
    setSearching(false)
  }, [])

  const handleSelect = async (city) => {
    onClose()
    await setLocationAndLoad(city.latitude, city.longitude,
      [city.name, city.admin1, city.country_code].filter(Boolean).join(', '))
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" style={{ borderRadius: '28px 28px 0 0', paddingBottom: 40 }}
        onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h3 style={{ marginBottom: 16 }}>Search City</h3>
        <input
          autoFocus
          type="text"
          placeholder="Enter city name…"
          value={query}
          onChange={e => handleSearch(e.target.value)}
        />
        {searching && <div className="spinner" style={{ marginTop: 16 }} />}
        <div className="search-results">
          {results.map(city => (
            <button key={city.id} className="search-result-item" onClick={() => handleSelect(city)}>
              <span className="search-result-flag">{city.country_code ? getFlagEmoji(city.country_code) : '🌍'}</span>
              <div>
                <div className="search-result-name">{city.name}</div>
                <div className="search-result-sub">
                  {[city.admin1, city.country].filter(Boolean).join(', ')}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function getFlagEmoji(countryCode) {
  const codePoints = countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

export default function HomePage() {
  const { weather, location, loading, error, gpsError, requestGps, units } = useWeather()
  const [showSearch, setShowSearch] = useState(false)

  if (loading) {
    return (
      <div className="spinner-page">
        <div className="spinner" />
        <p>Fetching weather…</p>
      </div>
    )
  }

  if (gpsError && !weather) {
    return (
      <div className="spinner-page" style={{ padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📍</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{gpsError}</p>
        <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 24px' }}
          onClick={requestGps}>
          Try Again
        </button>
        <button className="btn btn-secondary" style={{ marginTop: 12, width: 'auto', padding: '12px 24px' }}
          onClick={() => setShowSearch(true)}>
          Search City
        </button>
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
      </div>
    )
  }

  if (error) {
    return (
      <div className="spinner-page" style={{ padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{error}</p>
        <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 24px' }}
          onClick={requestGps}>
          Retry
        </button>
      </div>
    )
  }

  if (!weather) return null

  const curr = weather.current
  const daily = weather.daily
  const hourly = weather.hourly

  const wmo = getWmo(curr.weather_code)
  const now = new Date()

  // Next 24h hourly data
  const currentHourIdx = hourly.time.findIndex(t => new Date(t) > now) - 1
  const next24 = hourly.time
    .slice(currentHourIdx, currentHourIdx + 24)
    .map((t, i) => ({
      time: t,
      temp: hourly.temperature_2m[currentHourIdx + i],
      precip: hourly.precipitation_probability[currentHourIdx + i],
      code: hourly.weather_code[currentHourIdx + i],
    }))

  const tempSymbol = `°${units.temp}`

  return (
    <div className="home-page">
      {/* Hero card */}
      <div className="hero-card" style={{ background: wmo.bg }}>
        {/* Top bar */}
        <div className="hero-topbar">
          <button className="hero-btn" onClick={requestGps} title="Use GPS">📍</button>
          <div className="hero-location">{location?.name ?? '—'}</div>
          <button className="hero-btn" onClick={() => setShowSearch(true)} title="Search">🔍</button>
        </div>

        {/* Date */}
        <p className="hero-date">{format(now, 'EEEE, MMMM d')}</p>

        {/* Big temp */}
        <div className="hero-temp">
          <span className="hero-temp-value">{Math.round(curr.temperature_2m)}</span>
          <span className="hero-temp-unit">{tempSymbol}</span>
        </div>

        {/* Condition */}
        <div className="hero-condition">
          <span className="hero-emoji">{wmo.emoji}</span>
          <span className="hero-label">{wmo.label}</span>
        </div>

        <p className="hero-feels">Feels like {Math.round(curr.apparent_temperature)}{tempSymbol}</p>

        {/* Stats row */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span>💧</span>
            <span>{curr.relative_humidity_2m}%</span>
          </div>
          <div className="hero-stat">
            <span>💨</span>
            <span>{Math.round(curr.wind_speed_10m)} {units.wind}</span>
          </div>
          <div className="hero-stat">
            <span>🌬️</span>
            <span>{windDir(curr.wind_direction_10m)}</span>
          </div>
          <div className="hero-stat">
            <span>☀️</span>
            <span>UV {Math.round(curr.uv_index)}</span>
          </div>
        </div>
      </div>

      <div className="home-content">
        {/* Today's high/low */}
        <div className="today-hl card">
          <div className="today-hl-item">
            <span>🔺</span>
            <span className="today-hl-val today-high">
              {Math.round(daily.temperature_2m_max[0])}{tempSymbol}
            </span>
            <span className="today-hl-label">High</span>
          </div>
          <div className="today-hl-divider" />
          <div className="today-hl-item">
            <span>🔻</span>
            <span className="today-hl-val today-low">
              {Math.round(daily.temperature_2m_min[0])}{tempSymbol}
            </span>
            <span className="today-hl-label">Low</span>
          </div>
          <div className="today-hl-divider" />
          <div className="today-hl-item">
            <span>🌅</span>
            <span className="today-hl-val">
              {format(new Date(daily.sunrise[0]), 'h:mm a')}
            </span>
            <span className="today-hl-label">Sunrise</span>
          </div>
          <div className="today-hl-divider" />
          <div className="today-hl-item">
            <span>🌇</span>
            <span className="today-hl-val">
              {format(new Date(daily.sunset[0]), 'h:mm a')}
            </span>
            <span className="today-hl-label">Sunset</span>
          </div>
        </div>

        {/* Hourly scroll */}
        <div className="section-header">
          <h3>Next 24 Hours</h3>
        </div>
        <div className="hourly-scroll">
          {next24.map((h, i) => {
            const hTime = new Date(h.time)
            const isNow = i === 0
            return (
              <div key={h.time} className={`hourly-card ${isNow ? 'hourly-now' : ''}`}>
                <span className="hourly-time">
                  {isNow ? 'Now' : format(hTime, 'ha')}
                </span>
                <span className="hourly-emoji">{getWmo(h.code).emoji}</span>
                <span className="hourly-temp">{Math.round(h.temp)}{tempSymbol}</span>
                {h.precip > 0 && (
                  <span className="hourly-precip">💧{h.precip}%</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Extra details */}
        <div className="section-header" style={{ marginTop: 8 }}>
          <h3>Details</h3>
        </div>
        <div className="details-grid">
          <div className="detail-card card">
            <span className="detail-icon">💨</span>
            <div className="detail-info">
              <span className="detail-label">Wind Gusts</span>
              <span className="detail-value">{Math.round(curr.wind_gusts_10m)} {units.wind}</span>
            </div>
          </div>
          <div className="detail-card card">
            <span className="detail-icon">👁️</span>
            <div className="detail-info">
              <span className="detail-label">Visibility</span>
              <span className="detail-value">
                {curr.visibility >= 1000
                  ? `${(curr.visibility / 1000).toFixed(1)} km`
                  : `${curr.visibility} m`}
              </span>
            </div>
          </div>
          <div className="detail-card card">
            <span className="detail-icon">🌡️</span>
            <div className="detail-info">
              <span className="detail-label">Pressure</span>
              <span className="detail-value">{Math.round(curr.pressure_msl)} hPa</span>
            </div>
          </div>
          <div className="detail-card card">
            <span className="detail-icon">☁️</span>
            <div className="detail-info">
              <span className="detail-label">Cloud Cover</span>
              <span className="detail-value">{curr.cloud_cover}%</span>
            </div>
          </div>
          <div className="detail-card card">
            <span className="detail-icon">🌧️</span>
            <div className="detail-info">
              <span className="detail-label">Precipitation</span>
              <span className="detail-value">{curr.precipitation} in</span>
            </div>
          </div>
          <div className="detail-card card">
            <span className="detail-icon">🌦️</span>
            <div className="detail-info">
              <span className="detail-label">Rain Chance</span>
              <span className="detail-value">{daily.precipitation_probability_max[0]}%</span>
            </div>
          </div>
        </div>
      </div>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </div>
  )
}
