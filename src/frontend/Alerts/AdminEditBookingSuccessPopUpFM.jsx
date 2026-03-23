import React from "react";

import styles from "./AdminEditBookingSuccessPopUpFM.module.css";

export default function AdminEditBookingSuccessPopUpFM({
  onClose,
  eventName = "CS Department Exam",
  bookingId = "#BK-2489",
  organizerName = "the organizer",
}) {
  return (
    <div className={styles.page}>
      <div className={styles.backdrop} role="dialog" aria-modal="true">
        <div className={styles.modal}>
          <div className={styles.successCircle}>
            <span className="material-symbols-outlined" aria-hidden="true">
              check
            </span>
          </div>

          <h2 className={styles.title}>Updates Saved Successfully</h2>

          <p className={styles.description}>
            The details for {eventName} ({bookingId}) have been updated. The organizer {organizerName} will receive a
            notification email shortly.
          </p>

          <button className={styles.closeBtn} type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
