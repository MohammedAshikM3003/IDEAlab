import React from "react";

import styles from "./AdminApprovalConfirmationPopUp.module.css";

export default function AdminApprovalConfirmationPopUp({
  venueName,
  recipientName,
  onReturnToInbox,
}) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="approval-success-title">
      <div className={styles.modal}>
        <div className={styles.iconWrap}>
          <span className={`${styles.icon} material-icons`}>check_circle</span>
        </div>

        <h3 className={styles.title} id="approval-success-title">Booking Confirmed &amp; Email Sent!</h3>
        <p className={styles.description}>
          The slot for <strong>{venueName}</strong> has been successfully blocked. An automated confirmation email has been
          sent to <strong>{recipientName}</strong>.
        </p>

        <button className={styles.returnBtn} type="button" onClick={onReturnToInbox}>
          <span className="material-icons">arrow_back</span>
          Return to Inbox
        </button>
      </div>
    </div>
  );
}
