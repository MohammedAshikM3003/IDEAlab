import React, { useState } from "react";

import Calendar from "../Calendar";
import styles from "./AdminMaintenanceBlockingPopUpFM.module.css";

function parseDateFromDateTime(value) {
  if (!value) {
    return undefined;
  }

  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  const parsed = new Date(year, month - 1, day);
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function dateToISO(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readTimePart(value, fallback = "09:00") {
  if (!value || !value.includes("T")) {
    return fallback;
  }

  const [, timePart] = value.split("T");
  return timePart || fallback;
}

export default function AdminMaintenanceBlockingPopUp({
  title = "Schedule Maintenance Mode",
  venues = [
    { value: "seminar-hall", label: "Seminar Hall (Main Block)" },
    { value: "aicte-lab", label: "AICTE Idea Lab" },
    { value: "conf-room", label: "Conference Room A" },
    { value: "auditorium", label: "KSR Main Auditorium" },
  ],
  defaultVenueValue = "",
  fromValue = "2023-10-27T09:00",
  toValue = "2023-10-27T17:00",
  reasons = [
    { value: "routine-cleaning", label: "Routine Cleaning", icon: "cleaning_services" },
    { value: "repair-work", label: "Repair Work", icon: "construction" },
    { value: "administrative-use", label: "Administrative Use", icon: "admin_panel_settings" },
  ],
  defaultReasonValue = "routine-cleaning",
  notesPlaceholder = "Add any specific details about the maintenance task...",
  pendingRequestCount = 2,
  onClose,
  onCancel,
  onConfirm,
  onBlockVenue,
}) {
  const [fromDate, setFromDate] = useState(() => {
    const parsed = parseDateFromDateTime(fromValue);
    return parsed ? dateToISO(parsed) : dateToISO(new Date());
  });
  const [toDate, setToDate] = useState(() => {
    const parsed = parseDateFromDateTime(toValue);
    return parsed ? dateToISO(parsed) : dateToISO(new Date());
  });
  const [fromTime, setFromTime] = useState(() => readTimePart(fromValue, "09:00"));
  const [toTime, setToTime] = useState(() => readTimePart(toValue, "17:00"));

  return (
    <div className={styles.page}>
      <div className={styles.backgroundMock} aria-hidden="true">
        <div className={styles.mockGrid}>
          <div className={styles.mockLeft}>
            <div className={styles.mockBarLarge} />
            <div className={styles.mockBarMedium} />
            <div className={styles.mockBarSmall} />
            <div className={styles.mockPanel} />
          </div>

          <div className={styles.mockRight}>
            <div className={styles.mockTopRow}>
              <div className={styles.mockTitleBar} />
              <div className={styles.mockButtonRow}>
                <div className={styles.mockButton} />
                <div className={styles.mockButton} />
              </div>
            </div>

            <div className={styles.mockCalendarGrid}>
              <div className={styles.mockDaySolid} />
              <div className={styles.mockDayOutline} />
              <div className={styles.mockDaySolid} />
              <div className={styles.mockDayOutline} />
              <div className={styles.mockDaySolid} />
              <div className={styles.mockDayOutline} />
              <div className={styles.mockDaySolid} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.backdrop} role="dialog" aria-modal="true">
        <div className={styles.modal}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={`${styles.headerIcon} material-symbols-outlined`} aria-hidden="true">
                warning
              </span>
              <h2 className={styles.title}>{title}</h2>
            </div>

            <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.section}>
              <label className={styles.label} htmlFor="venue">
                Select Venue
              </label>

              <div className={styles.selectWrap}>
                <select className={styles.select} id="venue" defaultValue={defaultVenueValue}>
                  <option disabled value="">
                    Select a venue...
                  </option>
                  {venues.map((venue) => (
                    <option key={venue.value} value={venue.value}>
                      {venue.label}
                    </option>
                  ))}
                </select>
                <span className={`${styles.selectIcon} material-symbols-outlined`} aria-hidden="true">
                  expand_more
                </span>
              </div>
            </div>

            <div className={styles.section}>
              <span className={styles.label}>Duration</span>

              <div className={styles.durationGrid}>
                <div className={styles.durationField}>
                  <span className={styles.helperText}>From</span>
                  <div className={styles.durationCalendar}>
                    <Calendar
                      availabilityData={{}}
                      onDateSelect={(value) => setFromDate(dateToISO(value))}
                      selectedDate={parseDateFromDateTime(`${fromDate}T00:00`) || undefined}
                    />
                  </div>
                  <input className={styles.datetimeInput} type="time" value={fromTime} onChange={(event) => setFromTime(event.target.value)} />
                </div>

                <div className={styles.durationField}>
                  <span className={styles.helperText}>To</span>
                  <div className={styles.durationCalendar}>
                    <Calendar
                      availabilityData={{}}
                      minDate={parseDateFromDateTime(`${fromDate}T00:00`) || undefined}
                      onDateSelect={(value) => setToDate(dateToISO(value))}
                      selectedDate={parseDateFromDateTime(`${toDate}T00:00`) || undefined}
                    />
                  </div>
                  <input className={styles.datetimeInput} type="time" value={toTime} onChange={(event) => setToTime(event.target.value)} />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <span className={styles.label}>Reason for Maintenance</span>

              <div className={styles.reasonGroup}>
                {reasons.map((reason) => (
                  <label key={reason.value} className={styles.reasonOption}>
                    <input
                      className={styles.reasonRadio}
                      type="radio"
                      name="reason"
                      value={reason.value}
                      defaultChecked={reason.value === defaultReasonValue}
                    />
                    <span className={styles.reasonText}>{reason.label}</span>
                    <span className={`${styles.reasonIcon} material-symbols-outlined`} aria-hidden="true">
                      {reason.icon}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.label} htmlFor="notes">
                Internal Notes <span className={styles.optional}>(Optional)</span>
              </label>
              <textarea
                className={styles.notes}
                id="notes"
                rows={3}
                placeholder={notesPlaceholder}
              />
            </div>

            <div className={styles.impactAlert}>
              <span className={`${styles.impactIcon} material-symbols-outlined`} aria-hidden="true">
                info
              </span>
              <div className={styles.impactText}>
                <p className={styles.impactTitle}>Impact Warning</p>
                <p className={styles.impactDescription}>
                  This will auto-cancel <span className={styles.impactCount}>{pendingRequestCount} existing pending requests</span>
                  during this period.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelBtn} type="button" onClick={onCancel}>
              Cancel
            </button>

            <button className={styles.blockBtn} type="button" onClick={onConfirm || onBlockVenue}>
              <span className="material-symbols-outlined">build</span>
              <span className={styles.blockBtnText}>Block Venue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
