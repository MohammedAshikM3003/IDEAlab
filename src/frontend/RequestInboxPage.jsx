import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import AdminApprovalConfirmationPopUp from './Alerts/AdminApprovalConfirmationPopUp'
import AdminApprovalPopUp from './Alerts/AdminApprovalPopUp'
import AdminDeletePopUp from './Alerts/AdminDeletePopUp'
import AdminInquirySentPopUp from './Alerts/AdminInquirySentPopUp'
import AdminRejectionPopUp from './Alerts/AdminRejectionPopUp'
import AdminRejectionSuccessPopUp from './Alerts/AdminRejectionSuccessPopUp'
import AdminRequestClarificationPopUp from './Alerts/AdminRequestClarificationPopUp'
import PageHeader from './PageHeader'
import Sidebar from './Sidebar'
import styles from './RequestInboxPage.module.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function RequestInboxPage({ isSidebarOpen, setIsSidebarOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestItemRefs = useRef({})
  const hasHandledDeepLink = useRef(false)

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(() => new URLSearchParams(location.search).get('requestId'))
  const [activeFilter, setActiveFilter] = useState(location.state?.initialTab || 'ALL')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [venueFilter, setVenueFilter] = useState('All')
  const [venueOptions, setVenueOptions] = useState(['All'])
  const [readIds, setReadIds] = useState(new Set())
  const [modalView, setModalView] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteModalStep, setDeleteModalStep] = useState('confirm')
  const [deletedRequestName, setDeletedRequestName] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionComments, setRejectionComments] = useState('')
  const [inquiryMessage, setInquiryMessage] = useState('')

  const normalizeStatus = (value) => String(value || '').trim().toUpperCase()

  const getStatusLabel = (value) => {
    const normalized = normalizeStatus(value)
    if (normalized === 'PENDING') return 'NEW REQUEST'
    if (normalized === 'FORM_RECEIVED') return 'REVISED REQUEST'
    if (normalized === 'CLARIFICATION' || normalized === 'CLARIFICATION REQUESTED') {
      return 'CLARIFICATION REQUESTED'
    }
    if (normalized === 'CLARIFICATION_PROVIDED') return 'REPLY RECEIVED'
    return normalized || 'NEW REQUEST'
  }

  const getStatusTone = (value) => {
    const normalized = normalizeStatus(value)
    switch (normalized) {
      case 'APPROVED':
        return 'ok'
      case 'REJECTED':
        return 'rejected'
      case 'NEW REQUEST':
      case 'NEW_REQUEST':
      case 'REPLY RECEIVED':
      case 'CLARIFICATION_PROVIDED':
        return 'new'
      case 'CLARIFICATION':
      case 'CLARIFICATION REQUESTED':
      case 'CLARIFY':
      case 'CLARIFY_REQUESTED':
        return 'clarification'
      case 'FORM_RECEIVED':
      case 'REVISED REQUEST':
      case 'PENDING':
        return 'pending'
      default:
        return 'read'
    }
  }

  useEffect(() => {
    fetch(`${API_URL}/api/bookings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const mapped = (data.bookings || data.data || data || []).map((b) => {
          const statusLabel = getStatusLabel(b.status)
          return {
          id: b._id,
          status: statusLabel,
          venue: b.extractedDetails?.venue || 'Not specified',
          venueId: b.extractedDetails?.venueId || b.extractedDetails?.venue || '',
          submittedAt: b.receivedAt,
          name: b.requesterName,
          title: b.subject,
          preview: b.rawEmailContent?.slice(0, 80) || '',
          time: (() => {
            const date = new Date(b.receivedAt)
            const today = new Date()
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)

            if (date.toDateString() === today.toDateString()) {
              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }

            if (date.toDateString() === yesterday.toDateString()) {
              return 'Yesterday'
            }

            return date.toLocaleDateString([], { day: 'numeric', month: 'short' })
          })(),
          unread: false,
          email: b.requesterEmail,
          role: b.extractedDetails?.department || '',
          subject: b.subject,
          message: b.rawEmailContent || '',
          tags: [{ label: statusLabel, tone: getStatusTone(statusLabel) }],
          eventDate: b.extractedDetails?.requestedDate || 'TBD',
          timeSlot: (() => {
            let raw = b.extractedDetails?.timeSlot || 'TBD'
            if (raw === 'TBD') return raw
            
            // Clean up missing minutes like "04: PM"
            raw = raw.replace(/(\d{1,2}):\s*(AM|PM)/ig, '$1:00 $2')
            
            // Normalize all times to HH:MM AM/PM
            const timeRegex = /(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/ig
            return raw.replace(timeRegex, (match, h, m, period) => {
              let hour = parseInt(h, 10)
              const isPM = period && period.toUpperCase() === 'PM'
              const isAM = period && period.toUpperCase() === 'AM'
              
              if (isPM && hour < 12) hour += 12
              if (isAM && hour === 12) hour = 0
              
              const outPeriod = hour >= 12 ? 'PM' : 'AM'
              const hour12 = hour % 12 || 12
              return `${hour12}:${m} ${outPeriod}`
            })
          })(),
          department: b.extractedDetails?.department || 'Not specified',
          attendees: b.extractedDetails?.attendees
            ? `${String(b.extractedDetails.attendees)} Students`
            : 'Not specified',
          equipment: b.extractedDetails?.equipment || 'Not specified',
          supervisor: b.extractedDetails?.supervisor || 'Not specified',
          clarificationReplies: b.clarificationReplies || [],
        }
        })
        setRequests(mapped.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch(`${API_URL}/api/venues`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const venues = (data.venues || data.data || data || [])
          .map((venue) => (typeof venue === 'string' ? venue : venue.name || venue.venueName || ''))
          .filter(Boolean)
        setVenueOptions(['All', ...venues])
      })
      .catch(() => {})
  }, [])

  const inquiryTemplates = ['Needs Equipment Details', 'Clarify Event Purpose', 'Confirm Guest Count']

  const displayedRequests = useMemo(() => {
    let next = [...requests]

    if (activeFilter === 'UNREAD') {
      next = next.filter(
        (req) =>
          !readIds.has(req.id) &&
          (req.status === 'NEW REQUEST' || req.status === 'PENDING' || req.status === 'FORM_SENT' || req.status === 'REPLY RECEIVED' || req.status === 'REVISED REQUEST')
      )
    }

    if (venueFilter !== 'All') {
      next = next.filter((req) => req.venue === venueFilter)
    }

    next.sort((a, b) => {
      const timeA = new Date(a.submittedAt).getTime()
      const timeB = new Date(b.submittedAt).getTime()
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA
    })

    return next
  }, [activeFilter, readIds, requests, sortOrder, venueFilter])

  const selectedRequest = useMemo(() => {
    if (!selectedId) return null
    return requests.find((r) => r.id === selectedId) ?? null
  }, [requests, selectedId])

  const showDetail = Boolean(selectedRequest)
  const isApprovedRequest = selectedRequest?.status === 'APPROVED'
  const isRejectedRequest = selectedRequest?.status === 'REJECTED'
  const isProcessedRequest = isApprovedRequest || isRejectedRequest

  const calendarInfo = useMemo(() => {
    const rawValue = selectedRequest?.eventDate ?? ''
    const trimmed = String(rawValue).trim()

    if (!trimmed || trimmed.toLowerCase().includes('tbd')) {
      return null
    }

    let parsed = null
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)

    if (isoMatch) {
      const [, year, month, day] = isoMatch
      parsed = new Date(Number(year), Number(month) - 1, Number(day))
    } else {
      const namedMatch = trimmed.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})$/)
      if (namedMatch) {
        const [, dayText, monthText, yearText] = namedMatch
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        const monthIndex = months.findIndex((month) => monthText.toLowerCase().startsWith(month))
        if (monthIndex >= 0) {
          parsed = new Date(Number(yearText), monthIndex, Number(dayText))
        }
      }
    }

    if (!parsed || Number.isNaN(parsed.getTime())) {
      const fallback = new Date(trimmed)
      if (!Number.isNaN(fallback.getTime())) {
        parsed = fallback
      }
    }

    if (!parsed || Number.isNaN(parsed.getTime())) {
      return null
    }

    const year = parsed.getFullYear()
    const monthIndex = parsed.getMonth()
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const startOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7
    const days = [
      ...Array.from({ length: startOffset }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ]

    return {
      monthLabel: parsed.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      monthShort: parsed.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      dayNumber: parsed.getDate(),
      days,
    }
  }, [selectedRequest?.eventDate])

  const handleApproveRequest = () => {
    if (!selectedRequest) return
    setModalView('approveConfirm')
  }

  const handleApproveAndSend = async () => {
    if (!selectedRequest) return
    try {
      const res = await fetch(`${API_URL}/api/bookings/${selectedRequest.id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          venueId: selectedRequest.venueId || selectedRequest.venue,
          date: selectedRequest.eventDate,
          timeSlot: {
            start: selectedRequest.timeSlot?.split(' - ')[0] || '09:00',
            end: selectedRequest.timeSlot?.split(' - ')[1] || '17:00',
          },
          comments: '',
        }),
      })
      if (!res.ok) throw new Error('Approval failed')
      setRequests((prev) =>
        prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: 'APPROVED' } : r))
      )
      setModalView('approveSuccess')
    } catch (err) {
      console.error('Approve error:', err)
      alert('Failed to approve request. Please try again.')
    }
  }

  const handleOpenRejectModal = () => {
    if (!selectedRequest) return
    setRejectionReason('')
    setRejectionComments('')
    setModalView('rejectForm')
  }

  const handleConfirmRejection = async () => {
    if (!selectedRequest) return
    try {
      const res = await fetch(`${API_URL}/api/bookings/${selectedRequest.id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          reason: rejectionReason,
          comments: rejectionComments,
        }),
      })
      if (!res.ok) throw new Error('Rejection failed')
      setRequests((prev) =>
        prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: 'REJECTED' } : r))
      )
      setModalView('rejectSuccess')
    } catch (err) {
      console.error('Reject error:', err)
      alert('Failed to reject request. Please try again.')
    }
  }

  const handleOpenRequestInfoModal = () => {
    if (!selectedRequest) return
    setInquiryMessage(
      `Dear ${selectedRequest.name},\n\nRegarding your booking request for ${selectedRequest.venue}, could you please clarify...`
    )
    setModalView('infoForm')
  }

  const handleTemplateInsert = (template) => {
    setInquiryMessage((prev) => {
      const nextLine = prev.trim().length ? `\n- ${template}` : `- ${template}`
      return `${prev}${nextLine}`
    })
  }

  const handleSendInquiry = async () => {
    if (!selectedRequest) return
    try {
      const res = await fetch(`${API_URL}/api/bookings/${selectedRequest.id}/clarify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          clarificationRequest: inquiryMessage,
        }),
      })
      if (!res.ok) throw new Error('Clarification failed')
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id ? { ...r, status: 'CLARIFICATION_REQUESTED' } : r
        )
      )
      setModalView('infoSuccess')
    } catch (err) {
      console.error('Clarify error:', err)
      alert('Failed to send inquiry. Please try again.')
    }
  }

  const handleOpenDeleteModal = () => {
    if (!selectedRequest) return
    setDeletedRequestName(selectedRequest.name)
    setDeleteModalStep('confirm')
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeleteModalStep('confirm')
  }

  const handleDelete = () => {
    if (!selectedRequest) return

    setDeletedRequestName(selectedRequest.name)
    setRequests((prev) => prev.filter((req) => req.id !== selectedRequest.id))
    setSelectedId(null)
    setDeleteModalStep('success')
  }

  const handleDeleteFlowDone = () => {
    setIsDeleteModalOpen(false)
    setDeleteModalStep('confirm')
    setActiveFilter('ALL')
    setVenueFilter('All')
  }

  const closeModal = () => {
    setModalView(null)
  }

  const handleReturnToInbox = () => {
    setModalView(null)
    setSelectedId(null)
  }

  const handlePrint = () => {
    window.print()
  }

  const tagToneClass = (tone) => {
    switch (tone) {
      case 'new':
        return styles.tagNew
      case 'lab':
        return styles.tagLab
      case 'read':
        return styles.tagRead
      case 'pending':
        return styles.tagPending
      case 'ok':
        return styles.tagOk
      case 'rejected':
        return styles.tagRejected
      case 'clarification':
        return styles.tagClarification
      default:
        return styles.tagRead
    }
  }

  const indicatorToneClass = (request) => {
    if (request.tags?.some((tag) => tag.tone === 'ok')) {
      return styles.indicatorOk
    }

    switch (request.status) {
      case 'NEW REQUEST':
      case 'REPLY RECEIVED':
        return styles.indicatorNew
      case 'PENDING':
        return styles.indicatorPending
      case 'APPROVED':
        return styles.indicatorOk
      case 'REJECTED':
        return styles.indicatorRejected
      case 'READ':
        return styles.indicatorRead
      default:
        return styles.indicatorRead
    }
  }

  const unreadDotClass = (request) => {
    switch (request.status) {
      case 'NEW REQUEST':
      case 'REPLY RECEIVED':
        return styles.reqDotNew
      case 'REVISED REQUEST':
      case 'PENDING':
        return styles.reqDotPending
      default:
        return styles.reqDotPending
    }
  }

  useEffect(() => {
    if (hasHandledDeepLink.current) {
      return
    }

    const deepLinkedRequestId = searchParams.get('requestId')

    if (!deepLinkedRequestId) {
      hasHandledDeepLink.current = true
      return
    }

    const matchedRequest = requests.find((request) => request.id === deepLinkedRequestId)

    if (matchedRequest) {
      requestAnimationFrame(() => {
        requestItemRefs.current[matchedRequest.id]?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        })
      })
    }

    hasHandledDeepLink.current = true
    navigate('/inbox', { replace: true })
  }, [navigate, requests, searchParams])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.wrap}>
          <Sidebar activePage="inbox" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
          <div className={styles.main}>
            <PageHeader title="Request Inbox" setIsSidebarOpen={setIsSidebarOpen} />
            <main className={styles.body}>
              <div className={styles.split}>
                <aside className={cx(styles.listPane, styles.listNarrow, styles.listBorder)}>
                  <div className={styles.listHead}>
                    <div className={styles.headRow}>
                      <div className={styles.tabRow}>
                        <div className={cx(styles.skeleton, styles.skeletonTag)} style={{ width: 40 }} />
                        <div className={cx(styles.skeleton, styles.skeletonTag)} style={{ width: 60 }} />
                      </div>
                    </div>
                  </div>
                  <div className={styles.reqList}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={styles.skeletonCard}>
                        <div className={cx(styles.skeleton, styles.skeletonName)} />
                        <div className={cx(styles.skeleton, styles.skeletonSubject)} />
                        <div className={cx(styles.skeleton, styles.skeletonTag)} />
                      </div>
                    ))}
                  </div>
                </aside>
                <section className={styles.detail}>
                  <div className={styles.detailWrap}>
                    <div className={cx(styles.skeleton, styles.skeletonDetailTitle)} />
                    <div className={cx(styles.skeleton, styles.skeletonDetailBody)} />
                    <div className={cx(styles.skeleton, styles.skeletonRow)} />
                    <div className={cx(styles.skeleton, styles.skeletonRow)} />
                    <div className={cx(styles.skeleton, styles.skeletonRow)} />
                    <div className={cx(styles.skeleton, styles.skeletonRow)} />
                  </div>
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <Sidebar activePage="inbox" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className={styles.main}>
          <PageHeader title="Request Inbox" setIsSidebarOpen={setIsSidebarOpen} />

          <main className={styles.body}>
            <div className={cx(styles.split, showDetail && styles.splitDetailOpen)}>
              <aside
                className={cx(styles.listPane, showDetail ? styles.listNarrow : styles.listFull, showDetail && styles.listBorder)}
              >
                <div className={styles.listHead}>
                  <div className={styles.headRow}>
                    <div className={styles.tabRow}>
                      <button
                        className={cx(styles.tab, styles.tabBtn, activeFilter === 'ALL' ? styles.tabAct : styles.tabIdle)}
                        onClick={() => setActiveFilter('ALL')}
                        type="button"
                      >
                        All
                      </button>
                      <button
                        className={cx(styles.tab, styles.tabBtn, activeFilter === 'UNREAD' ? styles.tabAct : styles.tabIdle)}
                        onClick={() => setActiveFilter('UNREAD')}
                        type="button"
                      >
                        Unread
                      </button>
                    </div>
                    <div className={styles.toolBtns}>
                      <div className={styles.filterWrap}>
                        <button
                          className={styles.iconCoral}
                          onClick={() => setShowFilterMenu((prev) => !prev)}
                          type="button"
                          title="Filter"
                        >
                          <span className="material-icons text-sm text-white">filter_list</span>
                        </button>

                        {showFilterMenu ? (
                          <div className={styles.filterMenu}>
                            {venueOptions.map((venue) => (
                              <button
                                className={cx(styles.filterItem, venueFilter === venue && styles.filterItemActive)}
                                key={venue}
                                onClick={() => {
                                  setVenueFilter(venue)
                                  setShowFilterMenu(false)
                                }}
                                type="button"
                              >
                                {venue}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <button
                        className={styles.iconCoral}
                        onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                        type="button"
                        title="Sort"
                      >
                        <span className="material-icons text-sm text-white">sort</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.searchWrap}>
                    <span className={`material-icons ${styles.searchIco}`}>search</span>
                    <input
                      className={styles.searchIn}
                      placeholder="Search requests..."
                      type="text"
                    />
                  </div>
                </div>

                <div className={`${styles.reqList} ${styles.customScrollbar}`}>
                  {displayedRequests.map((req) => (
                    <button
                      key={req.id}
                      type="button"
                      ref={(element) => {
                        if (element) {
                          requestItemRefs.current[req.id] = element
                        }
                      }}
                      className={cx(
                        styles.reqBtn,
                        styles.reqIndicator,
                        indicatorToneClass(req),
                        req.id === selectedId ? styles.reqSel : styles.reqIdle,
                        req.id === selectedId && styles.reqSelIndicator
                      )}
                      onClick={() => {
                        setSelectedId(req.id)
                        setReadIds((prev) => new Set([...prev, req.id]))
                      }}
                    >
                      <div className={styles.reqTop}>
                        <div className={styles.reqMain}>
                          <div className={styles.reqNameRow}>
                            <p className={styles.reqName}>{req.name}</p>
                            {!readIds.has(req.id) &&
                            (req.status === 'NEW REQUEST' || req.status === 'FORM_SENT' || req.status === 'REPLY RECEIVED' || req.status === 'REVISED REQUEST') ? (
                              <span className={cx(styles.reqDot, unreadDotClass(req))} />
                            ) : null}
                          </div>
                          <p className={styles.reqTitle}>{req.title}</p>
                          {showDetail && req.tags?.length ? (
                            <div className={styles.tagRow}>
                              {req.tags.map((tag) => (
                                <span key={tag.label} className={cx(styles.tagPill, tagToneClass(tag.tone))}>
                                  {tag.label}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className={styles.reqMeta}>
                          {!showDetail && req.tags?.length ? (
                            <div className={styles.tagRowRight}>
                              {req.tags.map((tag) => (
                                <span key={tag.label} className={cx(styles.tagPill, tagToneClass(tag.tone))}>
                                  {tag.label}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          <span className={styles.reqTime}>{req.time}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </aside>

              {showDetail ? (
                <section className={`${styles.detail} ${styles.customScrollbar}`}>
                  <div className={`${styles.detailWrap} ${styles.printableContent}`}>
                    <div className={styles.printDocHeader}>
                      <h1 className={styles.printDocTitle}>IDEALAB - Venue Booking Record</h1>
                      <p className={styles.printDocSubTitle}>KSR College of Engineering</p>
                    </div>

                    <div className={styles.cardTop}>
                      <div className={styles.senderRow}>
                        <button
                          className={styles.backBtn}
                          type="button"
                          onClick={() => setSelectedId(null)}
                          title="Back to inbox"
                        >
                          <span className="material-icons">arrow_back</span>
                        </button>

                        <img
                          className={styles.senderImg}
                          alt={`Sender profile image ${selectedRequest.name}`}
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedRequest.name)}&background=fff3e0&color=ff9500`}
                        />
                        <div className={styles.senderMeta}>
                          <div className={styles.senderHead}>
                            <p className={styles.senderName}>{selectedRequest.name}</p>
                          </div>
                          <p className={styles.senderMail}>{selectedRequest.email}</p>
                        </div>
                        <div className={styles.senderActs}>
                          <button
                            className={styles.iconCoralLg}
                            type="button"
                            title="Print"
                            onClick={handlePrint}
                          >
                            <span className={`material-icons ${styles.actionIcon}`}>print</span>
                          </button>
                          <button
                            className={styles.deleteBtn}
                            type="button"
                            title="Delete request"
                            onClick={handleOpenDeleteModal}
                          >
                            <span className={`material-icons ${styles.actionIcon}`}>delete</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={styles.subjectBlk}>
                      <h2 className={styles.subject}>Subject: {selectedRequest.subject}</h2>
                      <div className={styles.msgCard}>
                        <p className={styles.msgText}>{selectedRequest.message}</p>
                      </div>
                      {selectedRequest.clarificationReplies?.length > 0 && selectedRequest.clarificationReplies.map((reply, i) => (
                        <div key={`reply-${i}`} className={styles.msgCard} style={{ marginTop: '1rem', borderLeft: '3px solid #ff9500' }}>
                          <p className={styles.msgText} style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#ff9500' }}>
                            Reply ({new Date(reply.receivedAt).toLocaleString()}):
                          </p>
                          <p className={styles.msgText} style={{ whiteSpace: 'pre-wrap' }}>{reply.content}</p>
                        </div>
                      ))}
                    </div>

                    <div className={styles.grid12}>
                      <div className={styles.colLeft}>
                        <p className={styles.secLbl}>
                          <span className={`material-icons ${styles.secIco}`}>assignment</span>
                          Form Data Panel
                        </p>
                        <div className={styles.tblWrap}>
                          <table className={styles.tbl}>
                            <tbody className={styles.tblBody}>
                              <tr>
                                <td className={styles.tdKey}>Department</td>
                                <td className={styles.tdVal}>{selectedRequest.department}</td>
                              </tr>
                              <tr>
                                <td className={styles.tdKey}>Venue Requested</td>
                                <td className={cx(styles.tdVal, styles.tdStrong)}>{selectedRequest.venue}</td>
                              </tr>
                              <tr>
                                <td className={styles.tdKey}>Event Date</td>
                                <td className={styles.tdVal}>{selectedRequest.eventDate}</td>
                              </tr>
                              <tr>
                                <td className={styles.tdKey}>Time Slot</td>
                                <td className={styles.tdVal}>{selectedRequest.timeSlot}</td>
                              </tr>
                              <tr>
                                <td className={styles.tdKey}>Attendees</td>
                                <td className={styles.tdVal}>{selectedRequest.attendees}</td>
                              </tr>
                              <tr>
                                <td className={styles.tdKey}>Equipment</td>
                                <td className={styles.tdVal}>{selectedRequest.equipment}</td>
                              </tr>
                              <tr>
                                <td className={styles.tdKey}>Supervisor</td>
                                <td className={styles.tdVal}>{selectedRequest.supervisor}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className={styles.colRight}>
                        <p className={styles.secLbl}>
                          <span className={`material-icons ${styles.secIco}`}>event_available</span>
                          Availability Checker
                        </p>

                        <div className={styles.calCard}>
                          {!calendarInfo ? (
                            <p className={styles.calTitle}>No date specified yet</p>
                          ) : (
                            <>
                              <div className={styles.calHead}>
                                <span className={styles.calTitle}>{calendarInfo.monthLabel}</span>
                                <div className={styles.calNav}>
                                  <button className={styles.iconCoralSm} type="button">
                                    <span className="material-icons text-xs text-white">chevron_left</span>
                                  </button>
                                  <button className={styles.iconCoralSm} type="button">
                                    <span className="material-icons text-xs text-white">chevron_right</span>
                                  </button>
                                </div>
                              </div>

                              <div className={styles.weekRow}>
                                <div>M</div>
                                <div>T</div>
                                <div>W</div>
                                <div>T</div>
                                <div>F</div>
                                <div>S</div>
                                <div>S</div>
                              </div>

                              <div className={styles.daysGrid}>
                                {calendarInfo.days.map((day, index) => {
                                  if (!day) {
                                    return (
                                      <div
                                        key={`empty-${index}`}
                                        className={styles.day}
                                        aria-hidden="true"
                                      />
                                    )
                                  }

                                  const isMain = day === calendarInfo.dayNumber

                                  return (
                                    <div
                                      key={day}
                                      className={cx(styles.day, isMain && styles.dayMain)}
                                    >
                                      {day}
                                    </div>
                                  )
                                })}
                              </div>

                              <div className={styles.confWrap}>
                                <p className={styles.confTitle}>
                                  {`CONFLICTS ON ${calendarInfo.monthShort} ${calendarInfo.dayNumber}`}
                                </p>
                                <div className={styles.confCard}>
                                  <div className={styles.confBar} />
                                  <div className={styles.confTxt}>
                                    <p className={styles.confName}>All Clear</p>
                                    <p className={styles.confSub}>No bookings for Seminar Hall</p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.stickyAct}>
                      <div className={styles.actBar}>
                        {isProcessedRequest ? (
                          <div
                            className={cx(
                              'min-h-[56px] w-full rounded-xl border px-4 py-3 flex items-center gap-2 text-sm font-bold',
                              isApprovedRequest
                                ? 'bg-green-50 border-[#22C55E] text-[#22C55E]'
                                : 'bg-red-50 border-[#F87171] text-[#F87171]'
                            )}
                          >
                            <span className="material-icons text-base">check_circle</span>
                            <span>
                              {isApprovedRequest
                                ? 'This request has been approved and the slot is blocked.'
                                : 'This request has been rejected.'}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className={styles.actLeft}>
                              <button className={styles.btnPri} type="button" onClick={handleApproveRequest}>
                                <span className="material-icons text-sm">check_circle</span>
                                Approve Request
                              </button>
                              <button className={cx(styles.btnSec, 'bg-red-400 hover:bg-red-500')} type="button" onClick={handleOpenRejectModal}>
                                <span className="material-icons text-sm">cancel</span>
                                Reject
                              </button>
                            </div>
                            <button
                              className={cx(styles.btnInfo, 'bg-blue-600 hover:bg-blue-700')}
                              type="button"
                              onClick={handleOpenRequestInfoModal}
                            >
                              <span className="material-icons text-sm">question_answer</span>
                              Request More Info
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}
            </div>
          </main>
        </div>
      </div>

      {modalView === 'approveConfirm' && selectedRequest ? (
        <AdminApprovalPopUp
          userName={selectedRequest.name}
          venueName={selectedRequest.venue}
          dateText={selectedRequest.eventDate}
          timeText={selectedRequest.timeSlot}
          onCancel={closeModal}
          onClose={closeModal}
          onApprove={handleApproveAndSend}
        />
      ) : null}

      {modalView === 'approveSuccess' && selectedRequest ? (
        <AdminApprovalConfirmationPopUp
          venueName={selectedRequest.venue}
          recipientName={selectedRequest.name}
          onReturnToInbox={handleReturnToInbox}
        />
      ) : null}

      {modalView === 'rejectForm' && selectedRequest ? (
        <AdminRejectionPopUp
          reason={rejectionReason}
          comments={rejectionComments}
          onReasonChange={setRejectionReason}
          onCommentsChange={setRejectionComments}
          onClose={closeModal}
          onCancel={closeModal}
          onConfirm={handleConfirmRejection}
          confirmDisabled={!rejectionReason}
        />
      ) : null}

      {modalView === 'rejectSuccess' && selectedRequest ? (
        <AdminRejectionSuccessPopUp
          venueName={selectedRequest.venue}
          userName={selectedRequest.name}
          onReturn={handleReturnToInbox}
        />
      ) : null}

      {modalView === 'infoForm' && selectedRequest ? (
        <AdminRequestClarificationPopUp
          recipientText={`To: ${selectedRequest.name} (${selectedRequest.email})`}
          templates={inquiryTemplates}
          message={inquiryMessage}
          onMessageChange={setInquiryMessage}
          onTemplateClick={handleTemplateInsert}
          onClose={closeModal}
          onCancel={closeModal}
          onSend={handleSendInquiry}
          sendDisabled={!inquiryMessage.trim()}
        />
      ) : null}

      {modalView === 'infoSuccess' && selectedRequest ? (
        <AdminInquirySentPopUp
          recipientName={selectedRequest.name}
          onReturnToInbox={handleReturnToInbox}
        />
      ) : null}

      {isDeleteModalOpen ? (
        <AdminDeletePopUp
          step={deleteModalStep}
          deletedRequestName={deletedRequestName}
          onClose={closeDeleteModal}
          onCancel={closeDeleteModal}
          onConfirmDelete={handleDelete}
          onDone={handleDeleteFlowDone}
        />
      ) : null}
    </div>
  )
}
