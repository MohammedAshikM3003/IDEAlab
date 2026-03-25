import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./PageHeader.module.css";
import { useUserProfile } from "./UserProfileContext.jsx";

const NOTIFICATIONS_READ_KEY = "notificationsRead";

const NOTIFICATION_ITEMS = [
  {
    id: "maintenance",
    color: "blue",
    title: "System Maintenance Scheduled",
    description: "Portal down Oct 28th, 2 AM to 4 AM.",
  },
  {
    id: "approvals",
    color: "amber",
    title: "Pending Venue Approvals",
    description: "5 venue requests awaiting your approval.",
  },
  {
    id: "report",
    color: "green",
    title: "Monthly Report Generated",
    description: "October analytics report is ready.",
  },
];

export default function PageHeader({ title }) {
  const navigate = useNavigate();
  const { userProfile } = useUserProfile();
  const fullName = `${userProfile.titlePrefix} ${userProfile.firstName} ${userProfile.lastName}`;
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(() => {
    const saved = localStorage.getItem(NOTIFICATIONS_READ_KEY);
    return saved === "true";
  });
  const notificationsRef = useRef(null);

  useEffect(() => {
    if (!isNotificationsOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isNotificationsOpen]);

  const notifications = useMemo(
    () =>
      NOTIFICATION_ITEMS.map((item) => ({
        ...item,
        read: notificationsRead,
      })),
    [notificationsRead],
  );

  const handleMarkAllRead = () => {
    setNotificationsRead(true);
    localStorage.setItem(NOTIFICATIONS_READ_KEY, "true");
  };

  const handleViewAllNotifications = () => {
    setIsNotificationsOpen(false);
    navigate("/settings#system-notifications");
  };

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <label className={styles.menu} htmlFor="mobile-menu-toggle">
          <span className="material-icons">menu</span>
        </label>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        <div className={styles.notifWrap} ref={notificationsRef}>
          <button
            aria-expanded={isNotificationsOpen}
            aria-haspopup="menu"
            className={styles.notif}
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            type="button"
          >
            <span className="material-icons">notifications</span>
            {!notificationsRead ? <span className={styles.dot} /> : null}
          </button>

          {isNotificationsOpen ? (
            <div className={styles.notifPanel} role="menu">
              <div className={styles.notifHead}>
                <p className={styles.notifTitle}>Notifications</p>
                <button className={styles.notifMarkAll} onClick={handleMarkAllRead} type="button">
                  Mark all read
                </button>
              </div>

              <div className={styles.notifDivider} />

              <ul className={styles.notifList}>
                {notifications.map((item) => (
                  <li className={styles.notifItem} key={item.id}>
                    <span
                      className={`${styles.notifIconWrap} ${
                        item.color === "blue"
                          ? styles.notifBlue
                          : item.color === "amber"
                            ? styles.notifAmber
                            : styles.notifGreen
                      }`}
                    >
                      <span className="material-icons">shield</span>
                    </span>

                    <div className={styles.notifContent}>
                      <p className={styles.notifItemTitle}>{item.title}</p>
                      <p className={styles.notifItemDesc}>{item.description}</p>
                    </div>

                    {!item.read ? <span className={styles.notifUnreadDot} /> : null}
                  </li>
                ))}
              </ul>

              <div className={styles.notifDivider} />

              <button className={styles.notifFooterLink} onClick={handleViewAllNotifications} type="button">
                View all notifications
              </button>
            </div>
          ) : null}
        </div>

        <div className={styles.profile}>
          <div className={styles.meta}>
            <p className={styles.uname}>{fullName}</p>
            <p className={styles.role}>{userProfile.role}</p>
          </div>
          <div className={styles.avatar}>
            <img
              alt="Admin Profile"
              className={styles.img}
              src={userProfile.avatarUrl}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
