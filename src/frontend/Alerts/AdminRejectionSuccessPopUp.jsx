import React from "react";

import styles from "./AdminRejectionSuccessPopUp.module.css";

export default function AdminRejectionSuccessPopUp({ venueName, userName, onReturn }) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="reject-success-title">
      <div className={styles.modal}>
        <div className={styles.iconWrap}>
          <span className={`${styles.icon} material-icons`}>cancel</span>
        </div>

        <h3 className={styles.title} id="reject-success-title">Request Rejected</h3>
        <p className={styles.description}>
          The booking request for <strong>{venueName}</strong> has been declined. An automated email with your rejection
          reason has been sent to <strong>{userName}</strong>.
        </p>

        <button className={styles.returnBtn} type="button" onClick={onReturn}>Return to Inbox</button>
      </div>
    </div>
  );
}
