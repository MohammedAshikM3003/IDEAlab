import React from "react";

import styles from "./AdminInquirySentPopUp.module.css";

export default function AdminInquirySentPopUp({ recipientName, onReturnToInbox }) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="inquiry-success-title">
      <div className={styles.modal}>
        <div className={styles.iconWrap}>
          <span className={`${styles.icon} material-icons`}>send</span>
        </div>

        <h3 className={styles.title} id="inquiry-success-title">Inquiry Sent Successfully</h3>
        <p className={styles.description}>
          Your questions have been emailed to <strong>{recipientName}</strong>. The booking request will remain in
          <strong> Pending</strong> status until you receive a response.
        </p>

        <button className={styles.returnBtn} type="button" onClick={onReturnToInbox}>Return to Inbox</button>
      </div>
    </div>
  );
}
