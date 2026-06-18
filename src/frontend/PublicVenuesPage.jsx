import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './PublicVenuesPage.module.css'
import ksrceLogo from '../assets/collegelogo.jpg'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function PublicVenuesPage() {
  const navigate = useNavigate()
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_URL}/api/venues/public`)
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        const venueList = Array.isArray(data) ? data : (data.venues || [])
        setVenues(venueList.filter(v => v.status === 'active'))
      } catch (err) {
        console.error('Failed to fetch venues:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchVenues()
  }, [])

  const getVenueImage = (venue) => {
    if (venue.bannerImage) return venue.bannerImage
    if (venue.gallery && venue.gallery.length > 0) return venue.gallery[0]
    return '/placeholder-venue.jpg'
  }

  const filteredVenues = venues.filter(v =>
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.headerBrand} to="/">
            <div className={styles.logoWrap}>
              <img alt="KSRCE Logo" className={styles.logo} src={ksrceLogo} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>KSR College of Engineering</span>
              <span className={styles.brandBadge}>Booking Portal</span>
            </div>
          </Link>
          <div className={styles.headerActions}>
            <Link className={styles.backLink} to="/">
              <span className="material-icons">arrow_back</span>
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <section className={styles.heroBanner}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>All Venues</h1>
          <p className={styles.heroSub}>Browse and discover all available spaces for your next event</p>
          <div className={styles.searchWrap}>
            <span className="material-icons" style={{ color: '#9ca3af' }}>search</span>
            <input
              className={styles.searchInput}
              placeholder="Search venues by name, location..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Results count */}
          {!loading && !error && (
            <div className={styles.resultsBar}>
              <p className={styles.resultsCount}>
                Showing <strong>{filteredVenues.length}</strong> {filteredVenues.length === 1 ? 'venue' : 'venues'}
                {searchQuery && <> matching "<em>{searchQuery}</em>"</>}
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className={styles.venuesGrid}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage}></div>
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonText}></div>
                    <div className={styles.skeletonTextShort}></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className={styles.feedbackState}>
              <span className="material-icons" style={{ fontSize: '3rem', color: '#ef4444' }}>error_outline</span>
              <h3>Failed to load venues</h3>
              <p>{error}</p>
              <button className={styles.retryBtn} onClick={() => window.location.reload()}>
                <span className="material-icons" style={{ fontSize: '1rem' }}>refresh</span>
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredVenues.length === 0 && (
            <div className={styles.feedbackState}>
              <span className="material-icons" style={{ fontSize: '3rem', color: '#9ca3af' }}>meeting_room</span>
              <h3>{searchQuery ? 'No matching venues' : 'No venues available'}</h3>
              <p>{searchQuery ? 'Try a different search term.' : 'Check back later for available spaces.'}</p>
              {searchQuery && (
                <button className={styles.retryBtn} onClick={() => setSearchQuery('')}>
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Venue grid */}
          {!loading && !error && filteredVenues.length > 0 && (
            <div className={styles.venuesGrid}>
              {filteredVenues.map(venue => (
                <div className={styles.venueCard} key={venue._id}>
                  <div className={styles.venueImgWrap}>
                    <img
                      alt={venue.name}
                      className={styles.venueImg}
                      src={getVenueImage(venue)}
                      onError={(e) => { e.target.src = '/placeholder-venue.jpg' }}
                    />
                    <div className={styles.badgeAvailable}>Available</div>
                  </div>
                  <div className={styles.venueBody}>
                    <h3 className={styles.venueName}>{venue.name}</h3>
                    {venue.location && (
                      <p className={styles.venueLocation}>
                        <span className="material-icons" style={{ fontSize: '0.875rem' }}>location_on</span>
                        {venue.location}
                      </p>
                    )}
                    <p className={styles.venueDesc}>
                      {venue.description
                        ? venue.description.substring(0, 120) + (venue.description.length > 120 ? '...' : '')
                        : 'Premium venue available for booking.'}
                    </p>
                    <div className={styles.venueAmenities}>
                      {venue.capacity && (
                        <span className={styles.amenityTag}>
                          <span className="material-icons">people</span>
                          {venue.capacity} Seats
                        </span>
                      )}
                      {(venue.amenities?.includes('High-speed Wi-Fi') || (venue.wifiStatus && venue.wifiStatus !== 'None')) && (
                        <span className={styles.amenityTag}>
                          <span className="material-icons">wifi</span>
                          WiFi
                        </span>
                      )}
                      {venue.amenities?.includes('Professional Sound System') && (
                        <span className={styles.amenityTag}>
                          <span className="material-icons">mic</span>
                          Audio
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/venue/${venue._id}`)}
                      className={styles.checkBtn}
                    >
                      Check Availability
                      <span className="material-icons">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2023 KSR College of Engineering. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default PublicVenuesPage
