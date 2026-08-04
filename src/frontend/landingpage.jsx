import styles from './landingpage.module.css'
import ksrceLogo from '../assets/collegelogo.jpg'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeNav, setActiveNav] = useState('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const scrollLockRef = useRef(null)

  // Live venue data from API
  const [venues, setVenues] = useState([])
  const [venuesLoading, setVenuesLoading] = useState(true)
  const [venuesError, setVenuesError] = useState(null)
  const [stats, setStats] = useState({ venuesCount: 15, monthlyBookings: 500, approvalTime: '24h', digitalProcess: '100%' })
  // Carousel pause state: true when mouse hovers or finger touches the strip
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)

  useEffect(() => {
    const fetchVenuesAndStats = async () => {
      try {
        setVenuesLoading(true)
        setVenuesError(null)

        const [venuesRes, statsRes] = await Promise.all([
          fetch(`${API_URL}/api/venues/public`),
          fetch(`${API_URL}/api/venues/public-stats`).catch(() => null)
        ])

        if (!venuesRes.ok) {
          throw new Error(`HTTP error! status: ${venuesRes.status}`)
        }

        const data = await venuesRes.json()
        console.log('Venues API response:', data)

        // Handle both response formats: {venues: [...]} or [...]
        const venueList = Array.isArray(data) ? data : (data.venues || [])

        // Keep all active venues for the carousel
        setVenues(venueList.filter(v => v.status === 'active'))

        if (statsRes && statsRes.ok) {
          const statsData = await statsRes.json()
          setStats({
            venuesCount: statsData.venuesCount || 0,
            monthlyBookings: statsData.monthlyBookings || 0,
            approvalTime: statsData.approvalTime || '24h',
            digitalProcess: statsData.digitalProcess || '100%'
          })
        }
      } catch (err) {
        console.error('Failed to fetch venues:', err)
        setVenuesError(err.message)
      } finally {
        setVenuesLoading(false)
      }
    }

    fetchVenuesAndStats()
  }, [])

  const navigateToSection = (sectionId) => {
    setActiveNav(sectionId)
    clearTimeout(scrollLockRef.current)
    scrollLockRef.current = setTimeout(() => {
      scrollLockRef.current = null
    }, 1000)

    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Scroll to section when navigating from another page + sync active nav
  useEffect(() => {
    const scrollTo = location.state?.scrollTo
    if (scrollTo === 'hero') {
      clearTimeout(scrollLockRef.current)
      scrollLockRef.current = setTimeout(() => {
        scrollLockRef.current = null
        setActiveNav('home')
      }, 1000)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (scrollTo) {
      clearTimeout(scrollLockRef.current)
      scrollLockRef.current = setTimeout(() => {
        scrollLockRef.current = null
        setActiveNav(scrollTo)
      }, 1000)
      const el = document.getElementById(scrollTo)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.state])

  // Update active nav based on scroll position
  useEffect(() => {
    const sectionIds = ['how-it-works', 'venues', 'contact']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !scrollLockRef.current) setActiveNav(entry.target.id)
        })
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: 0.05 }
    )
    // Observe the top of the page to reset to 'home'
    const heroObserver = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && !scrollLockRef.current) setActiveNav('home') },
      { rootMargin: '0px 0px -80% 0px' }
    )
    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    const heroEl = document.querySelector('section')
    if (heroEl) heroObserver.observe(heroEl)
    return () => { observer.disconnect(); heroObserver.disconnect() }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])



  return (
    <div lang="en">
      {/* Announcement Bar */}
      <div className={styles.announcementBar}>
        <div className={styles.announcementInner}>
          <span className="material-icons">campaign</span>
          <p>
            New: AICTE Idea Lab now open for booking!
            <a className={styles.announcementLink} href="#">Learn more</a>
          </p>
        </div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerRow}>
            <div className={styles.headerBrand}>
              <div className={styles.headerLogoWrap}>
                <img alt="KSRCE Logo" className={styles.headerLogo} src={ksrceLogo} />
              </div>
              <div className={styles.headerBrandText}>
                <span className={styles.brandName}>KSR College of Engineering</span>
                <span className={styles.brandBadge}>Booking Portal</span>
              </div>
            </div>

            <nav className={styles.nav}>
              <a
                className={activeNav === 'home' ? styles.navLinkActive : styles.navLink}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  navigateToSection('home')
                }}
              >
                Home
              </a>
              <a
                className={activeNav === 'how-it-works' ? styles.navLinkActive : styles.navLink}
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault()
                  navigateToSection('how-it-works')
                }}
              >
                How to Book
              </a>
              <a
                className={activeNav === 'venues' ? styles.navLinkActive : styles.navLink}
                href="#venues"
                onClick={(e) => {
                  e.preventDefault()
                  navigateToSection('venues')
                }}
              >
                Venues
              </a>
              <a
                className={activeNav === 'contact' ? styles.navLinkActive : styles.navLink}
                href="#contact"
                onClick={(e) => {
                  e.preventDefault()
                  navigateToSection('contact')
                }}
              >
                Contact
              </a>
            </nav>

            <div className={styles.headerRight}>
              <Link className={styles.adminBtn} to="/login">
                <span className="material-icons">lock</span>
                Admin Login
              </Link>
              <button
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
                className={styles.menuBtn}
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                type="button"
              >
                <span className="material-icons">{isMobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <nav className={styles.mobileNav}>
              <a
                className={activeNav === 'home' ? styles.mobileNavLinkActive : styles.mobileNavLink}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  navigateToSection('home')
                  setIsMobileMenuOpen(false)
                }}
              >
                Home
              </a>
              <a
                className={activeNav === 'how-it-works' ? styles.mobileNavLinkActive : styles.mobileNavLink}
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault()
                  navigateToSection('how-it-works')
                  setIsMobileMenuOpen(false)
                }}
              >
                How to Book
              </a>
              <a
                className={activeNav === 'venues' ? styles.mobileNavLinkActive : styles.mobileNavLink}
                href="#venues"
                onClick={(e) => {
                  e.preventDefault()
                  navigateToSection('venues')
                  setIsMobileMenuOpen(false)
                }}
              >
                Venues
              </a>
              <a
                className={activeNav === 'contact' ? styles.mobileNavLinkActive : styles.mobileNavLink}
                href="#contact"
                onClick={(e) => {
                  e.preventDefault()
                  navigateToSection('contact')
                  setIsMobileMenuOpen(false)
                }}
              >
                Contact
              </a>
              <Link className={styles.mobileAdminBtn} onClick={() => setIsMobileMenuOpen(false)} to="/login">
                <span className="material-icons">lock</span>
                Admin Login
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBg}>
          <div className={styles.heroBgGrid} />
          <div className={styles.heroGlow1} />
          <div className={styles.heroGlow2} />
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroLayout}>
            <div className={styles.heroLeft}>
              <div className={styles.heroTitleGroup}>
                <h1 className={styles.heroTitle}>
                  Venue &amp; Lab <br />
                  <span className={styles.heroAccent}>Booking Portal</span>
                </h1>

                <div className={styles.heroFeatures}>
                  <div className={styles.heroFeature}>
                    <span className={styles.featureTick}>✓</span> AICTE Approved
                  </div>
                  <div className={styles.heroFeature}>
                    <span className={styles.featureTick}>✓</span> 24/7 Access
                  </div>
                  <div className={styles.heroFeature}>
                    <span className={styles.featureTick}>✓</span> Instant Confirmation
                  </div>
                </div>
              </div>

              <div
                className={styles.searchBar}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <div className={styles.searchField}>
                  <div className={styles.searchIconWrap}>
                    <span className="material-icons">search</span>
                  </div>
                  <input
                    className={styles.searchInput}
                    placeholder="Search venues, labs, halls..."
                    type="text"
                  />
                </div>
                <button className={styles.searchSubmit} type="button">
                  <span className="material-icons">arrow_forward</span>
                </button>
              </div>

              <div className={styles.popularRow}>
                <span className={styles.popularLabel}>Popular:</span>
                <a className={styles.popularTag} href="#" onClick={(e) => { e.preventDefault(); navigate('/venue/aicte-idea-lab') }}>AICTE Idea Lab</a>
                <a className={styles.popularTag} href="#" onClick={(e) => { e.preventDefault(); navigate('/venue/platinum-hall') }}>Platinum Hall</a>
                <a className={styles.popularTag} href="#" onClick={(e) => { e.preventDefault(); navigate('/venue/seminar-hall-a') }}>Seminar Hall A</a>
              </div>
            </div>

            <div className={styles.heroRight}>
              <div className={styles.heroVisual}>
                <div className={styles.mockupFloat}>
                  <div className={styles.mockupCard}>
                    <div className={styles.mockupTitleBar}>
                      <div className={styles.mockupDotRed} />
                      <div className={styles.mockupDotYellow} />
                      <div className={styles.mockupDotGreen} />
                    </div>
                    <div className={styles.mockupBody}>
                      <div className={styles.mockupImgArea}>
                        <span className="material-icons">apartment</span>
                        <div className={styles.mockupImgOverlay} />
                      </div>
                      <div className={styles.mockupTextLine} />
                      <div className={styles.mockupTextLineSm} />
                      <div className={styles.mockupCalGrid}>
                        <div className={styles.mockupCell} />
                        <div className={styles.mockupCellActive}>
                          <div className={styles.mockupActiveDot} />
                        </div>
                        <div className={styles.mockupCell} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.confirmBadge}>
                  <div className={styles.confirmIconWrap}>
                    <span className="material-icons">check</span>
                  </div>
                  <div className={styles.confirmText}>
                    <p className={styles.confirmTitle}>Lab Booking Confirmed</p>
                    <p className={styles.confirmSub}>Room 302 • 10:00 AM</p>
                  </div>
                </div>

                <div className={styles.calendarWidget}>
                  <div className={styles.heroBookingWidget}>
                    <p className={styles.heroBookingLabel}>OCTOBER</p>
                    <div className={styles.heroBookingDates}>
                      <span className={styles.heroBookingDate}>12</span>
                      <span className={`${styles.heroBookingDate} ${styles.heroBookingDateActive}`}>13</span>
                      <span className={`${styles.heroBookingDate} ${styles.heroBookingDateAvailable}`}>14</span>
                      <span className={styles.heroBookingDate}>15</span>
                      <span className={styles.heroBookingDate}>16</span>
                    </div>
                  </div>
                </div>

                <div className={styles.previewThumbnail}>
                  <img
                    alt="Preview"
                    className={styles.previewImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvAHJJEwa7KoT2DEx2GgxWNy2DFj7UOe0qW7lOjfLi6BhumzALFJVdoqbBG0Rm4bGCxJPbTsz8vxDxf0LBlOTnEZWmF1F-wIyvk2vKhTk79hVomkcbbVoPEcUR2q3y0TCYIKKGVtg9uxrHR-gNCv9QjF-l8HFuB9g_oE3MBF2diCzvqOqUrP9w9k1NyWMlu1K5H6Mxf3h-vavtV3gTo8NGFjbcDzFsJZ5yLntU0Ausp9BFthl5B-VNoeKkTzGYIcGpqPWLaat4W8U"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statsInner}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <p className={`${styles.statValue} ${styles.statOrange}`}>{stats.venuesCount}+</p>
              <p className={styles.statLabel}>Available Venues</p>
            </div>
            <div className={styles.statItem}>
              <p className={styles.statValue}>{stats.monthlyBookings}+</p>
              <p className={styles.statLabel}>Monthly Bookings</p>
            </div>
            <div className={styles.statItem}>
              <p className={`${styles.statValue} ${styles.statOrange}`}>{stats.approvalTime}</p>
              <p className={styles.statLabel}>Approval Time</p>
            </div>
            <div className={styles.statItem}>
              <p className={styles.statValue}>{stats.digitalProcess}</p>
              <p className={styles.statLabel}>Digital Process</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className={styles.howSection} id="how-it-works">
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionLabel}>Workflow</h2>
            <h3 className={styles.sectionTitle}>How to Book ?</h3>
            <div className={styles.sectionDivider} />
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepCardBg} />
              <div className={styles.stepCardContent}>
                <div className={styles.stepIconWrap}>
                  <span className={`material-icons ${styles.stepIcon}`}>email</span>
                </div>
                <div className={styles.stepNum}>01</div>
                <h4 className={styles.stepTitle}>Send Request</h4>
                <p className={styles.stepDesc}>Initiate your booking by sending a formal request through the portal.</p>
              </div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepCardBg} />
              <div className={styles.stepCardContent}>
                <div className={styles.stepIconWrap}>
                  <span className={`material-icons ${styles.stepIcon}`}>edit_note</span>
                </div>
                <div className={styles.stepNum}>02</div>
                <h4 className={styles.stepTitle}>Fill Form</h4>
                <p className={styles.stepDesc}>Complete the detailed application form with event specifics and requirements.</p>
              </div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepCardBg} />
              <div className={styles.stepCardContent}>
                <div className={styles.stepIconWrap}>
                  <span className={`material-icons ${styles.stepIcon}`}>admin_panel_settings</span>
                </div>
                <div className={styles.stepNum}>03</div>
                <h4 className={styles.stepTitle}>Admin Review</h4>
                <p className={styles.stepDesc}>The administration team reviews the availability and purpose of the venue.</p>
              </div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepCardBg} />
              <div className={styles.stepCardContent}>
                <div className={styles.stepIconWrap}>
                  <span className={`material-icons ${styles.stepIcon}`}>check_circle</span>
                </div>
                <div className={styles.stepNum}>04</div>
                <h4 className={styles.stepTitle}>Get Confirmation</h4>
                <p className={styles.stepDesc}>Receive your official booking confirmation and access pass via email.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Venues Section — Infinite Marquee Carousel */}
      <section className={styles.venuesSection} id="venues">
        {/* Section header — max-width constrained */}
        <div className={styles.venuesSectionHeader}>
          <div>
            <h2 className={styles.sectionLabel}>Our Spaces</h2>
            <h3 className={styles.venuesTitle}>Our Labs &amp; Spaces</h3>
          </div>
        </div>

        {/* Loading skeleton — horizontal strip */}
        {venuesLoading && (
          <div className={styles.marqSkeletonOuter}>
            <div className={styles.marqSkeletonInner}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={styles.marqSkeletonCard} />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {!venuesLoading && venuesError && (
          <div className={styles.venuesFeedbackState}>
            <span className="material-icons" style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: 12 }}>error_outline</span>
            <p>Unable to load venues. Please try again later.</p>
            <button className={styles.retryBtn} onClick={() => window.location.reload()}>
              <span className="material-icons" style={{ fontSize: '1rem' }}>refresh</span>
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!venuesLoading && !venuesError && venues.length === 0 && (
          <div className={styles.venuesFeedbackState}>
            <span className="material-icons" style={{ fontSize: '2.5rem', color: '#9ca3af', marginBottom: 12 }}>meeting_room</span>
            <p>No venues available at the moment.</p>
          </div>
        )}

        {/* Marquee carousel — list rendered twice for seamless loop */}
        {!venuesLoading && !venuesError && venues.length > 0 && (
          <div className={styles.venuesCarouselOuter}>
            <div
              className={`${styles.venuesCarouselInner}${isCarouselPaused ? ` ${styles.paused}` : ''}`}
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
              onTouchStart={() => setIsCarouselPaused(true)}
              onTouchEnd={() => setTimeout(() => setIsCarouselPaused(false), 300)}
            >
              {[...venues, ...venues].map((venue, idx) => (
                <div
                  className={styles.marqCard}
                  key={`${venue._id}-${idx}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/venue/${venue._id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/venue/${venue._id}`) }}
                >
                  {venue.facilityType && (
                    <span className={styles.marqCardType}>{venue.facilityType}</span>
                  )}
                  <h4 className={styles.marqCardName}>{venue.name}</h4>
                  <p className={styles.marqCardDesc}>
                    {venue.description
                      ? venue.description.substring(0, 110) + (venue.description.length > 110 ? '...' : '')
                      : 'A premium space available for booking.'}
                  </p>
                  {venue.capacity && (
                    <div className={styles.marqCapacity}>
                      <span className="material-icons">people</span>
                      {venue.capacity} seats
                    </div>
                  )}
                  <button
                    type="button"
                    className={styles.marqBtn}
                    onClick={(e) => { e.stopPropagation(); navigate(`/venue/${venue._id}`) }}
                  >
                    View Details
                    <span className="material-icons">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaTextureBg} />
        <div className={styles.ctaInner}>
          <div className={styles.ctaTextBlock}>
            <h2 className={styles.ctaTitle}>Need a custom booking arrangement?</h2>
            <p className={styles.ctaSub}>Contact the administration office for special event permissions.</p>
          </div>
          <div className={styles.ctaBtns}>
            <button className={styles.ctaContactBtn} type="button" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Contact Admin</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer} id="contact">
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrandCol}>
              <div className={styles.footerLogoRow}>
                <div className={styles.footerLogoWrap}>
                  <img alt="KSRCE Logo" className={styles.footerLogo} src={ksrceLogo} />
                </div>
                <span className={styles.footerColName}>KSR College</span>
              </div>
              <p className={styles.footerDesc}>
                Empowering education through efficient resource management. The official venue booking portal for students and faculty.
              </p>
            </div>

            <div>
              <h3 className={styles.footerColTitle}>Quick Links</h3>
              <ul className={styles.footerLinks}>
                <li><a className={styles.footerLink} href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Home</a></li>
                <li><a className={styles.footerLink} href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>About Us</a></li>
                <li><a className={styles.footerLink} href="#" onClick={(e) => { e.preventDefault(); document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>All Venues</a></li>
                <li><a className={styles.footerLink} href="#" onClick={(e) => { e.preventDefault(); document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>Check Availability</a></li>
              </ul>
            </div>

            <div>
              <h3 className={styles.footerColTitle}>Support</h3>
              <ul className={styles.footerLinks}>
                <li><a className={styles.footerLink} href="#" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>How to Book</a></li>
                <li><a className={styles.footerLink} href="#">Cancellation Policy</a></li>
                <li><a className={styles.footerLink} href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Admin Login</a></li>
                <li><a className={styles.footerLink} href="#">Report Issue</a></li>
              </ul>
            </div>

            <div>
              <h3 className={styles.footerColTitle}>Contact</h3>
              <ul className={styles.footerContactList}>
                <li className={styles.footerContactItem}>
                  <span className={`material-icons ${styles.footerContactIcon}`}>location_on</span>
                  <span>KSR Kalvi Nagar, Tiruchengode,<br />Namakkal - 637215</span>
                </li>
                <li className={styles.footerContactItem}>
                  <span className={`material-icons ${styles.footerContactIcon}`}>phone</span>
                  <span>+91 12345 67890</span>
                </li>
                <li className={styles.footerContactItem}>
                  <span className={`material-icons ${styles.footerContactIcon}`}>email</span>
                  <span>admin@ksr.edu.in</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p className={styles.footerCopy}>© 2023 KSR College of Engineering. All rights reserved.</p>
            <div className={styles.footerLegalLinks}>
              <a className={styles.footerLegalLink} href="#">Privacy Policy</a>
              <a className={styles.footerLegalLink} href="#">Terms of Service</a>
            </div>
          </div>

          <div className={styles.footerAccentBar} />
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
