import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import AdminLogOutPopUp from './Alerts/AdminLogOutPopUp'
import styles from './DashboardPage.module.css'

export default function Sidebar({ activePage }) {
  const inboxIsActive = activePage === 'inbox'
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  return (
    <aside className={`${styles.sideNav} flex flex-col flex-shrink-0`}>
      <div className={`${styles.brand} border-b border-white/10 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 min-w-[32px] bg-primary rounded flex items-center justify-center font-bold text-lg text-white">K</div>
          <span className={`${styles.brandText} font-bold tracking-tight text-lg text-white whitespace-nowrap overflow-hidden pl-1`}>KSR Admin</span>
        </div>
      </div>

      <nav className="flex-1 mt-6 space-y-1 overflow-y-auto overflow-x-hidden">
        <Link
          className={`${styles.navItem} ${activePage === 'dashboard' ? styles.itemActive : styles.itemIdle} text-white transition-all whitespace-nowrap`}
          to="/dashboard"
        >
          <span className="material-icons">dashboard</span>
          <span className={`${styles.navText} text-sm font-medium ml-4 text-white`}>Dashboard</span>
        </Link>

        <Link
          className={`${styles.navItem} ${inboxIsActive ? styles.itemActive : styles.itemIdle} text-white/80 transition-all whitespace-nowrap group`}
          to="/inbox"
        >
          <span className={`material-icons ${inboxIsActive ? '' : 'group-hover:text-primary'} transition-colors`}>inbox</span>
          <div className={`${styles.expanded} items-center flex-1 overflow-hidden`}>
            <span
              className={`${styles.navText} text-sm font-medium ml-4 text-white ${inboxIsActive ? '' : 'group-hover:text-primary'} transition-colors`}
            >
              Request Inbox
            </span>
            <span className={`${styles.badge} bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto`}>23</span>
          </div>
        </Link>

        <Link
          className={`${styles.navItem} ${activePage === 'status' ? styles.itemActive : styles.itemIdle} text-white/80 transition-all whitespace-nowrap`}
          to="/status"
        >
          <span className={`material-icons ${activePage === 'status' ? '' : 'hover:text-primary'} transition-colors`}>calendar_today</span>
          <span className={`${styles.navText} text-sm font-medium ml-4 text-white ${activePage === 'status' ? '' : 'hover:text-primary'} transition-colors`}>
            Availability Tracker
          </span>
        </Link>

        <Link
          className={`${styles.navItem} ${activePage === 'facilities' ? styles.itemActive : styles.itemIdle} text-white/80 transition-all whitespace-nowrap`}
          to="/facilities"
        >
          <span className={`material-icons ${activePage === 'facilities' ? '' : 'hover:text-primary'} transition-colors`}>business</span>
          <span className={`${styles.navText} text-sm font-medium ml-4 text-white ${activePage === 'facilities' ? '' : 'hover:text-primary'} transition-colors`}>
            Venue Management
          </span>
        </Link>

        <Link
          className={`${styles.navItem} ${activePage === 'history' ? styles.itemActive : styles.itemIdle} text-white/80 transition-all whitespace-nowrap`}
          to="/history"
        >
          <span className={`material-icons ${activePage === 'history' ? '' : 'hover:text-primary'} transition-colors`}>inventory_2</span>
          <span className={`${styles.navText} text-sm font-medium ml-4 text-white ${activePage === 'history' ? '' : 'hover:text-primary'} transition-colors`}>
            Booking Archive
          </span>
        </Link>
      </nav>

      <div className="px-4 pb-3 space-y-2 shrink-0">

        <Link
          className={`${styles.navItem} ${activePage === 'settings' ? styles.itemActive : styles.itemIdle} bg-primary text-white rounded-lg border-l-0 w-full transition-all whitespace-nowrap`}
          to="/settings"
        >
          <span className="material-icons">settings</span>
          <span className={`${styles.navText} text-sm font-semibold ml-4 text-white`}>Settings</span>
        </Link>

        <button
          className={`${styles.navItem} ${styles.logoutItem} rounded-lg border-l-0 w-full transition-all whitespace-nowrap`}
          onClick={() => setShowLogoutModal(true)}
          type="button"
        >
          <span className="material-icons">logout</span>
          <span className={`${styles.navText} text-sm font-semibold ml-4 text-white`}>Logout</span>
        </button>
      </div>

      <div className={`${styles.cta} border-t border-white/10 shrink-0`}>
        <button className={`${styles.ctaBtn} hover:bg-primary/90`} type="button">
          <span className="material-icons text-[24px]">add</span>
          <span className={`${styles.ctaText} font-semibold whitespace-nowrap`}>New Booking</span>
        </button>
      </div>

      {showLogoutModal && <AdminLogOutPopUp isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />}
    </aside>
  )
}