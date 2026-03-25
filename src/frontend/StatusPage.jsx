import React, { useEffect, useMemo, useRef, useState } from 'react'

import AdminBookingDetailsPopUpFM from './Alerts/AdminBookingDetailsPopUpFM'
import detailsPopupStyles from './Alerts/AdminBookingDetailsPopUpFM.module.css'
import AdminCancelBookingPopUpFM from './Alerts/AdminCancelBookingPopUpFM'
import cancelPopupStyles from './Alerts/AdminCancelBookingPopUpFM.module.css'
import AdminEditBookingPopUpFM from './Alerts/AdminEditBookingPopUpFM'
import editPopupStyles from './Alerts/AdminEditBookingPopUpFM.module.css'
import AdminEditBookingSuccessPopUpFM from './Alerts/AdminEditBookingSuccessPopUpFM'
import editSuccessPopupStyles from './Alerts/AdminEditBookingSuccessPopUpFM.module.css'
import PageHeader from './PageHeader'
import Sidebar from './Sidebar'
import layoutStyles from './DashboardPage.module.css'
import statusStyles from './StatusPage.module.css'

// TODO: Replace with API calls when backend ready
const RIGHT_NOW_DATA = [
  {
    id: 'aicte-idea-lab',
    type: 'inUse',
    icon: 'science',
    venue: 'AICTE Idea Lab',
    badge: 'IN USE',
    capacityText: 'Capacity: 60 • First Floor',
    sessionText: 'Current Session: IoT Workshop',
    requestedBy: 'Prof. Ramesh',
    freeAt: '2:00 PM',
  },
  {
    id: 'seminar-hall',
    type: 'available',
    icon: 'storefront',
    venue: 'Seminar Hall',
    badge: 'AVAILABLE',
    capacityText: 'Capacity: 120 • Ground Floor',
    vacancyText: 'Currently vacant.',
    nextBookingText: 'Next booking starts at 3:00 PM.',
  },
  {
    id: 'conference-room-a',
    type: 'maintenance',
    icon: 'meeting_room',
    venue: 'Conference Room A',
    badge: 'MAINTENANCE',
    capacityText: 'Capacity: 15 • Admin Block',
    maintenanceReason: 'PROJECTOR REPAIR',
    etaText: 'Est. completion: 4:00 PM today',
  },
]

const UPCOMING_DATA = [
  {
    id: 'cs-exam',
    type: 'confirmed',
    time12: '2:00 PM',
    time24: '14:00',
    title: 'CS Department Exam',
    venue: 'Computer Lab 2',
    statusText: 'CONFIRMED',
    metaTwoIcon: 'schedule',
    metaTwoText: '2h duration',
    requesterName: 'Rahul Kumar',
    requesterInitials: 'RK',
  },
  {
    id: 'guest-lecture-future-ai',
    type: 'confirmed',
    time12: '3:00 PM',
    time24: '15:00',
    title: 'Guest Lecture: Future AI',
    venue: 'Seminar Hall A',
    statusText: 'CONFIRMED',
    metaTwoIcon: 'groups',
    metaTwoText: '110 Students',
  },
  {
    id: 'cultural-club-practice',
    type: 'pending',
    time12: '5:00 PM',
    time24: '17:00',
    title: 'Cultural Club Practice',
    venue: 'Main Auditorium',
    statusText: 'PENDING APPROVAL',
  },
  {
    id: 'double-booking-aicte-lab',
    type: 'conflict',
    time12: '6:00 PM',
    time24: '18:00',
    title: 'Double Booking: AICTE Lab',
    venue: 'AICTE Lab',
    statusText: 'CONFLICT WARNING',
    conflictText: 'Two requests for same time slot: "Robotics Club" and "Staff Meeting".',
  },
]

const VENUE_OPTIONS = [
  'AICTE Idea Lab',
  'Seminar Hall',
  'Conference Room A',
  'Computer Lab 2',
  'Seminar Hall A',
  'Main Auditorium',
  'AICTE Lab',
]

function formatDisplayDate(date) {
  const today = new Date()
  const selected = new Date(date)
  const isToday = selected.toDateString() === today.toDateString()

  return isToday
    ? `Today, ${selected.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`
    : selected.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
}

function toInputDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseInputDate(value) {
  const [year, month, day] = value.split('-').map(Number)
  const result = new Date()
  result.setFullYear(year, month - 1, day)
  result.setHours(0, 0, 0, 0)
  return result
}

