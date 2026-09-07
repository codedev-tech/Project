import { useEffect, useState } from 'react'
import { getGpsReadingStatus } from '../utils/gpsReading'
import './GpsReadingAge.css'

export default function GpsReadingAge({ recordedAt }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const { label, delayed } = getGpsReadingStatus(recordedAt, now)
  return <small className={`gps-reading-age${delayed ? ' gps-reading-age--delayed' : ''}`}>{label}</small>
}
