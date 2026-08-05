import React, { useEffect, useMemo, useRef, useState } from 'react'

import Calendar from '../Calendar'
import TimePickerField from '../TimePickerField'
import styles from './InternalBookingModal.module.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── helpers (same as BookingFormPage) ───────────────────────────────────────

function formatDisplayDate(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}-${month}-${year}`
}

function parseISODate(isoDate) {
  if (!isoDate) return undefined
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return undefined
  const d = new Date(year, month - 1, day)
  d.setHours(0, 0, 0, 0)
  return d
}

function toISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function timePartsToMinutes(parts) {
  let h = Number(parts.hour)
  const m = Number(parts.minute)
  if (parts.period === 'PM' && h !== 12) h += 12
  if (parts.period === 'AM' && h === 12) h = 0
  return h * 60 + m
}

function timePartsToString(parts) {
  if (!parts.hour || !parts.minute || !parts.period) return ''
  return `${parts.hour}:${parts.minute} ${parts.period}`
}

function formatDate(isoDate) {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00`)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

// ── component ────────────────────────────────────────────────────────────────

const EMPTY_TIME = { hour: '', minute: '', period: 'AM' }

export default function InternalBookingModal({ isOpen, onClose }) {
  const [step, setStep] = useState('form')

  // form fields
  const [eventTitle, setEventTitle] = useState('')
  const [venueId, setVenueId] = useState('')
  const [date, setDate] = useState('')                             // ISO YYYY-MM-DD
  const [timeSlotStart, setTimeSlotStart] = useState(EMPTY_TIME)  // { hour, minute, period }
  const [timeSlotEnd, setTimeSlotEnd] = useState({ ...EMPTY_TIME, period: 'PM' })
  const [organizer, setOrganizer] = useState('')
  const [attendees, setAttendees] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)

  // calendar popover
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const calendarRef = useRef(null)

  // tooltip
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const tooltipRef = useRef(null)

  // venues
  const [venues, setVenues] = useState([])
  const [venuesLoading, setVenuesLoading] = useState(false)
  const [venuesError, setVenuesError] = useState('')

  // submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── fetch venues when modal opens ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const controller = new AbortController()
    const token = localStorage.getItem('token')

    setVenuesLoading(true)
    setVenuesError('')

    fetch(`${API_URL}/api/venues`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load venues')
        return res.json()
      })
      .then((payload) => {
        const list = payload?.venues || payload?.data || payload || []
        setVenues(Array.isArray(list) ? list : [])
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setVenuesError('Could not load venues. Please try again.')
      })
      .finally(() => setVenuesLoading(false))

    return () => controller.abort()
  }, [isOpen])

  // ── close calendar on outside click ──────────────────────────────────────
  useEffect(() => {
    if (!isCalendarOpen) return undefined
    const handleClick = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setIsCalendarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isCalendarOpen])

  // ── close tooltip on outside click ───────────────────────────────────────
  useEffect(() => {
    if (!isTooltipOpen) return undefined
    const handleClick = (e) => {
      if (tooltipRef.current?.contains(e.target)) return
      setIsTooltipOpen(false)
    }
    document.addEventListener('pointerdown', handleClick)
    return () => document.removeEventListener('pointerdown', handleClick)
  }, [isTooltipOpen])

  // ── reset & close ─────────────────────────────────────────────────────────
  const handleClose = () => {
    setStep('form')
    setEventTitle('')
    setVenueId('')
    setDate('')
    setTimeSlotStart(EMPTY_TIME)
    setTimeSlotEnd({ ...EMPTY_TIME, period: 'PM' })
    setOrganizer('')
    setAttendees('')
    setIsRecurring(false)
    setIsCalendarOpen(false)
    setIsTooltipOpen(false)
    setSubmitError('')
    onClose?.()
  }

  // ── derived ───────────────────────────────────────────────────────────────
  const displayDate = useMemo(() => formatDisplayDate(date), [date])

  const startMins = timeSlotStart.hour && timeSlotStart.minute
    ? timePartsToMinutes(timeSlotStart) : null
  const endMins = timeSlotEnd.hour && timeSlotEnd.minute
    ? timePartsToMinutes(timeSlotEnd) : null
  const isEndBeforeStart = startMins !== null && endMins !== null && endMins <= startMins

  const selectedVenueObj = venues.find((v) => String(v._id) === venueId)

  const canConfirm = useMemo(() => {
    return Boolean(
      eventTitle.trim() &&
      venueId &&
      date &&
      timeSlotStart.hour && timeSlotStart.minute &&
      timeSlotEnd.hour && timeSlotEnd.minute &&
      !isEndBeforeStart &&
      organizer.trim() &&
      attendees !== '' && Number(attendees) >= 0
    )
  }, [eventTitle, venueId, date, timeSlotStart, timeSlotEnd, isEndBeforeStart, organizer, attendees])

  // ── confirm ───────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!canConfirm || isSubmitting) return
    setIsSubmitting(true)
    setSubmitError('')

    const authToken = localStorage.getItem('token')

    const body = {
      eventPurpose: eventTitle.trim(),
      organizer: organizer.trim(),
      venue: venueId,
      venueName: selectedVenueObj?.name || '',
      date,
      timeSlot: {
        start: timePartsToString(timeSlotStart),
        end: timePartsToString(timeSlotEnd),
      },
      isRecurring,
      source: 'internal',
      attendees: Number(attendees),
    }

    try {
      const res = await fetch(`${API_URL}/api/bookings/internal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({}))
        throw new Error(errPayload?.message || `Server error ${res.status}`)
      }

      setStep('success')
    } catch (err) {
      setSubmitError(err?.message || 'Failed to confirm booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.overlay}>
      {step === 'form' ? (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="internal-booking-title">
          <div className={styles.header}>
            <h2 className={styles.title} id="internal-booking-title">New Internal Booking</h2>
            <button className={styles.closeBtn} type="button" onClick={handleClose} aria-label="Close modal">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 200" }}>close</span>
            </button>
          </div>

          <div className={styles.formBody}>

            {/* Event Title */}
            <label className={styles.field}>
              <span className={styles.label}>Event Title</span>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g., HOD Meeting"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </label>

            {/* Venue */}
            <label className={styles.field}>
              <span className={styles.label}>Venue</span>
              <select
                className={styles.input}
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                disabled={venuesLoading}
              >
                <option value="" disabled>
                  {venuesLoading ? 'Loading venues…' : venuesError ? 'Error loading venues' : 'Select a venue'}
                </option>
                {venues.map((v) => (
                  <option key={v._id} value={String(v._id)}>
                    {v.name}
                  </option>
                ))}
              </select>
              {venuesError && <span className={styles.fieldError}>{venuesError}</span>}
            </label>

            {/* Date — identical pattern to BookingFormPage */}
            <div className={styles.field}>
              <span className={styles.label}>Date of Event</span>
              <div
                className={styles.dateInputWrap}
                onClick={() => setIsCalendarOpen(true)}
              >
                <input
                  type="text"
                  readOnly
                  value={displayDate}
                  placeholder="Select a date"
                  className={styles.dateInput}
                />
                <span className={styles.dateIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              {isCalendarOpen && (
                <div className={styles.calendarPopover} ref={calendarRef}>
                  <Calendar
                    selectedDate={parseISODate(date) || new Date()}
                    onDateSelect={(selected) => {
                      setDate(toISODate(selected))
                      setIsCalendarOpen(false)
                    }}
                    minDate={new Date()}
                  />
                </div>
              )}
            </div>

            {/* Time pickers — same component & same value shape as BookingFormPage */}
            <div className={styles.timePickersRow}>
              <TimePickerField
                id="internal-booking-start"
                label="Time Slot Start"
                value={timeSlotStart}
                onChange={(next) => setTimeSlotStart(next)}
              />
              <TimePickerField
                id="internal-booking-end"
                label="Time Slot End"
                value={timeSlotEnd}
                onChange={(next) => setTimeSlotEnd(next)}
                errorMsg={isEndBeforeStart ? 'End time must be after start time.' : undefined}
              />
            </div>

            {/* Organizer */}
            <label className={styles.field}>
              <span className={styles.label}>Organizer</span>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g., Principal's Office"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
              />
            </label>

            {/* Attendees */}
            <label className={styles.field}>
              <span className={styles.label}>Total Attendees</span>
              <input
                className={styles.input}
                type="number"
                min="0"
                placeholder="e.g. 50"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </label>

            {/* Recurring checkbox */}
            <label className={styles.checkboxRow}>
              <input
                className={styles.checkbox}
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <span className={styles.checkboxText}>Recurring Event?</span>
              <span
                className={styles.infoTooltipWrap}
                ref={tooltipRef}
                onMouseEnter={() => setIsTooltipOpen(true)}
                onMouseLeave={() => setIsTooltipOpen(false)}
              >
                <button
                  aria-expanded={isTooltipOpen}
                  aria-label="Recurring event help"
                  className={styles.infoIconBtn}
                  onClick={() => setIsTooltipOpen((p) => !p)}
                  type="button"
                >
                  <span className={styles.infoIcon}>info</span>
                </button>
                {isTooltipOpen && (
                  <div className={styles.tooltipBubble} role="tooltip">
                    Set weekly or monthly repetition.
                  </div>
                )}
              </span>
            </label>

            {submitError && <p className={styles.fieldError}>{submitError}</p>}
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelBtn} type="button" onClick={handleClose}>Cancel</button>
            <button
              className={styles.confirmBtn}
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm || isSubmitting}
            >
              {isSubmitting ? <span className={styles.btnSpinner} /> : <span className="material-icons">add</span>}
              {isSubmitting ? 'Saving…' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      ) : (
        /* Success screen */
        <div className={styles.successModal} role="dialog" aria-modal="true" aria-labelledby="booking-confirmed-title">
          <div className={styles.successIconWrap}>
            <span className="material-icons">check_circle</span>
          </div>
          <h2 className={styles.successTitle} id="booking-confirmed-title">Booking Confirmed!</h2>
          <p className={styles.successDescription}>
            <strong>&apos;{eventTitle.trim() || 'Untitled Event'}&apos;</strong> has been successfully scheduled
            for <strong>{formatDate(date) || 'the selected date'}</strong>
            {selectedVenueObj?.name ? <> at <strong>{selectedVenueObj.name}</strong></> : ''}.
          </p>
          <div className={styles.successActions}>
            <button className={styles.doneBtn} type="button" onClick={handleClose}>Done</button>
            <button className={styles.linkBtn} type="button" onClick={handleClose}>View in Availability Tracker</button>
          </div>
        </div>
      )}
    </div>
  )
}
