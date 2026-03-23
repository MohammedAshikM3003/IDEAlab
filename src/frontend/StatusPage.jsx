import React, { useEffect, useMemo, useRef, useState } from 'react'

import PageHeader from './PageHeader'
import Sidebar from './Sidebar'
import layoutStyles from './DashboardPage.module.css'
import statusStyles from './StatusPage.module.css'
import AdminBookingDetailsPopUp from './Alerts/AdminBookingDetailsPopUpFM'
import AdminBookingSuccessModalPopUp from './Alerts/AdminBookingSuccessModalPopUp'
import AdminDeletePopUp from './Alerts/AdminDeletePopUp'
import AdminDeletePopUpFM from './Alerts/AdminDeletePopUpFM'
import AdminEditBookingPopUpFM from './Alerts/AdminEditBookingPopUpFM'
import AdminEditBookingSuccessPopUpFM from './Alerts/AdminEditBookingSuccessPopUpFM'
import AdminInternalBookingPopUp from './Alerts/AdminInternalBookingPopUpFM'
import AdminInquirySentPopUpFM from './Alerts/AdminInquirySentPopUpFM'
import AdminMaintenanceBlockingPopUp from './Alerts/AdminMaintenanceBlockingPopUpFM'
import AdminMaintenanceSuccessPopUp from './Alerts/AdminMaintenanceSuccessPopUpFM'

const RIGHT_NOW_DATA = [
  {
    id: 'aicte-idea-lab',
    venue: 'AICTE Idea Lab',
    type: 'inUse',
    icon: 'science',
    capacityText: 'Capacity: 60 • First Floor',
    badge: 'In Use',
    currentSession: 'IoT Workshop',
    endsIn: 'Ends in 26m',
    progressWidth: '75%',
    instructor: 'Prof. Ramesh',
    nextFree: 'Free at 2:00 PM',
  },
  {
    id: 'seminar-hall',
    venue: 'Seminar Hall',
    type: 'available',
    icon: 'podium',
    capacityText: 'Capacity: 120 • Ground Floor',
    badge: 'Available',
    notice: 'Currently vacant. Next booking starts at',
    nextBooking: '3:00 PM',
  },
  {
    id: 'conference-room-a',
    venue: 'Conference Room A',
    type: 'maintenance',
    icon: 'meeting_room',
    capacityText: 'Capacity: 15 • Admin Block',
    badge: 'Maintenance',
    alertTitle: 'Projector Repair',
    alertText: 'Est. completion: 4:00 PM today',
  },
]

const UPCOMING_DATA = [
  {
    id: 'cs-exam',
    time: '2:00 PM',
    time24: '14:00',
    title: 'CS Department Exam',
    venue: 'Computer Lab 2',
    badge: 'Confirmed',
    type: 'confirmed',
    metaTwoIcon: 'schedule',
    metaTwoText: '2h duration',
    requester: {
      name: 'Rahul Kumar',
      initials: 'RK',
      avatar: 'https://ui-avatars.com/api/?name=Rahul+Kumar&background=fff3e0&color=ff9500',
    },
    organizerText: 'Prof. Rahul (CSE Dept)',
    contactText: '9876543210',
    contactHref: 'tel:9876543210',
    timeText: '2:00 PM - 4:00 PM',
    bookingId: '#KSR-2489',
  },
  {
    id: 'guest-lecture-future-ai',
    time: '3:00 PM',
    time24: '15:00',
    title: 'Guest Lecture: Future AI',
    venue: 'Seminar Hall A',
    badge: 'Confirmed',
    type: 'confirmed',
    metaTwoIcon: 'group',
    metaTwoText: '110 Students',
    organizerText: 'Dr. Meera (ECE Dept)',
    contactText: '9123456780',
    contactHref: 'tel:9123456780',
    timeText: '3:00 PM - 5:00 PM',
    bookingId: '#KSR-2511',
  },
  {
    id: 'cultural-club-practice',
    time: '5:00 PM',
    time24: '17:00',
    title: 'Cultural Club Practice',
    venue: 'Main Auditorium',
    badge: 'Pending Approval',
    type: 'pending',
    organizerText: 'Cultural Club Coordinator',
    contactText: '9000012345',
    contactHref: 'tel:9000012345',
    timeText: '5:00 PM - 6:30 PM',
    bookingId: '#KSR-2538',
  },
  {
    id: 'double-booking-aicte-lab',
    time: '6:00 PM',
    time24: '18:00',
    title: 'Double Booking: AICTE Lab',
    venue: 'AICTE Lab',
    badge: 'Conflict Warning',
    type: 'conflict',
    conflictText: 'Two requests for same time slot: "Robotics Club" and "Staff Meeting".',
  },
]

function isSameDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

function formatDateLabel(date) {
  const today = new Date()
  const label = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return isSameDay(date, today) ? `Today, ${label}` : label
}

function formatTimeLabel(date) {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function createBookingModalProps(entry) {
  const statusVariant = entry.type === 'rejected' ? 'danger' : 'success'
  const statusText = entry.type === 'rejected' ? 'Rejected' : 'Confirmed'

  return {
    title: entry.title,
    bookingId: entry.bookingId || '#KSR-0000',
    statusText,
    statusVariant,
    organizerText: entry.organizerText || 'Event Organizer',
    contactText: entry.contactText || 'N/A',
    contactHref: entry.contactHref || '#',
    timeText: entry.timeText || `${entry.time} onwards`,
    venueText: entry.venue,
  }
}

function toInputDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function to24HourTime(value) {
  const normalized = value.trim().toUpperCase()
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/)
  if (!match) {
    return ''
  }

  let hour = Number(match[1])
  const minute = match[2]
  const period = match[3]

  if (period === 'AM' && hour === 12) {
    hour = 0
  }
  if (period === 'PM' && hour !== 12) {
    hour += 12
  }

  return `${String(hour).padStart(2, '0')}:${minute}`
}

function extractTimes(timeText) {
  const [rawStart, rawEnd] = timeText.split('-')
  return {
    startTime: rawStart ? to24HourTime(rawStart) : '',
    endTime: rawEnd ? to24HourTime(rawEnd) : '',
  }
}

function buildEditVenues(currentVenue) {
  const baseVenues = [
    { value: 'aicte-idea-lab', label: 'AICTE Idea Lab' },
    { value: 'seminar-hall', label: 'Seminar Hall' },
    { value: 'conference-room-a', label: 'Conference Room A' },
    { value: 'main-auditorium', label: 'Main Auditorium' },
  ]

  if (!currentVenue) {
    return baseVenues
  }

  const hasVenue = baseVenues.some((venue) => venue.value === currentVenue)
  if (hasVenue) {
    return baseVenues
  }

  return [{ value: currentVenue, label: currentVenue }, ...baseVenues]
}

function to12HourTime(time24) {
  if (!time24) {
    return ''
  }

  const [rawHour, rawMinute] = time24.split(':')
  const hour = Number(rawHour)
  const minute = rawMinute || '00'
  const period = hour >= 12 ? 'PM' : 'AM'
  const converted = hour % 12 || 12
  return `${String(converted).padStart(2, '0')}:${minute} ${period}`
}

