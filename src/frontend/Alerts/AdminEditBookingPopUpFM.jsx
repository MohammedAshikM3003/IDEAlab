import React, { useMemo, useState } from "react";

import Calendar from "../Calendar";
import styles from "./AdminEditBookingPopUpFM.module.css";

function parseISODate(isoDate) {
  if (!isoDate) {
    return undefined;
  }

  const [year, month, day] = isoDate.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  const parsed = new Date(year, month - 1, day);
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function toISODate(dateValue) {
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AdminEditBookingPopUpFM({
  onClose,
  onConfirm,
  bookingId = "#BK-2489",
  subtitle = "Modify reservation details",
  prefilledVenue = "",
  organizerHint = "",
  initialEventTitle = "",
  initialDate = "",
  initialStartTime = "",
  initialEndTime = "",
  initialOrganizer = "",
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
  const [changeNote, setChangeNote] = useState("");

  const canSave = useMemo(() => Boolean(eventTitle && venue && date && startTime && endTime), [eventTitle, venue, date, startTime, endTime]);

  const handleSave = () => {
    if (!canSave || !onConfirm) {
      return;
    }

    onConfirm({
      eventTitle,
      venue,
      date,
      startTime,
      endTime,
      organizer: initialOrganizer || organizerHint,
      changeNote,
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.backdrop} role="dialog" aria-modal="true">
        <div className={styles.modal}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>Edit Booking: {bookingId}</h2>
              <p className={styles.subtitle}>Modify reservation details for {subtitle}.</p>
            </div>

            <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.section}>
              <label className={styles.label} htmlFor="edit-event-title">
                Event Title
              </label>
              <input
                className={styles.input}
                id="edit-event-title"
                type="text"
                value={eventTitle}
                onChange={(event) => setEventTitle(event.target.value)}
              />
            </div>

            <div className={styles.section}>
              <label className={styles.label} htmlFor="edit-venue">
                Venue
              </label>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  id="edit-venue"
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
                <span className={`${styles.selectIcon} material-symbols-outlined`} aria-hidden="true">
                  expand_more
                </span>
              </div>
            </div>

            <div className={styles.timeGrid}>
              <div className={styles.section}>
                <label className={styles.label} htmlFor="edit-date">
                  Date
                </label>
                <div className={styles.calendarWrap} id="edit-date">
                  <Calendar
                    availabilityData={{}}
                    onDateSelect={(dateValue) => setDate(toISODate(dateValue))}
                    selectedDate={parseISODate(date)}
                  />
                </div>
              </div>

              <div className={styles.section}>
                <label className={styles.label}>Time Slot</label>
                <div className={styles.slotRow}>
                  <input
                    className={styles.input}
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  />
                  <input
                    className={styles.input}
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.label} htmlFor="edit-change-note">
                Change Note <span className={styles.optional}>(Optional)</span>
              </label>
              <textarea
                className={styles.textarea}
                id="edit-change-note"
                rows={3}
                placeholder="Note for User (e.g., Changed venue due to AC failure)"
                value={changeNote}
                onChange={(event) => setChangeNote(event.target.value)}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.discardBtn} type="button" onClick={onClose}>
              Discard Changes
            </button>

            <button className={styles.saveBtn} disabled={!canSave} type="button" onClick={handleSave}>
              <span className="material-symbols-outlined">check</span>
              Save Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
