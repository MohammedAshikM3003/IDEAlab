import React, { useMemo, useState } from 'react'

import styles from './InternalBookingModal.module.css'

const VENUES = [
  { value: '', label: 'Select a venue' },
  { value: 'aicte', label: 'AICTE Idea Lab' },
  { value: 'seminar', label: 'Seminar Hall' },
  { value: 'conference', label: 'Conference Room' },
  { value: 'mini', label: 'Mini Hall' },
]

const formatDate = (isoDate) => {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00`)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
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

  const handleClose = () => {
    setStep('form')
    setEventTitle('')
    setVenue('')
    setDate('')
    setStartTime('')
    setEndTime('')
    setOrganizer('')
    setIsRecurring(false)
    onClose?.()
  }

  const isSlotCheckReady = Boolean(date && startTime && endTime)

  const canConfirm = useMemo(() => {
    return Boolean(eventTitle.trim() && venue && date && startTime && endTime && organizer.trim())
  }, [date, endTime, eventTitle, organizer, startTime, venue])

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
              <div className={styles.inputWrap}>
                <input
                  className={`${styles.input} native-datetime`}
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <span className={styles.inputIcon}><span className="material-icons">calendar_month</span></span>
              </div>
            </label>

            <div className={styles.timeGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Start Time</span>
                <div className={styles.inputWrap}>
                  <input
                    className={`${styles.input} native-datetime`}
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  <span className={styles.inputIcon}><span className="material-icons">schedule</span></span>
                </div>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>End Time</span>
                <div className={styles.inputWrap}>
                  <input
                    className={`${styles.input} native-datetime`}
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                  <span className={styles.inputIcon}><span className="material-icons">schedule</span></span>
                </div>
              </label>
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
              <span className={styles.infoIcon} title="Set weekly or monthly repetition">info</span>
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
