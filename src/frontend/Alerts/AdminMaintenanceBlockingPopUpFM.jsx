import React from "react";

import styles from "./AdminMaintenanceBlockingPopUpFM.module.css";

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
  onBlockVenue,
}) {
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
                  <input className={styles.datetimeInput} type="datetime-local" defaultValue={fromValue} />
                </div>

                <div className={styles.durationField}>
                  <span className={styles.helperText}>To</span>
                  <input className={styles.datetimeInput} type="datetime-local" defaultValue={toValue} />
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

            <button className={styles.blockBtn} type="button" onClick={onBlockVenue}>
              <span className="material-symbols-outlined">build</span>
              <span className={styles.blockBtnText}>Block Venue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
