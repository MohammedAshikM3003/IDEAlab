import { toISODate } from './utils/dateFormat';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getBookingTimeStatus, parseTimeStrToMinutes } from './utils/bookingTimeStatus'

import AdminBookingDetailsPopUpFM from './Alerts/AdminBookingDetailsPopUpFM'
import detailsPopupStyles from './Alerts/AdminBookingDetailsPopUpFM.module.css'
import AdminCancelBookingPopUpFM from './Alerts/AdminCancelBookingPopUpFM'
import cancelPopupStyles from './Alerts/AdminCancelBookingPopUpFM.module.css'
import AdminEditBookingPopUpFM from './Alerts/AdminEditBookingPopUpFM'
import editPopupStyles from './Alerts/AdminEditBookingPopUpFM.module.css'
import AdminEditBookingSuccessPopUpFM from './Alerts/AdminEditBookingSuccessPopUpFM'
import editSuccessPopupStyles from './Alerts/AdminEditBookingSuccessPopUpFM.module.css'
import AdminMaintenanceBlockingPopUpFM from './Alerts/AdminMaintenanceBlockingPopUpFM'
import AdminMaintenanceSuccessPopUpFM from './Alerts/AdminMaintenanceSuccessPopUpFM'
import Calendar from './Calendar'
import PageHeader from './PageHeader'
import Sidebar from './Sidebar'
import layoutStyles from './DashboardPage.module.css'
import statusStyles from './StatusPage.module.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const DEFAULT_REJECTION_MESSAGE =
  'We regret to inform you that your booking request for AICTE Lab at 6:00 PM has been declined due to a scheduling conflict. Please contact the admin to reschedule.'


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



function formatTimeClock(date) {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatTime12(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const match = raw.match(/(\d{1,2})[:\s.]?(\d{2})?\s*(am|pm)?/i)
  if (match) {
    let h = parseInt(match[1], 10)
    let m = match[2] || '00'
    let p = (match[3] || '').toUpperCase()
    if (!p) {
      if (raw.toUpperCase().includes('PM')) p = 'PM'
      else if (raw.toUpperCase().includes('AM')) p = 'AM'
      else {
        p = h >= 12 ? 'PM' : 'AM'
        if (h > 12) h -= 12
        if (h === 0) h = 12
      }
    }
    return `${h}:${m} ${p}`
  }
  return raw
}

function formatTime24(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i)
  if (ampmMatch) {
    let hour = Number(ampmMatch[1])
    const minute = ampmMatch[2]
    const period = ampmMatch[3].toLowerCase()
    if (period === 'pm' && hour < 12) hour += 12
    if (period === 'am' && hour === 12) hour = 0
    return `${String(hour).padStart(2, '0')}:${minute}`
  }
  const match = raw.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return ''
  return `${String(match[1]).padStart(2, '0')}:${match[2]}`
}

function getTimeRangeFromSlot(slotValue) {
  if (!slotValue) {
    return { start: '', end: '' }
  }
  if (typeof slotValue === 'object') {
    return {
      start: slotValue?.start ? String(slotValue.start).trim() : '',
      end: slotValue?.end ? String(slotValue.end).trim() : '',
    }
  }

  const text = String(slotValue).replace(/\s+/g, ' ').trim()
  const dashParts = text.split('-').map((part) => part.trim()).filter(Boolean)
  if (dashParts.length >= 2) {
    return { start: dashParts[0], end: dashParts[1] }
  }
  const toParts = text.split(/\bto\b/i).map((part) => part.trim()).filter(Boolean)
  if (toParts.length >= 2) {
    return { start: toParts[0], end: toParts[1] }
  }
  return { start: text, end: '' }
}

function formatCapacityText(venue) {
  const capacityValue = venue?.capacity
  const capacityLabel = Number.isFinite(capacityValue) ? capacityValue : capacityValue ? String(capacityValue) : 'N/A'
  const locationLabel = venue?.location ? String(venue.location) : ''
  const parts = [`Capacity: ${capacityLabel}`]
  if (locationLabel) {
    parts.push(locationLabel)
  }
  return parts.join(' • ')
}

// parseTimeStrToMinutes imported from utils

