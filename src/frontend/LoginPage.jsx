import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import styles from './LoginPage.module.css'
import LoadingScreen from './LoadingScreen'
import ksrceLogo from '../assets/collegelogo.jpg'
import ksrceImage from "../assets/KSR college image.jpg"
import nbaLogo from '../assets/NBA_logo.svg'
import naacLogo from '../assets/NAAC_LOGO.svg'
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const authTimerRef = useRef(null);
  const navigate = useNavigate();
  const inputContainerStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
  };

  useEffect(() => {
    return () => {
      if (authTimerRef.current) {
        window.clearTimeout(authTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isAuthenticating) {
      return;
    }

    if (!email.trim() || !password) {
      setAuthError('Email and password are required');
      return;
    }

    setAuthError('');
    setIsAuthenticating(true);

    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.message || 'Login failed');
        }

        authTimerRef.current = window.setTimeout(() => {
          navigate('/dashboard');
        }, 900);
      })
      .catch((error) => {
        setAuthError(error.message || 'Login failed');
        setIsAuthenticating(false);
      });
  };

  if (isAuthenticating) {
    return <LoadingScreen />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.leftCol}>
          <img
            className={styles.leftBg}
            alt="Modern university campus building with glass facade"
            src= {ksrceImage}
          />
          <div className={styles.leftFade} />

          <Link className={styles.backBtn} to="/">
            <span className="material-symbols-outlined">arrow_back</span>
            BACK TO HOME
          </Link>

          <div className={styles.leftBody}>
            <div className={styles.hero}>
              <span className={styles.pill}>ADMIN PORTAL</span>
              <h1 className={styles.heroHead}>
                Empowering <br />
                Excellence in <br />
                <span className={styles.heroAccent}>Engineering Education</span>
              </h1>
              <p className={styles.heroSub}>
                Seamlessly manage campus facilities, academic schedules, and institutional resources through our secure centralized booking system.
              </p>
            </div>

            <div className={styles.quote}>
              <div className={styles.quoteBar} />
              <div>
                <p className={styles.quoteTxt}>“Where future begins”</p>
                <p className={styles.quoteFrom}>K.S.R. College of Engineering</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <Link className={`${styles.backBtn} ${styles.mobileBackBtn}`} to="/">
            ← Back to Home
          </Link>

          <div className={styles.form}>
            <div className={styles.brand}>
              <div className={styles.brandRow}>
                <img alt="KSRCE Logo" className={styles.logoRight} src={ksrceLogo} />
                <span className={styles.brandNameRight}>KSR College of Engineering</span>
              </div>
              <div className={styles.brandDivider} />
              <h2 className={styles.welcomeHead}>Welcome Back</h2>
            </div>

            <form className={styles.formInner} action="#" onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  Institutional Email
                </label>
                <div className={styles.inputBox} style={inputContainerStyle}>
                  <div className={styles.inputIco} aria-hidden="true">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <input
                    className={styles.input}
                    id="email"
                    placeholder="admin@ksrce.ac.in"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  Secure Password
                </label>
                <div className={styles.inputBox} style={inputContainerStyle}>
                  <div className={styles.inputIco} aria-hidden="true">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <input
                    className={styles.input}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {authError ? (
                <p style={{ margin: '-0.25rem 0 0', color: '#dc2626', fontSize: '0.875rem', fontWeight: 600 }}>
                  {authError}
                </p>
              ) : null}

              <button className={styles.submit} type="submit">
                Authenticate
                <span className={styles.submitIco + ' material-symbols-outlined'}>arrow_forward</span>
              </button>
            </form>

            <div className={styles.footer}>
              <div className={styles.footerBody}>
                <p className={styles.footerTagline}>Secured Access Portal</p>

                <div className={styles.trust}>
                  <div className={styles.trustBadge} title="National Board of Accreditation">
                    <img src={nbaLogo} alt="NBA" className={styles.nbaLogo} />
                    <span className={styles.trustLbl}>NBA Accreditated</span>
                  </div>

                  <div className={styles.trustSep} />

                  <div className={styles.trustBadge} title="NAAC A++ Accredited">
                    <img src={naacLogo} alt="NAAC" className={styles.naacLogo}/>
                    <span className={styles.trustLbl}>NAAC A++</span>
                  </div>
                </div>

                <p className={styles.copyright}> 2026 K.S.R College of Engineering. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}