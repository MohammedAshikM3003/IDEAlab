import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import styles from './BookingFormPage.module.css'
import ksrLogo from '../assets/KSRCElogo.svg'
import Calendar from './Calendar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const initialForm = {
  requesterName: '',
  requesterEmail: '',
  department: '',
  venue: '',
  purpose: '',
  eventDate: '',
  timeSlotStart: { hour: '', minute: '', period: 'AM' },
  timeSlotEnd: { hour: '', minute: '', period: 'PM' },
  attendance: '',
  equipment: '',
  supervisor: '',
}

// ─── Time Spinner Picker ─────────────────────────────────────────────────────
function TimeSpinnerPicker({ id, value, onChange, hasError }) {
  // Safe-parse: treat missing/invalid hour as 10, minute as 00, period as AM
  const safeHour = (value && value.hour) || '10'
  const safeMinute = (value && value.minute != null) ? value.minute : '00'
  const safePeriod = (value && (value.period === 'AM' || value.period === 'PM'))
    ? value.period
    : 'AM'

  // Resolve numeric base — always a finite integer before clamping
  const numHour = Number(safeHour)
  const numMinute = Number(safeMinute)
  const baseHour = Number.isFinite(numHour) ? numHour : 10
  const baseMinute = Number.isFinite(numMinute) ? numMinute : 0

  function clampHour(n) {
    if (!Number.isFinite(n) || n < 1) return 12   // NaN / < 1 → wrap to 12
    if (n > 12) return 1                           // > 12  → wrap to 1
    return n
  }

  function clampMinute(n) {
    if (!Number.isFinite(n)) return 0   // NaN → reset to 0
    if (n < 0) return 59               // underflow  → wrap to 59
    if (n > 59) return 0               // overflow   → wrap to 0
    return n
  }

  function stepHour(delta) {
    const next = clampHour(baseHour + delta)
    onChange({ ...value, hour: String(next).padStart(2, '0'), minute: safeMinute, period: safePeriod })
  }

  function stepMinute(delta) {
    const next = clampMinute(baseMinute + delta)
    onChange({ ...value, hour: safeHour, minute: String(next).padStart(2, '0'), period: safePeriod })
  }

  function handleHourInput(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 2)
    onChange({ ...value, hour: raw, minute: safeMinute, period: safePeriod })
  }

  function handleHourBlur(e) {
    const n = Number(e.target.value)
    const clamped = Number.isFinite(n) && n >= 1 && n <= 12 ? n : 10
    onChange({ ...value, hour: String(clamped).padStart(2, '0'), minute: safeMinute, period: safePeriod })
  }

  function handleMinuteInput(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 2)
    onChange({ ...value, hour: safeHour, minute: raw, period: safePeriod })
  }

  function handleMinuteBlur(e) {
    const n = Number(e.target.value)
    const clamped = Number.isFinite(n) && n >= 0 && n <= 59 ? n : 0
    onChange({ ...value, hour: safeHour, minute: String(clamped).padStart(2, '0'), period: safePeriod })
  }

  return (
    <div
      className={`${styles.timeSpinnerWrapper}${hasError ? ' ' + styles.timeSpinnerError : ''}`}
      role="group"
      aria-label="Time picker"
    >
      {/* HH spinner */}
      <div className={styles.spinnerUnit}>
        <div className={styles.spinnerLabel}>HH</div>
        <button
          type="button"
          className={styles.spinnerBtn}
          onClick={() => stepHour(1)}
          aria-label="Increase hour"
          tabIndex={-1}
        >
          <svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={safeHour}
          onChange={handleHourInput}
          onBlur={handleHourBlur}
          className={styles.spinnerInput}
          aria-label="Hour"
          maxLength={2}
        />
        <button
          type="button"
          className={styles.spinnerBtn}
          onClick={() => stepHour(-1)}
          aria-label="Decrease hour"
          tabIndex={-1}
        >
          <svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </button>
      </div>

      <span className={styles.spinnerColon}>:</span>

      {/* MM spinner */}
      <div className={styles.spinnerUnit}>
        <div className={styles.spinnerLabel}>MM</div>
        <button
          type="button"
          className={styles.spinnerBtn}
          onClick={() => stepMinute(1)}
          aria-label="Increase minute"
          tabIndex={-1}
        >
          <svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={safeMinute}
          onChange={handleMinuteInput}
          onBlur={handleMinuteBlur}
          className={styles.spinnerInput}
          aria-label="Minute"
          maxLength={2}
        />
        <button
          type="button"
          className={styles.spinnerBtn}
          onClick={() => stepMinute(-1)}
          aria-label="Decrease minute"
          tabIndex={-1}
        >
          <svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </button>
      </div>

    </div>
  )
}

