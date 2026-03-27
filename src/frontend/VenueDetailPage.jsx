import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Calendar from "./Calendar";
import s from "./VenueDetailPage.module.css";
import lp from "./landingpage.module.css";
import ksrceLogo from '../assets/collegelogo.jpg';
import venuesData from '../data/venuesData.js';

export default function VenueDetailPage() {
  const navigate = useNavigate();
  const { venueId } = useParams();
  const venue = venuesData.find(v => v.id === venueId);

  const [selectedPreviewDate, setSelectedPreviewDate] = useState(() => new Date(2023, 9, 7));

  if (!venue) {
    return (
      <div className={s.page}>
        <div className={`${s.container} text-center py-20`}>
          <h1 className="text-2xl font-bold mb-4">Venue not found</h1>
          <button onClick={() => navigate(-1)} className={s.ctaBtn}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
            <div className={s.brand}>
              <div className={s.logo}>
                <img alt="KSRCE Logo" className={s.logoImg} src={ksrceLogo} />
              </div>
              <div className={s.brandText}>
                <span className={s.brandTitle}>KSR College of Engineering</span>
                <span className={s.portalPill}>Booking Portal</span>
              </div>
            </div>

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
                <a className={s.crumbAnchor} href="#">
                  Venues
                </a>
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
                  alt="Modern lab interior with equipment"
                  className={s.heroImg}
                  data-alt="Modern spacious laboratory interior with equipment"
                  src={venue.images.hero}
                />
              </div>

              <div className={s.thumbRow}>
                {venue.images.thumbnails.map((thumb, index) => (
                  <div className={index === 0 ? s.thumbOn : s.thumb} key={index}>
                    <img
                      alt={`Thumbnail ${index + 1}`}
                      className={s.thumbImg}
                      src={thumb}
                    />
                  </div>
                ))}
              </div>
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
                <p className={s.secSubtitle}>{venue.location}</p>
              </div>

              <div className={s.stats}>
                <div className={s.statCard}>
                  <div className={s.statRow}>
                    <div className={s.statIcon}>
                      <span className="material-icons">groups</span>
                    </div>
                    <div>
                      <p className={s.statLbl}>Capacity</p>
                      <p className={s.statVal}>{venue.capacity} Students</p>
                    </div>
                  </div>
                </div>

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
              </div>

              <div className={s.desc}>
                <p>
                  {venue.description}
                </p>
                <ul className={s.features}>
                  {venue.amenities.map((amenity, index) => (
                    <li className={s.feature} key={index}>
                      <span className={`material-icons ${s.checkIcon}`}>check_circle</span>
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {venue.equipment.length > 0 && (
          <section className={s.equipWrap}>
            <div className={s.container}>
              <h2 className={s.secTitle}>
                <span className="material-icons text-primary">precision_manufacturing</span>
                Available Equipment
              </h2>

              <div className={s.equipRow}>
                {venue.equipment.map((item, index) => (
                  <div className={s.eCard} key={index}>
                    <div className={s.eImgWrap}>
                      <img
                        alt={item.name}
                        className={s.eImg}
                        src={item.image}
                      />
                    </div>
                    <div className={s.eBody}>
                      <div className={s.eHead}>
                        <h3 className={s.eTitle}>{item.name}</h3>
                        <span className={s.tagGreen}>{item.quantity} Unit{item.quantity > 1 ? 's' : ''}</span>
                      </div>
                      <p className={s.eSub}>{item.specs}</p>
                      <p className={s.eText}>
                        {item.description}
                      </p>
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
                {venue.bookingProcess.map((step, index) => (
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

        <section className={`${s.container} ${s.preview}`}>
          <div className={s.previewRow}>
            <div>
              <h3 className={s.secSubtitle}>
                <span className="material-icons text-primary">calendar_month</span>
                Availability Preview
              </h3>

              <div className={s.previewCalendar}>
                <Calendar
                  availabilityData={venue.availability}
                  onDateSelect={setSelectedPreviewDate}
                  selectedDate={selectedPreviewDate}
                />
              </div>
            </div>

            {venue.reviews.length > 0 && (
              <div>
                <h3 className={s.secSubtitle}>
                  <span className="material-icons text-primary">forum</span>
                  What Users Say
                </h3>

                <div className="space-y-4">
                  {venue.reviews.map((review, index) => (
                    <div className={s.review} key={index}>
                      <span className={`material-icons ${s.quoteIco}`}>format_quote</span>
                      <p className={s.quoteText}>
                        "{review.review}"
                      </p>
                      <div className={s.author}>
                        <div className={s.avatar}>
                          <img
                            alt="User avatar"
                            src={review.avatar}
                          />
                        </div>
                        <div>
                          <p className={s.authorTitle}>{review.name}</p>
                          <p className={s.authorSub}>{review.department}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
