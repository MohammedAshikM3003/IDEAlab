import React from "react";

import styles from "./AdminBookingDetailsPopUpFM.module.css";

export default function AdminBookingDetailsPopUp({
  title = "CS Department Exam",
  bookingId = "#KSR-2489",
  statusText = "Confirmed",
  statusVariant = "success",
  organizerText = "Prof. Rahul (CSE Dept)",
  contactText = "9876543210",
  contactHref = "tel:9876543210",
  timeText = "09:00 AM - 11:00 AM",
  venueText = "Computer Lab 2",
  onCancelBooking,
  onEdit,
  onCancelClick,
  onEditClick,
  onClose,
}) {
  const statusClass = statusVariant === "danger" ? styles.statusDanger : styles.statusSuccess;

  return (
    <div className={styles.page}>
      <div className={styles.backgroundMock} aria-hidden="true">
        <header className={styles.mockHeader}>
          <div className={styles.mockTitleBar} />
          <div className={styles.mockHeaderRight}>
            <div className={styles.mockAvatar} />
          </div>
        </header>

        <div className={styles.mockContent}>
          <div className={styles.mockCardSmall} />
          <div className={styles.mockCardSmall} />
          <div className={styles.mockCardSmall} />
          <div className={styles.mockCardLarge} />
          <div className={styles.mockCardTall} />
        </div>
      </div>

      <div className={styles.backdrop} role="dialog" aria-modal="true">
        <div className={styles.modal}>
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <h2 className={styles.title}>{title}</h2>

              <div className={`${styles.statusBadge} ${statusClass}`}>
                <span className="material-symbols-outlined">check_circle</span>
                <span className={styles.statusText}>{statusText}</span>
              </div>
            </div>
            <p className={styles.bookingId}>Booking ID: {bookingId}</p>
          </div>

          <div className={styles.body}>
            <div className={styles.grid}>
              <div className={styles.field}>
                <div className={styles.fieldLabelRow}>
                  <span className="material-symbols-outlined">person</span>
                  <span className={styles.fieldLabel}>Organizer</span>
                </div>
                <p className={styles.fieldValueIndented}>{organizerText}</p>
              </div>

              <div className={styles.field}>
                <div className={styles.fieldLabelRow}>
                  <span className="material-symbols-outlined">call</span>
                  <span className={styles.fieldLabel}>Contact</span>
                </div>
                <a className={styles.contactLink} href={contactHref}>
                  {contactText}
                </a>
              </div>

              <div className={`${styles.field} ${styles.fieldDividerOnMobile}`}>
                <div className={styles.fieldLabelRow}>
                  <span className="material-symbols-outlined">schedule</span>
                  <span className={styles.fieldLabel}>Time</span>
                </div>
                <p className={styles.fieldValueIndented}>{timeText}</p>
              </div>

              <div className={`${styles.field} ${styles.fieldDividerOnMobile}`}>
                <div className={styles.fieldLabelRow}>
                  <span className="material-symbols-outlined">location_on</span>
                  <span className={styles.fieldLabel}>Venue</span>
                </div>
                <p className={styles.fieldValueIndented}>{venueText}</p>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelLink} type="button" onClick={onCancelClick || onCancelBooking}>
              Cancel Booking
            </button>

            <button className={styles.editBtn} type="button" onClick={onEditClick || onEdit}>
              Edit
            </button>

            <button className={styles.closeBtn} type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
