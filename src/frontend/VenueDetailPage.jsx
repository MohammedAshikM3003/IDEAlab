import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import s from "./VenueDetailPage.module.css";
import lp from "./landingpage.module.css";
import ksrceLogo from '../assets/collegelogo.jpg';
import VenueCalendar from './components/VenueCalendar';
import LiveOccupancy from './components/LiveOccupancy';
import VenueGallery from './components/VenueGallery';
import { normalizeImageUrl } from './utils/imageUrl';

/** Subcomponent for Equipment to cleanly handle per-item image error state */
const EquipmentCard = ({ item, index, onImageClick }) => {
  const [imgError, setImgError] = React.useState(false);
  return (
    <div className={s.eCard}>
      <div className={s.eImgWrap} onClick={item.image && !imgError ? onImageClick : undefined} style={{ cursor: item.image && !imgError ? 'pointer' : 'default' }}>
        {item.image && !imgError ? (
          <img
            alt={item.itemDetails || `Equipment ${index + 1}`}
            className={s.eImg}
            src={item.image}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={s.eImgPlaceholder}>
            <span className="material-icons">precision_manufacturing</span>
          </div>
        )}
      </div>
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
  );
};

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

        if (data) {
          data.bannerImage = normalizeImageUrl(data.bannerImage);
          if (Array.isArray(data.gallery)) {
            data.gallery = data.gallery.map(normalizeImageUrl).filter(Boolean);
          }
          if (Array.isArray(data.equipment)) {
            data.equipment = data.equipment.map(eq => ({
              ...eq,
              image: normalizeImageUrl(eq.image)
            }));
          }
        }

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

  // ─── Lightbox logic ───────────────────────────────────
  const equipment = venue?.equipment || [];
  const equipmentImages = useMemo(() => equipment.filter(item => item.image).map(item => item.image), [equipment]);

  const [lightbox, setLightbox] = useState({
    open: false,
    images: [],
    currentIndex: 0,
    title: '',
  });

  const openLightbox = (images, index, title) => {
    const sanitizedImages = Array.isArray(images) ? images.filter(Boolean) : [];
    if (!sanitizedImages.length) return;
    const boundedIndex = Math.max(0, Math.min(index, sanitizedImages.length - 1));
    setLightbox({ open: true, images: sanitizedImages, currentIndex: boundedIndex, title });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightbox(prev => ({ ...prev, open: false }));
    document.body.style.overflow = '';
  };

  const nextImage = () => setLightbox(prev => prev.images.length ? { ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length } : prev);
  const prevImage = () => setLightbox(prev => prev.images.length ? { ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length } : prev);

  useEffect(() => {
    const handleKey = (e) => {
      if (!lightbox.open) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox.currentIndex, lightbox.open]);

  useEffect(() => { return () => { document.body.style.overflow = ''; }; }, []);

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
        <main className={s.main} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
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
        <main className={s.main} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={`${s.container}`} style={{ textAlign: 'center', padding: '1rem' }}>
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
              <Link to="/" className={s.ctaBtn} style={{ textDecoration: 'none' }}>
                Browse All Venues
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Main detail view ────────────────────────────────
  const amenities = venue.amenities || [];
  const hasEquipment = equipment.length > 0;
  const hasAmenities = amenities.length > 0;
  const bookingSteps = [
    {
      icon: 'email',
      num: '01',
      name: 'Send Request',
      description: (
        <>
          Email your booking request to <strong style={{ color: 'var(--primary)' }}>ksridealab@gmail.com</strong> with the venue, date, and event details you're interested in.
        </>
      ),
    },
    {
      icon: 'edit_note',
      num: '02',
      name: 'Fill Form',
      description: "Complete the detailed application form you'll receive by email, with your event specifics and requirements.",
    },
    {
      icon: 'admin_panel_settings',
      num: '03',
      name: 'Admin Review',
      description: "The administration team reviews the availability and purpose of the venue.",
    },
    {
      icon: 'check_circle',
      num: '04',
      name: 'Get Confirmation',
      description: "Receive your official booking confirmation and access pass via email.",
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
                <Link className={s.crumbAnchor} to="/">
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
              <VenueGallery venue={venue} onOpenLightbox={openLightbox} />
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

              {/* Live Occupancy — placeholder, data wired in next step */}
              <LiveOccupancy venueId={venue._id} />

              <div className={s.desc}>
                <p>
                  {venue.description || 'A premium venue available for booking. Contact administration for more details.'}
                </p>
              </div>

            </div>
          </div>
        </div>

        <section className={s.equipWrap}>
          <div className={s.container}>
            <h2 className={s.secTitle}>
              <span className="material-icons text-primary">precision_manufacturing</span>
              Equipment & Features
            </h2>

            {(hasEquipment || hasAmenities) ? (
              <>
                {hasEquipment && (
                  <div className={s.equipRow}>
                    {equipment.map((item, index) => (
                      <EquipmentCard 
                        key={index} 
                        item={item} 
                        index={index} 
                        onImageClick={() => openLightbox(equipmentImages, equipmentImages.indexOf(item.image), 'Equipment')} 
                      />
                    ))}
                  </div>
                )}

                {hasAmenities && (
                  <div style={{ marginTop: hasEquipment ? '2rem' : '0' }}>
                    {hasEquipment && (
                      <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600, color: '#334155' }}>
                        Additional Features
                      </h3>
                    )}
                    <div className={s.amenitiesGrid}>
                      {amenities.map((amenity, index) => (
                        <div className={s.amenityCard} key={index}>
                          <div className={s.amenityIcon}>
                            <span className="material-icons">check_circle</span>
                          </div>
                          <div className={s.amenityText}>{amenity}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={s.galleryPlaceholder} style={{ height: 'auto', padding: '3rem 2rem' }}>
                <span className="material-icons" style={{ fontSize: '3rem', color: '#9ca3af', marginBottom: '12px' }}>
                  inventory_2
                </span>
                <h3 style={{ color: '#4b5563', fontSize: '1.25rem', fontWeight: '600', margin: '0 0 4px 0' }}>
                  Equipment details coming soon
                </h3>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                  We are currently updating our equipment inventory for this venue.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className={`${s.container} ${s.bottomSectionWrap}`}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            
            {/* Availability Calendar */}
            <div className={s.calendarPanel}>
              <h3 className={s.sectionHeader}>
                <span className="material-icons text-primary">calendar_month</span>
                Availability Calendar
              </h3>
              <div className={s.calendarInner}>
                <VenueCalendar bookings={venue.upcomingBookings || []} />
              </div>
            </div>

            {/* How to Book */}
            <div className={s.howToBookPanel}>
              <div className={s.howToBookHeader}>
                <span className={s.howToBookLabel}>Workflow</span>
                <h2 className={s.howToBookTitle}>How to Book ?</h2>
                <div className={s.howToBookDivider} />
              </div>

              <div className={s.htbStepsGrid}>
                {bookingSteps.map((step, index) => (
                  <div className={s.htbStepCard} key={index}>
                    <div className={s.htbStepCardBg} />
                    <div className={s.htbStepCardContent}>
                      <div className={s.htbStepIconWrap}>
                        <span className={`material-icons ${s.htbStepIcon}`}>{step.icon}</span>
                      </div>
                      <div className={s.htbStepNum}>{step.num}</div>
                      <h4 className={s.htbStepName}>{step.name}</h4>
                      <p className={s.htbStepDesc}>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '2rem', color: '#6b7280', fontSize: '0.95rem' }}>
                If we need any additional details, we'll follow up by replying to your email — just reply back and we'll pick up your request from there.
              </div>
            </div>
            
          </div>
        </section>
      </main>

      {lightbox.open && (
        <div className={s.lightboxOverlay} onClick={closeLightbox}>
          <button
            aria-label="Close"
            className={s.lightboxClose}
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            type="button"
          >
            ✕
          </button>
          {lightbox.images.length > 1 && (
            <div className={s.lightboxCounter}>
              {lightbox.currentIndex + 1} / {lightbox.images.length}
            </div>
          )}
          <div className={s.lightboxTitle}>{lightbox.title}</div>
          <div
            className={s.lightboxContent}
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            {lightbox.images.length > 1 && (
              <button
                aria-label="Previous"
                className={`${s.lightboxArrow} ${s.lightboxArrowLeft}`}
                onClick={prevImage}
                type="button"
              >
                ‹
              </button>
            )}
            <img
              alt={`${lightbox.title} ${lightbox.currentIndex + 1}`}
              className={s.lightboxImage}
              src={lightbox.images[lightbox.currentIndex]}
            />
            {lightbox.images.length > 1 && (
              <button
                aria-label="Next"
                className={`${s.lightboxArrow} ${s.lightboxArrowRight}`}
                onClick={nextImage}
                type="button"
              >
                ›
              </button>
            )}
          </div>
          {lightbox.images.length > 1 && (
            <div
              className={s.lightboxThumbnails}
              onClick={(e) => e.stopPropagation()}
              role="presentation"
            >
              {lightbox.images.map((image, index) => (
                <img
                  alt={`thumb ${index + 1}`}
                  className={index === lightbox.currentIndex ? `${s.lightboxThumb} ${s.lightboxThumbActive}` : s.lightboxThumb}
                  key={image + String(index)}
                  onClick={() => setLightbox(prev => ({ ...prev, currentIndex: index }))}
                  src={image}
                />
              ))}
            </div>
          )}
        </div>
      )}

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
                <li><a className={lp.footerLink} href="#" onClick={(e) => { e.preventDefault(); navigate('/', { state: { scrollTo: 'venues' } }) }}>All Venues</a></li>
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
                  <span>ksridealab@gmail.com</span>
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
