import React from 'react'

import Sidebar from './Sidebar'
import layoutStyles from './DashboardPage.module.css'
import statusStyles from './StatusPage.module.css'

export default function StatusPage() {
  return (
    <div className={layoutStyles.root}>
      <input className="hidden" id="mobile-menu-toggle" type="checkbox" />

      <label
        className={`${layoutStyles.mobileOverlay} hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden`}
        htmlFor="mobile-menu-toggle"
      />

      <div className={`${layoutStyles.wrapper} flex h-screen overflow-hidden`}>
        <Sidebar activePage="status" />

        <div className={`${layoutStyles.mainArea} flex-1 flex flex-col min-w-0 transition-all duration-300`}>
          <header className={`${layoutStyles.navBar} h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/10 text-white shrink-0`}>
            <div className="flex items-center gap-4">
              <label className="lg:hidden text-white cursor-pointer p-1 rounded hover:bg-white/10" htmlFor="mobile-menu-toggle">
                <span className="material-icons">menu</span>
              </label>
              <h1 className="text-xl font-semibold tracking-tight truncate">Availability Tracker</h1>
            </div>
 
            <div className="flex items-center gap-6">
              <button className="relative p-1 text-white/80 hover:text-white transition-colors" type="button">
                <span className="material-icons">notifications</span>
                <span className={`absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 ${layoutStyles.navBar}`} />
              </button>

              <div className="flex items-center gap-3 border-l border-white/20 pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-white">Dr. Arul Kumaran</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Chief Administrator</p>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-400 border-2 border-primary/20 flex-shrink-0">
                  <img
                    alt="Admin Profile"
                    className="w-full h-full object-cover"
                    src="https://ui-avatars.com/api/?name=Arul+Kumaran&background=0D47A1&color=fff"
                  />
                </div>
              </div>
            </div>
          </header>

          <div className={statusStyles.toolbar}>
            <div className={statusStyles.toolLeft}>
              <div className={statusStyles.datePicker}>
                <button className={statusStyles.navBtn} type="button">
                  <span className="material-icons text-lg">chevron_left</span>
                </button>
                <div className={statusStyles.dateInfo}>
                  <span className="material-icons text-slate-400 text-lg">calendar_today</span>
                  <span className="text-sm font-semibold text-slate-700">Today, Jan 26, 2026</span>
                </div>
                <button className={statusStyles.navBtn} type="button">
                  <span className="material-icons text-lg">chevron_right</span>
                </button>
              </div>

              <div className="h-8 w-px bg-gray-200" />

              <div className={statusStyles.filterWrap}>
                <select className={statusStyles.filterDrop}>
                  <option>All Venues (15)</option>
                  <option>Lecture Halls</option>
                  <option>Labs</option>
                  <option>Auditoriums</option>
                </select>
                <span className={`material-icons ${statusStyles.filterIco}`}>filter_alt</span>
                <span className={`material-icons ${statusStyles.filterArrow}`}>expand_more</span>
              </div>
            </div>

            <div className={statusStyles.toolRight}>
              <div className={statusStyles.toggleWrap}>
                <span className={statusStyles.toggleLbl}>Auto-refresh</span>
                <button aria-checked="true" className={statusStyles.toggle} role="switch" type="button">
                  <span className={statusStyles.knob} />
                </button>
              </div>

              <div className={statusStyles.livePill}>
                <span className={statusStyles.liveRing}>
                  <span className={statusStyles.livePulse} />
                  <span className={statusStyles.liveDot} />
                </span>
                <span className={statusStyles.liveLabel}>Live Updates</span>
              </div>
            </div>
          </div>

          <main className={statusStyles.body}>
            <div className={statusStyles.fabGroup}>
              <button className={statusStyles.fabSecondary} type="button">
                <span className="material-icons">handyman</span>
                <span>Block Maintenance</span>
              </button>
              <button className={statusStyles.fabPrimary} type="button">
                <span className="material-icons">add</span>
                <span>Add Booking</span>
              </button>
            </div>

            <div className={statusStyles.leftPanel}>
              <div className={statusStyles.pHead}>
                <div className={statusStyles.pHeadLeft}>
                  <span className={`material-icons ${statusStyles.pHeadIcon}`}>timer</span>
                  <h2 className={statusStyles.pHeadTitle}>Right Now</h2>
                </div>
                <span className={statusStyles.pHeadLive}>
                  <span className={statusStyles.livePulse} />
                  <span className={statusStyles.liveDot} />
                </span>
              </div>

              <div className={statusStyles.pGrid}>
                <div className={statusStyles.cardInUse}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={statusStyles.iconRed}>
                        <span className="material-icons">science</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">AICTE Idea Lab</h3>
                        <p className="text-xs text-slate-500 font-medium">Capacity: 60 • First Floor</p>
                      </div>
                    </div>
                    <span className={statusStyles.tagInUse}>In Use</span>
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

                <div className={statusStyles.cardOpen}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={statusStyles.iconGreen}>
                        <span className="material-icons">podium</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Seminar Hall</h3>
                        <p className="text-xs text-slate-500 font-medium">Capacity: 120 • Ground Floor</p>
                      </div>
                    </div>
                    <span className={statusStyles.tagOpen}>Available</span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 bg-gray-50 dark:bg-slate-700/50 p-2 rounded border border-gray-100 dark:border-gray-700">
                    Currently vacant. Next booking starts at <span className="font-bold">3:00 PM</span>.
                  </p>
                  <button className={statusStyles.btnGreen} type="button">
                    <span className="material-icons text-lg">add_circle</span>
                    Book Now
                  </button>
                </div>

                <div className={statusStyles.cardMaint}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={statusStyles.iconAmber}>
                        <span className="material-icons">meeting_room</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Conference Room A</h3>
                        <p className="text-xs text-slate-500 font-medium">Capacity: 15 • Admin Block</p>
                      </div>
                    </div>
                    <span className={statusStyles.tagMaint}>Maintenance</span>
                  </div>

                  <div className={statusStyles.alert}>
                    <div className={statusStyles.alertHead}>
                      <span className={`material-icons ${statusStyles.alertIco}`}>warning</span>
                      <div>
                        <p className={statusStyles.alertLbl}>Projector Repair</p>
                        <p className={statusStyles.alertMsg}>Est. completion: 4:00 PM today</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={statusStyles.rightPanel}>
              <div className={statusStyles.pHead}>
                <div className={statusStyles.pHeadLeft}>
                  <span className={`material-icons ${statusStyles.pHeadIcon}`}>schedule</span>
                  <h2 className={statusStyles.pHeadTitle}>Upcoming Schedule</h2>
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

              <div className={statusStyles.schedule}>
                <div className={statusStyles.scheduleRow}>
                  <div className={statusStyles.timeCol}>
                    <span className={statusStyles.timeLabel}>2:00 PM</span>
                    <span className={statusStyles.timeSub}>14:00</span>
                    <div className={statusStyles.schedule} />
                  </div>
                  <div className={statusStyles.event}>
                    <div className={statusStyles.eventRow}>
                      <div className={statusStyles.dot} />
                      <div className={statusStyles.eventBody}>
                        <div className={statusStyles.eventHead}>
                          <h4 className={statusStyles.eventName}>CS Department Exam</h4>
                          <span className={statusStyles.tagOk}>Confirmed</span>
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
                            className={statusStyles.reqAvatar}
                            src="https://ui-avatars.com/api/?name=Rahul+Kumar&background=fff3e0&color=ff9500"
                          />
                          <span className={statusStyles.reqName}>Req. by Rahul Kumar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={statusStyles.scheduleRow}>
                  <div className={statusStyles.timeCol}>
                    <span className={statusStyles.timeLabel}>3:00 PM</span>
                    <span className={statusStyles.timeSub}>15:00</span>
                    <div className={statusStyles.schedule} />
                  </div>
                  <div className={statusStyles.event}>
                    <div className={statusStyles.eventRow}>
                      <div className={statusStyles.dot} />
                      <div className={statusStyles.eventBody}>
                        <div className={statusStyles.eventHead}>
                          <h4 className={statusStyles.eventName}>Guest Lecture: Future AI</h4>
                          <span className={statusStyles.tagOk}>Confirmed</span>
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

                <div className={statusStyles.scheduleRow}>
                  <div className={statusStyles.timeCol}>
                    <span className={statusStyles.timeLabel}>5:00 PM</span>
                    <span className={statusStyles.timeSub}>17:00</span>
                    <div className={statusStyles.schedule} />
                  </div>
                  <div className={`${statusStyles.event} ${statusStyles.eventPending}`}>
                    <div className={statusStyles.eventRow}>
                      <div className={statusStyles.dotPending} />
                      <div className={statusStyles.eventBody}>
                        <div className={statusStyles.eventHead}>
                          <h4 className={statusStyles.eventName}>Cultural Club Practice</h4>
                          <span className={statusStyles.tagPending}>Pending Approval</span>
                        </div>
                        <div className={statusStyles.pendingRow}>
                          <div className={statusStyles.pendingInfo}>
                            <span>
                              <span className="material-icons text-sm">location_on</span> Main Auditorium
                            </span>
                          </div>
                          <div className={statusStyles.btnRow}>
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

                <div className={statusStyles.scheduleRow}>
                  <div className={statusStyles.timeCol}>
                    <span className={statusStyles.timeLabel}>6:00 PM</span>
                    <span className={statusStyles.timeSub}>18:00</span>
                  </div>
                  <div className={statusStyles.conflictItem}>
                    <div className={statusStyles.eventRow}>
                      <div className={statusStyles.dotConflict} />
                      <div className={statusStyles.eventBody}>
                        <div className={statusStyles.eventHead}>
                          <div className={statusStyles.conflictHead}>
                            <span className={`material-icons ${statusStyles.conflictIcon}`}>error</span>
                            <h4 className={statusStyles.eventName}>Double Booking: AICTE Lab</h4>
                          </div>
                          <span className={statusStyles.tagConflict}>Conflict Warning</span>
                        </div>
                        <p className={statusStyles.conflictMsg}>
                          Two requests for same time slot: "Robotics Club" and "Staff Meeting".
                        </p>
                        <button className={statusStyles.conflictBtn} type="button">
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