function TimePickerField({ id, label, value, onChange, errorMsg }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const formatTime = (h, m) => {
    if (!h && !m) return '';
    return `${h || '10'}:${m || '00'}`;
  };

  const [inputValue, setInputValue] = useState(formatTime(value.hour, value.minute));
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(formatTime(value.hour, value.minute));
  }, [value.hour, value.minute]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleInputChange = (e) => {
    let val = e.target.value.replace(/[^\d:]/g, '');
    
    if (val === '') {
      setInputValue('');
      onChange({ ...value, hour: '', minute: '' });
      return;
    }

    if (val.length === 2 && inputValue.length < 2 && !val.includes(':')) {
      val += ':';
    } else if (val.length > 2 && !val.includes(':')) {
      val = val.slice(0, 2) + ':' + val.slice(2);
    }
    if (val.length > 5) val = val.slice(0, 5);

    setInputValue(val);

    const match = val.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      let h = parseInt(match[1], 10);
      let m = parseInt(match[2], 10);
      if (h > 0 && h <= 12 && m >= 0 && m < 60) {
        onChange({ ...value, hour: String(h).padStart(2, '0'), minute: String(m).padStart(2, '0') });
      }
    }
  };

  const handleInputBlur = () => {
    setInputValue(formatTime(value.hour, value.minute));
  };

  return (
    <div className={styles.field} ref={wrapperRef}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div className={`${styles.control} ${styles.pointerCursor}`} style={{ flex: 1 }} onClick={() => setIsOpen(true)}>
          <input
            type="text"
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`${styles.input} ${styles.hasIcon} ${styles.pointerCursor}`}
            aria-invalid={Boolean(errorMsg)}
            placeholder="HH:MM"
          />
          <div className={styles.inputIcon} onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>

        <div className={styles.inlinePeriodToggle}>
          <button
            type="button"
            className={`${styles.periodBtn}${value.period === 'AM' ? ' ' + styles.periodBtnActive : ''}`}
            onClick={() => onChange({ ...value, period: 'AM' })}
            aria-pressed={value.period === 'AM'}
          >
            AM
          </button>
          <button
            type="button"
            className={`${styles.periodBtn}${value.period === 'PM' ? ' ' + styles.periodBtnActive : ''}`}
            onClick={() => onChange({ ...value, period: 'PM' })}
            aria-pressed={value.period === 'PM'}
          >
            PM
          </button>
        </div>
      </div>

      {isOpen && (
        <div className={styles.timePickerPopup}>
          <TimeSpinnerPicker
            id={`${id}-spinner`}
            value={value}
            onChange={onChange}
            hasError={Boolean(errorMsg)}
          />
        </div>
      )}
      {errorMsg ? <div className={styles.error}>{errorMsg}</div> : null}
    </div>
  );
}

function normalizeVenues(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.venues)) return data.venues
  if (data && Array.isArray(data.data)) return data.data
  return []
}

function normalizeBookingFields(data) {
  return {
    requesterName:
      (data && (data.requesterName || data.name || (data.requester && data.requester.name))) || '',
    requesterEmail:
      (data && (data.requesterEmail || data.email || (data.requester && data.requester.email))) || '',
  }
}

function parseTime(value) {
  if (!value) {
    return { hour: '', minute: '', period: '' }
  }

  const [rawHour, rawMinute] = value.split(':')
  const hourNumber = Number(rawHour)

  if (!Number.isFinite(hourNumber)) {
    return { hour: '', minute: '', period: '' }
  }

  const period = hourNumber >= 12 ? 'PM' : 'AM'
  const hour12 = hourNumber % 12 || 12

  return {
    hour: String(hour12).padStart(2, '0'),
    minute: rawMinute ? String(rawMinute).padStart(2, '0') : '',
    period,
  }
}

function buildTime(parts) {
  if (!parts.hour || !parts.minute || !parts.period) {
    return ''
  }

  let hourNumber = Number(parts.hour)

  if (parts.period === 'PM' && hourNumber !== 12) {
    hourNumber += 12
  }

  if (parts.period === 'AM' && hourNumber === 12) {
    hourNumber = 0
  }

  return `${String(hourNumber).padStart(2, '0')}:${parts.minute}`
}

