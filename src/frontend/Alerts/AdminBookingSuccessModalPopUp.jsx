import React from "react";

import styles from "./AdminBookingSuccessModalPopUp.module.css";

export default function AdminBookingSuccessModalPopUp({
  eventName = "HOD Meeting",
  dateText = "Oct 24, 2023",
  onDone,
  trackerHref = "#",
  onViewTracker,
}) {
  const handleViewTracker = (e) => {
    if (!onViewTracker) return;
    e.preventDefault();
    onViewTracker();
  };

  return (
    <div className={styles.page}>
      <div className={styles.mock} aria-hidden="true">
        <header className={styles.mockHeader}>
          <div className={styles.mockCirclePrimary} />
          <div className={styles.mockPill} />
          <div className={styles.mockSpacer} />
          <div className={styles.mockCircle} />
          <div className={styles.mockCircle} />
        </header>

        <div className={styles.mockMainRow}>
          <aside className={styles.mockSidebar}>
            <div className={styles.mockSidebarItem} />
            <div className={styles.mockSidebarItemSmall} />
            <div className={styles.mockSidebarItem} />
            <div className={styles.mockSidebarItemBottom} />
          </aside>

          <main className={styles.mockGrid}>
            <div className={styles.mockPanelWide}>
              <div className={styles.mockPanelTitle} />
              <div className={styles.mockPanelBody} />
            </div>
            <div className={styles.mockPanel} />
            <div className={styles.mockPanelShort} />
            <div className={styles.mockPanelShort} />
            <div className={styles.mockPanelShort} />
          </main>
        </div>
      </div>

      <div className={styles.backdrop} role="dialog" aria-modal="true">
        <div className={styles.modal}>
          <div className={styles.successIconWrap}>
            <span
              className={`${styles.successIcon} material-symbols-outlined`}
              style={{ fontVariationSettings: "'wght' 600" }}
            >
              check_circle
            </span>
          </div>

          <h1 className={styles.title}>Booking Confirmed!</h1>

          <div className={styles.body}>
            <p className={styles.text}>
              The <span className={styles.eventName}>{eventName}</span> has been successfully scheduled for
            </p>

            <div className={styles.dateBadge}>
              <span className={`${styles.dateIcon} material-symbols-outlined`}>calendar_month</span>
              <span className={styles.dateText}>{dateText}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.doneBtn} type="button" onClick={onDone}>
              Done
            </button>

            <a className={styles.trackerLink} href={trackerHref} onClick={handleViewTracker}>
              <span>View in Availability Tracker</span>
              <span className={`${styles.trackerArrow} material-symbols-outlined`}>arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
