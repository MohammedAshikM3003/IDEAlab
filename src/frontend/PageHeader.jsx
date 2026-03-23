import React from "react";

import styles from "./DashboardPage.module.css";

export default function PageHeader({ title }) {
  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <label className={styles.menu} htmlFor="mobile-menu-toggle">
          <span className="material-icons">menu</span>
        </label>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        <button className={styles.notif} type="button">
          <span className="material-icons">notifications</span>
          <span className={styles.dot} />
        </button>

        <div className={styles.profile}>
          <div className={styles.meta}>
            <p className={styles.uname}>Dr. Arul Kumaran</p>
            <p className={styles.role}>Chief Administrator</p>
          </div>
          <div className={styles.avatar}>
            <img
              alt="Admin Profile"
              className={styles.img}
              src="https://ui-avatars.com/api/?name=Arul+Kumaran&background=0D47A1&color=fff"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
