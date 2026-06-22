import React, { useEffect, useMemo, useRef, useState } from 'react'

import Calendar from '../Calendar'
import styles from './InternalBookingModal.module.css'

import TimePickerField from '../TimePickerField'

const VENUES = [
  { value: '', label: 'Select a venue' },
  { value: 'aicte', label: 'AICTE Idea Lab' },
  { value: 'seminar', label: 'Seminar Hall' },
  { value: 'conference', label: 'Conference Room' },
  { value: 'mini', label: 'Mini Hall' },
]

const HOUR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => i)

const formatDate = (isoDate) => {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00`)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

const parseISODate = (isoDate) => {
  if (!isoDate) return undefined
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return undefined
  const parsed = new Date(year, month - 1, day)
  parsed.setHours(0, 0, 0, 0)
  return parsed
}

const toISODate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseTimeValue = (timeValue) => {
  if (!timeValue) return { hour: '', minute: '', period: 'AM' }

  const [hourRaw, minuteRaw] = timeValue.split(':').map(Number)
  if (!Number.isInteger(hourRaw) || !Number.isInteger(minuteRaw)) {
    return { hour: '', minute: '', period: 'AM' }
  }

  const period = hourRaw >= 12 ? 'PM' : 'AM'
  const hour12 = hourRaw % 12 || 12
  const minute = String(Math.max(0, Math.min(59, minuteRaw))).padStart(2, '0')
  return { hour: String(hour12).padStart(2, '0'), minute, period }
}

const to24HourTime = (hour, minute, period) => {
  if (!hour || !minute) return ''
  let hour24 = Number(hour) % 12
  if (period === 'PM') hour24 += 12
  return `${String(hour24).padStart(2, '0')}:${minute}`
}

const toMinutes = (timeValue) => {
  if (!timeValue) return null
  const [hourRaw, minuteRaw] = timeValue.split(':').map(Number)
  if (!Number.isInteger(hourRaw) || !Number.isInteger(minuteRaw)) return null
  return hourRaw * 60 + minuteRaw
}

export default function InternalBookingModal({ isOpen, onClose }) {
  const [step, setStep] = useState('form')
  const [eventTitle, setEventTitle] = useState('')
  const [venue, setVenue] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [organizer, setOrganizer] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const tooltipRef = useRef(null)

  const handleClose = () => {
    setStep('form')
    setEventTitle('')
    setVenue('')
    setDate('')
    setStartTime('')
    setEndTime('')
    setOrganizer('')
    setIsRecurring(false)
    setIsTooltipOpen(false)
    onClose?.()
  }

  useEffect(() => {
    if (!isTooltipOpen) return undefined

    const handleOutsidePress = (event) => {
      if (tooltipRef.current?.contains(event.target)) return
      setIsTooltipOpen(false)
    }

    document.addEventListener('pointerdown', handleOutsidePress)
    return () => document.removeEventListener('pointerdown', handleOutsidePress)
  }, [isTooltipOpen])

  const isSlotCheckReady = Boolean(date && startTime && endTime)

  const canConfirm = useMemo(() => {
    return Boolean(eventTitle.trim() && venue && date && startTime && endTime && organizer.trim())
  }, [date, endTime, eventTitle, organizer, startTime, venue])

  const startParts = parseTimeValue(startTime)
  const endParts = parseTimeValue(endTime)
  const isEndBeforeStart = toMinutes(startTime) !== null && toMinutes(endTime) !== null && toMinutes(endTime) < toMinutes(startTime)



  const normalizedEventTitle = (eventTitle || '').trim().replace(/\s+/g, ' ')
  const successEventTitle = normalizedEventTitle || 'Untitled Event'

  if (!isOpen) return null

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

            <label className={styles.field}>
              <span className={styles.label}>Venue</span>
              <select className={styles.input} value={venue} onChange={(e) => setVenue(e.target.value)}>
                {VENUES.map((item) => (
                  <option key={item.label} value={item.value} disabled={!item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Date</span>
              <div className={styles.calendarWrap}>
                <Calendar
                  availabilityData={{}}
                  onDateSelect={(selected) => setDate(toISODate(selected))}
                  selectedDate={parseISODate(date)}
                />
              </div>
            </label>

            <div className={styles.timePickersRow}>
              <TimePickerField
                id="internal-booking-start"
                label="Time Slot Start"
                value={startParts}
                onChange={(next) => setStartTime(to24HourTime(next.hour, next.minute, next.period))}
              />

              <TimePickerField
                id="internal-booking-end"
                label="Time Slot End"
                value={endParts}
                onChange={(next) => setEndTime(to24HourTime(next.hour, next.minute, next.period))}
                errorMsg={isEndBeforeStart ? "End time before start" : undefined}
              />
            </div>

            {isSlotCheckReady ? (
              <div className={styles.slotAvailable}>
                <span className="material-icons">check_circle</span>
                <span>Slot Available</span>
              </div>
            ) : null}

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

            <label className={styles.checkboxRow}>
              <input className={styles.checkbox} type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
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
                  onClick={() => setIsTooltipOpen((previous) => !previous)}
                  type="button"
                >
                  <span className={styles.infoIcon}>info</span>
                </button>

                {isTooltipOpen ? (
                  <div className={styles.tooltipBubble} role="tooltip">
                    Set weekly or monthly repetition.
                  </div>
                ) : null}
              </span>
            </label>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelBtn} type="button" onClick={handleClose}>Cancel</button>
            <button className={styles.confirmBtn} type="button" onClick={() => setStep('success')} disabled={!canConfirm}>
              <span className="material-icons">add</span>
              Confirm Booking
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.successModal} role="dialog" aria-modal="true" aria-labelledby="booking-confirmed-title">
          <div className={styles.successIconWrap}>
            <span className="material-icons">check_circle</span>
          </div>

          <h2 className={styles.successTitle} id="booking-confirmed-title">Booking Confirmed!</h2>

          <p className={styles.successDescription}>
            The <strong>&apos;{successEventTitle}&apos;</strong> has been successfully scheduled for <strong>{formatDate(date) || 'the selected date'}</strong>.
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
