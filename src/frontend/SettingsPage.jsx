import React, { useMemo, useState } from 'react'

import PageHeader from './PageHeader'
import Sidebar from './Sidebar'
import styles from './SettingsPage.module.css'

function IconShield({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2 20 6v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M9.5 12.5 11 14l3.5-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

function IconDevices({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 7h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M6 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function IconCheck({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 12.5 11 14.5 15.5 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function IconCircle({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = useMemo(
    () => [
      { id: 'profile', label: 'Profile Details' },
      
    ],
    [],
  )

  return (
    <div className={styles.page}>
      <input className="hidden" id="mobile-menu-toggle" type="checkbox" />

      <label
        className="hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        htmlFor="mobile-menu-toggle"
      />

      <div className={styles.shell}>
        <Sidebar activePage="settings" />

        <main className={styles.main}>
          <PageHeader title="Account Settings" />

          <div className={styles.mainContent}>
            <section className={styles.panelGrid}>
              <div className={styles.card}>
                <div className={styles.cardHead}>Profile Management</div>

                <nav className={styles.tabs} aria-label="Settings tabs">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      className={`${styles.tab} ${activeTab === t.id ? styles.tabOn : ''}`}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </nav>

                <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                  <div className={styles.avatarWrap}>
                    <div className={styles.avatarLg} aria-hidden="true" />
                    <div>
                      <button className={styles.btnSecondary} type="button">
                        Change Avatar
                      </button>
                      <div className={styles.hint}>JPG, GIF or PNG. 1MB Max.</div>
                    </div>
                  </div>

                  <div className={styles.cols2}>
                    <label className={styles.field}>
                      <span className={styles.label}>First Name</span>
                      <input className={styles.input} defaultValue="Arul" type="text" />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.label}>Last Name</span>
                      <input className={styles.input} defaultValue="Kumaran" type="text" />
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span className={styles.label}>Email Address</span>
                    <input className={styles.input} defaultValue="admin@ksrce.ac.in" type="email" />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Role Designation</span>
                    <input className={`${styles.input} ${styles.inputOff}`} defaultValue="Chief Administrator" readOnly type="text" />
                  </label>

                  <div className={styles.formBtns}>
                    <button className={styles.btnPrimary} type="button">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              <div className={styles.rightCol}>
                <div className={`${styles.card} ${styles.profileCardWrap}`}>
                  <div className={styles.pcLastLogin}>Last Login: 2h ago</div>
                  <div className={styles.pcAvatarWrap}>
                    <div className={styles.pcAvatar} aria-hidden="true" />
                    <span className={styles.onlineDot} />
                  </div>
                  <div className={styles.pcName}>Dr. Arul Kumaran</div>
                  <div className={styles.pcMeta}>Member since 2018</div>
                  <div className={styles.badges}>
                    <span className={`${styles.badge} ${styles.tagBlue}`}>Admin</span>
                    <span className={`${styles.badge} ${styles.tagPurple}`}>Faculty Head</span>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.verifyHead}>
                    <div className={styles.cardHead}>Verification Status</div>
                    <div className={styles.verifyDate}>Oct 2018</div>
                  </div>

                  <ul className={styles.verifyList}>
                    <li className={styles.verifyItem}>
                      <div className={styles.verifyLeft}>
                        <IconCheck className={`${styles.verifyIco} ${styles.verifyIcoOk}`} />
                        <span className={styles.verifyTxt}>Email Verified</span>
                      </div>
                    </li>
                    <li className={styles.verifyItem}>
                      <div className={styles.verifyLeft}>
                        <IconCheck className={`${styles.verifyIco} ${styles.verifyIcoOk}`} />
                        <span className={styles.verifyTxt}>Mobile Number</span>
                      </div>
                      <button className={styles.linkBtn} type="button">
                        Update
                      </button>
                    </li>
                    <li className={styles.verifyItem}>
                      <div className={styles.verifyLeft}>
                        <IconCircle className={`${styles.verifyIco} ${styles.verifyIcoPend}`} />
                        <span className={styles.verifyMuted}>Two-Factor Auth (2FA)</span>
                      </div>
                      <button className={styles.linkBtn} type="button">
                        Enable
                      </button>
                    </li>
                  </ul>

                  <div className={styles.verifyHint}>Complete verification to increase security score.</div>
                </div>
              </div>
            </section>

            

{/* BOTTOM SECTION */}

<section className={styles.activityGrid}>
  <div className={styles.card}>
    <div className={styles.bottomHead}>
      <span>Recent Security Activity</span>
      <a href="#" className={styles.link}>View Log</a>
    </div>

    <ul className={styles.activityList}>
      <li className={styles.activityItem}>
        <IconCheck className={`${styles.actIcon} ${styles.iconGreen}`} />
        <div>
          <div>Password updated successfully</div>
          <div className={styles.activityTime}>Just now</div>
        </div>
      </li>
      <li className={styles.activityItem}>
        <IconDevices className={`${styles.actIcon} ${styles.iconBlue}`} />
        <div>
          <div>New login from Chrome/Windows</div>
          <div className={styles.activityTime}>2h ago</div>
        </div>
      </li>
      <li className={styles.activityItem}>
        <IconCircle className={`${styles.actIcon} ${styles.iconGray}`} />
        <div>
          <div>Profile information updated</div>
          <div className={styles.activityTime}>Yesterday</div>
        </div>
      </li>
    </ul>
  </div>

  <div className={styles.card}>
    <div className={styles.bottomHead}>
      <span>System Notifications</span>
      <a href="#" className={styles.link}>Mark all read</a>
    </div>

    <ul className={styles.notificationList}>
      <li className={`${styles.notificationItem} ${styles.notInfo}`}>
        <div className={styles.notIconWrap}>
          <IconShield className={styles.notIcon} />
        </div>
        <div>
          <div className={styles.notTitle}>System Maintenance Scheduled</div>
          <div className={styles.notDesc}>The portal will be down for maintenance on Oct 28th from 2 AM to 4 AM.</div>
        </div>
      </li>
      <li className={`${styles.notificationItem} ${styles.notWarn}`}>
        <div className={styles.notIconWrap}>
          <IconShield className={styles.notIcon} />
        </div>
        <div>
          <div className={styles.notTitle}>Pending Venue Approvals</div>
          <div className={styles.notDesc}>You have 5 venue requests awaiting your approval.</div>
        </div>
      </li>
      <li className={`${styles.notificationItem} ${styles.notOk}`}>
        <div className={styles.notIconWrap}>
          <IconShield className={styles.notIcon} />
        </div>
        <div>
          <div className={styles.notTitle}>Monthly Report Generated</div>
          <div className={styles.notDesc}>October analytics report is ready for download.</div>
        </div>
      </li>
    </ul>
  </div>
</section>
          </div>
        </main>
      </div>
    </div>
  )
}
