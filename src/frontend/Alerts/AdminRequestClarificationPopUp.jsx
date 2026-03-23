import React from "react";

import styles from "./AdminRequestClarificationPopUp.module.css";

export default function AdminRequestClarificationPopUp({
  recipientText,
  templates,
  message,
  onMessageChange,
  onTemplateClick,
  onClose,
  onCancel,
  onSend,
  sendDisabled,
}) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="request-info-title">
      <div className={styles.modal}>
        <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close modal">
          <span className="material-icons">close</span>
        </button>

        <h3 className={styles.title} id="request-info-title">Request Information</h3>

        <div className={styles.section}>
          <span className={styles.label}>Recipient</span>
          <div className={styles.recipientBox}>
            <span className="material-icons">person</span>
            <span>{recipientText}</span>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>Quick Templates</span>
          <div className={styles.chips}>
            {templates.map((template) => (
              <button key={template} className={styles.chip} type="button" onClick={() => onTemplateClick?.(template)}>
                <span className="material-icons">add</span>
                {template}
              </button>
            ))}
          </div>
        </div>

        <label className={styles.section}>
          <span className={styles.label}>Message</span>
          <textarea className={styles.textarea} value={message} onChange={(e) => onMessageChange?.(e.target.value)} />
        </label>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} type="button" onClick={onCancel}>Cancel</button>
          <button className={styles.sendBtn} type="button" onClick={onSend} disabled={sendDisabled}>
            Send Inquiry
            <span className="material-icons">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
