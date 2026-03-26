import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import settingsIcon from '../assets/settingsIcon.svg'
import logoutIcon from '../assets/logoutIcon.svg'
import collegeLogo from '../assets/collegelogo.jpg'
import AdminLogOutPopUp from './Alerts/AdminLogOutPopUp'
import InternalBookingModal from './Alerts/InternalBookingModal'
import styles from './Sidebar.module.css'

export default function Sidebar({ activePage, isSidebarOpen, setIsSidebarOpen }) {
  const inboxIsActive = activePage === 'inbox'
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isInternalBookingOpen, setIsInternalBookingOpen] = useState(false)

  return (
    <>
      <aside className={`${styles.nav} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoRow}>
            <div className={styles.logoMark}>
              <img alt="KSR College logo" className={styles.logoImage} src={collegeLogo} />
            </div>
            <span className={styles.logoTxt}>KSR Admin</span>
          </div>
        </div>

        <nav className={styles.navList}>
          <Link
            className={`${styles.item} ${activePage === 'dashboard' ? styles.active : styles.idle} group border-l-4 border-transparent`}
            onClick={() => setIsSidebarOpen(false)}
            to="/dashboard"
          >
            <span className={`material-icons ${activePage === 'dashboard' ? '' : 'group-hover:text-primary'} transition-colors`}>dashboard</span>
            <span className={`${styles.txt} ${activePage === 'dashboard' ? '' : 'group-hover:text-primary'} transition-colors`}>Dashboard</span>
          </Link>

          <Link
            className={`${styles.item} ${inboxIsActive ? styles.active : styles.idle} group border-l-4 border-transparent`}
            onClick={() => setIsSidebarOpen(false)}
            to="/inbox"
          >
            <span className={`material-icons ${inboxIsActive ? '' : 'group-hover:text-primary'} transition-colors`}>inbox</span>
            <div className={styles.expand}>
              <span className={`${styles.txt} ${inboxIsActive ? '' : 'group-hover:text-primary'} transition-colors`}>
                Request Inbox
              </span>
              <span className={styles.badge}>23</span>
            </div>
          </Link>

          <Link
            className={`${styles.item} ${activePage === 'status' ? styles.active : styles.idle} group border-l-4 border-transparent`}
            onClick={() => setIsSidebarOpen(false)}
            to="/status"
          >
            <span className={`material-icons ${activePage === 'status' ? '' : 'group-hover:text-primary'} transition-colors`}>calendar_today</span>
            <span className={`${styles.txt} ${activePage === 'status' ? '' : 'group-hover:text-primary'} transition-colors`}>
              Availability Tracker
            </span>
          </Link>

          <Link
            className={`${styles.item} ${activePage === 'facilities' ? styles.active : styles.idle} group border-l-4 border-transparent`}
            onClick={() => setIsSidebarOpen(false)}
            to="/facilities"
          >
            <span className={`material-icons ${activePage === 'facilities' ? '' : 'group-hover:text-primary'} transition-colors`}>business</span>
            <span className={`${styles.txt} ${activePage === 'facilities' ? '' : 'group-hover:text-primary'} transition-colors`}>
              Venue Management
            </span>
          </Link>

          <Link
            className={`${styles.item} ${activePage === 'history' ? styles.active : styles.idle} group border-l-4 border-transparent`}
            onClick={() => setIsSidebarOpen(false)}
            to="/history"
          >
            <span className={`material-icons ${activePage === 'history' ? '' : 'group-hover:text-primary'} transition-colors`}>inventory_2</span>
            <span className={`${styles.txt} ${activePage === 'history' ? '' : 'group-hover:text-primary'} transition-colors`}>
              Booking Archive
            </span>
          </Link>
        </nav>

        <div className={styles.foot}>
          <Link
            className={`${styles.footBtn} ${styles.settingsBtn}`}
            onClick={() => setIsSidebarOpen(false)}
            to="/settings"
          >
            <span className={styles.footIconWrap}>
              <img alt="Settings" className={styles.footIcon} src={settingsIcon} />
            </span>
            <span className={styles.ctaTxt}>Settings</span>
          </Link>

          <button
            className={`${styles.footBtn} ${styles.logoutBtn}`}
            onClick={() => {
              setIsSidebarOpen(false)
              setShowLogoutModal(true)
            }}
            type="button"
          >
            <span className={styles.footIconWrap}>
              <img alt="Logout" className={styles.footIcon} src={logoutIcon} />
            </span>
            <span className={styles.ctaTxt}>Logout</span>
          </button>
        </div>

        <div className={styles.cta}>
          <button
            className={styles.btn}
            type="button"
            onClick={() => {
              setIsSidebarOpen(false)
              setIsInternalBookingOpen(true)
            }}
          >
            <span className={`material-icons ${styles.addIcon}`}>add</span>
            <span className={styles.ctaTxt}>New Booking</span>
          </button>
        </div>

      </aside>

      <div
        className={`${styles.overlay} ${isSidebarOpen ? styles.overlayVisible : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {showLogoutModal && <AdminLogOutPopUp isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />}
      <InternalBookingModal isOpen={isInternalBookingOpen} onClose={() => setIsInternalBookingOpen(false)} />
    </>
  )
}