import React from "react";

import styles from "./AdminDeletePopUp.module.css";

export default function AdminDeletePopUp({
  step = "confirm",
  deletedRequestName,
  onClose,
  onCancel,
  onConfirmDelete,
  onDone,
}) {
  const isSuccess = step === "success";

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="delete-title">
      <div className={styles.modal}>
        {!isSuccess ? (
          <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close modal">
            <span className="material-icons">close</span>
          </button>
        ) : null}

        <div className={isSuccess ? styles.successIconWrap : styles.warningIconWrap}>
          <span className={`${styles.icon} material-icons`}>{isSuccess ? "task_alt" : "delete"}</span>
        </div>

        <h3 className={styles.title} id="delete-title">
          {isSuccess ? "Request Deleted" : "Delete Request?"}
        </h3>

        {isSuccess ? (
          <p className={styles.description}>
            {deletedRequestName ? `${deletedRequestName}'s request was deleted successfully.` : "The request was deleted successfully."}
          </p>
        ) : (
          <p className={styles.description}>
            Are you sure you want to delete this request? This action cannot be undone.
          </p>
        )}

        {isSuccess ? (
          <button className={styles.doneBtn} type="button" onClick={onDone}>
            Return to Inbox
          </button>
        ) : (
          <div className={styles.actions}>
            <button className={styles.cancelBtn} type="button" onClick={onCancel}>
              Cancel
            </button>
            <button className={styles.deleteBtn} type="button" onClick={onConfirmDelete}>
              Delete Permanently
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
