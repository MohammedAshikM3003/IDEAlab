import React from "react";
import { Link, useNavigate } from "react-router-dom";
import s from "./AICTEVenuePage.module.css";
import lp from "./landingpage.module.css";
import ksrceLogo from '../assets/collegelogo.jpg';

export default function AICTELabVenuePage() {
  const navigate = useNavigate()
  return (
    <div className={s.page}>
      <div className={s.banner}>
        <div className={s.bannerInner}>
          <span className="material-icons">campaign</span>
          <p>
            New: AICTE Idea Lab now open for booking!{" "}
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
              <li className={s.crumbActive}>AICTE Idea Lab</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7 space-y-4">
              <div className={s.hero}>
                <img
                  alt="Modern lab interior with equipment"
                  className={s.heroImg}
                  data-alt="Modern spacious laboratory interior with equipment"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7GcdAuhgYP1yhlSMg9WQ5tYuEnyCZYhB2bVF7ntyxTGbInvN_B_vxBSoQ2OC0i-Igi_2w_82dibu7VcD4-JP4_4Bnc05UOwq1MPuBp_msY5HvzLY_kTEU9ZOSg_jnZ0j-714_Vt_XBSSBki6gaCCfaazWSry3QzpfaM1ja962f0ewuz7b52GIraDV2fobPuIkK9UYgGSqaKti8LjHVYcLt6zLkyNmurB2QY8g3k32lFRir9W40DtL-oyzw8LaOCriuQU4rNQ10Nk"
                />
              </div>

              <div className={s.thumbRow}>
                <div className={s.thumbOn}>
                  <img
                    alt="Lab main view thumbnail"
                    className={s.thumbImg}
                    data-alt="Lab main view thumbnail"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaHCbod4qQEm0wqcR19L6ZER7z44aZNVQS_p8l1aEWzSZ8OwKtiCiF9mXJei8yO8ykky9HwP1JChQq6z3SRxARIAN8IYw7Hca0zvgJBtNQiJBk2n19N2LJ9f8HkbX4SX0v84wCrsJTD3MvWdugwbaJeQ5tzbsIlBC-Gl6X5sHmnR7AJDmsqSusLBaoeKN9u-U3xSNtkQEBvks6R-CZcVR4nfviG7s50nI2Ig1MHhgZsn4KzJvKMQbBDixgrbUfsxtPzkcD4pAtxZU"
                  />
                </div>

                <div className={s.thumb}>
                  <img
                    alt="3D printer close up"
                    className={s.thumbImg}
                    data-alt="3D printer close up"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDwSU613HokGEjw9ngYRkV6WNRAV2mj_7Cyw0fGydMKhEO0SxwC1FRVIeNfej4YW0u3PdYCwQZ0xmLJsU7Y-qtmlH_DtLSiv4UEeg3k3qeKWazKxy8FoabM1IwnIjjl-3U0pkawEDTr6OiUpQvEg82cuXq1YbOK8E1HGhD0Uf4FkMlu4GFR-LYPADeGXpRESPp2wDpymX6f8VAi9lnpnO0wcEtVy5FjWFM2UJxnBDMqKgSTtaj0IcTMy8oPJze90BAAmDi7axgKLQ"
                  />
                </div>

                <div className={s.thumb}>
                  <img
                    alt="Students working together"
                    className={s.thumbImg}
                    data-alt="Students working together"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYvtvgCOxg2CMhH8wyGRkpvVq_p7YZtNthGgmXjbr3OG_K4rLvCmgpZ57Q2Lyi6XpoYxZ5cq4m53Kd1VQFXYNZWMGQq0I-a-qWWqu2rKGC74CAvJO2jnsSXVehXhzTTZSBgHbXNDOXr0oNuCvyl6bI1SQ28pVTc8v-v924AQB4y1c-PlbM_KBkB9Ybly24JevO7chTFCSExqyVK0BS5VIBVKtTgRirKx2iLTVx7q9lgbDFqluoyJ3nCYqIEq1s3Kt5KJhg4CjjQDY"
                  />
                </div>

                <div className={s.thumb}>
                  <img
                    alt="Electronic components on table"
                    className={s.thumbImg}
                    data-alt="Electronic components on table"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQmbS5ssB6EezZ66uO_GOLXERalMn9hydsOSnS-oLpjXz4PL8wugDnJnJ848q8ffBrtM8HgcgbSDtwGI_VJOBUjCyVW-L3YdS49I-xXPargfhoBJKg6MHgVtYaw8NRgIoz_gHZUuGuV6kJFh9ZlZFthSoVV9P0ebRXny_zKqPRomuCYnl263XbtJU4r5XWvOrQg6WXJc2Psi9QePsI4txV7ijAxNTz4N1-GDQ_6xe59aEtKQPDk0L6dXNZl9MKdHULmZsl2K4Kml8"
                  />
                </div>
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
                <h1 className={s.title}>AICTE Idea Lab</h1>
                <p className={s.secSubtitle}>Lab Block A, Engineering Wing</p>
              </div>

              <div className={s.stats}>
                <div className={s.statCard}>
                  <div className={s.statRow}>
                    <div className={s.statIcon}>
                      <span className="material-icons">groups</span>
                    </div>
                    <div>
                      <p className={s.statLbl}>Capacity</p>
                      <p className={s.statVal}>60 Students</p>
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
                      <p className={s.statVal}>1200 Sq. Ft</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={s.desc}>
                <p>
                  The AICTE Idea Lab is a state-of-the-art innovation center designed to foster creativity and prototyping. Equipped with advanced
                  manufacturing tools, it serves as a collaborative space for students to turn ideas into reality.
                </p>
                <ul className={s.features}>
                  <li className={s.feature}>
                    <span className={`material-icons ${s.checkIcon}`}>check_circle</span>
                    High-speed internet &amp; WiFi access
                  </li>
                  <li className={s.feature}>
                    <span className={`material-icons ${s.checkIcon}`}>check_circle</span>
                    Smart projector &amp; Audio system
                  </li>
                  <li className={s.feature}>
                    <span className={`material-icons ${s.checkIcon}`}>check_circle</span>
                    Dedicated mentor support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <section className={s.equipWrap}>
          <div className={s.container}>
            <h2 className={s.secTitle}>
              <span className="material-icons text-primary">precision_manufacturing</span>
              Available Equipment
            </h2>

            <div className={s.equipRow}>
              <div className={s.eCard}>
                <div className={s.eImgWrap}>
                  <img
                    alt="Prusa i3 MK3S+ 3D Printer"
                    className={s.eImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZBGQ8-NQX_zLIa_NNIOylQm4FGdsILs06LuUbRpAxtojYk0dzMee4eKVVZjuAFBTiloqdS30lRX0FDnDq546VmqoalCRwNNNQK1DoLNE23qjHGQD-bcGGAIZMmCt9pnd1lk7V2xQU8CuOhXCJO7GK4d-yp809wRhRigYE3AHxC8Sb7cwqvSeV-Tte4Pmn7PQDvKxjHYgRocPLr4g-ANRbJe4PjIjpHMq-QDNA1x_pwGDNeXQfuEVFRxxXy2yF7Ci5NWUDA1oDK0I"
                  />
                </div>
                <div className={s.eBody}>
                  <div className={s.eHead}>
                    <h3 className={s.eTitle}>3D Printers</h3>
                    <span className={s.tagGreen}>5 Units</span>
                  </div>
                  <p className={s.eSub}>Prusa i3 MK3S+</p>
                  <p className={s.eText}>
                    FDM printing up to 300mm, ideal for rapid prototyping and mechanical parts.
                  </p>
                </div>
              </div>

              <div className={s.eCard}>
                <div className={s.eImgWrap}>
                  <img
                    alt="CO2 Laser Cutter Machine"
                    className={s.eImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGmYHoxe9D3m0QhPoMqOxQJ2Gg5KPc9Q11mIu4tbBwBx51AUgLAKmJ3OZN57w2KMc6QKJNY_7YNKZKwBA2Nyg_0PlguFGlSotgforvq4g-fcAIcvp641jT1ltGbNdfB2cmWFKV2PJ8U7jeAWyrVxDsGDLg854qMx77HjORp4MTFHSWBul-iFYctAOv2MdNkjNh6wpQ7rJtD-UxJfnrQwEdzQL89vfmVvIc9Z2cdBp-eRDA5o5-8flCKPbjOSp6f3TYN9mJczpoRIY"
                  />
                </div>
                <div className={s.eBody}>
                  <div className={s.eHead}>
                    <h3 className={s.eTitle}>Laser Cutter</h3>
                    <span className={s.tagYellow}>1 Unit</span>
                  </div>
                  <p className={s.eSub}>CO2 Laser 60W</p>
                  <p className={s.eText}>
                    Precision cutting up to 600x400mm for acrylic, wood, and fabric materials.
                  </p>
                </div>
              </div>

              <div className={s.eCard}>
                <div className={s.eImgWrap}>
                  <img
                    alt="IoT Development Kits"
                    className={s.eImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEeA8qJfqzGQifOuCNLPsBZ38c_Y5gN97Qb6m5GrYLR6PSGfGiSBMrwJdcQYssXPpeh8WBNpVkwcIYH8-wV9pPzqZ9zReiIPClEfivH3ex95AIbvF0SyQdkdM5UCFduBPpoqQagXkR9VevWYGlJxRqe9mMMrNn-bIAehcfQazddytGukLjJ1bp69tmEZbeNs9SNN43vD_zj2FR2676z8HHUQvQBVRwwh0niGhQ4qGlWDp4GSoyaaz6bzJyhPkuSUIWuC-FJzwLePI"
                  />
                </div>
                <div className={s.eBody}>
                  <div className={s.eHead}>
                    <h3 className={s.eTitle}>IoT Dev Kits</h3>
                    <span className={s.tagGreen}>20 Kits</span>
                  </div>
                  <p className={s.eSub}>Arduino &amp; Raspberry Pi</p>
                  <p className={s.eText}>
                    Complete sensor modules, actuators, and wireless connectivity for IoT projects.
                  </p>
                </div>
              </div>

              <div className={s.eCard}>
                <div className={s.eImgWrap}>
                  <img
                    alt="High-end CAD Workstation"
                    className={s.eImg}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbYAHnbkIc6PczxpTuNkFkdsyEHmPN5TxUtHtZ0TViX7DXvfwJ6Vh9PfTJVVCV0WEjunKGCgUMhd2sXA2IPbFhpaGlOUeex1tHFuELvk231GE_Mg2o1xyflSI7Ss8fOH8hHQYTCFgbxZeq09uLkqFGRTz170oGZUNiayScKjNQbDSJyjwyr7vYu9bwmyTHOavtg8aXkkYPSQUkqWf_h3PFFfbcj5iaYXIToXwdhhgfp88cj8cl9efdYuN0szQZlK5Z58L4WlocEgk"
                  />
                </div>
                <div className={s.eBody}>
                  <div className={s.eHead}>
                    <h3 className={s.eTitle}>CAD Workstations</h3>
                    <span className={s.tagGreen}>10 PCs</span>
                  </div>
                  <p className={s.eSub}>Intel i7, 16GB RAM, NVIDIA</p>
                  <p className={s.eText}>Pre-loaded with SolidWorks, AutoCAD, and simulation software.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${s.container} ${s.bookWrap}`}>
          <div className={s.bookPanel}>
            <div className={s.bookBody}>
              <div className={s.bookHead}>
                <h2 className={s.bookName}>Booking Process</h2>
                <p className={s.bookSub}>Follow these simple steps to reserve the Idea Lab for your project.</p>
              </div>

              <div className={s.steps}>
                <div className={s.stepLine} />

                <div className={s.step}>
                  <div className={s.stepRing}>
                    <span className={`material-icons ${s.stepIcon}`}>email</span>
                  </div>
                  <h3 className={s.stepName}>1. Check Availability</h3>
                  <p className={s.stepDesc}>
                    Review the calendar below or email the lab coordinator to confirm open slots.
                  </p>
                </div>

                <div className={s.step}>
                  <div className={s.stepRing}>
                    <span className={`material-icons ${s.stepIcon}`}>assignment</span>
                  </div>
                  <h3 className={s.stepName}>2. Submit Request</h3>
                  <p className={s.stepDesc}>Fill out the official request form with project details and required equipment.</p>
                </div>

                <div className={s.step}>
                  <div className={s.stepRing}>
                    <span className={`material-icons ${s.stepIcon}`}>verified</span>
                  </div>
                  <h3 className={s.stepName}>3. Get Confirmation</h3>
                  <p className={s.stepDesc}>Receive approval notification via email and access code for the lab.</p>
                </div>
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

              <div className={s.cal}>
                <div className={s.calNav}>
                  <h4 className={s.calTitle}>October 2023</h4>
                  <div className="flex gap-2">
                    <button className={s.calBtn} type="button">
                      <span className="material-icons">chevron_left</span>
                    </button>
                    <button className={s.calBtn} type="button">
                      <span className="material-icons">chevron_right</span>
                    </button>
                  </div>
                </div>

                <div className={`${s.calGrid} mb-2`}>
                  <div className={s.calHead}>Mo</div>
                  <div className={s.calHead}>Tu</div>
                  <div className={s.calHead}>We</div>
                  <div className={s.calHead}>Th</div>
                  <div className={s.calHead}>Fr</div>
                  <div className={s.calHead}>Sa</div>
                  <div className={s.calHead}>Su</div>
                </div>

                <div className={s.calGrid}>
                  <div className={s.calOff}>28</div>
                  <div className={s.calOff}>29</div>
                  <div className={s.calOff}>30</div>
                  <div className={s.calDay}>1</div>
                  <div className={`${s.calDay} relative`}>
                    2
                    <span className={s.calDot} />
                  </div>
                  <div className={s.calFull}>3</div>
                  <div className={s.calFull}>4</div>
                  <div className={s.calDay}>5</div>
                  <div className={s.calDay}>6</div>
                  <div className={s.calPicked}>7</div>
                  <div className={s.calDay}>8</div>
                  <div className={`${s.calDay} relative`}>
                    9
                    <span className={s.calDot} />
                  </div>
                  <div className={s.calDim}>10</div>
                  <div className={s.calDim}>11</div>
                </div>

                <div className={s.legend}>
                  <div className={s.legItem}>
                    <span className={s.dotFree} /> Open
                  </div>
                  <div className={s.legItem}>
                    <span className={s.dotFull} /> Booked
                  </div>
                  <div className={s.legItem}>
                    <span className={s.dotOff} /> Closed
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className={s.secSubtitle}>
                <span className="material-icons text-primary">forum</span>
                What Users Say
              </h3>

              <div className="space-y-4">
                <div className={s.review}>
                  <span className={`material-icons ${s.quoteIco}`}>format_quote</span>
                  <p className={s.quoteText}>
                    "The 3D printers here are top-notch. I was able to prototype my final year project chassis in just two days. The mentors are super
                    helpful!"
                  </p>
                  <div className={s.author}>
                    <div className={s.avatar}>
                      <img
                        alt="User avatar"
                        data-alt="Avatar of student Ravi K"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNiDcsbdlajqdKJU6Tn5mV2YvNqZhFdtIyxAld-Vhu5yM7_KXJ4eNsm-dcq6dZmmcuWRUNtw9luT8ynD5AOmKyKoO6Br3zVTwGeNcET9JI46EfzVDvMuR_JfQit7KH5BowNB-fXKqS3LNqT3YArzxcyqPXIENHDph-CppqCp0pnpzz7n9NTSOQ_Q62odcfrDm46tDm8tS-4B3s5q1ujH90K00jf20FPTehOLpE938WBVZMYS0MySc-CTlK-7MNETcQ8xMxOZ25DZQ"
                      />
                    </div>
                    <div>
                      <p className={s.authorTitle}>Ravi Kumar</p>
                      <p className={s.authorSub}>Mechanical Engineering, Year 4</p>
                    </div>
                  </div>
                </div>

                <div className={s.review}>
                  <span className={`material-icons ${s.quoteIco}`}>format_quote</span>
                  <p className={s.quoteText}>
                    "Great environment for hackathons. The IoT kits were sufficient for our team of four. WiFi speed is excellent for cloud
                    deployments."
                  </p>
                  <div className={s.author}>
                    <div className={s.avatar}>
                      <img
                        alt="User avatar"
                        data-alt="Avatar of student Priya S"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXMIAifc1VjJiDhXtS9y-o9KjQuvuxN_n46Xl0yWZCC6c-WU2R2FEf-G5iKnvX8AeJmQH3BfpLJkTkUJh0Exp88WbOgFxHjWUJA5yQhPL_QcvrBygyz3rtcQ4jIeRvvx8FHASlmuxvAqdY_gJwVTUj3cnypLeM1iiTmdba-65cVEeOI50-INboVghXAk8qvoNAAh_77p-pA6DNNFyFpgOIB_zly2Wwt-ySxLvxuAOIMr0I8wDOff7lTX_mZgBiXlThHk4J0FRDnfo"
                      />
                    </div>
                    <div>
                      <p className={s.authorTitle}>Priya Sharma</p>
                      <p className={s.authorSub}>Computer Science, Year 3</p>
                    </div>
                  </div>
                </div>
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
