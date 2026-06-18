import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import s from "./VenueDetailPage.module.css";
import lp from "./landingpage.module.css";
import ksrceLogo from '../assets/collegelogo.jpg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VenueDetailPage() {
  const navigate = useNavigate();
  const { venueId } = useParams();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/venues/public/${venueId}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError('not_found');
          } else {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return;
        }

        const data = await res.json();
        console.log('Venue detail response:', data);
        setVenue(data);
      } catch (err) {
        console.error('Failed to fetch venue:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [venueId]);

  /** Get the hero / banner image with fallback */
  const getHeroImage = () => {
    if (venue.bannerImage) return venue.bannerImage;
    if (venue.gallery?.length > 0) return venue.gallery[0];
    return '/placeholder-venue.jpg';
  };

  /** Get gallery thumbnails (up to 4) */
  const getThumbnails = () => {
    const thumbs = [];
    if (venue.bannerImage) thumbs.push(venue.bannerImage);
    if (venue.gallery) {
      venue.gallery.forEach(img => {
        if (!thumbs.includes(img)) thumbs.push(img);
      });
    }
    return thumbs.slice(0, 4);
  };

  // ─── Loading state ───────────────────────────────────
  if (loading) {
    return (
      <div className={s.page}>
        <header className={s.header}>
          <div className={s.container}>
            <div className={s.headerWrap}>
              <Link className={s.brand} to="/" style={{ textDecoration: 'none' }}>
                <div className={s.logo}>
                  <img alt="KSRCE Logo" className={s.logoImg} src={ksrceLogo} />
                </div>
                <div className={s.brandText}>
                  <span className={s.brandTitle}>KSR College of Engineering</span>
                  <span className={s.portalPill}>Booking Portal</span>
                </div>
              </Link>
            </div>
          </div>
        </header>
        <main className={s.main}>
          <div className={`${s.container}`} style={{ padding: '80px 1rem', textAlign: 'center' }}>
            <div className={s.loadingSpinner}></div>
            <p style={{ color: '#6b7280', marginTop: 16 }}>Loading venue details...</p>
          </div>
        </main>
      </div>
    );
  }

  // ─── Not found / error state ─────────────────────────
  if (error || !venue) {
    return (
      <div className={s.page}>
        <header className={s.header}>
          <div className={s.container}>
            <div className={s.headerWrap}>
              <Link className={s.brand} to="/" style={{ textDecoration: 'none' }}>
                <div className={s.logo}>
                  <img alt="KSRCE Logo" className={s.logoImg} src={ksrceLogo} />
                </div>
                <div className={s.brandText}>
                  <span className={s.brandTitle}>KSR College of Engineering</span>
                  <span className={s.portalPill}>Booking Portal</span>
                </div>
              </Link>
            </div>
          </div>
        </header>
        <main className={s.main}>
          <div className={`${s.container}`} style={{ padding: '80px 1rem', textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: '3.5rem', color: error === 'not_found' ? '#9ca3af' : '#ef4444', marginBottom: 16 }}>
              {error === 'not_found' ? 'meeting_room' : 'error_outline'}
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E3A5F', marginBottom: 8 }}>
              {error === 'not_found' ? 'Venue Not Found' : 'Failed to Load Venue'}
            </h1>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>
              {error === 'not_found'
                ? 'This venue may have been removed or is no longer available.'
                : 'Something went wrong while fetching venue details. Please try again.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate(-1)} className={s.ctaBtn}>
                ← Go Back
              </button>
              <Link to="/venues" className={s.ctaBtn} style={{ textDecoration: 'none' }}>
                Browse All Venues
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Main detail view ────────────────────────────────
  const thumbnails = getThumbnails();
  const amenities = venue.amenities || [];
  const equipment = venue.equipment || [];
  const bookingSteps = [
    {
      name: 'Check Availability',
      description: 'Use the calendar to find an open date for your event. You can see which dates are booked, open, or closed for maintenance.',
    },
    {
      name: 'Submit Request',
      description: 'Fill out the booking form with your event details. Our team will review your request and get back to you within 24 hours.',
    },
    {
      name: 'Confirmation',
      description: 'Once approved, you will receive a confirmation email with all the details for your scheduled event. You are all set!',
    },
  ];

  return (
    <div className={s.page}>
      <div className={s.banner}>
        <div className={s.bannerInner}>
          <span className="material-icons">campaign</span>
          <p>
            New: {venue.name} now open for booking!{" "}
            <a className={s.bannerLink} href="#">Learn more</a>
          </p>
        </div>
      </div>

      <header className={s.header}>
        <div className={s.container}>
          <div className={s.headerWrap}>
            <Link className={s.brand} to="/" style={{ textDecoration: 'none' }}>
              <div className={s.logo}>
                <img alt="KSRCE Logo" className={s.logoImg} src={ksrceLogo} />
              </div>
              <div className={s.brandText}>
                <span className={s.brandTitle}>KSR College of Engineering</span>
                <span className={s.portalPill}>Booking Portal</span>
              </div>
            </Link>

            <nav className={s.nav}>
              <a
                className={s.navAnchor}
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/', { state: { scrollTo: 'hero' } }) }}
              >
                Home
              </a>
              <a
                className={s.navAnchor}
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/', { state: { scrollTo: 'how-it-works' } }) }}
              >
                How to Book
              </a>
              <a className={s.navOn} href="#">Venues</a>
              <a
                className={s.navAnchor}
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/', { state: { scrollTo: 'contact' } }) }}
              >
                Contact
              </a>
            </nav>

            <div className={s.headerRight}>
              <Link className={s.adminBtn} to="/login">
                <span className="material-icons">lock</span>
                Admin Login
              </Link>
              <button className={s.menuBtn} type="button">
                <span className="material-icons">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={s.main}>
        <div className={`${s.container} py-6`}>
          <nav aria-label="Breadcrumb" className={s.crumb}>
            <ol className={s.breadcrumbs}>
              <li>
                <Link className={s.crumbAnchor} to="/">
                  Home
                </Link>
              </li>
              <li>
                <span className={s.crumbSep}>/</span>
              </li>
              <li>
                <Link className={s.crumbAnchor} to="/venues">
                  Venues
                </Link>
              </li>
              <li>
                <span className={s.crumbSep}>/</span>
              </li>
              <li className={s.crumbActive}>{venue.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7 space-y-4">
              <div className={s.hero}>
                <img
                  alt={venue.name}
                  className={s.heroImg}
                  src={getHeroImage()}
                  onError={(e) => { e.target.src = '/placeholder-venue.jpg'; }}
                />
              </div>

              {thumbnails.length > 1 && (
                <div className={s.thumbRow}>
                  {thumbnails.map((thumb, index) => (
                    <div className={index === 0 ? s.thumbOn : s.thumb} key={index}>
                      <img
                        alt={`Thumbnail ${index + 1}`}
                        className={s.thumbImg}
                        src={thumb}
                        onError={(e) => { e.target.src = '/placeholder-venue.jpg'; }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`lg:col-span-5 ${s.sidebar}`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={s.statusTag}>
                    <span className={s.pulse} />
                    Available for Booking
                  </span>
                </div>
                <h1 className={s.title}>{venue.name}</h1>
                {venue.location && (
                  <p className={s.secSubtitle}>
                    <span className="material-icons" style={{ fontSize: '1.125rem', verticalAlign: 'middle', marginRight: 4 }}>location_on</span>
                    {venue.location}
                  </p>
                )}
              </div>

              <div className={s.stats}>
                {venue.capacity && (
                  <div className={s.statCard}>
                    <div className={s.statRow}>
                      <div className={s.statIcon}>
                        <span className="material-icons">groups</span>
                      </div>
                      <div>
                        <p className={s.statLbl}>Capacity</p>
                        <p className={s.statVal}>{venue.capacity} Seats</p>
                      </div>
                    </div>
                  </div>
                )}

                {venue.size && (
                  <div className={s.statCard}>
                    <div className={s.statRow}>
                      <div className={s.statIcon}>
                        <span className="material-icons">straighten</span>
                      </div>
                      <div>
                        <p className={s.statLbl}>Size</p>
                        <p className={s.statVal}>{venue.size}</p>
                      </div>
                    </div>
                  </div>
                )}

                {venue.facilityType && (
                  <div className={s.statCard}>
                    <div className={s.statRow}>
                      <div className={s.statIcon}>
                        <span className="material-icons">category</span>
                      </div>
                      <div>
                        <p className={s.statLbl}>Type</p>
                        <p className={s.statVal}>{venue.facilityType}</p>
                      </div>
                    </div>
                  </div>
                )}

                {venue.wifiStatus && venue.wifiStatus !== 'None' && (
                  <div className={s.statCard}>
                    <div className={s.statRow}>
                      <div className={s.statIcon}>
                        <span className="material-icons">wifi</span>
                      </div>
                      <div>
                        <p className={s.statLbl}>Wi-Fi</p>
                        <p className={s.statVal}>{venue.wifiStatus}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={s.desc}>
                <p>
                  {venue.description || 'A premium venue available for booking. Contact administration for more details.'}
                </p>
                {amenities.length > 0 && (
                  <ul className={s.features}>
                    {amenities.map((amenity, index) => (
                      <li className={s.feature} key={index}>
                        <span className={`material-icons ${s.checkIcon}`}>check_circle</span>
                        {amenity}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {equipment.length > 0 && (
          <section className={s.equipWrap}>
            <div className={s.container}>
              <h2 className={s.secTitle}>
                <span className="material-icons text-primary">precision_manufacturing</span>
                Available Equipment
              </h2>

              <div className={s.equipRow}>
                {equipment.map((item, index) => (
                  <div className={s.eCard} key={index}>
                    {item.image && (
                      <div className={s.eImgWrap}>
                        <img
                          alt={item.itemDetails || `Equipment ${index + 1}`}
                          className={s.eImg}
                          src={item.image}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className={s.eBody}>
                      <div className={s.eHead}>
                        <h3 className={s.eTitle}>{item.itemDetails || `Equipment ${index + 1}`}</h3>
                        {item.quantity && (
                          <span className={s.tagGreen}>{item.quantity} Unit{item.quantity > 1 ? 's' : ''}</span>
                        )}
                      </div>
                      {item.condition && <p className={s.eSub}>Condition: {item.condition}</p>}
                      {item.description && (
                        <p className={s.eText}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className={`${s.container} ${s.bookWrap}`}>
          <div className={s.bookPanel}>
            <div className={s.bookBody}>
              <div className={s.bookHead}>
                <h2 className={s.bookName}>Booking Process</h2>
                <p className={s.bookSub}>Follow these simple steps to reserve the {venue.name} for your project.</p>
              </div>

              <div className={s.steps}>
                <div className={s.stepLine} />
                {bookingSteps.map((step, index) => (
                  <div className={s.step} key={index}>
                    <div className={s.stepRing}>
                      <span className={`material-icons ${s.stepIcon}`}>
                        {index === 0 ? 'email' : index === 1 ? 'assignment' : 'verified'}
                      </span>
                    </div>
                    <h3 className={s.stepName}>{index + 1}. {step.name}</h3>
                    <p className={s.stepDesc}>
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className={s.ctaWrap}>
                <button className={s.ctaBtn} type="button" onClick={() => navigate('/', { state: { scrollTo: 'how-it-works' } })}>
                  Want to Book? Know How
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={lp.footer} id="contact">
        <div className={lp.footerInner}>
          <div className={lp.footerGrid}>
            <div className={lp.footerBrandCol}>
              <div className={lp.footerLogoRow}>
                <div className={lp.footerLogoWrap}>
                  <img alt="KSRCE Logo" className={lp.footerLogo} src={ksrceLogo} />
                </div>
                <span className={lp.footerColName}>KSR College</span>
              </div>
              <p className={lp.footerDesc}>
                Empowering education through efficient resource management. The official venue booking portal for students and faculty.
              </p>
            </div>

            <div>
              <h3 className={lp.footerColTitle}>Quick Links</h3>
              <ul className={lp.footerLinks}>
                <li><a className={lp.footerLink} href="#" onClick={(e) => { e.preventDefault(); navigate('/', { state: { scrollTo: 'hero' } }) }}>Home</a></li>
                <li><a className={lp.footerLink} href="#" onClick={(e) => { e.preventDefault(); navigate('/', { state: { scrollTo: 'hero' } }) }}>About Us</a></li>
                <li><Link className={lp.footerLink} to="/venues">All Venues</Link></li>
                <li><a className={lp.footerLink} href="#" onClick={(e) => { e.preventDefault(); navigate('/', { state: { scrollTo: 'venues' } }) }}>Check Availability</a></li>
              </ul>
            </div>

            <div>
              <h3 className={lp.footerColTitle}>Support</h3>
              <ul className={lp.footerLinks}>
                <li><a className={lp.footerLink} href="#" onClick={(e) => { e.preventDefault(); navigate('/', { state: { scrollTo: 'how-it-works' } }) }}>How to Book</a></li>
                <li><a className={lp.footerLink} href="#">Cancellation Policy</a></li>
                <li><a className={lp.footerLink} href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Admin Login</a></li>
                <li><a className={lp.footerLink} href="#">Report Issue</a></li>
              </ul>
            </div>

            <div>
              <h3 className={lp.footerColTitle}>Contact</h3>
              <ul className={lp.footerContactList}>
                <li className={lp.footerContactItem}>
                  <span className={`material-icons ${lp.footerContactIcon}`}>location_on</span>
                  <span>KSR Kalvi Nagar, Tiruchengode,<br />Namakkal - 637215</span>
                </li>
                <li className={lp.footerContactItem}>
                  <span className={`material-icons ${lp.footerContactIcon}`}>phone</span>
                  <span>+91 12345 67890</span>
                </li>
                <li className={lp.footerContactItem}>
                  <span className={`material-icons ${lp.footerContactIcon}`}>email</span>
                  <span>admin@ksr.edu.in</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={lp.footerBottom}>
            <p className={lp.footerCopy}>© 2023 KSR College of Engineering. All rights reserved.</p>
            <div className={lp.footerLegalLinks}>
              <a className={lp.footerLegalLink} href="#">Privacy Policy</a>
              <a className={lp.footerLegalLink} href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