export default function StatusPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedVenue, setSelectedVenue] = useState('ALL')
  const [autoRefreshOn, setAutoRefreshOn] = useState(true)
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date())
  const [upcomingEntries, setUpcomingEntries] = useState(() => UPCOMING_DATA)
  const [selectedBookingEntry, setSelectedBookingEntry] = useState(null)
  const [approvedEntry, setApprovedEntry] = useState(null)
  const [entryPendingReject, setEntryPendingReject] = useState(null)
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)
  const [isMaintenanceSuccessOpen, setIsMaintenanceSuccessOpen] = useState(false)
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false)
  const [entryForEdit, setEntryForEdit] = useState(null)
  const [bookingPendingCancellation, setBookingPendingCancellation] = useState(null)
  const [cancellationSuccessEntry, setCancellationSuccessEntry] = useState(null)
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false)
  const [editSuccessEntry, setEditSuccessEntry] = useState(null)
  const rejectRemovalTimeoutRef = useRef(null)

  const venueOptions = useMemo(() => {
    const allVenues = [...RIGHT_NOW_DATA.map((item) => item.venue), ...upcomingEntries.map((item) => item.venue)]
    return Array.from(new Set(allVenues))
  }, [upcomingEntries])

  const isToday = useMemo(() => isSameDay(currentDate, new Date()), [currentDate])

  const filteredRightNowItems = useMemo(() => {
    if (!isToday) {
      return []
    }
    if (selectedVenue === 'ALL') {
      return RIGHT_NOW_DATA
    }
    return RIGHT_NOW_DATA.filter((item) => item.venue === selectedVenue)
  }, [isToday, selectedVenue])

  const filteredUpcomingItems = useMemo(() => {
    if (!isToday) {
      return []
    }
    if (selectedVenue === 'ALL') {
      return upcomingEntries
    }
    return upcomingEntries.filter((item) => item.venue === selectedVenue)
  }, [isToday, selectedVenue, upcomingEntries])

  useEffect(() => {
    if (!autoRefreshOn) {
      return undefined
    }

    const intervalId = setInterval(() => {
      setLastRefreshedAt(() => new Date())
    }, 10000)

    return () => {
      clearInterval(intervalId)
    }
  }, [autoRefreshOn])

  useEffect(() => {
    return () => {
      if (rejectRemovalTimeoutRef.current) {
        clearTimeout(rejectRemovalTimeoutRef.current)
      }
    }
  }, [])

  const goToPreviousDay = () => {
    setCurrentDate((prevDate) => {
      const nextDate = new Date(prevDate)
      nextDate.setDate(nextDate.getDate() - 1)
      return nextDate
    })
  }

  const goToNextDay = () => {
    setCurrentDate((prevDate) => {
      const nextDate = new Date(prevDate)
      nextDate.setDate(nextDate.getDate() + 1)
      return nextDate
    })
  }

  const handleAutoRefreshToggle = () => {
    if (!autoRefreshOn) {
      setLastRefreshedAt(new Date())
    }
    setAutoRefreshOn((previousState) => !previousState)
  }

  const handleConfirmedEntryClick = (entry) => {
    if (entry.type !== 'confirmed') {
      return
    }
    setSelectedBookingEntry(entry)
  }

  const handleApprove = (entryId) => {
    const approved = upcomingEntries.find((entry) => entry.id === entryId)
    if (approved) {
      setApprovedEntry({
        title: approved.title,
        dateText: formatDateLabel(currentDate),
      })
    }

    setUpcomingEntries((previousEntries) => {
      return previousEntries.map((entry) => {
        if (entry.id !== entryId) {
          return entry
        }

        return {
          ...entry,
          type: 'confirmed',
          badge: 'Confirmed',
          metaTwoIcon: 'schedule',
          metaTwoText: '1h 30m duration',
        }
      })
    })
  }

  const handleRejectClick = (entryId) => {
    const rejectTarget = upcomingEntries.find((entry) => entry.id === entryId) || null
    setEntryPendingReject(rejectTarget)
  }

  const handleRejectConfirm = () => {
    if (!entryPendingReject) {
      return
    }

    const entryId = entryPendingReject.id
    setEntryPendingReject(null)

    setUpcomingEntries((previousEntries) =>
      previousEntries.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              type: 'rejected',
              badge: 'Rejected',
              isRemoving: true,
            }
          : entry,
      ),
    )

    if (rejectRemovalTimeoutRef.current) {
      clearTimeout(rejectRemovalTimeoutRef.current)
    }

    rejectRemovalTimeoutRef.current = setTimeout(() => {
      setUpcomingEntries((previousEntries) => previousEntries.filter((entry) => entry.id !== entryId))
    }, 1500)
  }

  const handleResolveConflict = (entryId) => {
    setUpcomingEntries((previousEntries) =>
      previousEntries.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              type: 'pending',
              badge: 'Pending Approval',
            }
          : entry,
      ),
    )
  }

  const handleBlockMaintenanceSuccess = () => {
    setIsMaintenanceModalOpen(false)
    setIsMaintenanceSuccessOpen(true)
  }

  const handleDetailsCancelClick = () => {
    if (!selectedBookingEntry) {
      return
    }

    setBookingPendingCancellation(selectedBookingEntry)
    setSelectedBookingEntry(null)
  }

  const handleDetailsEditClick = () => {
    if (!selectedBookingEntry) {
      return
    }

    setEntryForEdit(selectedBookingEntry)
    setIsEditBookingOpen(true)
    setSelectedBookingEntry(null)
  }

  const handleCancelBookingConfirm = ({ reason }) => {
    if (!bookingPendingCancellation) {
      return
    }

    const targetId = bookingPendingCancellation.id
    const cancelledEntry = bookingPendingCancellation

    setUpcomingEntries((previousEntries) => previousEntries.filter((entry) => entry.id !== targetId))
    setBookingPendingCancellation(null)
    setCancellationSuccessEntry({
      ...cancelledEntry,
      cancellationReason: reason || '',
    })
  }

  const handleEditBookingConfirm = (payload) => {
    if (!entryForEdit) {
      return
    }

    const updatedTimeText = `${to12HourTime(payload.startTime)} - ${to12HourTime(payload.endTime)}`

    setUpcomingEntries((previousEntries) =>
      previousEntries.map((entry) => {
        if (entry.id !== entryForEdit.id) {
          return entry
        }

        return {
          ...entry,
          title: payload.eventTitle,
          venue: payload.venue,
          organizerText: payload.organizer,
          timeText: updatedTimeText,
        }
      }),
    )

    setIsEditBookingOpen(false)
    setEditSuccessEntry({
      title: payload.eventTitle,
      bookingId: entryForEdit.bookingId || '#KSR-0000',
      organizer: payload.organizer,
    })
    setEntryForEdit(null)
  }

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
                <button className={statusStyles.navButton} onClick={goToPreviousDay} type="button">
                  <span className="material-icons text-lg">chevron_left</span>
                </button>
                <div className={statusStyles.dateDisplay}>
                  <span className="material-icons text-slate-400 text-lg">calendar_today</span>
                  <span className="text-sm font-semibold text-slate-700">{formatDateLabel(currentDate)}</span>
                </div>
                <button className={statusStyles.navButton} onClick={goToNextDay} type="button">
                  <span className="material-icons text-lg">chevron_right</span>
                </button>
              </div>

              <div className="h-8 w-px bg-gray-200" />

              <div className={statusStyles.filterWrapper}>
                <select
                  className={statusStyles.filterSelect}
                  onChange={(event) => setSelectedVenue(event.target.value)}
                  value={selectedVenue}
                >
                  <option value="ALL">All Venues ({venueOptions.length})</option>
                  {venueOptions.map((venue) => (
                    <option key={venue} value={venue}>
                      {venue}
                    </option>
                  ))}
                </select>
                <span className={`material-icons ${statusStyles.filterIcon}`}>filter_alt</span>
                <span className={`material-icons ${statusStyles.filterChevron}`}>expand_more</span>
              </div>
            </div>

            <div className={statusStyles.toolbarRight}>
              <div className={statusStyles.toggleWrapper}>
                <span className={statusStyles.toggleLabel}>Auto-refresh</span>
                <button
                  aria-checked={autoRefreshOn}
                  className={statusStyles.toggleSwitch}
                  onClick={handleAutoRefreshToggle}
                  role="switch"
                  type="button"
                >
                  <span className={statusStyles.toggleKnob} />
                </button>
                <span className={statusStyles.toggleLabel}>Last refreshed at {formatTimeLabel(lastRefreshedAt)}</span>
              </div>

              <div className={statusStyles.liveBadge}>
                <span className={statusStyles.liveIndicator}>
                  {autoRefreshOn ? <span className={statusStyles.livePulse} /> : null}
                  <span className={statusStyles.liveDot} />
                </span>
                <span className={statusStyles.liveText}>Live Updates</span>
              </div>
            </div>
          </div>

          <main className={statusStyles.mainContent}>
            <div className={statusStyles.floatingActions}>
              <button className={statusStyles.fabSecondary} onClick={() => setIsMaintenanceModalOpen(true)} type="button">
                <span className="material-icons">handyman</span>
                <span>Block Maintenance</span>
              </button>
              <button className={statusStyles.fabPrimary} onClick={() => setIsAddBookingOpen(true)} type="button">
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
                  {autoRefreshOn ? <span className={statusStyles.livePulse} /> : null}
                  <span className={statusStyles.liveDot} />
                </span>
              </div>

              <div className={statusStyles.panelContentGrid}>
                {!isToday || filteredRightNowItems.length === 0 ? (
                  <div className={statusStyles.venueCardAvailable}>
                    <p className="text-sm text-slate-600 p-4">No bookings for this date</p>
                  </div>
                ) : null}

                {isToday
                  ? filteredRightNowItems.map((item) => {
                      if (item.type === 'inUse') {
                        return (
                          <div className={statusStyles.venueCardInUse} key={item.id}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className={statusStyles.venueIconRed}>
                                  <span className="material-icons">{item.icon}</span>
                                </div>
                                <div>
                                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{item.venue}</h3>
                                  <p className="text-xs text-slate-500 font-medium">{item.capacityText}</p>
                                </div>
                              </div>
                              <span className={statusStyles.badgeInUse}>{item.badge}</span>
                            </div>

                            <div className="mb-4">
                              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium">
                                <span>Current Session: {item.currentSession}</span>
                                <span className="text-status-red">{item.endsIn}</span>
                              </div>
                              <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-status-red rounded-full" style={{ width: item.progressWidth }} />
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                              <span className="flex items-center gap-1">
                                <span className="material-icons text-sm">person</span> {item.instructor}
                              </span>
                              <span className="font-semibold text-status-green">{item.nextFree}</span>
                            </div>
                          </div>
                        )
                      }

                      if (item.type === 'available') {
                        return (
                          <div className={statusStyles.venueCardAvailable} key={item.id}>
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className={statusStyles.venueIconGreen}>
                                  <span className="material-icons">{item.icon}</span>
                                </div>
                                <div>
                                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{item.venue}</h3>
                                  <p className="text-xs text-slate-500 font-medium">{item.capacityText}</p>
                                </div>
                              </div>
                              <span className={statusStyles.badgeAvailable}>{item.badge}</span>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 bg-gray-50 dark:bg-slate-700/50 p-2 rounded border border-gray-100 dark:border-gray-700">
                              {item.notice} <span className="font-bold">{item.nextBooking}</span>.
                            </p>
                            <button className={statusStyles.buttonGreen} type="button">
                              <span className="material-icons text-lg">add_circle</span>
                              Book Now
                            </button>
                          </div>
                        )
                      }

                      return (
                        <div className={statusStyles.venueCardMaintenance} key={item.id}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className={statusStyles.venueIconAmber}>
                                <span className="material-icons">{item.icon}</span>
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 dark:text-white text-lg">{item.venue}</h3>
                                <p className="text-xs text-slate-500 font-medium">{item.capacityText}</p>
                              </div>
                            </div>
                            <span className={statusStyles.badgeMaintenance}>{item.badge}</span>
                          </div>

                          <div className={statusStyles.alertBox}>
                            <div className={statusStyles.alertBoxHeader}>
                              <span className={`material-icons ${statusStyles.alertIcon}`}>warning</span>
                              <div>
                                <p className={statusStyles.alertTitle}>{item.alertTitle}</p>
                                <p className={statusStyles.alertText}>{item.alertText}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  : null}
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
                {!isToday || filteredUpcomingItems.length === 0 ? (
                  <div className={statusStyles.timelineItem}>
                    <div className={statusStyles.eventContent}>
                      <p className="text-sm text-slate-600 p-4">No bookings for this date</p>
                    </div>
                  </div>
                ) : null}

                {isToday
                  ? filteredUpcomingItems.map((item, index) => {
                      const showLine = index < filteredUpcomingItems.length - 1

                      if (item.type === 'confirmed') {
                        return (
                          <div className={statusStyles.timelineItem} key={item.id}>
                            <div className={statusStyles.timeColumn}>
                              <span className={statusStyles.timeLabel}>{item.time}</span>
                              <span className={statusStyles.timeSubLabel}>{item.time24}</span>
                              {showLine ? <div className={statusStyles.timeLine} /> : null}
                            </div>
                            <div
                              className={statusStyles.eventContent}
                              onClick={() => handleConfirmedEntryClick(item)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault()
                                  handleConfirmedEntryClick(item)
                                }
                              }}
                              role="button"
                              tabIndex={0}
                            >
                              <div className={statusStyles.eventRow}>
                                <div className={statusStyles.eventIndicator} />
                                <div className={statusStyles.eventBody}>
                                  <div className={statusStyles.eventHeader}>
                                    <h4 className={statusStyles.eventTitle}>{item.title}</h4>
                                    <span className={statusStyles.badgeConfirmed}>{item.badge}</span>
                                  </div>
                                  <div className={statusStyles.eventMeta}>
                                    <span>
                                      <span className="material-icons text-sm">location_on</span> {item.venue}
                                    </span>
                                    <span>
                                      <span className="material-icons text-sm">{item.metaTwoIcon}</span> {item.metaTwoText}
                                    </span>
                                  </div>
                                  {item.requester ? (
                                    <div className={statusStyles.requester}>
                                      <img
                                        alt={item.requester.initials}
                                        className={statusStyles.requesterAvatar}
                                        src={item.requester.avatar}
                                      />
                                      <span className={statusStyles.requesterName}>Req. by {item.requester.name}</span>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      if (item.type === 'pending') {
                        return (
                          <div className={statusStyles.timelineItem} key={item.id}>
                            <div className={statusStyles.timeColumn}>
                              <span className={statusStyles.timeLabel}>{item.time}</span>
                              <span className={statusStyles.timeSubLabel}>{item.time24}</span>
                              {showLine ? <div className={statusStyles.timeLine} /> : null}
                            </div>
                            <div className={`${statusStyles.eventContent} ${statusStyles.eventContentPending}`}>
                              <div className={statusStyles.eventRow}>
                                <div className={statusStyles.eventIndicatorPending} />
                                <div className={statusStyles.eventBody}>
                                  <div className={statusStyles.eventHeader}>
                                    <h4 className={statusStyles.eventTitle}>{item.title}</h4>
                                    <span className={statusStyles.badgePending}>{item.badge}</span>
                                  </div>
                                  <div className={statusStyles.pendingActions}>
                                    <div className={statusStyles.pendingMeta}>
                                      <span>
                                        <span className="material-icons text-sm">location_on</span> {item.venue}
                                      </span>
                                    </div>
                                    <div className={statusStyles.actionButtons}>
                                      <button
                                        className={statusStyles.btnSecondary}
                                        onClick={() => handleRejectClick(item.id)}
                                        type="button"
                                      >
                                        Reject
                                      </button>
                                      <button className={statusStyles.btnPrimary} onClick={() => handleApprove(item.id)} type="button">
                                        Approve
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      if (item.type === 'rejected') {
                        return (
                          <div
                            className={statusStyles.timelineItem}
                            key={item.id}
                            style={{ opacity: item.isRemoving ? 0 : 1, transition: 'opacity 1.5s ease' }}
                          >
                            <div className={statusStyles.timeColumn}>
                              <span className={statusStyles.timeLabel}>{item.time}</span>
                              <span className={statusStyles.timeSubLabel}>{item.time24}</span>
                              {showLine ? <div className={statusStyles.timeLine} /> : null}
                            </div>
                            <div className={statusStyles.eventContent}>
                              <div className={statusStyles.eventRow}>
                                <div className={statusStyles.eventIndicatorConflict} />
                                <div className={statusStyles.eventBody}>
                                  <div className={statusStyles.eventHeader}>
                                    <h4 className={statusStyles.eventTitle}>{item.title}</h4>
                                    <span
                                      className={statusStyles.statusBadge}
                                      style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
                                    >
                                      {item.badge}
                                    </span>
                                  </div>
                                  <div className={statusStyles.eventMeta}>
                                    <span>
                                      <span className="material-icons text-sm">location_on</span> {item.venue}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div className={statusStyles.timelineItem} key={item.id}>
                          <div className={statusStyles.timeColumn}>
                            <span className={statusStyles.timeLabel}>{item.time}</span>
                            <span className={statusStyles.timeSubLabel}>{item.time24}</span>
                            {showLine ? <div className={statusStyles.timeLine} /> : null}
                          </div>
                          <div className={statusStyles.conflictCard}>
                            <div className={statusStyles.eventRow}>
                              <div className={statusStyles.eventIndicatorConflict} />
                              <div className={statusStyles.eventBody}>
                                <div className={statusStyles.eventHeader}>
                                  <div className={statusStyles.conflictHeader}>
                                    <span className={`material-icons ${statusStyles.conflictIcon}`}>error</span>
                                    <h4 className={statusStyles.eventTitle}>{item.title}</h4>
                                  </div>
                                  <span className={statusStyles.badgeConflict}>{item.badge}</span>
                                </div>
                                <p className={statusStyles.conflictText}>{item.conflictText}</p>
                                <button
                                  className={statusStyles.conflictAction}
                                  onClick={() => handleResolveConflict(item.id)}
                                  type="button"
                                >
                                  Resolve Conflict <span className="material-icons text-sm">arrow_forward</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  : null}
              </div>
            </div>
          </main>

          {selectedBookingEntry ? (
            <AdminBookingDetailsPopUp
              {...createBookingModalProps(selectedBookingEntry)}
              onCancelBooking={() => setSelectedBookingEntry(null)}
              onCancelClick={handleDetailsCancelClick}
              onClose={() => setSelectedBookingEntry(null)}
              onEdit={() => setSelectedBookingEntry(null)}
              onEditClick={handleDetailsEditClick}
            />
          ) : null}

          {entryPendingReject ? (
            <AdminDeletePopUp
              onCancel={() => setEntryPendingReject(null)}
              onClose={() => setEntryPendingReject(null)}
              onConfirmDelete={handleRejectConfirm}
            />
          ) : null}

          {bookingPendingCancellation ? (
            <AdminDeletePopUpFM
              bookingName={bookingPendingCancellation.title}
              onClose={() => setBookingPendingCancellation(null)}
              onConfirm={handleCancelBookingConfirm}
            />
          ) : null}

          {cancellationSuccessEntry ? (
            <AdminInquirySentPopUpFM
              bookingName={cancellationSuccessEntry.title}
              onClose={() => setCancellationSuccessEntry(null)}
              organizerName={cancellationSuccessEntry.organizerText || 'the organizer'}
            />
          ) : null}

          {approvedEntry ? (
            <AdminBookingSuccessModalPopUp
              dateText={approvedEntry.dateText}
              eventName={approvedEntry.title}
              onDone={() => setApprovedEntry(null)}
              onViewTracker={() => setApprovedEntry(null)}
            />
          ) : null}

          {isMaintenanceModalOpen ? (
            <AdminMaintenanceBlockingPopUp
              onBlockVenue={handleBlockMaintenanceSuccess}
              onCancel={() => setIsMaintenanceModalOpen(false)}
              onClose={() => setIsMaintenanceModalOpen(false)}
            />
          ) : null}

          {isMaintenanceSuccessOpen ? (
            <AdminMaintenanceSuccessPopUp onReturn={() => setIsMaintenanceSuccessOpen(false)} />
          ) : null}

          {isAddBookingOpen ? (
            <AdminInternalBookingPopUp
              onClose={() => {
                setIsAddBookingOpen(false)
              }}
              onConfirm={() => {
                setIsAddBookingOpen(false)
              }}
            />
          ) : null}

          {isEditBookingOpen && entryForEdit ? (
            <AdminEditBookingPopUpFM
              bookingId={entryForEdit.bookingId || '#KSR-0000'}
              initialDate={toInputDate(currentDate)}
              initialEndTime={extractTimes(entryForEdit.timeText || '').endTime}
              initialEventTitle={entryForEdit.title || ''}
              initialOrganizer={entryForEdit.organizerText || ''}
              initialStartTime={extractTimes(entryForEdit.timeText || '').startTime}
              onClose={() => {
                setIsEditBookingOpen(false)
                setEntryForEdit(null)
              }}
              onConfirm={handleEditBookingConfirm}
              organizerHint={entryForEdit.organizerText || ''}
              prefilledVenue={entryForEdit.venue || ''}
              subtitle={entryForEdit.organizerText || ''}
              venues={buildEditVenues(entryForEdit.venue)}
            />
          ) : null}

          {editSuccessEntry ? (
            <AdminEditBookingSuccessPopUpFM
              bookingId={editSuccessEntry.bookingId}
              eventName={editSuccessEntry.title}
              onClose={() => setEditSuccessEntry(null)}
              organizerName={editSuccessEntry.organizer || 'the organizer'}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
