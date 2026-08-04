import React, { useState, useEffect } from 'react'
import s from '../VenueDetailPage.module.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function LiveOccupancy({ venueId }) {
  const [occupancy, setOccupancy] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!venueId) return

    const fetchOccupancy = async () => {
      try {
        const res = await fetch(`${API_URL}/api/venues/${venueId}/occupancy`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setOccupancy(data)
        setError(false)
      } catch (err) {
        console.error('Error fetching occupancy:', err)
        setError(true)
      }
    }

    fetchOccupancy()
    const interval = setInterval(fetchOccupancy, 45000)
    return () => clearInterval(interval)
  }, [venueId])

  return (
    <div className={s.liveOccupancyPanel}>
      <h3 className={s.sectionHeader}>
        <span className="material-icons text-primary">sensors</span>
        Live Occupancy
      </h3>
      <div className={s.liveOccupancyBody}>
        {error || !occupancy ? (
          <div className={s.liveOccupancyPlaceholder}>
            <span className="material-icons" style={{ fontSize: '2rem', color: '#d1d5db' }}>sensors</span>
            <p>{error ? "Unable to load live occupancy." : "Loading live occupancy..."}</p>
          </div>
        ) : (
          <div>
            <p style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '8px' }}>
              <span style={{ color: '#ef4444' }}>{occupancy.currentOccupancy}</span> / {occupancy.capacity} seats occupied right now
            </p>
            <p style={{ color: '#22c55e', fontWeight: '600', marginBottom: '16px' }}>{occupancy.available} seats free</p>
            
            {occupancy.upcomingToday && occupancy.upcomingToday.length > 0 && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>Upcoming Today</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {occupancy.upcomingToday.map((booking, i) => (
                    <li key={i} style={{ fontSize: '0.875rem', marginBottom: '4px' }}>
                      <strong>{booking.timeSlot}</strong> &mdash; {booking.attendees} attendees
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
