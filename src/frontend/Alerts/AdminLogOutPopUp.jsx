import React from "react";
import { useNavigate } from "react-router-dom";

import styles from "./AdminLogOutPopUp.module.css";

export default function AdminLogOutPopUp({
  isOpen = false,
  title = "Logging Out?",
  message =
    "You are about to end your secure session. Any unsaved changes in your profile settings will be lost.",
  onClose,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleStay = () => {
    onClose?.();
  };

  const handleConfirmLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authToken");
      sessionStorage.clear();
    } catch (e) {
      // ignore storage errors
    }

    onClose?.();
    navigate("/login");
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Logout">
      <div className={styles.backdrop} />

      <div className={styles.modal}>
        <div className={styles.iconWrap}>
          <span
            className={`${styles.icon} material-symbols-outlined`}
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
            aria-hidden="true"
          >
            logout
          </span>
        </div>

        <div className={styles.textBlock}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.stayBtn} type="button" onClick={handleStay}>
            Stay Logged In
          </button>
          <button className={styles.logoutBtn} type="button" onClick={handleConfirmLogout}>
            Yes, Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
