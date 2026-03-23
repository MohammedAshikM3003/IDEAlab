import React from "react";

import styles from "./AdminApprovalPopUp.module.css";

export default function AdminApprovalPopUp({
  userName,
  venueName,
  dateText,
  timeText,
  onCancel,
  onApprove,
  onClose,
}) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="approve-title">
      <div className={styles.modal}>
        <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close modal">
          <span className="material-icons">close</span>
        </button>

        <div className={styles.iconWrap}>
          <span className={`${styles.icon} material-icons`}>check_circle</span>
        </div>

        <h3 className={styles.title} id="approve-title">Confirm Booking?</h3>
        <p className={styles.description}>
          Are you sure you want to approve this request? This will automatically send a confirmation email to the user
          and block the slot in the master calendar.
        </p>

        <div className={styles.summaryBox}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.label}>User</span>
              <span className={styles.value}>{userName}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Venue</span>
              <span className={styles.value}>{venueName}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Date</span>
              <span className={styles.value}>{dateText}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Time</span>
              <span className={styles.value}>{timeText}</span>
            </div>
          </div>
        </div>

        <div className={styles.footerButtons}>
          <button className={styles.cancelBtn} type="button" onClick={onCancel}>Cancel</button>
          <button className={styles.approveBtn} type="button" onClick={onApprove}>
            <span className="material-icons">send</span>
            Approve &amp; Send
          </button>
        </div>
      </div>
    </div>
  );
}
