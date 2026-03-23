import React from 'react'

import PageHeader from './PageHeader'
import Sidebar from './Sidebar'
import layoutStyles from './DashboardPage.module.css'
import statusStyles from './StatusPage.module.css'

export default function StatusPage() {
  return (
    <div className={layoutStyles.page}>
      <input className="hidden" id="mobile-menu-toggle" type="checkbox" />

      <label
        className={`${layoutStyles.overlay} hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden`}
        htmlFor="mobile-menu-toggle"
      />

      <div className={layoutStyles.wrap}>
        <Sidebar activePage="status" />

        <div className={layoutStyles.main}>
          <PageHeader title="Availability Tracker" />

          <div className={statusStyles.toolbar}>
            <div className={statusStyles.toolbarLeft}>
              <div className={statusStyles.dateNavigator}>
                <button className={statusStyles.navButton} type="button">
                  <span className="material-icons text-lg">chevron_left</span>
                </button>
                <div className={statusStyles.dateDisplay}>
                  <span className="material-icons text-slate-400 text-lg">calendar_today</span>
                  <span className="text-sm font-semibold text-slate-700">Today, Jan 26, 2026</span>
                </div>
                <button className={statusStyles.navButton} type="button">
                  <span className="material-icons text-lg">chevron_right</span>
                </button>
              </div>

              <div className="h-8 w-px bg-gray-200" />

              <div className={statusStyles.filterWrapper}>
                <select className={statusStyles.filterSelect}>
                  <option>All Venues (15)</option>
                  <option>Lecture Halls</option>
                  <option>Labs</option>
                  <option>Auditoriums</option>
                </select>
                <span className={`material-icons ${statusStyles.filterIcon}`}>filter_alt</span>
                <span className={`material-icons ${statusStyles.filterChevron}`}>expand_more</span>
              </div>
            </div>

            <div className={statusStyles.toolbarRight}>
              <div className={statusStyles.toggleWrapper}>
                <span className={statusStyles.toggleLabel}>Auto-refresh</span>
                <button aria-checked="true" className={statusStyles.toggleSwitch} role="switch" type="button">
                  <span className={statusStyles.toggleKnob} />
                </button>
              </div>

              <div className={statusStyles.liveBadge}>
                <span className={statusStyles.liveIndicator}>
                  <span className={statusStyles.livePulse} />
                  <span className={statusStyles.liveDot} />
                </span>
                <span className={statusStyles.liveText}>Live Updates</span>
              </div>
            </div>
          </div>

          <main className={statusStyles.mainContent}>
            <div className={statusStyles.floatingActions}>
              <button className={statusStyles.fabSecondary} type="button">
                <span className="material-icons">handyman</span>
                <span>Block Maintenance</span>
              </button>
              <button className={statusStyles.fabPrimary} type="button">
                <span className="material-icons">add</span>
                <span>Add Booking</span>
              </button>
            </div>

            <div className={statusStyles.panelLeft}>
              <div className={statusStyles.panelHeader}>
                <div className={statusStyles.panelHeaderLeft}>
                  <span className={`material-icons ${statusStyles.panelHeaderIcon}`}>timer</span>
                  <h2 className={statusStyles.panelHeaderTitle}>Right Now</h2>
                </div>
                <span className={statusStyles.panelHeaderLive}>
                  <span className={statusStyles.livePulse} />
                  <span className={statusStyles.liveDot} />
                </span>
              </div>

              <div className={statusStyles.panelContentGrid}>
                <div className={statusStyles.venueCardInUse}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={statusStyles.venueIconRed}>
                        <span className="material-icons">science</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">AICTE Idea Lab</h3>
                        <p className="text-xs text-slate-500 font-medium">Capacity: 60 • First Floor</p>
                      </div>
                    </div>
                    <span className={statusStyles.badgeInUse}>In Use</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium">
                      <span>Current Session: IoT Workshop</span>
                      <span className="text-status-red">Ends in 26m</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-status-red w-[75%] rounded-full" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-sm">person</span> Prof. Ramesh
                    </span>
                    <span className="font-semibold text-status-green">Free at 2:00 PM</span>
                  </div>
                </div>

                <div className={statusStyles.venueCardAvailable}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={statusStyles.venueIconGreen}>
                        <span className="material-icons">podium</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Seminar Hall</h3>
                        <p className="text-xs text-slate-500 font-medium">Capacity: 120 • Ground Floor</p>
                      </div>
                    </div>
                    <span className={statusStyles.badgeAvailable}>Available</span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 bg-gray-50 dark:bg-slate-700/50 p-2 rounded border border-gray-100 dark:border-gray-700">
                    Currently vacant. Next booking starts at <span className="font-bold">3:00 PM</span>.
                  </p>
                  <button className={statusStyles.buttonGreen} type="button">
                    <span className="material-icons text-lg">add_circle</span>
                    Book Now
                  </button>
                </div>

                <div className={statusStyles.venueCardMaintenance}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={statusStyles.venueIconAmber}>
                        <span className="material-icons">meeting_room</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Conference Room A</h3>
                        <p className="text-xs text-slate-500 font-medium">Capacity: 15 • Admin Block</p>
                      </div>
                    </div>
                    <span className={statusStyles.badgeMaintenance}>Maintenance</span>
                  </div>

                  <div className={statusStyles.alertBox}>
                    <div className={statusStyles.alertBoxHeader}>
                      <span className={`material-icons ${statusStyles.alertIcon}`}>warning</span>
                      <div>
                        <p className={statusStyles.alertTitle}>Projector Repair</p>
                        <p className={statusStyles.alertText}>Est. completion: 4:00 PM today</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={statusStyles.panelRight}>
              <div className={statusStyles.panelHeader}>
                <div className={statusStyles.panelHeaderLeft}>
                  <span className={`material-icons ${statusStyles.panelHeaderIcon}`}>schedule</span>
                  <h2 className={statusStyles.panelHeaderTitle}>Upcoming Schedule</h2>
                </div>
                <div className={statusStyles.tabGroup}>
                  <button className={statusStyles.tabActive} type="button">
                    Timeline
                  </button>
                  <button className={statusStyles.tabInactive} type="button">
                    List
                  </button>
                </div>
              </div>

              <div className={statusStyles.timeline}>
                <div className={statusStyles.timelineItem}>
                  <div className={statusStyles.timeColumn}>
                    <span className={statusStyles.timeLabel}>2:00 PM</span>
                    <span className={statusStyles.timeSubLabel}>14:00</span>
                    <div className={statusStyles.timeLine} />
                  </div>
                  <div className={statusStyles.eventContent}>
                    <div className={statusStyles.eventRow}>
                      <div className={statusStyles.eventIndicator} />
                      <div className={statusStyles.eventBody}>
                        <div className={statusStyles.eventHeader}>
                          <h4 className={statusStyles.eventTitle}>CS Department Exam</h4>
                          <span className={statusStyles.badgeConfirmed}>Confirmed</span>
                        </div>
                        <div className={statusStyles.eventMeta}>
                          <span>
                            <span className="material-icons text-sm">location_on</span> Computer Lab 2
                          </span>
                          <span>
                            <span className="material-icons text-sm">schedule</span> 2h duration
                          </span>
                        </div>
                        <div className={statusStyles.requester}>
                          <img
                            alt="RK"
                            className={statusStyles.requesterAvatar}
                            src="https://ui-avatars.com/api/?name=Rahul+Kumar&background=fff3e0&color=ff9500"
                          />
                          <span className={statusStyles.requesterName}>Req. by Rahul Kumar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={statusStyles.timelineItem}>
                  <div className={statusStyles.timeColumn}>
                    <span className={statusStyles.timeLabel}>3:00 PM</span>
                    <span className={statusStyles.timeSubLabel}>15:00</span>
                    <div className={statusStyles.timeLine} />
                  </div>
                  <div className={statusStyles.eventContent}>
                    <div className={statusStyles.eventRow}>
                      <div className={statusStyles.eventIndicator} />
                      <div className={statusStyles.eventBody}>
                        <div className={statusStyles.eventHeader}>
                          <h4 className={statusStyles.eventTitle}>Guest Lecture: Future AI</h4>
                          <span className={statusStyles.badgeConfirmed}>Confirmed</span>
                        </div>
                        <div className={statusStyles.eventMeta}>
                          <span>
                            <span className="material-icons text-sm">location_on</span> Seminar Hall A
                          </span>
                          <span>
                            <span className="material-icons text-sm">group</span> 110 Students
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={statusStyles.timelineItem}>
                  <div className={statusStyles.timeColumn}>
                    <span className={statusStyles.timeLabel}>5:00 PM</span>
                    <span className={statusStyles.timeSubLabel}>17:00</span>
                    <div className={statusStyles.timeLine} />
                  </div>
                  <div className={`${statusStyles.eventContent} ${statusStyles.eventContentPending}`}>
                    <div className={statusStyles.eventRow}>
                      <div className={statusStyles.eventIndicatorPending} />
                      <div className={statusStyles.eventBody}>
                        <div className={statusStyles.eventHeader}>
                          <h4 className={statusStyles.eventTitle}>Cultural Club Practice</h4>
                          <span className={statusStyles.badgePending}>Pending Approval</span>
                        </div>
                        <div className={statusStyles.pendingActions}>
                          <div className={statusStyles.pendingMeta}>
                            <span>
                              <span className="material-icons text-sm">location_on</span> Main Auditorium
                            </span>
                          </div>
                          <div className={statusStyles.actionButtons}>
                            <button className={statusStyles.btnSecondary} type="button">
                              Reject
                            </button>
                            <button className={statusStyles.btnPrimary} type="button">
                              Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={statusStyles.timelineItem}>
                  <div className={statusStyles.timeColumn}>
                    <span className={statusStyles.timeLabel}>6:00 PM</span>
                    <span className={statusStyles.timeSubLabel}>18:00</span>
                  </div>
                  <div className={statusStyles.conflictCard}>
                    <div className={statusStyles.eventRow}>
                      <div className={statusStyles.eventIndicatorConflict} />
                      <div className={statusStyles.eventBody}>
                        <div className={statusStyles.eventHeader}>
                          <div className={statusStyles.conflictHeader}>
                            <span className={`material-icons ${statusStyles.conflictIcon}`}>error</span>
                            <h4 className={statusStyles.eventTitle}>Double Booking: AICTE Lab</h4>
                          </div>
                          <span className={statusStyles.badgeConflict}>Conflict Warning</span>
                        </div>
                        <p className={statusStyles.conflictText}>
                          Two requests for same time slot: "Robotics Club" and "Staff Meeting".
                        </p>
                        <button className={statusStyles.conflictAction} type="button">
                          Resolve Conflict <span className="material-icons text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
