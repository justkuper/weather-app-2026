import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const WeatherContext = createContext()

// WMO Weather Code → { label, emoji, bg }
export const WMO_CODES = {
  0:  { label: 'Clear Sky',       emoji: '☀️',  bg: 'linear-gradient(160deg,#1E90FF,#87CEEB)' },
  1:  { label: 'Mainly Clear',    emoji: '🌤️', bg: 'linear-gradient(160deg,#2196F3,#87CEEB)' },
  2:  { label: 'Partly Cloudy',   emoji: '⛅',  bg: 'linear-gradient(160deg,#5C8DD6,#A8C5E8)' },
  3:  { label: 'Overcast',        emoji: '☁️',  bg: 'linear-gradient(160deg,#607D8B,#90A4AE)' },
  45: { label: 'Foggy',           emoji: '🌫️', bg: 'linear-gradient(160deg,#78909C,#B0BEC5)' },
  48: { label: 'Icy Fog',         emoji: '🌫️', bg: 'linear-gradient(160deg,#78909C,#B0BEC5)' },
  51: { label: 'Light Drizzle',   emoji: '🌦️', bg: 'linear-gradient(160deg,#3A7BD5,#6AABDB)' },
  53: { label: 'Drizzle',         emoji: '🌦️', bg: 'linear-gradient(160deg,#3A7BD5,#6AABDB)' },
  55: { label: 'Heavy Drizzle',   emoji: '🌦️', bg: 'linear-gradient(160deg,#2C5F8A,#4A8FB8)' },
  61: { label: 'Light Rain',      emoji: '🌧️', bg: 'linear-gradient(160deg,#1565C0,#42A5F5)' },
  63: { label: 'Rain',            emoji: '🌧️', bg: 'linear-gradient(160deg,#0D47A1,#1976D2)' },
  65: { label: 'Heavy Rain',      emoji: '🌧️', bg: 'linear-gradient(160deg,#0D47A1,#1565C0)' },
  71: { label: 'Light Snow',      emoji: '🌨️', bg: 'linear-gradient(160deg,#4FC3F7,#B3E5FC)' },
  73: { label: 'Snow',            emoji: '❄️',  bg: 'linear-gradient(160deg,#29B6F6,#81D4FA)' },
  75: { label: 'Heavy Snow',      emoji: '❄️',  bg: 'linear-gradient(160deg,#0288D1,#4FC3F7)' },
  77: { label: 'Snow Grains',     emoji: '🌨️', bg: 'linear-gradient(160deg,#4FC3F7,#B3E5FC)' },
  80: { label: 'Light Showers',   emoji: '🌦️', bg: 'linear-gradient(160deg,#1976D2,#42A5F5)' },
  81: { label: 'Showers',         emoji: '🌧️', bg: 'linear-gradient(160deg,#1565C0,#1976D2)' },
  82: { label: 'Heavy Showers',   emoji: '⛈️',  bg: 'linear-gradient(160deg,#0D47A1,#1565C0)' },
  85: { label: 'Snow Showers',    emoji: '🌨️', bg: 'linear-gradient(160deg,#29B6F6,#81D4FA)' },
  86: { label: 'Heavy Snow Showers', emoji: '❄️', bg: 'linear-gradient(160deg,#0288D1,#4FC3F7)' },
  95: { label: 'Thunderstorm',    emoji: '⛈️',  bg: 'linear-gradient(160deg,#1A237E,#283593)' },
  96: { label: 'Thunderstorm w/ Hail', emoji: '⛈️', bg: 'linear-gradient(160deg,#1A237E,#283593)' },
  99: { label: 'Thunderstorm w/ Hail', emoji: '⛈️', bg: 'linear-gradient(160deg,#1A237E,#283593)' },
}

export function getWmo(code) {
  return WMO_CODES[code] ?? { label: 'Unknown', emoji: '🌡️', bg: 'linear-gradient(160deg,#607D8B,#90A4AE)' }
}

// Wind direction degrees → compass
export function windDir(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW']
  return dirs[Math.round(deg / 45) % 8]
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      'Your Location'
    )
  } catch {
    return 'Your Location'
  }
}

