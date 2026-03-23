import React from "react";

import styles from "./AdminRejectionPopUp.module.css";

export default function AdminRejectionPopUp({
  reason,
  comments,
  onReasonChange,
  onCommentsChange,
  onClose,
  onCancel,
  onConfirm,
  confirmDisabled,
}) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="reject-title">
      <div className={styles.modal}>
        <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close modal">
          <span className="material-icons">close</span>
        </button>

        <h3 className={styles.title} id="reject-title">Reject Booking Request</h3>

        <div className={styles.warningBanner}>
          <span className="material-icons">warning</span>
          <p>This action will trigger an automated rejection email to the user.</p>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Reason for Rejection</span>
          <select className={styles.select} value={reason} onChange={(e) => onReasonChange?.(e.target.value)}>
            <option value="" disabled>Select a reason</option>
            <option value="slot_unavailable">Slot Unavailable</option>
            <option value="maintenance">Maintenance Work</option>
            <option value="inappropriate">Inappropriate Event Purpose</option>
            <option value="admin_decision">Administrative Decision</option>
          </select>
        </label>

        <label className={styles.field}>
          <div className={styles.labelRow}>
            <span className={styles.label}>Additional Comments</span>
            <span className={styles.optional}>Optional</span>
          </div>
          <textarea
            className={styles.textarea}
            placeholder="Please provide details for the rejection..."
            value={comments}
            onChange={(e) => onCommentsChange?.(e.target.value)}
          />
        </label>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} type="button" onClick={onCancel}>Cancel</button>
          <button className={styles.confirmBtn} type="button" onClick={onConfirm} disabled={confirmDisabled}>
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}