function getTimeSlotLabel(timeSlot) {
  const start = timeSlot?.start ? String(timeSlot.start).trim() : ''
  const end = timeSlot?.end ? String(timeSlot.end).trim() : ''
  if (!start || !end) {
    return ''
  }
  return `${formatTime12(start)} - ${formatTime12(end)}`
}

export default function StatusPage({ isSidebarOpen, setIsSidebarOpen }) {
  const datePickerRef = useRef(null)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState('ALL')
  const [autoRefreshOn, setAutoRefreshOn] = useState(true)
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date())
  const [upcomingView, setUpcomingView] = useState('timeline')
  const [upcomingItemsByDate, setUpcomingItemsByDate] = useState({})
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isEditSuccessOpen, setIsEditSuccessOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [bookingActionModal, setBookingActionModal] = useState({
    isOpen: false,
    action: 'approve',
    booking: null,
  })
  const [rejectionReason, setRejectionReason] = useState('')
  const [conflictResolutionModal, setConflictResolutionModal] = useState({
    isOpen: false,
    booking: null,
  })
  const [selectedWinnerId, setSelectedWinnerId] = useState('')
  const [resolutionMessage, setResolutionMessage] = useState(DEFAULT_REJECTION_MESSAGE)
  const [toast, setToast] = useState(null)
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false)
  const [showMaintenanceSuccess, setShowMaintenanceSuccess] = useState(false)
  const [mobileTab, setMobileTab] = useState('rightNow')
  const [venues, setVenues] = useState([])
  const [venuesLoading, setVenuesLoading] = useState(true)
  const [venuesError, setVenuesError] = useState('')
  const [availabilityBookings, setAvailabilityBookings] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(true)
  const [availabilityError, setAvailabilityError] = useState('')
  const [scheduleLoading, setScheduleLoading] = useState(true)
  const [scheduleError, setScheduleError] = useState('')

  useEffect(() => {
    if (!autoRefreshOn) {
      return undefined
    }

    const intervalId = setInterval(() => {
      setLastRefreshedAt(new Date())
    }, 1000)

    return () => clearInterval(intervalId)
  }, [autoRefreshOn])

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [toast])

  const selectedDateKey = useMemo(() => toISODate(selectedDate), [selectedDate])

  useEffect(() => {
    if (!selectedDateKey) {
      return undefined
    }

    const controller = new AbortController()
    const token = localStorage.getItem('token')

    setScheduleLoading(true)
    setScheduleError('')

    fetch(`${API_URL}/api/bookings?limit=500`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load bookings')
        }
        return res.json()
      })
      .then((payload) => {
        const list = payload?.bookings || payload?.data || payload || []
        const items = Array.isArray(list) ? list : []

        const scheduleItems = items
          .map((booking) => {
            const status = String(booking?.status || '').toLowerCase()
            const isApproved = status === 'approved'
            const isPending = status === 'pending' || status === 'form_sent' || status === 'clarification_requested'
            if (!isApproved && !isPending) {
              return null
            }

            const bookingDate = booking?.confirmedBooking?.date || booking?.extractedDetails?.requestedDate
            if (!bookingDate) {
              return null
            }

            const bookingDateKey = toISODate(new Date(bookingDate))
            if (bookingDateKey !== selectedDateKey) {
              return null
            }

            const timeSlotSource = isApproved
              ? booking?.confirmedBooking?.timeSlot
              : booking?.extractedDetails?.timeSlot
            const { start, end } = getTimeRangeFromSlot(timeSlotSource)
            const time24 = formatTime24(start)
            const time12 = formatTime12(start) || 'TBD'
            const title = booking?.extractedDetails?.eventPurpose || booking?.subject || 'Booking Request'
            const venueName = booking?.confirmedBooking?.venue?.name || booking?.extractedDetails?.venue || 'Venue'
            const attendees = booking?.extractedDetails?.attendees
            const attendeesLabel = attendees ? `${attendees} Students` : ''

            let statusType = 'pending';
            let statusText = 'PENDING APPROVAL';
            if (isApproved) {
              const timeStatus = getBookingTimeStatus(bookingDateKey, start, end);
              if (timeStatus === 'completed') {
                statusType = 'completed';
                statusText = 'COMPLETED';
              } else if (timeStatus === 'in_progress') {
                statusType = 'in_progress';
                statusText = 'IN PROGRESS';
              } else {
                statusType = 'upcoming';
                statusText = 'CONFIRMED';
              }
            }

            return {
              id: String(booking?._id || ''),
              type: statusType,
              time12,
              time24: time24 || '--:--',
              title,
              venue: venueName,
              statusText: statusText,
              metaTwoIcon: attendeesLabel ? 'groups' : 'schedule',
              metaTwoText: attendeesLabel,
              requesterName: booking?.requesterName,
              requesterInitials: booking?.requesterName
                ? booking.requesterName
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0].toUpperCase())
                    .join('')
                : '',
              durationText: end ? `Ends ${end}` : '',
            }
          })
          .filter(Boolean)
          .sort((a, b) => a.time24.localeCompare(b.time24))

        setUpcomingItemsByDate((prev) => ({
          ...prev,
          [selectedDateKey]: scheduleItems,
        }))
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setScheduleError(err?.message || 'Failed to load bookings')
        setUpcomingItemsByDate((prev) => ({
          ...prev,
          [selectedDateKey]: [],
        }))
      })
      .finally(() => {
        setScheduleLoading(false)
      })

    return () => controller.abort()
  }, [selectedDateKey])

  const venueOptions = useMemo(
    () => venues.map((venue) => venue?.name).filter(Boolean),
    [venues],
  )

  useEffect(() => {
    if (selectedVenue === 'ALL') {
      return
    }
    if (!venueOptions.includes(selectedVenue)) {
      setSelectedVenue('ALL')
    }
  }, [selectedVenue, venueOptions])

  useEffect(() => {
    const controller = new AbortController()
    const token = localStorage.getItem('token')

    setVenuesLoading(true)
    setVenuesError('')

    fetch(`${API_URL}/api/venues`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load venues')
        }
        return res.json()
      })
      .then((payload) => {
        const list = payload?.venues || payload?.data || payload || []
        const filteredList = (Array.isArray(list) ? list : []).filter(v => !v.isComingSoon)
        setVenues(filteredList)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setVenuesError(err?.message || 'Failed to load venues')
        setVenues([])
      })
      .finally(() => {
        setVenuesLoading(false)
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!selectedDateKey) {
      return undefined
    }

    const controller = new AbortController()
    const token = localStorage.getItem('token')

    setAvailabilityLoading(true)
    setAvailabilityError('')

    fetch(`${API_URL}/api/bookings/availability?date=${encodeURIComponent(selectedDateKey)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load availability')
        }
        return res.json()
      })
      .then((payload) => {
        const list = payload?.data || payload || []
        setAvailabilityBookings(Array.isArray(list) ? list : [])
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setAvailabilityError(err?.message || 'Failed to load availability')
        setAvailabilityBookings([])
      })
      .finally(() => {
        setAvailabilityLoading(false)
      })

    return () => controller.abort()
  }, [selectedDateKey])

  const rightNowItemsForSelectedDate = useMemo(() => {
    const list = Array.isArray(venues) ? venues : []
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    const currentMins = today.getHours() * 60 + today.getMinutes();

    return list.map((venue) => {
      const venueId = venue?._id ? String(venue._id) : String(venue?.id || venue?.name || '')
      
      const venueBookings = availabilityBookings.filter((b) => {
        const v = b?.confirmedBooking?.venue;
        const vId = typeof v === 'string' ? v : String(v?._id || '');
        return vId === venueId;
      });

      let activeBooking = null;
      if (isToday) {
        activeBooking = venueBookings.find((b) => {
          const slot = b?.confirmedBooking?.timeSlot;
          if (!slot) return false;
          const status = getBookingTimeStatus(selectedDateKey, slot.start, slot.end);
          return status === 'in_progress';
        });
      }

      if (activeBooking) {
        const timeSlotLabel = getTimeSlotLabel(activeBooking.confirmedBooking.timeSlot);
        const endTimeStr = activeBooking.confirmedBooking.timeSlot.end;
        const endMins = parseTimeStrToMinutes(endTimeStr);
        const startMins = parseTimeStrToMinutes(activeBooking.confirmedBooking.timeSlot.start);
        const minsLeft = Math.max(0, endMins - currentMins);
        
        let percent = 0;
        if (endMins > startMins) {
           percent = Math.min(100, Math.max(0, ((currentMins - startMins) / (endMins - startMins)) * 100));
        }

        return {
          id: venueId,
          type: 'inUse',
          icon: 'event_busy',
          venue: venue?.name || 'Venue',
          badge: 'IN USE',
          capacityText: formatCapacityText(venue),
          sessionText: timeSlotLabel ? `Current Session: ${timeSlotLabel}` : 'Current Session: Approved booking',
          requestedBy: activeBooking.requesterName || activeBooking.subject || 'Requester',
          freeAt: endTimeStr ? formatTime12(endTimeStr) : 'TBD',
          percent: percent || 0,
          endsInText: `Ends in ${minsLeft}m`,
        }
      }

      const nextBooking = !isToday
        ? venueBookings[0]
        : venueBookings.find((b) => {
            const slot = b?.confirmedBooking?.timeSlot;
            if (!slot) return false;
            const status = getBookingTimeStatus(selectedDateKey, slot.start, slot.end);
            return status === 'upcoming';
          });

      if (nextBooking) {
        const slot = nextBooking.confirmedBooking?.timeSlot;
        const timeSlotLabel = getTimeSlotLabel(slot);
        const startsAt = slot?.start ? formatTime12(slot.start) : '';
        const startMinsVal = parseTimeStrToMinutes(slot?.start);
        const minsUntil = isToday && startMinsVal !== -1 ? Math.max(0, startMinsVal - currentMins) : null;

        return {
          id: venueId,
          type: 'scheduled',
          icon: 'event',
          venue: venue?.name || 'Venue',
          badge: 'SCHEDULED',
          capacityText: formatCapacityText(venue),
          sessionText: timeSlotLabel ? `Scheduled: ${timeSlotLabel}` : 'Has a confirmed booking.',
          requestedBy: nextBooking.requesterName || nextBooking.subject || 'Requester',
          startsAt: startsAt,
          startsInText: minsUntil !== null ? (minsUntil <= 0 ? 'Starting now' : `Starts in ${minsUntil}m`) : '',
        }
      }

      return {
        id: venueId,
        type: 'available',
        icon: 'event_available',
        venue: venue?.name || 'Venue',
        badge: 'AVAILABLE',
        capacityText: formatCapacityText(venue),
        vacancyText: isToday ? 'Currently available.' : 'Available on this date.',
        nextBookingText: 'No approved bookings on this date.',
      }
    })
  }, [availabilityBookings, venues, selectedDate, lastRefreshedAt])

  const upcomingItemsForSelectedDate = useMemo(
    () => upcomingItemsByDate[selectedDateKey] || [],
    [selectedDateKey, upcomingItemsByDate],
  )

  const filteredRightNowItems = useMemo(() => {
    if (selectedVenue === 'ALL') {
      return rightNowItemsForSelectedDate
    }
    return rightNowItemsForSelectedDate.filter((item) => item.venue === selectedVenue)
  }, [selectedVenue, rightNowItemsForSelectedDate])

  const rightNowStatusMessage = useMemo(() => {
    if (venuesLoading || availabilityLoading) {
      return 'Loading availability...'
    }
    if (venuesError || availabilityError) {
      return venuesError || availabilityError || 'Failed to load availability.'
    }
    return ''
  }, [availabilityError, availabilityLoading, venuesError, venuesLoading])

  const filteredUpcomingItems = useMemo(() => {
    if (selectedVenue === 'ALL') {
      return upcomingItemsForSelectedDate
    }
    return upcomingItemsForSelectedDate.filter((item) => item.venue === selectedVenue)
  }, [selectedVenue, upcomingItemsForSelectedDate])

  const rightNowAlertCount = useMemo(
    () => filteredRightNowItems.filter((item) => item.type !== 'available').length,
    [filteredRightNowItems],
  )

  const scheduleAlertCount = useMemo(
    () =>
      filteredUpcomingItems.filter((item) => item.type === 'pending' || item.type === 'conflict').length,
    [filteredUpcomingItems],
  )

  const scheduleStatusMessage = useMemo(() => {
    if (scheduleLoading) {
      return 'Loading schedule...'
    }
    if (scheduleError) {
      return scheduleError
    }
    return ''
  }, [scheduleError, scheduleLoading])

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

  const openBookingActionModal = (action, booking) => {
    setBookingActionModal({ isOpen: true, action, booking })
    setRejectionReason('')
  }

  const closeBookingActionModal = () => {
    setBookingActionModal({ isOpen: false, action: 'approve', booking: null })
    setRejectionReason('')
  }

  const confirmBookingAction = () => {
    const { booking, action } = bookingActionModal
    if (!booking) {
      return
    }

    setUpcomingItemsByDate((prev) => {
      const dateItems = prev[selectedDateKey] || []

      return {
        ...prev,
        [selectedDateKey]: dateItems.map((item) => {
          if (item.id !== booking.id) {
            return item
          }

          if (action === 'approve') {
            return {
              ...item,
              type: 'confirmed',
              statusText: 'CONFIRMED',
            }
          }

          return {
            ...item,
            type: 'rejected',
            statusText: 'REJECTED',
            rejectionReason,
          }
        }),
      }
    })

    setToast({
      kind: action === 'approve' ? 'success' : 'error',
      message:
        action === 'approve'
          ? `${booking.title} has been approved \u2713`
          : `${booking.title} has been rejected`,
    })

    closeBookingActionModal()
  }

  const openConflictResolutionModal = (booking) => {
    setConflictResolutionModal({ isOpen: true, booking })
    setSelectedWinnerId('')
    setResolutionMessage(DEFAULT_REJECTION_MESSAGE)
  }

  const closeConflictResolutionModal = () => {
    setConflictResolutionModal({ isOpen: false, booking: null })
    setSelectedWinnerId('')
    setResolutionMessage(DEFAULT_REJECTION_MESSAGE)
  }

  const confirmConflictResolution = () => {
    const conflictBooking = conflictResolutionModal.booking
    if (!conflictBooking || !selectedWinnerId) {
      return
    }

    const winner = conflictBooking.conflictRequests?.find((request) => request.id === selectedWinnerId)
    if (!winner) {
      return
    }

    const winningEvent = {
      id: `${conflictBooking.id}-${winner.id}`,
      type: 'confirmed',
      time12: winner.time12,
      time24: winner.time24,
      title: winner.eventName,
      venue: conflictBooking.venue,
      statusText: 'CONFIRMED',
      metaTwoIcon: 'schedule',
      metaTwoText: winner.durationText,
      requesterName: winner.requesterName,
      requesterInitials: winner.requesterInitials,
      resolutionMessage,
    }

    setUpcomingItemsByDate((prev) => {
      const dateItems = prev[selectedDateKey] || []
      const nextItems = []

      dateItems.forEach((item) => {
        if (item.id === conflictBooking.id) {
          nextItems.push(winningEvent)
        } else {
          nextItems.push(item)
        }
      })

      return {
        ...prev,
        [selectedDateKey]: nextItems,
      }
    })

    setToast({
      kind: 'success',
      message: `Conflict resolved. ${winner.partyName} booking confirmed.`,
    })

    closeConflictResolutionModal()
  }

  const handleCancelBooking = ({ bookingId, reason }) => {
    setUpcomingItemsByDate((prev) => {
      const dateItems = prev[selectedDateKey] || []

      return {
        ...prev,
        [selectedDateKey]: dateItems.filter((item) => item.id !== bookingId),
      }
    })
    void reason
  }

  useEffect(() => {
    if (!isCalendarOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsCalendarOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isCalendarOpen])

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

  const getEstimatedEndTime = (booking) => {
    if (!booking?.time24) {
      return ''
    }

    const [hourText, minuteText] = booking.time24.split(':')
    const baseHour = Number(hourText)
    const baseMinute = Number(minuteText)
    if (Number.isNaN(baseHour) || Number.isNaN(baseMinute)) {
      return booking.time24
    }

    const durationSource = booking.metaTwoText || booking.durationText || ''
    const durationHoursMatch = String(durationSource).match(/(\d+)\s*h/i)
    const durationHours = durationHoursMatch ? Number(durationHoursMatch[1]) : 1
    const durationMinutes = durationHours * 60

    const totalMinutes = baseHour * 60 + baseMinute + durationMinutes
    const wrappedMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60)
    const endHour = String(Math.floor(wrappedMinutes / 60)).padStart(2, '0')
    const endMinute = String(wrappedMinutes % 60).padStart(2, '0')
    return `${endHour}:${endMinute}`
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
              <div className={statusStyles.datePickerWrap} ref={datePickerRef}>
                <button
                  className={statusStyles.dateDisplay}
                  onClick={() => setIsCalendarOpen((previous) => !previous)}
                  type="button"
                >
                  <span className="material-icons">calendar_today</span>
                  <span className={statusStyles.dateText}>{formatDisplayDate(selectedDate)}</span>
                </button>

                {isCalendarOpen ? (
                  <div className={statusStyles.datePickerPopover}>
                    <Calendar
                      availabilityData={{}}
                      onDateSelect={(date) => {
                        setSelectedDate(date)
                        setIsCalendarOpen(false)
                      }}
                      selectedDate={selectedDate}
                    />
                  </div>
                ) : null}
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
                  <option value="ALL">All Venues ({venues.length})</option>
                  {venueOptions.map((venue) => (
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

          <div className={statusStyles.mobileTabsRow}>
            <div className={statusStyles.mobileTabsBar}>
              <button
                className={`${statusStyles.mobileTab} ${
                  mobileTab === 'rightNow' ? statusStyles.mobileTabActive : ''
                }`}
                onClick={() => setMobileTab('rightNow')}
                type="button"
              >
                <span>Right Now</span>
                <span className={statusStyles.mobileTabCount}>{rightNowAlertCount}</span>
              </button>
              <button
                className={`${statusStyles.mobileTab} ${
                  mobileTab === 'schedule' ? statusStyles.mobileTabActive : ''
                }`}
                onClick={() => setMobileTab('schedule')}
                type="button"
              >
                <span>Schedule</span>
                <span className={statusStyles.mobileTabCount}>{scheduleAlertCount}</span>
              </button>
            </div>
          </div>

          <main className={statusStyles.mainContent}>
            <section
              className={`${statusStyles.panel} ${statusStyles.panelUpcoming} ${statusStyles.mobilePanel} ${statusStyles.mobilePanelRightNow} ${
                mobileTab === 'rightNow' ? statusStyles.mobilePanelActive : ''
              }`}
            >
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
                {rightNowStatusMessage ? (
                  <p className={statusStyles.emptyStateMessage}>{rightNowStatusMessage}</p>
                ) : filteredRightNowItems.length > 0 ? (
                  filteredRightNowItems.map((item) => (
                    <article
                      className={
                        item.type === 'inUse'
                          ? statusStyles.venueCardInUse
                          : item.type === 'available'
                            ? statusStyles.venueCardAvailable
                            : item.type === 'scheduled'
                              ? statusStyles.venueCardScheduled
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
                                  : item.type === 'scheduled'
                                    ? statusStyles.venueIconScheduled
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
                                : item.type === 'scheduled'
                                  ? statusStyles.badgeScheduled
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
                              <div className={statusStyles.progressFill} style={{ width: `${item.percent}%` }} />
                            </div>
                            <span className={statusStyles.endsInText}>{item.endsInText}</span>
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

                      {item.type === 'scheduled' ? (
                        <>
                          <p className={statusStyles.sessionText}>{item.sessionText}</p>
                          {item.startsInText ? (
                            <div className={statusStyles.progressRow}>
                              <span className={statusStyles.startsInText}>{item.startsInText}</span>
                            </div>
                          ) : null}
                          <div className={statusStyles.footerRow}>
                            <span className={statusStyles.requestedBy}>
                              <span className="material-icons">person</span>
                              {item.requestedBy}
                            </span>
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
                  ))
                ) : (
                  <p className={statusStyles.emptyStateMessage}>No venue activity for this date.</p>
                )}
              </div>
            </section>

            <section
              className={`${statusStyles.panel} ${statusStyles.mobilePanel} ${statusStyles.mobilePanelSchedule} ${
                mobileTab === 'schedule' ? statusStyles.mobilePanelActive : ''
              }`}
            >
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
                  {scheduleStatusMessage ? (
                    <p className={statusStyles.emptyStateMessage}>{scheduleStatusMessage}</p>
                  ) : filteredUpcomingItems.length > 0 ? (
                    filteredUpcomingItems.map((item, index) => {
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
                              item.type === 'completed' || item.type === 'upcoming' || item.type === 'confirmed'
                                ? statusStyles.eventCardConfirmed
                                : item.type === 'in_progress'
                                  ? statusStyles.eventCardInProgress
                                  : item.type === 'pending'
                                    ? statusStyles.eventCardPending
                                    : statusStyles.eventCardConflict
                            }
                            onClick={['completed', 'upcoming', 'confirmed', 'in_progress'].includes(item.type) ? () => openDetailsForConfirmed(item) : undefined}
                            onKeyDown={
                              ['completed', 'upcoming', 'confirmed', 'in_progress'].includes(item.type)
                                ? (event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault()
                                      openDetailsForConfirmed(item)
                                    }
                                  }
                                : undefined
                            }
                            role={['completed', 'upcoming', 'confirmed', 'in_progress'].includes(item.type) ? 'button' : undefined}
                            tabIndex={['completed', 'upcoming', 'confirmed', 'in_progress'].includes(item.type) ? 0 : undefined}
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
                                  item.type === 'completed'
                                    ? statusStyles.badgeCompleted
                                    : item.type === 'in_progress'
                                      ? statusStyles.badgeInProgress
                                      : item.type === 'upcoming' || item.type === 'confirmed'
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
                                    <button
                                      className={statusStyles.btnSecondary}
                                      onClick={() => openBookingActionModal('reject', item)}
                                      type="button"
                                    >
                                  Reject
                                </button>
                                    <button
                                      className={statusStyles.btnPrimary}
                                      onClick={() => openBookingActionModal('approve', item)}
                                      type="button"
                                    >
                                  Approve
                                </button>
                              </div>
                            ) : null}

                            {item.type === 'conflict' ? (
                              <>
                                <p className={statusStyles.conflictBodyText}>{item.conflictText}</p>
                                <div className={statusStyles.conflictActions}>
                                  <button
                                    className={statusStyles.resolveLink}
                                    onClick={() => openConflictResolutionModal(item)}
                                    type="button"
                                  >
                                    Resolve Conflict
                                    <span className="material-icons">arrow_forward</span>
                                  </button>
                                </div>
                              </>
                            ) : null}
                          </div>
                        </article>
                      )
                    })
                  ) : (
                    <p className={statusStyles.emptyStateMessage}>No bookings for this date.</p>
                  )}
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

                  {scheduleStatusMessage ? (
                    <p className={statusStyles.emptyStateMessage}>{scheduleStatusMessage}</p>
                  ) : filteredUpcomingItems.length > 0 ? (
                    filteredUpcomingItems.map((item) => (
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
                              <button
                                className={statusStyles.btnSecondary}
                                onClick={() => openBookingActionModal('reject', item)}
                                type="button"
                              >
                                Reject
                              </button>
                              <button
                                className={statusStyles.btnPrimary}
                                onClick={() => openBookingActionModal('approve', item)}
                                type="button"
                              >
                                Approve
                              </button>
                            </>
                          ) : null}
                          {item.type === 'conflict' ? (
                            <button
                              className={statusStyles.resolveBtn}
                              onClick={() => openConflictResolutionModal(item)}
                              type="button"
                            >
                              Resolve
                            </button>
                          ) : null}
                        </span>
                      </article>
                    ))
                  ) : (
                    <p className={statusStyles.emptyStateMessage}>No bookings for this date.</p>
                  )}
                </div>
              )}

              <button
                className={statusStyles.blockMaintenanceFloatingBtn}
                onClick={() => setShowMaintenanceForm(true)}
                type="button"
              >
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
          bookingId={selectedBooking.id}
          initialDate={toISODate(selectedDate)}
          initialEndTime={getEstimatedEndTime(selectedBooking)}
          initialEventTitle={selectedBooking.title}
          initialOrganizer={selectedBooking.requesterName || ''}
          initialStartTime={selectedBooking.time24}
          onClose={closeBookingFlow}
          onConfirm={() => {
            setIsEditOpen(false)
            setIsEditSuccessOpen(true)
          }}
          organizerHint={selectedBooking.requesterName || ''}
          prefilledVenue={selectedBooking.venue}
          subtitle={selectedBooking.venue}
          venues={venueOptions.map((venueOption) => ({
            value: venueOption.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            label: venueOption,
          }))}
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

      {bookingActionModal.isOpen && bookingActionModal.booking ? (
        <div className={statusStyles.actionModalBackdrop} role="presentation">
          <div aria-modal="true" className={statusStyles.actionModalCard} role="dialog">
            <h3 className={statusStyles.actionModalTitle}>Confirm {bookingActionModal.action === 'approve' ? 'Approval' : 'Rejection'}</h3>
            <div className={statusStyles.actionModalMeta}>
              <p><strong>Event:</strong> {bookingActionModal.booking.title}</p>
              <p><strong>Venue:</strong> {bookingActionModal.booking.venue}</p>
              <p><strong>Time:</strong> {bookingActionModal.booking.time12} ({bookingActionModal.booking.time24})</p>
              <p><strong>Requester:</strong> {bookingActionModal.booking.requesterName || 'N/A'}</p>
            </div>
            <p className={statusStyles.actionModalMessage}>
              Are you sure you want to {bookingActionModal.action === 'approve' ? 'approve' : 'reject'} this booking?
            </p>

            {bookingActionModal.action === 'reject' ? (
              <label className={statusStyles.actionModalField}>
                <span>Rejection Reason (optional)</span>
                <textarea
                  className={statusStyles.actionModalTextarea}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  placeholder="Add an optional reason..."
                  rows={3}
                  value={rejectionReason}
                />
              </label>
            ) : null}

            <div className={statusStyles.actionModalActions}>
              <button className={statusStyles.actionModalCancelBtn} onClick={closeBookingActionModal} type="button">
                Cancel
              </button>
              <button className={statusStyles.actionModalConfirmBtn} onClick={confirmBookingAction} type="button">
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {conflictResolutionModal.isOpen && conflictResolutionModal.booking ? (
        <div className={statusStyles.actionModalBackdrop} role="presentation">
          <div aria-modal="true" className={statusStyles.conflictModalCard} role="dialog">
            <h3 className={statusStyles.actionModalTitle}>Resolve Double Booking Conflict</h3>
            <p className={statusStyles.conflictSubtitle}>AICTE Lab - 6:00 PM slot</p>

            <div className={statusStyles.conflictOptionGrid}>
              {(conflictResolutionModal.booking.conflictRequests || []).map((request) => {
                const isSelected = selectedWinnerId === request.id
                return (
                  <article
                    className={`${statusStyles.conflictOptionCard} ${isSelected ? statusStyles.conflictOptionCardActive : ''}`}
                    key={request.id}
                  >
                    <h4 className={statusStyles.conflictOptionTitle}>{request.partyName}</h4>
                    <p><strong>Requester:</strong> {request.requesterName}</p>
                    <p><strong>Event:</strong> {request.eventName}</p>
                    <p><strong>Time:</strong> {request.time12} ({request.time24})</p>
                    <button
                      className={statusStyles.conflictKeepBtn}
                      onClick={() => setSelectedWinnerId(request.id)}
                      type="button"
                    >
                      Keep This Booking
                    </button>
                  </article>
                )
              })}
            </div>

            <label className={statusStyles.actionModalField}>
              <span>Notification to Rejected Party</span>
              <textarea
                className={statusStyles.actionModalTextarea}
                onChange={(event) => setResolutionMessage(event.target.value)}
                rows={4}
                value={resolutionMessage}
              />
            </label>

            <div className={statusStyles.actionModalActions}>
              <button className={statusStyles.actionModalCancelBtn} onClick={closeConflictResolutionModal} type="button">
                Cancel
              </button>
              <button
                className={statusStyles.actionModalConfirmBtn}
                disabled={!selectedWinnerId}
                onClick={confirmConflictResolution}
                type="button"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={`${statusStyles.actionToast} ${toast.kind === 'error' ? statusStyles.actionToastError : statusStyles.actionToastSuccess}`}>
          {toast.message}
        </div>
      ) : null}

      {showMaintenanceForm ? (
        <AdminMaintenanceBlockingPopUpFM
          onCancel={() => setShowMaintenanceForm(false)}
          onClose={() => setShowMaintenanceForm(false)}
          onConfirm={() => {
            setShowMaintenanceForm(false)
            setShowMaintenanceSuccess(true)
          }}
        />
      ) : null}

      {showMaintenanceSuccess ? (
        <AdminMaintenanceSuccessPopUpFM
          onReturn={() => {
            setShowMaintenanceSuccess(false)
          }}
        />
      ) : null}
    </div>
  )
}