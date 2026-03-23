import React from "react";

import styles from "./AdminInternalBookingPopUp.module.css";

const DEFAULT_VENUES = [
  { value: "aicte", label: "AICTE Idea Lab" },
  { value: "seminar", label: "Seminar Hall" },
  { value: "conference", label: "Conference Room" },
  { value: "mini", label: "Mini Hall" },
];

export default function AdminInternalBookingPopUp({
  venues = DEFAULT_VENUES,

  eventTitle = "",
  onEventTitleChange,

  venue = "",
  onVenueChange,

  date = "",
  onDateChange,

  startTime = "",
  onStartTimeChange,

  endTime = "",
  onEndTimeChange,

  organizer = "",
  onOrganizerChange,

  recurring = false,
  onRecurringChange,

  slotStatusText = "Slot Available",
  slotStatusVariant = "success",

  onCancel,
  onConfirm,
  onClose,
}) {
  const statusClass = slotStatusVariant === "danger" ? styles.slotDanger : styles.slotSuccess;

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgSidebar}>
          <div className={styles.bgLogo} />
          <div className={styles.bgNav}>
            <div className={styles.bgNavItem} />
            <div className={styles.bgNavItem} />
            <div className={styles.bgNavItemActive} />
            <div className={styles.bgNavItem} />
          </div>
        </div>

        <div className={styles.bgMain}>
          <div className={styles.bgTopRow}>
            <div className={styles.bgTitleBar} />
            <div className={styles.bgAvatar} />
          </div>

          <div className={styles.bgCards}>
            <div className={styles.bgCard} />
            <div className={styles.bgCard} />
            <div className={styles.bgCard} />
          </div>

          <div className={styles.bgBigPanel} />
        </div>
      </div>

      <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="New Internal Booking">
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.headerTitle}>New Internal Booking</h2>
            <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className={styles.content}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="eventTitle">
                Event Title
              </label>
              <input
                id="eventTitle"
                className={styles.input}
                type="text"
                placeholder="e.g., HOD Meeting"
                value={eventTitle}
                onChange={(e) => onEventTitleChange?.(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="venue">
                Venue
              </label>
              <div className={styles.selectWrap}>
                <select id="venue" className={styles.select} value={venue} onChange={(e) => onVenueChange?.(e.target.value)}>
                  <option value="" disabled>
                    Select a venue
                  </option>
                  {venues.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <div className={styles.selectChevron} aria-hidden="true">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>

            <div className={styles.dateTimeGrid}>
              <div className={`${styles.field} ${styles.dateField}`}>
                <label className={styles.label} htmlFor="date">
                  Date
                </label>
                <div className={styles.dateWrap}>
                  <input id="date" className={styles.inputDate} type="date" value={date} onChange={(e) => onDateChange?.(e.target.value)} />
                  <div className={styles.dateIcon} aria-hidden="true">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="startTime">
                  Start Time
                </label>
                <input
                  id="startTime"
                  className={styles.input}
                  type="time"
                  value={startTime}
                  onChange={(e) => onStartTimeChange?.(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="endTime">
                  End Time
                </label>
                <input id="endTime" className={styles.input} type="time" value={endTime} onChange={(e) => onEndTimeChange?.(e.target.value)} />
              </div>
            </div>

            <div className={`${styles.slotIndicator} ${statusClass}`}>
              <span className="material-symbols-outlined">check_circle</span>
              <span className={styles.slotText}>{slotStatusText}</span>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="organizer">
                Organizer
              </label>
              <input
                id="organizer"
                className={styles.input}
                type="text"
                placeholder="e.g., Principal's Office"
                value={organizer}
                onChange={(e) => onOrganizerChange?.(e.target.value)}
              />
            </div>

            <div className={styles.recurringRow}>
              <div className={styles.checkboxWrap}>
                <input
                  id="recurring"
                  className={styles.checkbox}
                  type="checkbox"
                  checked={recurring}
                  onChange={(e) => onRecurringChange?.(e.target.checked)}
                />
                <span className={styles.checkboxCheck} aria-hidden="true">
                  <span className="material-symbols-outlined">check</span>
                </span>
              </div>

              <label className={styles.recurringLabel} htmlFor="recurring">
                Recurring Event?
              </label>

              <div className={styles.infoTooltip}>
                <span className={`${styles.infoIcon} material-symbols-outlined`} aria-hidden="true">
                  info
                </span>
                <div className={styles.tooltipBubble}>Set weekly or monthly repetition.</div>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelBtn} type="button" onClick={onCancel}>
              Cancel
            </button>
            <button
              className={styles.confirmBtn}
              type="button"
              onClick={() =>
                onConfirm?.({
                  eventTitle,
                  venue,
                  date,
                  startTime,
                  endTime,
                  organizer,
                  recurring,
                })
              }
            >
              <span className="material-symbols-outlined">add</span>
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
