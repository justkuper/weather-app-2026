import { useState } from 'react'
import { useWeather, getWmo } from '../../contexts/WeatherContext'
import { format, parseISO } from 'date-fns'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer, Legend
} from 'recharts'
import './HourlyPage.css'

const CHART_TABS = ['Temperature', 'Precipitation', 'Wind']

export default function HourlyPage() {
  const { weather, loading, units } = useWeather()
  const [activeTab, setActiveTab] = useState('Temperature')
  const [dayOffset, setDayOffset] = useState(0)

  if (loading) return <div className="spinner-page"><div className="spinner" /><p>Loading…</p></div>
  if (!weather) return (
    <div className="empty-state page">
      <div className="empty-icon">📈</div>
      <p>No data. Enable location or search a city.</p>
    </div>
  )

  const { hourly } = weather
  const tempSymbol = `°${units.temp}`

  // Group hourly by day (24 entries per day)
  const startIdx = dayOffset * 24
  const dayData = hourly.time.slice(startIdx, startIdx + 24).map((t, i) => ({
    time: format(parseISO(t), 'ha'),
    temperature: Math.round(hourly.temperature_2m[startIdx + i]),
    precipitation: hourly.precipitation_probability[startIdx + i],
    wind: Math.round(hourly.wind_speed_10m[startIdx + i]),
    code: hourly.weather_code[startIdx + i],
  }))

  const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']

  const tempColor = '#0EA5E9'
  const precipColor = '#6366F1'
  const windColor = '#10B981'

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}{p.name === 'Temperature' ? tempSymbol : p.name === 'Precipitation' ? '%' : ` ${units.wind}`}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="page hourly-page">
      <h2 style={{ paddingTop: 20, marginBottom: 16 }}>Hourly</h2>

      {/* Day selector */}
      <div className="filter-pills" style={{ marginBottom: 16 }}>
        {days.map((d, i) => (
          <button
            key={d}
            className={`pill ${dayOffset === i ? 'active' : ''}`}
            onClick={() => setDayOffset(i)}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Chart tabs */}
      <div className="chart-tabs">
        {CHART_TABS.map(tab => (
          <button
            key={tab}
            className={`chart-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'Temperature' ? `🌡️ Temp` : tab === 'Precipitation' ? `🌧️ Precip` : `💨 Wind`}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="chart-container card">
        <ResponsiveContainer width="100%" height={220}>
          {activeTab === 'Temperature' ? (
            <AreaChart data={dayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tempColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={tempColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                tickFormatter={v => `${v}°`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="temperature" name="Temperature"
                stroke={tempColor} strokeWidth={2.5}
                fill="url(#tempGrad)" dot={false} />
            </AreaChart>
          ) : activeTab === 'Precipitation' ? (
            <BarChart data={dayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="precipitation" name="Precipitation"
                fill={precipColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={dayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={windColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={windColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="wind" name="Wind"
                stroke={windColor} strokeWidth={2.5}
                fill="url(#windGrad)" dot={false} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Hourly table */}
      <h3 style={{ marginTop: 20, marginBottom: 12 }}>Hour by Hour</h3>
      <div className="hourly-table">
        {dayData.map((h, i) => {
          const wmo = getWmo(h.code)
          return (
            <div key={i} className="hourly-row card">
              <span className="hourly-row-time">{h.time}</span>
              <span className="hourly-row-emoji">{wmo.emoji}</span>
              <span className="hourly-row-label">{wmo.label}</span>
              <span className="hourly-row-temp">{h.temperature}{tempSymbol}</span>
              <span className="hourly-row-precip">💧{h.precipitation}%</span>
              <span className="hourly-row-wind">💨{h.wind} {units.wind}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
