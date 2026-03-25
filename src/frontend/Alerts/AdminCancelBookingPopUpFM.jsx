import React, { useState, useEffect } from "react";
import styles from "./AdminCancelBookingPopUpFM.module.css";

const AdminCancelBookingPopUpFM = ({ booking, onClose, onConfirmCancel }) => {
  const [step, setStep] = useState("confirm"); // "confirm" | "success"
  const [reason, setReason] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCancel = () => {
    if (onConfirmCancel) onConfirmCancel(booking, reason);
    setStep("success");
  };

  const handleReturnToTracker = () => {
    onClose();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && step === "confirm" && onClose()}
    >
      <div className={styles.modal}>

        {step === "confirm" && (
          <>
            <div className={styles.iconWrap}>
              <div className={styles.iconCircle}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    stroke="#E24B4A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <h2 className={styles.title}>Cancel This Booking?</h2>
            <p className={styles.body}>
              Are you sure you want to cancel the{" "}
              <strong>{booking?.eventTitle || "this booking"}</strong>? This action
              cannot be undone and will notify the organizer immediately.
            </p>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Reason for Cancellation (Optional)
              </label>
              <textarea
                className={styles.textarea}
                placeholder="e.g., Administrative override, Maintenance required..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className={styles.actions}>
              <button className={styles.btnKeep} onClick={onClose}>
                Keep Booking
              </button>
              <button className={styles.btnCancel} onClick={handleCancel}>
                Yes, Cancel Booking
              </button>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <button className={styles.closeBtn} onClick={handleReturnToTracker}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className={styles.iconWrap}>
              <div className={`${styles.iconCircle} ${styles.iconCircleSuccess}`}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="#3B6D11"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <h2 className={styles.title}>Booking Cancelled</h2>
            <p className={styles.body}>
              The <strong>{booking?.eventTitle || "booking"}</strong> has been removed
              from the schedule. A cancellation notification email has been automatically
              sent to <strong>{booking?.organizer || "the organizer"}</strong>.
            </p>

            <button className={styles.btnReturn} onClick={handleReturnToTracker}>
              Return to Tracker
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default AdminCancelBookingPopUpFM;
