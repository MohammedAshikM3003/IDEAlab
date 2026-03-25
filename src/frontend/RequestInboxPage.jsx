import React, { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

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

const cx = (...classes) => classes.filter(Boolean).join(' ')

const REQUESTS = [
  {
    id: 'r1',
    status: 'NEW REQUEST',
    venue: 'Main Seminar Hall',
    submittedAt: '2026-01-26T10:45:00',
    name: 'Rahul Kumar',
    title: 'Seminar Hall Booking for AICTE Workshop',
    preview: 'Subject: Seminar Hall Booking for AICTE Workshop on 3D Printing',
    time: '10:45 AM',
    unread: true,
    email: 'rahul.kumar@aicte-idealab.edu',
    role: 'AICTE Idea Lab Coordinator',
    subject: 'Seminar Hall Booking for AICTE Workshop on 3D Printing',
    message:
      'Respected Principal/Admin,\n\nWe would like to request the Main Seminar Hall for a 3-day workshop organized by the AICTE Idea Lab. The workshop will focus on advanced 3D printing techniques and rapid prototyping for second-year engineering students.\n\nWe require audiovisual support and high-speed internet connectivity during the sessions. Detailed schedule is attached in the form data below.',
    tags: [
      { label: 'New Request', tone: 'new' },
      { label: 'AICTE IDEA LAB', tone: 'lab' },
    ],
    eventDate: 'Nov 12 - Nov 14, 2024',
    timeSlot: '09:00 AM - 04:30 PM',
  },
  {
    id: 'r2',
    status: 'REJECTED',
    venue: 'Idea Lab',
    submittedAt: '2026-01-25T09:10:00',
    name: 'Dr. S. Priya',
    title: 'Placement Cell Internal Meeting',
    preview: 'Need seminar hall for internal planning session.',
    time: 'Yesterday',
    unread: false,
    email: 'priya@ksrce.ac.in',
    role: 'Placement Cell',
    subject: 'Placement Cell Internal Meeting',
    message: 'Need the seminar hall for an internal planning session for the upcoming placement drive.',
    tags: [
      { label: 'Rejected', tone: 'rejected' },
      { label: 'IT DEPT', tone: 'lab' },
    ],
    eventDate: 'Jan 27, 2026',
    timeSlot: '10:00 AM - 12:00 PM',
  },
  {
    id: 'r3',
    status: 'PENDING',
    venue: 'Board Room',
    submittedAt: '2026-01-24T15:40:00',
    name: 'Ganesh Murthy',
    title: 'Annual Cultural Fest Stage Approval',
    preview: 'Requesting board room approval for stage setup.',
    time: 'Oct 24',
    unread: false,
    email: 'ganesh.murthy@ksrce.ac.in',
    role: 'Cultural Committee',
    subject: 'Annual Cultural Fest Stage Approval',
    message: 'Requesting approval for stage setup and rehearsal slots for the annual cultural fest.',
    tags: [{ label: 'Pending', tone: 'pending' }],
    eventDate: 'Jan 30, 2026',
    timeSlot: '03:00 PM - 06:00 PM',
  },
  {
    id: 'r4',
    status: 'APPROVED',
    venue: 'Workshop A',
    submittedAt: '2026-01-23T11:00:00',
    name: 'Mechanical Admin',
    title: 'Workshop A - Maintenance Window',
    preview: 'Maintenance booking request for Workshop A.',
    time: 'Oct 23',
    unread: false,
    email: 'mech.admin@ksrce.ac.in',
    role: 'Mechanical Dept Admin',
    subject: 'Workshop A - Maintenance Window',
    message: 'Requesting a maintenance window booking for Workshop A.',
    tags: [{ label: 'Approved', tone: 'ok' }],
    eventDate: 'Jan 31, 2026',
    timeSlot: '11:00 AM - 02:00 PM',
  },
  {
    id: 'r5',
    status: 'PENDING',
    venue: 'Idea Lab',
    submittedAt: '2026-01-26T11:20:00',
    name: 'A. Nivetha',
    title: 'Electrical Lab Evening Slot Request',
    preview: 'Approval needed for additional practical session timing.',
    time: '11:20 AM',
    unread: true,
    email: 'nivetha.eee@ksrce.ac.in',
    role: 'EEE Department',
    subject: 'Electrical Lab Evening Slot Request',
    message:
      'Requesting permission to reserve Electrical Lab 1 for an evening practical slot due to schedule overlap in the regular timetable.',
    tags: [
      { label: 'Pending', tone: 'pending' },
      { label: 'EEE DEPT', tone: 'lab' },
    ],
    eventDate: 'Feb 02, 2026',
    timeSlot: '05:30 PM - 07:30 PM',
  },
]

export default function RequestInboxPage({ isSidebarOpen, setIsSidebarOpen }) {
  const location = useLocation()

  const [requests, setRequests] = useState(REQUESTS)
  const [selectedId, setSelectedId] = useState(null)
  const [activeFilter, setActiveFilter] = useState(location.state?.initialTab || 'ALL')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [venueFilter, setVenueFilter] = useState('All')
  const [modalView, setModalView] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteModalStep, setDeleteModalStep] = useState('confirm')
  const [deletedRequestName, setDeletedRequestName] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionComments, setRejectionComments] = useState('')
  const [inquiryMessage, setInquiryMessage] = useState('')

  const inquiryTemplates = ['Needs Equipment Details', 'Clarify Event Purpose', 'Confirm Guest Count']

  const displayedRequests = useMemo(() => {
    let next = [...requests]

    if (activeFilter === 'UNREAD') {
      next = next.filter((req) => req.status === 'NEW REQUEST' || req.status === 'PENDING')
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
  }, [activeFilter, requests, sortOrder, venueFilter])

  const selectedRequest = useMemo(() => {
    if (!selectedId) return null
    return requests.find((r) => r.id === selectedId) ?? null
  }, [requests, selectedId])

  const showDetail = Boolean(selectedRequest)
  const isApprovedRequest = selectedRequest?.status === 'APPROVED'
  const isRejectedRequest = selectedRequest?.status === 'REJECTED'
  const isProcessedRequest = isApprovedRequest || isRejectedRequest

  const handleApproveRequest = () => {
    if (!selectedRequest) return
    setModalView('approveConfirm')
  }

  const handleApproveAndSend = () => {
    setModalView('approveSuccess')
    // Optional: trigger booking approval API call here.
  }

  const handleOpenRejectModal = () => {
    if (!selectedRequest) return
    setRejectionReason('')
    setRejectionComments('')
    setModalView('rejectForm')
  }

  const handleConfirmRejection = () => {
    setModalView('rejectSuccess')
    // Optional: trigger booking rejection API call here.
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

  const handleSendInquiry = () => {
    setModalView('infoSuccess')
    // Optional: trigger inquiry email API call here.
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
        return styles.reqDotNew
      case 'PENDING':
        return styles.reqDotPending
      default:
        return styles.reqDotPending
    }
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
                            {['All', 'Main Seminar Hall', 'Idea Lab'].map((venue) => (
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
                      className={cx(
                        styles.reqBtn,
                        styles.reqIndicator,
                        indicatorToneClass(req),
                        req.id === selectedId ? styles.reqSel : styles.reqIdle,
                        req.id === selectedId && styles.reqSelIndicator
                      )}
                      onClick={() => setSelectedId(req.id)}
                    >
                      <div className={styles.reqTop}>
                        <div className={styles.reqMain}>
                          <div className={styles.reqNameRow}>
                            <p className={styles.reqName}>{req.name}</p>
                            {req.unread ? <span className={cx(styles.reqDot, unreadDotClass(req))} /> : null}
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
                            <span className={styles.senderRole}>{selectedRequest.role}</span>
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
                                <td className={styles.tdVal}>AICTE Idea Lab</td>
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
                                <td className={styles.tdKey}>Attendance</td>
                                <td className={styles.tdVal}>120 Students</td>
                              </tr>
                              <tr>
                                <td className={styles.tdKey}>Equipment</td>
                                <td className={styles.tdVal}>Projector, MIC, LAN (10 nodes)</td>
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
                          <div className={styles.calHead}>
                            <span className={styles.calTitle}>November 2024</span>
                            <div className={styles.calNav}>
                              <button
                                className={styles.iconCoralSm}
                                type="button"
                              >
                                <span className="material-icons text-xs text-white">chevron_left</span>
                              </button>
                              <button
                                className={styles.iconCoralSm}
                                type="button"
                              >
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
                            {Array.from({ length: 28 }).map((_, i) => {
                              const day = i + 1
                              const isMain = day === 12
                              const isRange = day === 13 || day === 14
                              return (
                                <div
                                  key={day}
                                  className={cx(styles.day, isMain && styles.dayMain, isRange && styles.dayRange)}
                                >
                                  {day}
                                </div>
                              )
                            })}
                          </div>

                          <div className={styles.confWrap}>
                            <p className={styles.confTitle}>Conflicts on Nov 12</p>
                            <div className={styles.confCard}>
                              <div className={styles.confBar} />
                              <div className={styles.confTxt}>
                                <p className={styles.confName}>All Clear</p>
                                <p className={styles.confSub}>No bookings for Seminar Hall</p>
                              </div>
                            </div>
                          </div>
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