function formatTimeClock(date) {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function StatusPage({ isSidebarOpen, setIsSidebarOpen }) {
  const dateInputRef = useRef(null)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [selectedVenue, setSelectedVenue] = useState('ALL')
  const [autoRefreshOn, setAutoRefreshOn] = useState(true)
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date())
  const [upcomingView, setUpcomingView] = useState('timeline')
  const [upcomingItems, setUpcomingItems] = useState(UPCOMING_DATA)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isEditSuccessOpen, setIsEditSuccessOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)

  useEffect(() => {
    if (!autoRefreshOn) {
      return undefined
    }

    const intervalId = setInterval(() => {
      setLastRefreshedAt(new Date())
    }, 1000)

    return () => clearInterval(intervalId)
  }, [autoRefreshOn])

  const filteredRightNowItems = useMemo(() => {
    if (selectedVenue === 'ALL') {
      return RIGHT_NOW_DATA
    }
    return RIGHT_NOW_DATA.filter((item) => item.venue === selectedVenue)
  }, [selectedVenue])

  const filteredUpcomingItems = useMemo(() => {
    if (selectedVenue === 'ALL') {
      return upcomingItems
    }
    return upcomingItems.filter((item) => item.venue === selectedVenue)
  }, [selectedVenue, upcomingItems])

  const closeBookingFlow = () => {
    setIsDetailsOpen(false)
    setIsEditOpen(false)
    setIsEditSuccessOpen(false)
    setIsCancelOpen(false)
    setSelectedBooking(null)
  }

  const openDetailsForConfirmed = (item) => {
    if (item.type !== 'confirmed') {
      return
    }
    setSelectedBooking(item)
    setIsDetailsOpen(true)
  }

  const handleCancelBooking = ({ bookingId, reason }) => {
    setUpcomingItems((prev) => prev.filter((item) => item.id !== bookingId))
    void reason
  }

  useEffect(() => {
    const modalOpen = isDetailsOpen || isEditOpen || isEditSuccessOpen || isCancelOpen
    if (!modalOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeBookingFlow()
      }
    }

    const handlePointerDown = (event) => {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const clickedInsideModal = target.closest(
        `.${detailsPopupStyles.modal}, .${editPopupStyles.modal}, .${editSuccessPopupStyles.modal}, .${cancelPopupStyles.modal}`,
      )

      if (clickedInsideModal) {
        return
      }

      const clickedOverlay = target.closest(
        `.${detailsPopupStyles.backdrop}, .${editPopupStyles.backdrop}, .${editSuccessPopupStyles.backdrop}, .${cancelPopupStyles.overlay}`,
      )

      if (clickedOverlay) {
        closeBookingFlow()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown, true)
    }
  }, [isDetailsOpen, isEditOpen, isEditSuccessOpen, isCancelOpen])

  const rightNowProgress = useMemo(() => {
    const now = lastRefreshedAt
    const mockStart = new Date(now.getTime() - 45 * 60000)
    const mockEnd = new Date(now.getTime() + 26 * 60000)
    const percent = Math.min(100, Math.max(0, ((now - mockStart) / (mockEnd - mockStart)) * 100))
    const minsLeft = Math.max(0, Math.round((mockEnd - now) / 60000))

    return {
      percent,
      endsInText: `Ends in ${minsLeft}m`,
    }
  }, [lastRefreshedAt])

  const goToPreviousDate = () => {
    setSelectedDate((previous) => {
      const nextDate = new Date(previous)
      nextDate.setDate(nextDate.getDate() - 1)
      return nextDate
    })
  }

  const goToNextDate = () => {
    setSelectedDate((previous) => {
      const nextDate = new Date(previous)
      nextDate.setDate(nextDate.getDate() + 1)
      return nextDate
    })
  }

  return (
    <div className={layoutStyles.page}>
      <div className={layoutStyles.wrap}>
        <Sidebar activePage="status" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className={layoutStyles.main}>
          <PageHeader title="Availability Tracker" setIsSidebarOpen={setIsSidebarOpen} />

          <section className={statusStyles.controlsBar}>
            <div className={statusStyles.dateNavigator}>
              <button className={statusStyles.navButton} onClick={goToPreviousDate} type="button">
                <span className="material-icons">chevron_left</span>
              </button>
              <div
                className={statusStyles.dateDisplay}
                onClick={() => dateInputRef.current?.showPicker()}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <input
                  aria-label="Select date"
                  onChange={(event) => {
                    if (!event.target.value) {
                      return
                    }
                    setSelectedDate(parseInputDate(event.target.value))
                  }}
                  ref={dateInputRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 10,
                    pointerEvents: 'auto',
                  }}
                  type="date"
                  value={toInputDateValue(selectedDate)}
                />
                <span className="material-icons">calendar_today</span>
                <span className={statusStyles.dateText}>{formatDisplayDate(selectedDate)}</span>
              </div>
              <button className={statusStyles.navButton} onClick={goToNextDate} type="button">
                <span className="material-icons">chevron_right</span>
              </button>
            </div>

            <div className={statusStyles.controlsRight}>
              <div className={statusStyles.filterWrapper}>
                <span className={`material-icons ${statusStyles.filterIcon}`}>filter_alt</span>
                <select
                  className={statusStyles.filterSelect}
                  onChange={(event) => setSelectedVenue(event.target.value)}
                  value={selectedVenue}
                >
                  <option value="ALL">All Venues (7)</option>
                  {VENUE_OPTIONS.map((venue) => (
                    <option key={venue} value={venue}>
                      {venue}
                    </option>
                  ))}
                </select>
                <span className={`material-icons ${statusStyles.filterChevron}`}>expand_more</span>
              </div>

              <div className={statusStyles.refreshGroup}>
                <span className={statusStyles.refreshLabel}>Auto-refresh</span>
                <button
                  aria-checked={autoRefreshOn}
                  className={statusStyles.toggleSwitch}
                  onClick={() => {
                    if (!autoRefreshOn) {
                      setLastRefreshedAt(new Date())
                    }
                    setAutoRefreshOn((previous) => !previous)
                  }}
                  role="switch"
                  type="button"
                >
                  <span className={statusStyles.toggleKnob} />
                </button>
                <span className={statusStyles.refreshTime}>Last refreshed at {formatTimeClock(lastRefreshedAt)}</span>
              </div>

              <div className={statusStyles.liveBadge}>
                <span className={statusStyles.liveDotWrap}>
                  {autoRefreshOn ? <span className={statusStyles.livePulse} /> : null}
                  <span className={statusStyles.liveDot} />
                </span>
                <span className={statusStyles.liveText}>LIVE UPDATES</span>
              </div>
            </div>
          </section>

          <main className={statusStyles.mainContent}>
            <section className={`${statusStyles.panel} ${statusStyles.panelUpcoming}`}>
              <header className={statusStyles.panelHeader}>
                <div className={statusStyles.panelHeaderTitleWrap}>
                  <span className={`material-icons ${statusStyles.panelHeaderIcon}`}>schedule</span>
                  <h2 className={statusStyles.panelHeaderTitle}>RIGHT NOW</h2>
                </div>
                <span className={statusStyles.panelHeaderLive}>
                  {autoRefreshOn ? <span className={statusStyles.livePulse} /> : null}
                  <span className={statusStyles.liveDot} />
                </span>
              </header>

              <div className={statusStyles.panelBody}>
                {filteredRightNowItems.map((item) => (
                  <article
                    className={
                      item.type === 'inUse'
                        ? statusStyles.venueCardInUse
                        : item.type === 'available'
                          ? statusStyles.venueCardAvailable
                          : statusStyles.venueCardMaintenance
                    }
                    key={item.id}
                  >
                    <div className={statusStyles.venueTopRow}>
                      <div className={statusStyles.venueIdentity}>
                        <span
                          className={
                            item.type === 'inUse'
                              ? statusStyles.venueIconInUse
                              : item.type === 'available'
                                ? statusStyles.venueIconAvailable
                                : statusStyles.venueIconMaintenance
                          }
                        >
                          <span className="material-icons">{item.icon}</span>
                        </span>
                        <div>
                          <h3 className={statusStyles.venueName}>{item.venue}</h3>
                          <p className={statusStyles.venueCapacity}>{item.capacityText}</p>
                        </div>
                      </div>

                      <span
                        className={
                          item.type === 'inUse'
                            ? statusStyles.badgeInUse
                            : item.type === 'available'
                              ? statusStyles.badgeAvailable
                              : statusStyles.badgeMaintenance
                        }
                      >
                        {item.badge}
                      </span>
                    </div>

                    {item.type === 'inUse' ? (
                      <>
                        <p className={statusStyles.sessionText}>{item.sessionText}</p>
                        <div className={statusStyles.progressRow}>
                          <div className={statusStyles.progressBar}>
                            <div className={statusStyles.progressFill} style={{ width: `${rightNowProgress.percent}%` }} />
                          </div>
                          <span className={statusStyles.endsInText}>{rightNowProgress.endsInText}</span>
                        </div>
                        <div className={statusStyles.footerRow}>
                          <span className={statusStyles.requestedBy}>
                            <span className="material-icons">person</span>
                            {item.requestedBy}
                          </span>
                          <span className={statusStyles.freeAtText}>Free at {item.freeAt}</span>
                        </div>
                      </>
                    ) : null}

                    {item.type === 'available' ? (
                      <div className={statusStyles.availableMeta}>
                        <p className={statusStyles.vacantText}>{item.vacancyText}</p>
                        <p className={statusStyles.nextBookingText}>{item.nextBookingText}</p>
                      </div>
                    ) : null}

                    {item.type === 'maintenance' ? (
                      <div className={statusStyles.maintenanceMeta}>
                        <p className={statusStyles.maintenanceReason}>
                          <span className="material-icons">warning</span>
                          {item.maintenanceReason}
                        </p>
                        <p className={statusStyles.maintenanceEta}>{item.etaText}</p>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <section className={statusStyles.panel}>
              <header className={statusStyles.panelHeader}>
                <div className={statusStyles.panelHeaderTitleWrap}>
                  <span className={`material-icons ${statusStyles.panelHeaderIcon}`}>schedule</span>
                  <h2 className={statusStyles.panelHeaderTitle}>UPCOMING SCHEDULE</h2>
                </div>

                <div className={statusStyles.tabGroup}>
                  <button
                    className={upcomingView === 'timeline' ? statusStyles.tabActive : statusStyles.tabInactive}
                    onClick={() => setUpcomingView('timeline')}
                    type="button"
                  >
                    Timeline
                  </button>
                  <button
                    className={upcomingView === 'list' ? statusStyles.tabActive : statusStyles.tabInactive}
                    onClick={() => setUpcomingView('list')}
                    type="button"
                  >
                    List
                  </button>
                </div>
              </header>

              {upcomingView === 'timeline' ? (
                <div className={statusStyles.timeline}>
                  {filteredUpcomingItems.map((item, index) => {
                    const showConnector = index < filteredUpcomingItems.length - 1

                    return (
                      <article className={statusStyles.timelineRow} key={item.id}>
                        <div className={statusStyles.timeColumn}>
                          <span className={statusStyles.time12}>{item.time12}</span>
                          <span className={statusStyles.time24}>{item.time24}</span>
                          {showConnector ? <span className={statusStyles.timeConnector} /> : null}
                        </div>

                        <div
                          className={
                            item.type === 'confirmed'
                              ? statusStyles.eventCardConfirmed
                              : item.type === 'pending'
                                ? statusStyles.eventCardPending
                                : statusStyles.eventCardConflict
                          }
                          onClick={item.type === 'confirmed' ? () => openDetailsForConfirmed(item) : undefined}
                          onKeyDown={
                            item.type === 'confirmed'
                              ? (event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    openDetailsForConfirmed(item)
                                  }
                                }
                              : undefined
                          }
                          role={item.type === 'confirmed' ? 'button' : undefined}
                          tabIndex={item.type === 'confirmed' ? 0 : undefined}
                        >
                          <div className={statusStyles.eventHead}>
                            <h4 className={statusStyles.eventTitleRow}>
                              {item.type === 'conflict' ? (
                                <span className={statusStyles.conflictTitleWrap}>
                                  <span className={`material-icons ${statusStyles.conflictWarnIcon}`}>error</span>
                                  {item.title}
                                </span>
                              ) : (
                                item.title
                              )}
                            </h4>
                            <span
                              className={
                                item.type === 'confirmed'
                                  ? statusStyles.badgeConfirmed
                                  : item.type === 'pending'
                                    ? statusStyles.badgePending
                                    : statusStyles.badgeConflict
                              }
                            >
                              {item.statusText}
                            </span>
                          </div>

                          {item.type !== 'conflict' ? (
                            <div className={statusStyles.eventMeta}>
                              <span>
                                <span className="material-icons">location_on</span>
                                {item.venue}
                              </span>
                              {item.metaTwoText ? (
                                <span>
                                  <span className="material-icons">{item.metaTwoIcon}</span>
                                  {item.metaTwoText}
                                </span>
                              ) : null}
                            </div>
                          ) : null}

                          {item.requesterName ? (
                            <div className={statusStyles.requesterLine}>
                              <span className={statusStyles.requesterAvatar}>{item.requesterInitials}</span>
                              <span className={statusStyles.requesterText}>Req. by {item.requesterName}</span>
                            </div>
                          ) : null}

                          {item.type === 'pending' ? (
                            <div className={statusStyles.pendingActions}>
                              <button className={statusStyles.btnSecondary} type="button">
                                Reject
                              </button>
                              <button className={statusStyles.btnPrimary} type="button">
                                Approve
                              </button>
                            </div>
                          ) : null}

                          {item.type === 'conflict' ? (
                            <>
                              <p className={statusStyles.conflictBodyText}>{item.conflictText}</p>
                              <div className={statusStyles.conflictActions}>
                                <button className={statusStyles.resolveLink} type="button">
                                  Resolve Conflict
                                  <span className="material-icons">arrow_forward</span>
                                </button>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className={statusStyles.listView}>
                  <div className={statusStyles.listHeader}>
                    <span>Time</span>
                    <span>Event</span>
                    <span>Venue</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>

                  {filteredUpcomingItems.map((item) => (
                    <article className={statusStyles.listRow} key={item.id}>
                      <span className={statusStyles.listTime}>{item.time12}</span>
                      <span className={statusStyles.listEvent}>{item.title}</span>
                      <span className={statusStyles.listVenue}>{item.venue}</span>
                      <span
                        className={
                          item.type === 'confirmed'
                            ? statusStyles.badgeConfirmed
                            : item.type === 'pending'
                              ? statusStyles.badgePending
                              : statusStyles.badgeConflict
                        }
                      >
                        {item.statusText}
                      </span>
                      <span className={statusStyles.listActions}>
                        {item.type === 'confirmed' ? (
                          <button
                            className={statusStyles.btnSecondary}
                            onClick={() => openDetailsForConfirmed(item)}
                            type="button"
                          >
                            View
                          </button>
                        ) : null}
                        {item.type === 'pending' ? (
                          <>
                            <button className={statusStyles.btnSecondary} type="button">
                              Reject
                            </button>
                            <button className={statusStyles.btnPrimary} type="button">
                              Approve
                            </button>
                          </>
                        ) : null}
                        {item.type === 'conflict' ? (
                          <button className={statusStyles.resolveBtn} type="button">
                            Resolve
                          </button>
                        ) : null}
                      </span>
                    </article>
                  ))}
                </div>
              )}

              <button className={statusStyles.blockMaintenanceFloatingBtn} type="button">
                <span className="material-icons">handyman</span>
                Block Maintenance
              </button>
            </section>
          </main>
        </div>
      </div>

      {isDetailsOpen && selectedBooking ? (
        <AdminBookingDetailsPopUpFM
          bookingId={`#BK-${selectedBooking.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`}
          contactHref="tel:9876543210"
          contactText="9876543210"
          onCancelClick={() => {
            setIsDetailsOpen(false)
            setIsCancelOpen(true)
          }}
          onClose={closeBookingFlow}
          onEditClick={() => {
            setIsDetailsOpen(false)
            setIsEditOpen(true)
          }}
          organizerText={selectedBooking.requesterName || 'Organizer not available'}
          statusText={selectedBooking.statusText}
          statusVariant={selectedBooking.type === 'confirmed' ? 'success' : 'danger'}
          timeText={`${selectedBooking.time12} (${selectedBooking.time24})`}
          title={selectedBooking.title}
          venueText={selectedBooking.venue}
        />
      ) : null}

      {isEditOpen && selectedBooking ? (
        <AdminEditBookingPopUpFM
          bookingId={`#BK-${selectedBooking.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`}
          initialDate={toInputDateValue(selectedDate)}
          initialEndTime={selectedBooking.time24}
          initialEventTitle={selectedBooking.title}
          initialOrganizer={selectedBooking.requesterName || ''}
          initialStartTime={selectedBooking.time24}
          onClose={closeBookingFlow}
          onConfirm={() => {
            setIsEditOpen(false)
            setIsEditSuccessOpen(true)
          }}
          organizerHint={selectedBooking.requesterName || ''}
          prefilledVenue=""
          subtitle={selectedBooking.venue}
        />
      ) : null}

      {isEditSuccessOpen && selectedBooking ? (
        <AdminEditBookingSuccessPopUpFM
          bookingId={`#BK-${selectedBooking.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`}
          eventName={selectedBooking.title}
          onClose={closeBookingFlow}
          organizerName={selectedBooking.requesterName || 'the organizer'}
        />
      ) : null}

      {isCancelOpen && selectedBooking ? (
        <AdminCancelBookingPopUpFM
          booking={{
            id: selectedBooking.id,
            eventTitle: selectedBooking.title,
            organizer: selectedBooking.requesterName || 'the organizer',
          }}
          onClose={closeBookingFlow}
          onConfirmCancel={(bookingPayload, reason) =>
            handleCancelBooking({
              bookingId: bookingPayload?.id,
              reason,
            })
          }
        />
      ) : null}
    </div>
  )
}