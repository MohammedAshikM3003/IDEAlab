import React, { useMemo, useState } from 'react'

import Sidebar from './Sidebar'
import styles from './DashboardPage.module.css'

export default function RequestInboxPage() {
  const requests = [
    {
      id: 'r1',
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
        { label: 'New Request', tone: 'bg-primary text-white' },
        { label: 'AICTE IDEA LAB', tone: 'bg-primary/10 text-primary' },
      ],
    },
    {
      id: 'r2',
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
        { label: 'Read', tone: 'bg-slate-200 text-slate-600' },
        { label: 'IT DEPT', tone: 'bg-primary/10 text-primary' },
      ],
    },
    {
      id: 'r3',
      name: 'Ganesh Murthy',
      title: 'Annual Cultural Fest Stage Approval',
      preview: 'Requesting board room approval for stage setup.',
      time: 'Oct 24',
      unread: false,
      email: 'ganesh.murthy@ksrce.ac.in',
      role: 'Cultural Committee',
      subject: 'Annual Cultural Fest Stage Approval',
      message: 'Requesting approval for stage setup and rehearsal slots for the annual cultural fest.',
      tags: [{ label: 'Pending', tone: 'bg-orange-100 text-orange-700' }],
    },
    {
      id: 'r4',
      name: 'Mechanical Admin',
      title: 'Workshop A - Maintenance Window',
      preview: 'Maintenance booking request for Workshop A.',
      time: 'Oct 23',
      unread: false,
      email: 'mech.admin@ksrce.ac.in',
      role: 'Mechanical Dept Admin',
      subject: 'Workshop A - Maintenance Window',
      message: 'Requesting a maintenance window booking for Workshop A.',
      tags: [{ label: 'Approved', tone: 'bg-emerald-100 text-emerald-700' }],
    },
  ]

  const [selectedId, setSelectedId] = useState(null)

  const selectedRequest = useMemo(() => {
    if (!selectedId) return null
    return requests.find((r) => r.id === selectedId) ?? null
  }, [requests, selectedId])

  const showDetail = Boolean(selectedRequest)

  return (
    <div className={styles.root}>
      <input className="hidden" id="mobile-menu-toggle" type="checkbox" />

      <label
        className={`${styles.mobileOverlay} hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden`}
        htmlFor="mobile-menu-toggle"
      />

      <div className={`${styles.wrapper} flex h-screen overflow-hidden`}>
        <Sidebar activePage="inbox" />

        <div className={`${styles.mainArea} flex-1 flex flex-col min-w-0 transition-all duration-300`}>
          <header className={`${styles.navBar} h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/10 text-white shrink-0`}>
            <div className="flex items-center gap-4">
              <label className="lg:hidden text-white cursor-pointer p-1 rounded hover:bg-white/10" htmlFor="mobile-menu-toggle">
                <span className="material-icons">menu</span>
              </label>
              <h1 className="text-xl font-semibold tracking-tight truncate">Request Inbox</h1>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-1 text-white/80 hover:text-white transition-colors" type="button">
                <span className="material-icons">notifications</span>
                <span className={`absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 ${styles.navBar}`} />
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

          <main className="flex-1 bg-[#f8f7f5] overflow-hidden">
            <div className="h-full flex">
              <aside
                className={`${showDetail ? 'w-[360px]' : 'flex-1'} bg-white ${showDetail ? 'border-r border-slate-200' : ''} flex flex-col shrink-0`}
              >
                <div className="p-4 border-b border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase">All</span>
                      <span className="px-2 py-0.5 text-slate-400 hover:bg-slate-50 text-[10px] font-bold rounded-full uppercase cursor-pointer">Unread</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="p-1.5 bg-[#FF7A59] hover:bg-[#e96a4d] rounded text-white transition-colors"
                        type="button"
                        title="Filter"
                      >
                        <span className="material-icons text-sm text-white">filter_list</span>
                      </button>
                      <button
                        className="p-1.5 bg-[#FF7A59] hover:bg-[#e96a4d] rounded text-white transition-colors"
                        type="button"
                        title="Sort"
                      >
                        <span className="material-icons text-sm text-white">sort</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                    <input
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Search requests..."
                      type="text"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {requests.map((req) => (
                    <button
                      key={req.id}
                      type="button"
                      className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${req.id === selectedId ? 'bg-slate-50' : 'bg-white'} ${req.unread ? 'border-l-4 border-l-primary' : ''}`}
                      onClick={() => setSelectedId(req.id)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-slate-900 truncate">{req.name}</p>
                            {req.unread ? <span className="w-2 h-2 rounded-full bg-primary" /> : null}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 truncate">{req.title}</p>
                          {showDetail && req.tags?.length ? (
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              {req.tags.map((tag) => (
                                <span key={tag.label} className={`${tag.tone} px-2 py-0.5 rounded text-[10px] font-bold uppercase`}>
                                  {tag.label}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!showDetail && req.tags?.length ? (
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              {req.tags.map((tag) => (
                                <span key={tag.label} className={`${tag.tone} px-2 py-0.5 rounded text-[10px] font-bold uppercase`}>
                                  {tag.label}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{req.time}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </aside>

              {showDetail ? (
                <section className="flex-1 overflow-y-auto">
                  <div className="max-w-5xl mx-auto p-6 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center gap-4">
                        <button
                          className="p-2 ml-2 rounded-lg bg-[#1E3A8A] text-white hover:bg-blue-900 transition-colors"
                          type="button"
                          onClick={() => setSelectedId(null)}
                          title="Back to inbox"
                        >
                          <span className="material-icons">arrow_back</span>
                        </button>

                        <img
                          className="w-10 h-10 rounded-xl border border-slate-200"
                          alt={`Sender profile image ${selectedRequest.name}`}
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedRequest.name)}&background=fff3e0&color=ff9500`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 leading-none">{selectedRequest.name}</p>
                            <span className="text-xs text-primary font-semibold">{selectedRequest.role}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 truncate">{selectedRequest.email}</p>
                        </div>
                        <div className="ml-auto flex gap-2">
                          <button
                            className="p-2 bg-[#FF7A59] hover:bg-[#e96a4d] rounded-lg text-white transition-colors"
                            type="button"
                            title="Print"
                          >
                            <span className="material-icons text-xl text-white">print</span>
                          </button>
                          <button
                            className="p-2 bg-[#FF7A59] hover:bg-[#e96a4d] rounded-lg text-white transition-colors"
                            type="button"
                            title="More"
                          >
                            <span className="material-icons text-xl text-white">more_vert</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-slate-900 leading-tight">Subject: {selectedRequest.subject}</h2>
                      <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">{selectedRequest.message}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                      <div className="col-span-12 lg:col-span-7 space-y-3">
                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <span className="material-icons text-sm">assignment</span>
                          Form Data Panel
                        </p>
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                          <table className="w-full text-left text-sm">
                            <tbody className="divide-y divide-slate-100">
                              <tr>
                                <td className="px-5 py-4 bg-slate-50/60 font-medium text-slate-500 w-1/3">Department</td>
                                <td className="px-5 py-4 text-slate-800">AICTE Idea Lab</td>
                              </tr>
                              <tr>
                                <td className="px-5 py-4 bg-slate-50/60 font-medium text-slate-500">Venue Requested</td>
                                <td className="px-5 py-4 text-slate-800 font-bold">Main Seminar Hall</td>
                              </tr>
                              <tr>
                                <td className="px-5 py-4 bg-slate-50/60 font-medium text-slate-500">Event Date</td>
                                <td className="px-5 py-4 text-slate-800">Nov 12 - Nov 14, 2024</td>
                              </tr>
                              <tr>
                                <td className="px-5 py-4 bg-slate-50/60 font-medium text-slate-500">Time Slot</td>
                                <td className="px-5 py-4 text-slate-800">09:00 AM - 04:30 PM</td>
                              </tr>
                              <tr>
                                <td className="px-5 py-4 bg-slate-50/60 font-medium text-slate-500">Attendance</td>
                                <td className="px-5 py-4 text-slate-800">120 Students</td>
                              </tr>
                              <tr>
                                <td className="px-5 py-4 bg-slate-50/60 font-medium text-slate-500">Equipment</td>
                                <td className="px-5 py-4 text-slate-800">Projector, MIC, LAN (10 nodes)</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="col-span-12 lg:col-span-5 space-y-3">
                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <span className="material-icons text-sm">event_available</span>
                          Availability Checker
                        </p>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">November 2024</span>
                            <div className="flex gap-1">
                              <button
                                className="p-1 bg-[#FF7A59] hover:bg-[#e96a4d] rounded text-white transition-colors"
                                type="button"
                              >
                                <span className="material-icons text-xs text-white">chevron_left</span>
                              </button>
                              <button
                                className="p-1 bg-[#FF7A59] hover:bg-[#e96a4d] rounded text-white transition-colors"
                                type="button"
                              >
                                <span className="material-icons text-xs text-white">chevron_right</span>
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400">
                            <div>M</div>
                            <div>T</div>
                            <div>W</div>
                            <div>T</div>
                            <div>F</div>
                            <div>S</div>
                            <div>S</div>
                          </div>

                          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
                            {Array.from({ length: 28 }).map((_, i) => {
                              const day = i + 1
                              const isMain = day === 12
                              const isRange = day === 13 || day === 14
                              return (
                                <div
                                  key={day}
                                  className={`py-1 rounded ${isMain ? 'bg-primary text-white font-bold ring-2 ring-primary/20 ring-offset-2' : ''} ${isRange ? 'bg-primary/15 text-primary font-bold' : ''}`}
                                >
                                  {day}
                                </div>
                              )
                            })}
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-[10px] text-slate-500 mb-2 font-bold uppercase">Conflicts on Nov 12</p>
                            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                              <div className="text-[10px]">
                                <p className="font-bold text-slate-800">All Clear</p>
                                <p className="text-slate-500">No bookings for Seminar Hall</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="sticky bottom-4">
                      <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button className="bg-primary hover:bg-[#ea7d00] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow flex items-center justify-center gap-2" type="button">
                            <span className="material-icons text-sm">check_circle</span>
                            Approve Request
                          </button>
                          <button className="bg-secondary hover:bg-secondary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow flex items-center justify-center gap-2" type="button">
                            <span className="material-icons text-sm">cancel</span>
                            Reject
                          </button>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow flex items-center justify-center gap-2" type="button">
                          <span className="material-icons text-sm">question_answer</span>
                          Request More Info
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