async function fetchWeather(lat, lon, units) {
  const tempUnit = units.temp === 'F' ? 'fahrenheit' : 'celsius'
  const windUnit = units.wind === 'mph' ? 'mph' : 'kmh'

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m','relative_humidity_2m','apparent_temperature',
      'precipitation','weather_code','cloud_cover',
      'wind_speed_10m','wind_direction_10m','wind_gusts_10m',
      'uv_index','visibility','pressure_msl'
    ].join(','),
    hourly: [
      'temperature_2m','precipitation_probability','weather_code','wind_speed_10m'
    ].join(','),
    daily: [
      'weather_code','temperature_2m_max','temperature_2m_min',
      'sunrise','sunset','precipitation_probability_max',
      'precipitation_sum','uv_index_max','wind_speed_10m_max'
    ].join(','),
    temperature_unit: tempUnit,
    wind_speed_unit: windUnit,
    precipitation_unit: 'inch',
    timezone: 'auto',
    forecast_days: '7',
    past_days: '0',
  })

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error('Weather fetch failed')
  return res.json()
}

export async function searchCities(query) {
  if (!query.trim()) return []
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
    )
    const data = await res.json()
    return data.results ?? []
  } catch {
    return []
  }
}

export function WeatherProvider({ children }) {
  const [location, setLocation] = useState(null)    // { lat, lon, name }
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gpsError, setGpsError] = useState(null)
  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem('wa-units')
    return saved ? JSON.parse(saved) : { temp: 'F', wind: 'mph' }
  })
  const [savedLocations, setSavedLocations] = useState(() => {
    const saved = localStorage.getItem('wa-saved-locations')
    return saved ? JSON.parse(saved) : []
  })

  // Persist units
  useEffect(() => {
    localStorage.setItem('wa-units', JSON.stringify(units))
  }, [units])

  // Persist saved locations
  useEffect(() => {
    localStorage.setItem('wa-saved-locations', JSON.stringify(savedLocations))
  }, [savedLocations])

  const loadWeather = useCallback(async (lat, lon, name) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeather(lat, lon, units)
      const locationName = name ?? await reverseGeocode(lat, lon)
      setLocation({ lat, lon, name: locationName })
      setWeather(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [units])

  // Refresh when units change (if we already have a location)
  useEffect(() => {
    if (location) {
      loadWeather(location.lat, location.lon, location.name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units])

  const requestGps = useCallback(() => {
    setGpsError(null)
    setLoading(true)
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords
        await loadWeather(latitude, longitude, null)
      },
      err => {
        setGpsError(
          err.code === 1
            ? 'Location permission denied. Please allow location access or search for a city.'
            : 'Unable to retrieve your location. Please search for a city.'
        )
        setLoading(false)
      },
      { timeout: 10000 }
    )
  }, [loadWeather])

  // Auto-request GPS on first load
  useEffect(() => {
    requestGps()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLocationAndLoad = useCallback(async (lat, lon, name) => {
    await loadWeather(lat, lon, name)
  }, [loadWeather])

  const saveCurrentLocation = useCallback(() => {
    if (!location) return
    setSavedLocations(prev => {
      const exists = prev.some(l => l.lat === location.lat && l.lon === location.lon)
      if (exists) return prev
      return [...prev, location]
    })
  }, [location])

  const removeSavedLocation = useCallback((idx) => {
    setSavedLocations(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const toggleTempUnit = () => setUnits(u => ({ ...u, temp: u.temp === 'F' ? 'C' : 'F' }))
  const toggleWindUnit = () => setUnits(u => ({ ...u, wind: u.wind === 'mph' ? 'km/h' : 'mph' }))

  return (
    <WeatherContext.Provider value={{
      location, weather, loading, error, gpsError, units,
      savedLocations,
      requestGps, setLocationAndLoad,
      saveCurrentLocation, removeSavedLocation,
      toggleTempUnit, toggleWindUnit,
    }}>
      {children}
    </WeatherContext.Provider>
  )
}

export const useWeather = () => useContext(WeatherContext)
