import { useWeather, getWmo } from '../../contexts/WeatherContext'
import { format, parseISO } from 'date-fns'
import './ForecastPage.css'

export default function ForecastPage() {
  const { weather, loading, units } = useWeather()

  if (loading) return <div className="spinner-page"><div className="spinner" /><p>Loading…</p></div>
  if (!weather) return (
    <div className="empty-state page">
      <div className="empty-icon">📅</div>
      <p>No forecast data. Enable location or search a city.</p>
    </div>
  )

  const { daily } = weather
  const tempSymbol = `°${units.temp}`

  const maxTemp = Math.max(...daily.temperature_2m_max)
  const minTemp = Math.min(...daily.temperature_2m_min)
  const range = maxTemp - minTemp || 1

  return (
    <div className="page forecast-page">
      <h2 style={{ marginBottom: 20, paddingTop: 20 }}>7-Day Forecast</h2>

      <div className="forecast-list">
        {daily.time.map((dateStr, i) => {
          const wmo = getWmo(daily.weather_code[i])
          const hi = Math.round(daily.temperature_2m_max[i])
          const lo = Math.round(daily.temperature_2m_min[i])
          const precip = daily.precipitation_probability_max[i]
          const isToday = i === 0

          // Temp bar positioning
          const barLeft = ((lo - minTemp) / range) * 100
          const barWidth = ((hi - lo) / range) * 100

          return (
            <div key={dateStr} className={`forecast-row card ${isToday ? 'forecast-today' : ''}`}>
              <div className="forecast-day">
                <span className="forecast-day-name">
                  {isToday ? 'Today' : format(parseISO(dateStr), 'EEE')}
                </span>
                <span className="forecast-day-date">
                  {format(parseISO(dateStr), 'MMM d')}
                </span>
              </div>

              <div className="forecast-condition">
                <span className="forecast-emoji">{wmo.emoji}</span>
                {precip > 20 && (
                  <span className="forecast-precip">💧{precip}%</span>
                )}
              </div>

              <div className="forecast-temps">
                <span className="forecast-lo">{lo}{tempSymbol}</span>
                <div className="forecast-bar-track">
                  <div
                    className="forecast-bar-fill"
                    style={{
                      left: `${barLeft}%`,
                      width: `${Math.max(barWidth, 8)}%`,
                      background: hi > 90
                        ? 'linear-gradient(90deg,#F59E0B,#EF4444)'
                        : hi > 70
                        ? 'linear-gradient(90deg,#38BDF8,#F59E0B)'
                        : 'linear-gradient(90deg,#6366F1,#38BDF8)',
                    }}
                  />
                </div>
                <span className="forecast-hi">{hi}{tempSymbol}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sunrise/Sunset strip */}
      <h3 style={{ marginTop: 24, marginBottom: 12 }}>Sunrise & Sunset</h3>
      <div className="sun-list">
        {daily.time.map((dateStr, i) => (
          <div key={dateStr} className="sun-row card">
            <span className="sun-day">
              {i === 0 ? 'Today' : format(parseISO(dateStr), 'EEE d')}
            </span>
            <span className="sun-item">🌅 {format(new Date(daily.sunrise[i]), 'h:mm a')}</span>
            <span className="sun-item">🌇 {format(new Date(daily.sunset[i]), 'h:mm a')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
