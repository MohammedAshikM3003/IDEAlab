import React, { useMemo, useState } from "react";

import styles from "./AdminInternalBookingPopUpFM.module.css";

export default function AdminInternalBookingPopUpFM({
  onClose,
  onConfirm,
  prefilledVenue = "",
  initialEventTitle = "",
  initialDate = "",
  initialStartTime = "",
  initialEndTime = "",
  initialOrganizer = "",
  initialRecurring = false,
  venues = [
    { value: "aicte-idea-lab", label: "AICTE Idea Lab" },
    { value: "seminar-hall", label: "Seminar Hall" },
    { value: "conference-room-a", label: "Conference Room A" },
    { value: "main-auditorium", label: "Main Auditorium" },
  ],
}) {
  const [eventTitle, setEventTitle] = useState(initialEventTitle);
  const [venue, setVenue] = useState(prefilledVenue);
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [organizer, setOrganizer] = useState(initialOrganizer);
  const [isRecurring, setIsRecurring] = useState(initialRecurring);

  const isSlotAvailable = useMemo(() => Boolean(startTime && endTime), [startTime, endTime]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm({
        eventTitle,
        venue,
        date,
        startTime,
        endTime,
        organizer,
        isRecurring,
      });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.backdrop} role="dialog" aria-modal="true">
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.title}>New Internal Booking</h2>

            <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.section}>
              <label className={styles.label} htmlFor="internal-event-title">
                Event Title
              </label>
              <input
                className={styles.textInput}
                id="internal-event-title"
                type="text"
                placeholder="e.g., HOD Meeting"
                value={eventTitle}
                onChange={(event) => setEventTitle(event.target.value)}
              />
            </div>

            <div className={styles.section}>
              <label className={styles.label} htmlFor="internal-venue">
                Venue
              </label>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  id="internal-venue"
                  value={venue}
                  onChange={(event) => setVenue(event.target.value)}
                >
                  <option value="">Select a venue</option>
                  {venues.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className={`${styles.iconRight} material-symbols-outlined`} aria-hidden="true">
                  expand_more
                </span>
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.label} htmlFor="internal-date">
                Date
              </label>
              <div className={styles.inputWithIcon}>
                <input
                  className={styles.textInput}
                  id="internal-date"
                  type="date"
                  placeholder="mm/dd/yyyy"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
                <span className={`${styles.iconRight} material-symbols-outlined`} aria-hidden="true">
                  calendar_month
                </span>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.timeGrid}>
                <div className={styles.timeField}>
                  <label className={styles.label} htmlFor="internal-start-time">
                    Start Time
                  </label>
                  <input
                    className={styles.textInput}
                    id="internal-start-time"
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  />
                </div>

                <div className={styles.timeField}>
                  <label className={styles.label} htmlFor="internal-end-time">
                    End Time
                  </label>
                  <input
                    className={styles.textInput}
                    id="internal-end-time"
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                  />
                </div>
              </div>

              {isSlotAvailable ? (
                <div className={styles.slotAvailable}>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    check_circle
                  </span>
                  <span>Slot Available</span>
                </div>
              ) : null}
            </div>

            <div className={styles.section}>
              <label className={styles.label} htmlFor="internal-organizer">
                Organizer
              </label>
              <input
                className={styles.textInput}
                id="internal-organizer"
                type="text"
                placeholder="e.g., Principal's Office"
                value={organizer}
                onChange={(event) => setOrganizer(event.target.value)}
              />
            </div>

            <label className={styles.recurringRow}>
              <input
                className={styles.checkbox}
                type="checkbox"
                checked={isRecurring}
                onChange={(event) => setIsRecurring(event.target.checked)}
              />
              <span className={styles.recurringLabel}>Recurring Event?</span>
              <span className={`${styles.infoIcon} material-symbols-outlined`} aria-hidden="true">
                info
              </span>
            </label>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelBtn} type="button" onClick={onClose}>
              Cancel
            </button>

            <button className={styles.primaryBtn} type="button" onClick={handleConfirm}>
              <span className="material-symbols-outlined">add</span>
              <span>Confirm Booking</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