function BookingFormPage() {
  const [searchParams] = useSearchParams()
  const token = useMemo(() => {
    const tokenValue = searchParams.get('token')
    return tokenValue ? tokenValue.trim() : ''
  }, [searchParams])

  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [linkStatus, setLinkStatus] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const calendarRef = useRef(null)

  const displayDate = useMemo(() => {
    if (!form.eventDate) return ''
    const [year, month, day] = form.eventDate.split('-')
    return `${day}-${month}-${year}`
  }, [form.eventDate])

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      if (!token) {
        if (isMounted) {
          setLinkStatus('invalid')
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setLoadError('')
      setLinkStatus('loading')

      try {
        const [venuesRes, bookingRes] = await Promise.all([
          fetch(`${API_URL}/api/venues/public`),
          fetch(`${API_URL}/api/bookings/by-token/${encodeURIComponent(token)}`),
        ])

        const bookingData = await bookingRes.json().catch(() => null)

        if (!bookingRes.ok) {
          if (isMounted) {
            setLinkStatus((bookingData && bookingData.status) || 'invalid')
            setLoading(false)
          }
          return
        }

        const venueData = venuesRes.ok ? await venuesRes.json() : null

        if (isMounted) {
          if (!venuesRes.ok) {
            setLoadError('Unable to load venues right now. Please try again later.')
          }

          if (bookingData && bookingData.status && bookingData.status !== 'active') {
            setLinkStatus(bookingData.status)
            setLoading(false)
            return
          }

          const normalizedVenues = normalizeVenues(venueData)
          const bookingFields = normalizeBookingFields(bookingData)

          setVenues(normalizedVenues)
          setForm((prev) => ({
            ...prev,
            requesterName: bookingFields.requesterName,
            requesterEmail: bookingFields.requesterEmail,
          }))
          setLinkStatus('active')
          setLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          setLinkStatus('invalid')
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [token])

  useEffect(() => {
    if (!isCalendarOpen) return

    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCalendarOpen])

  const venueOptions = useMemo(() => {
    return venues
      .map((venue) => {
        if (typeof venue === 'string') {
          return { id: venue, name: venue }
        }

        const name = venue && (venue.name || venue.venueName || venue.title || venue.label)
        const id = venue && (venue._id || venue.id || name)

        return name ? { id: String(id || name), name: String(name) } : null
      })
      .filter(Boolean)
  }, [venues])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  function handleDateSelect(date) {
    setForm((prev) => ({ ...prev, eventDate: date.toISOString().split('T')[0] }))
    setIsCalendarOpen(false)
    if (errors.eventDate) {
      setErrors((prev) => ({ ...prev, eventDate: '' }))
    }
  }

  function handleTimeChange(field, nextValue) {
    setForm((prev) => ({ ...prev, [field]: nextValue }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function timePartsToMinutes(parts) {
    let h = Number(parts.hour)
    const m = Number(parts.minute)
    if (parts.period === 'PM' && h !== 12) h += 12
    if (parts.period === 'AM' && h === 12) h = 0
    return h * 60 + m
  }

  function timePartsToString(parts) {
    return `${parts.hour}:${parts.minute} ${parts.period}`
  }

  function validateForm() {
    const nextErrors = {}

    if (!form.department.trim()) nextErrors.department = 'Department is required.'
    if (!form.venue) nextErrors.venue = 'Please select a venue.'
    if (!form.purpose.trim()) nextErrors.purpose = 'Event purpose is required.'
    if (!form.eventDate) nextErrors.eventDate = 'Event date is required.'

    const startMins = timePartsToMinutes(form.timeSlotStart)
    const endMins = timePartsToMinutes(form.timeSlotEnd)

    if (!form.timeSlotStart.hour) nextErrors.timeSlotStart = 'Start time is required.'
    if (!form.timeSlotEnd.hour) nextErrors.timeSlotEnd = 'End time is required.'
    if (form.timeSlotStart.hour && form.timeSlotEnd.hour && endMins <= startMins) {
      nextErrors.timeSlotEnd = 'End time must be after start time.'
    }
    if (!form.attendance || Number(form.attendance) <= 0) {
      nextErrors.attendance = 'Expected attendance is required.'
    }
    if (!form.supervisor.trim()) nextErrors.supervisor = 'Supervisor name is required.'

    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const nextErrors = validateForm()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        token: token,
        email: form.requesterEmail,
        name: form.requesterName,
        department: form.department,
        venue: form.venue,
        purpose: form.purpose,
        eventDate: String(form.eventDate),
        timeSlot: `${timePartsToString(form.timeSlotStart)} - ${timePartsToString(form.timeSlotEnd)}`,
        attendance: Number(form.attendance),
        equipment: form.equipment || '',
        supervisor: form.supervisor,
      }

      const response = await fetch(`${API_URL}/api/bookings/form-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Submit failed')
      }

      setIsSubmitted(true)
    } catch (error) {
      setSubmitError('Unable to submit the form. Please try again.')
      setIsSubmitting(false)
    }
  }

  const headerContent = (
    <div className={styles.collegeHeader}>
      <img src={ksrLogo} alt="KSR College Logo" className={styles.collegeLogo} />
      <div className={styles.collegeText}>
        <div className={styles.collegeName}>KSR College of Engineering</div>
        <div className={styles.collegeMeta}>AICTE Idea Lab - Venue Booking Form</div>
      </div>
    </div>
  )



  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          {headerContent}
          <div className={styles.headerDivider} />
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <div className={styles.loadingText}>Loading booking details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (linkStatus !== 'active') {
    const statusConfig = {
      invalid: {
        title: 'Invalid booking link',
        message: 'This booking link is invalid.',
        tone: styles.statusError,
        icon: (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M8 8l8 8M16 8l-8 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
      used: {
        title: 'Form already submitted',
        message: 'You have already submitted this form. Thank you!',
        tone: styles.statusInfo,
        icon: (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M8 12l3 3 5-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
      expired: {
        title: 'Link expired',
        message: 'This booking link has expired. Please contact the admin for a new link.',
        tone: styles.statusWarning,
        icon: (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 7v5l3 2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
    }

    const status = statusConfig[linkStatus] || statusConfig.invalid

    return (
      <div className={styles.page}>
        <div className={styles.card}>
          {headerContent}
          <div className={styles.headerDivider} />
          <div className={styles.statusBody}>
            <div className={`${styles.statusBadge} ${status.tone}`}>{status.icon}</div>
            <h2 className={styles.statusTitle}>{status.title}</h2>
            <p className={styles.statusText}>{status.message}</p>
          </div>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          {headerContent}
          <div className={styles.headerDivider} />
          <div className={styles.statusBody}>
            <div className={`${styles.statusBadge} ${styles.statusSuccess}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M8 12l3 3 5-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className={styles.statusTitle}>Booking request submitted</h2>
            <p className={styles.statusText}>You will receive a confirmation email shortly.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {headerContent}
        <div className={styles.headerDivider} />

        {loadError ? <div className={styles.banner}>{loadError}</div> : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Requester Information</span>
              <span className={styles.sectionLine} />
            </div>
            <div className={styles.sectionGrid}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="requesterName">
                  Requester Name
                </label>
                <div className={`${styles.control} ${styles.controlReadOnly}`}>
                  <input
                    id="requesterName"
                    name="requesterName"
                    type="text"
                    value={form.requesterName}
                    readOnly
                    className={`${styles.input} ${styles.readonlyInput} ${styles.hasIcon}`}
                  />
                  <span className={styles.inputIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M7 10V7a5 5 0 0110 0v3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="requesterEmail">
                  Requester Email
                </label>
                <div className={`${styles.control} ${styles.controlReadOnly}`}>
                  <input
                    id="requesterEmail"
                    name="requesterEmail"
                    type="email"
                    value={form.requesterEmail}
                    readOnly
                    className={`${styles.input} ${styles.readonlyInput} ${styles.hasIcon}`}
                  />
                  <span className={styles.inputIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M7 10V7a5 5 0 0110 0v3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Booking Details</span>
              <span className={styles.sectionLine} />
            </div>
            <div className={styles.sectionGrid}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="department">
                  Department
                </label>
                <div className={styles.control}>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={form.department}
                    onChange={handleChange}
                    required
                    placeholder="Computer Science and Engineering"
                    aria-invalid={Boolean(errors.department)}
                    className={styles.input}
                  />
                </div>
                {errors.department ? <div className={styles.error}>{errors.department}</div> : null}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="venue">
                  Venue Requested
                </label>
                <div className={styles.control}>
                  <select
                    id="venue"
                    name="venue"
                    value={form.venue}
                    onChange={handleChange}
                    required
                    aria-invalid={Boolean(errors.venue)}
                    className={styles.select}
                  >
                    <option value="">Select a venue</option>
                    {venueOptions.map((venue) => (
                      <option key={venue.id} value={venue.name}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.venue ? <div className={styles.error}>{errors.venue}</div> : null}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="purpose">
                  Event Purpose
                </label>
                <div className={styles.control}>
                  <input
                    id="purpose"
                    name="purpose"
                    type="text"
                    value={form.purpose}
                    onChange={handleChange}
                    required
                    placeholder="Workshop / Seminar / Training"
                    aria-invalid={Boolean(errors.purpose)}
                    className={styles.input}
                  />
                </div>
                {errors.purpose ? <div className={styles.error}>{errors.purpose}</div> : null}
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Schedule</span>
              <span className={styles.sectionLine} />
            </div>
            <div className={styles.sectionGrid}>
              <div className={styles.field}>
                <label htmlFor="eventDate" className={styles.fieldLabel}>
                  Date of Event
                </label>
                <div className={`${styles.control} ${styles.pointerCursor}`} onClick={() => setIsCalendarOpen(true)}>
                  <input
                    type="text"
                    id="eventDate"
                    name="eventDate"
                    value={displayDate}
                    readOnly
                    className={`${styles.input} ${styles.hasIcon} ${styles.pointerCursor}`}
                    placeholder="Select a date"
                  />
                  <div className={styles.inputIcon} onClick={() => setIsCalendarOpen(true)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                {isCalendarOpen && (
                  <div className={styles.calendarWrapper} ref={calendarRef}>
                    <Calendar
                      selectedDate={form.eventDate ? new Date(form.eventDate) : new Date()}
                      onDateSelect={handleDateSelect}
                      minDate={new Date()}
                    />
                  </div>
                )}
                {errors.eventDate && <p className={styles.error}>{errors.eventDate}</p>}
              </div>

              <TimePickerField
                id="timeSlotStart"
                label="Time Slot Start"
                value={form.timeSlotStart}
                onChange={(next) => handleTimeChange('timeSlotStart', next)}
                errorMsg={errors.timeSlotStart}
              />

              <TimePickerField
                id="timeSlotEnd"
                label="Time Slot End"
                value={form.timeSlotEnd}
                onChange={(next) => handleTimeChange('timeSlotEnd', next)}
                errorMsg={errors.timeSlotEnd}
              />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Additional Information</span>
              <span className={styles.sectionLine} />
            </div>
            <div className={styles.sectionGrid}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="attendance">
                  Expected Attendance
                </label>
                <div className={styles.control}>
                  <input
                    id="attendance"
                    name="attendance"
                    type="number"
                    min="1"
                    value={form.attendance}
                    onChange={handleChange}
                    required
                    placeholder="150"
                    aria-invalid={Boolean(errors.attendance)}
                    className={styles.input}
                  />
                </div>
                {errors.attendance ? <div className={styles.error}>{errors.attendance}</div> : null}
              </div>

              <div className={`${styles.field} ${styles.full}`}>
                <label className={styles.fieldLabel} htmlFor="equipment">
                  Equipment Required (Optional)
                </label>
                <div className={`${styles.control} ${styles.controlTextarea}`}>
                  <textarea
                    id="equipment"
                    name="equipment"
                    value={form.equipment}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Projector, sound system, lab kits..."
                    className={styles.textarea}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="supervisor">
                  Supervisor Name
                </label>
                <div className={styles.control}>
                  <input
                    id="supervisor"
                    name="supervisor"
                    type="text"
                    value={form.supervisor}
                    onChange={handleChange}
                    required
                    placeholder="Faculty in charge"
                    aria-invalid={Boolean(errors.supervisor)}
                    className={styles.input}
                  />
                </div>
                {errors.supervisor ? <div className={styles.error}>{errors.supervisor}</div> : null}
              </div>
            </div>
          </section>

          {submitError ? <div className={styles.submitError}>{submitError}</div> : null}

          <button className={styles.submitButton} type="submit" disabled={isSubmitting || isSubmitted}>
            {isSubmitting ? (
              <>
                <span className={styles.buttonSpinner} aria-hidden="true" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Booking Request</span>
                <span className={styles.submitArrow} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M5 12h12M13 6l6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookingFormPage
