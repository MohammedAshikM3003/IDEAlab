import React from "react";

import styles from "./AdminMaintenanceSuccessPopUpFM.module.css";

export default function AdminMaintenanceSuccessPopUp({
  portalTitle = "KSR College Admin Portal",
  activeNavLabel = "Maintenance",
  pageTitle = "Availability Tracker",
  successTitle = "Venue Blocked Successfully",
  affectedPendingRequests = 2,
  returnLabel = "Return to Tracker",
  onReturn,
}) {
  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.brand}>
              <div className={styles.brandIcon}>
                <span className="material-symbols-outlined">account_balance</span>
              </div>
              <h2 className={styles.portalTitle}>{portalTitle}</h2>
            </div>

            <nav className={styles.nav}>
              <a className={styles.navLink} href="#">
                Dashboard
              </a>
              <a className={styles.navLink} href="#">
                Venues
              </a>
              <a className={`${styles.navLink} ${styles.navLinkActive}`} href="#">
                {activeNavLabel}
              </a>
              <a className={styles.navLink} href="#">
                Schedules
              </a>
            </nav>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.avatar}>
              <span className="material-symbols-outlined">person</span>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.mainInner}>
            <div className={styles.topRow}>
              <h1 className={styles.pageTitle}>{pageTitle}</h1>
              <div className={styles.weekButtons}>
                <button className={styles.weekBtn} type="button">
                  Prev Week
                </button>
                <button className={styles.weekBtn} type="button">
                  Next Week
                </button>
              </div>
            </div>

            <div className={styles.trackerGrid} aria-hidden="true">
              <div className={styles.trackerCorner} />
              <div className={styles.trackerDay}>Mon 12</div>
              <div className={styles.trackerDay}>Tue 13</div>
              <div className={styles.trackerDay}>Wed 14</div>
              <div className={styles.trackerDay}>Thu 15</div>
              <div className={styles.trackerDay}>Fri 16</div>
              <div className={styles.trackerDay}>Sat 17</div>
              <div className={styles.trackerDay}>Sun 18</div>

              <div className={styles.trackerTime}>08:00 AM</div>
              <div className={`${styles.trackerCell} ${styles.trackerCellPrimary}`} />
              <div className={`${styles.trackerCell} ${styles.trackerCellNeutral}`} />
              <div className={`${styles.trackerCell} ${styles.trackerCellPrimary}`} />
              <div className={`${styles.trackerCell} ${styles.trackerCellNeutral}`} />
              <div className={`${styles.trackerCell} ${styles.trackerCellNeutral}`} />
              <div className={`${styles.trackerCell} ${styles.trackerCellNeutral}`} />
              <div className={`${styles.trackerCell} ${styles.trackerCellNeutral}`} />
            </div>
          </div>
        </main>
      </div>

      <div className={styles.backdrop} role="dialog" aria-modal="true">
        <div className={styles.modal}>
          <div className={styles.iconHeader}>
            <div className={styles.iconCircle}>
              <div className={styles.iconStack}>
                <span className={`${styles.successIcon} material-symbols-outlined`} aria-hidden="true">
                  check_circle
                </span>
                <span className={styles.badgeIconWrap} aria-hidden="true">
                  <span className={`${styles.badgeIcon} material-symbols-outlined`}>build</span>
                </span>
              </div>
            </div>
          </div>

          <div className={styles.content}>
            <h2 className={styles.successTitle}>{successTitle}</h2>
            <p className={styles.successDescription}>
              The venue has been blocked for maintenance. The calendar has been updated, and cancellation emails have been
              automatically sent to the <span className={styles.affectedText}>{affectedPendingRequests} affected pending requests</span>.
            </p>
          </div>

          <button className={styles.returnBtn} type="button" onClick={onReturn}>
            <span>{returnLabel}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      <div className={styles.decoration} aria-hidden="true">
        <svg className={styles.decorationSvg} viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg">
          <path className={styles.decorationPath} d="M0,0 L400,0 L400,800 L0,400 Z" />
        </svg>
      </div>
    </div>
  );
}
