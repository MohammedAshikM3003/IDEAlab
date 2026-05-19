import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import styles from './BookingFormPage.module.css'
import ksrLogo from '../assets/KSRCElogo.svg'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const initialForm = {
  requesterName: '',
  requesterEmail: '',
  department: '',
  venue: '',
  purpose: '',
  eventDate: '',
  timeSlotStart: '',
  timeSlotEnd: '',
  attendance: '',
  equipment: '',
  supervisor: '',
}

const HOURS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']
const PERIODS = ['AM', 'PM']

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

  function handleTimePartChange(field, part, value) {
    setForm((prev) => {
      const currentParts = parseTime(prev[field])
      const nextParts = {
        hour: currentParts.hour || '01',
        minute: currentParts.minute || '00',
        period: currentParts.period || 'AM',
        [part]: value,
      }
      return { ...prev, [field]: buildTime(nextParts) }
    })

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function validateForm() {
    const nextErrors = {}

    if (!form.department.trim()) nextErrors.department = 'Department is required.'
    if (!form.venue) nextErrors.venue = 'Please select a venue.'
    if (!form.purpose.trim()) nextErrors.purpose = 'Event purpose is required.'
    if (!form.eventDate) nextErrors.eventDate = 'Event date is required.'
    if (!form.timeSlotStart) nextErrors.timeSlotStart = 'Start time is required.'
    if (!form.timeSlotEnd) nextErrors.timeSlotEnd = 'End time is required.'
    if (form.timeSlotStart && form.timeSlotEnd && form.timeSlotEnd <= form.timeSlotStart) {
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
        timeSlot: `${form.timeSlotStart} - ${form.timeSlotEnd}`,
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

  const timeSlotStartParts = parseTime(form.timeSlotStart)
  const timeSlotEndParts = parseTime(form.timeSlotEnd)

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
                <label className={styles.fieldLabel} htmlFor="eventDate">
                  Event Date
                </label>
                <input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  value={form.eventDate}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(errors.eventDate)}
                  className={styles.dateControl}
                />
                {errors.eventDate ? <div className={styles.error}>{errors.eventDate}</div> : null}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="timeSlotStart">
                  Time Slot Start
                </label>
                <div className={styles.control}>
                  <div className={styles.timeRow}>
                    <select
                      id="timeSlotStart"
                      value={timeSlotStartParts.hour}
                      onChange={(event) =>
                        handleTimePartChange('timeSlotStart', 'hour', event.target.value)
                      }
                      aria-invalid={Boolean(errors.timeSlotStart)}
                      className={`${styles.select} ${styles.timeSelect}`}
                    >
                      <option value="">HH</option>
                      {HOURS.map((hour) => (
                        <option key={hour} value={hour}>
                          {Number(hour)}
                        </option>
                      ))}
                    </select>
                    <span className={styles.timeDivider}>:</span>
                    <select
                      value={timeSlotStartParts.minute}
                      onChange={(event) =>
                        handleTimePartChange('timeSlotStart', 'minute', event.target.value)
                      }
                      aria-invalid={Boolean(errors.timeSlotStart)}
                      className={`${styles.select} ${styles.timeSelect}`}
                    >
                      <option value="">MM</option>
                      {MINUTES.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                    <select
                      value={timeSlotStartParts.period}
                      onChange={(event) =>
                        handleTimePartChange('timeSlotStart', 'period', event.target.value)
                      }
                      aria-invalid={Boolean(errors.timeSlotStart)}
                      className={`${styles.select} ${styles.timeMeridiem}`}
                    >
                      <option value="">AM/PM</option>
                      {PERIODS.map((period) => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {errors.timeSlotStart ? (
                  <div className={styles.error}>{errors.timeSlotStart}</div>
                ) : null}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="timeSlotEnd">
                  Time Slot End
                </label>
                <div className={styles.control}>
                  <div className={styles.timeRow}>
                    <select
                      id="timeSlotEnd"
                      value={timeSlotEndParts.hour}
                      onChange={(event) =>
                        handleTimePartChange('timeSlotEnd', 'hour', event.target.value)
                      }
                      aria-invalid={Boolean(errors.timeSlotEnd)}
                      className={`${styles.select} ${styles.timeSelect}`}
                    >
                      <option value="">HH</option>
                      {HOURS.map((hour) => (
                        <option key={hour} value={hour}>
                          {Number(hour)}
                        </option>
                      ))}
                    </select>
                    <span className={styles.timeDivider}>:</span>
                    <select
                      value={timeSlotEndParts.minute}
                      onChange={(event) =>
                        handleTimePartChange('timeSlotEnd', 'minute', event.target.value)
                      }
                      aria-invalid={Boolean(errors.timeSlotEnd)}
                      className={`${styles.select} ${styles.timeSelect}`}
                    >
                      <option value="">MM</option>
                      {MINUTES.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                    <select
                      value={timeSlotEndParts.period}
                      onChange={(event) =>
                        handleTimePartChange('timeSlotEnd', 'period', event.target.value)
                      }
                      aria-invalid={Boolean(errors.timeSlotEnd)}
                      className={`${styles.select} ${styles.timeMeridiem}`}
                    >
                      <option value="">AM/PM</option>
                      {PERIODS.map((period) => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {errors.timeSlotEnd ? <div className={styles.error}>{errors.timeSlotEnd}</div> : null}
              </div>
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
