import React from "react";

import Sidebar from "./Sidebar";
import layoutStyles from "./DashboardPage.module.css";
import styles from "./HistoryPage.module.css";

function CalendarIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16" {...props}>
      <path
        d="M8 3v2m8-2v2M4 8h16M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SearchIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16" {...props}>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function DownloadIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16" {...props}>
      <path
        d="M12 3v10m0 0 4-4m-4 4-4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M4 17v3h16v-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14" {...props}>
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function PinIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14" {...props}>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" fill="currentColor" />
    </svg>
  );
}

function ChevronLeftIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14" {...props}>
      <path d="M15 18 9 12l6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function ChevronRightIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14" {...props}>
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function BellIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20" {...props}>
      <path
        d="M15 17H9m8-6a5 5 0 0 0-10 0c0 5-2 6-2 6h14s-2-1-2-6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function EyeIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18" {...props}>
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PrintIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18" {...props}>
      <path
        d="M7 8V4h10v4M7 17h10v3H7v-3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M6 17H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M17 12h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

function CopyIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18" {...props}>
      <path
        d="M9 9h10v10H9V9Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function InfoIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18" {...props}>
      <path d="M12 17v-6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M12 8h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      <path
        d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function HistoryPage() {
  return (
    <div className={styles.page}>
      <input className="hidden" id="mobile-menu-toggle" type="checkbox" />

      <label
        className={`${layoutStyles.mobileOverlay} hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden`}
        htmlFor="mobile-menu-toggle"
      />

      <div className={`${layoutStyles.wrapper} flex h-screen overflow-hidden`}>
        <Sidebar activePage="history" />

        <div className={`${layoutStyles.mainArea} flex-1 flex flex-col min-w-0 transition-all duration-300`}>
          <header className={`${layoutStyles.navBar} h-16 flex items-center justify-between px-6 z-20 shadow-md flex-shrink-0 border-b border-white/10 text-white`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <h1 className="font-bold text-xl tracking-tight text-white">Booking Archive</h1>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative text-slate-300 hover:text-white cursor-pointer transition-colors" type="button">
                <BellIcon />
                <span className={`absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 ${layoutStyles.navBar}`} />
              </button>

              <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">Dr. Arul Kumaran</p>
                  <p className="text-xs text-slate-400">Chief Administrator</p>
                </div>
                <img
                  alt="Admin Profile"
                  className="w-9 h-9 rounded-full border-2 border-primary object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC__Cgg6pqqNUg-YjGiC6iYQbYKal-o1L9EK-NtxMTNR839rJvGV3WhaMHoeDXozRfJSUDk1aSdixUjE8oB530g1EbPootvQ9UdjaEnK00m-UjipPbx-PV0Oe9wdhKnNmkg9arM7DKNFQRk-Lttr2DJG6G_RH6bK5ObTVW5Ol8kFbs3ZZsvoiR9lvIoMWkxKtYP1U374ssVdnle25AF6OkyC6JZwKgwTNOSQYGkjkA-X9o7PHadS4BdZjdtojeXNTpduuqIUHLV1s"
                />
              </div>
            </div>
          </header>

          <main className={`${styles.scroll} ${styles.main}`}>
            <section className={styles.filterBar}>
              <div className={styles.topRow}>
                <div className={styles.left}>
                  <div className={styles.titleWrap}>
                    <h2 className={styles.title}>Booking Archive</h2>
                    <span className={styles.countBadge}>1,247 bookings archived</span>
                  </div>
                  <p className={styles.subtitle}>Historical record of all venue reservations for audit and compliance.</p>
                </div>

                <div className={styles.controls}>
                  <button className={styles.datePicker} type="button">
                    <span className={styles.icon}>
                      <CalendarIcon />
                    </span>
                    <span className={styles.btnText}>Oct 1, 2025 - Oct 31, 2025</span>
                  </button>

                  <div className={styles.search}>
                    <span className={styles.icon}>
                      <SearchIcon />
                    </span>
                    <input className={styles.searchInput} placeholder="Search archive (ID, Event, Name)..." type="text" />
                  </div>

                  <button className={styles.exportBtn} type="button">
                    <DownloadIcon className={styles.exportIcon} />
                    Export
                  </button>
                </div>
              </div>

              <div className={styles.filters}>
                <span className={styles.filterTag}>Active Filters:</span>
                <span className={`${styles.pill} ${styles.pillBlue}`}>
                  Status: Approved
                  <button aria-label="Remove filter" className={styles.pillRemove} type="button">
                    <CloseIcon />
                  </button>
                </span>
                <span className={`${styles.pill} ${styles.pillPurple}`}>
                  Venue: AICTE Lab
                  <button aria-label="Remove filter" className={styles.pillRemove} type="button">
                    <CloseIcon />
                  </button>
                </span>
                <span className={`${styles.pill} ${styles.pillPink}`}>
                  Year: 2025
                  <button aria-label="Remove filter" className={styles.pillRemove} type="button">
                    <CloseIcon />
                  </button>
                </span>
                <button className={styles.clearBtn} type="button">
                  Clear all
                </button>
              </div>
            </section>

            <section className={`${styles.tableWrap} ${styles.watermark}`}>
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">
                      Booking ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">
                      Date &amp; Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">
                      Venue
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">
                      Event &amp; Organizer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">
                      Status
                    </th>
                    <th className="relative px-6 py-4" scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a className="text-primary font-medium hover:underline hover:text-primary/80 font-mono" href="#">
                        #BK-2026-0156
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-slate-200 font-medium">Oct 24, 2026</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">09:00 AM - 01:00 PM</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={styles.pin}>
                          <PinIcon />
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Main Auditorium</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-200">Annual Engineering Summit</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Dept. of Mech • John Doe</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-slate-400 hover:text-ksr-navy dark:hover:text-primary" title="View Details" type="button">
                          <EyeIcon />
                        </button>
                        <button className="text-slate-400 hover:text-ksr-navy dark:hover:text-primary" title="Print Record" type="button">
                          <PrintIcon />
                        </button>
                        <button className="text-slate-400 hover:text-ksr-navy dark:hover:text-primary" title="Duplicate Booking" type="button">
                          <CopyIcon />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group relative overflow-hidden">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a className="text-primary font-medium hover:underline hover:text-primary/80 font-mono opacity-60" href="#">
                        #BK-2026-0155
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap opacity-60">
                      <div className="text-sm text-slate-900 dark:text-slate-200 font-medium line-through decoration-slate-400">Oct 22, 2026</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">02:00 PM - 04:00 PM</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap opacity-60">
                      <div className="flex items-center">
                        <span className={styles.pin}>
                          <PinIcon />
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Seminar Hall B</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 opacity-60">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-200 line-through decoration-slate-400">Guest Lecture: AI Ethics</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Dept. of CSE • Sarah Smith</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                        Cancelled
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-slate-400 hover:text-ksr-navy dark:hover:text-primary" title="View Details" type="button">
                          <EyeIcon />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a className="text-primary font-medium hover:underline hover:text-primary/80 font-mono" href="#">
                        #BK-2026-0154
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-slate-200 font-medium">Oct 20, 2026</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">10:00 AM - 11:30 AM</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={styles.pin}>
                          <PinIcon />
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Open Air Theatre</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-200">Cultural Fest Rehearsal</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Student Council • Mike R.</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                        Rejected
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-slate-400 hover:text-ksr-navy dark:hover:text-primary" title="View Details" type="button">
                          <EyeIcon />
                        </button>
                        <button className="text-slate-400 hover:text-ksr-navy dark:hover:text-primary" title="View Reason" type="button">
                          <InfoIcon />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a className="text-primary font-medium hover:underline hover:text-primary/80 font-mono" href="#">
                        #BK-2026-0153
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-slate-200 font-medium">Oct 18, 2026</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">09:00 AM - 05:00 PM</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={styles.pin}>
                          <PinIcon />
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">AICTE Lab</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-200">Workshop on IoT</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Dept. of EEE • Prof. Alan</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-slate-400 hover:text-ksr-navy dark:hover:text-primary" title="View Details" type="button">
                          <EyeIcon />
                        </button>
                        <button className="text-slate-400 hover:text-ksr-navy dark:hover:text-primary" title="Print Record" type="button">
                          <PrintIcon />
                        </button>
                        <button className="text-slate-400 hover:text-ksr-navy dark:hover:text-primary" title="Duplicate Booking" type="button">
                          <CopyIcon />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a className="text-primary font-medium hover:underline hover:text-primary/80 font-mono" href="#">
                        #BK-2026-0152
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-slate-200 font-medium">Oct 15, 2026</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">02:00 PM - 03:00 PM</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={styles.pin}>
                          <PinIcon />
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Conference Room 1</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-200">Department Meeting</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Dept. of Civil • HOD</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-slate-400 hover:text-ksr-navy dark:hover:text-primary" title="View Details" type="button">
                          <EyeIcon />
                        </button>
                        <button className="text-slate-400 hover:text-ksr-navy dark:hover:text-primary" title="Print Record" type="button">
                          <PrintIcon />
                        </button>
                        <button className="text-slate-400 hover:text-ksr-navy dark:hover:text-primary" title="Duplicate Booking" type="button">
                          <CopyIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>

            <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Showing <span className="font-medium text-primary">1</span> to <span className="font-medium text-primary">5</span> of{" "}
                    <span className="font-medium text-primary">1,247</span> results
                  </p>
                </div>
                <div>
                  <nav aria-label="Pagination" className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <a className={styles.pageNav} href="#">
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon />
                    </a>
                    <a
                      aria-current="page"
                      className={styles.pageNumActive}
                      href="#"
                    >
                      1
                    </a>
                    <a
                      className={styles.pageNum}
                      href="#"
                    >
                      2
                    </a>
                    <a
                      className={styles.pageNum}
                      href="#"
                    >
                      3
                    </a>
                    <span className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                      ...
                    </span>
                    <a
                      className={styles.pageNum}
                      href="#"
                    >
                      25
                    </a>
                    <a className={styles.pageNav} href="#">
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon />
                    </a>
                  </nav>
                </div>
              </div>
            </div>
            </section>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-600">
              KSR College of Engineering • Venue Booking Portal Admin System v2.4 • Confidential Record
            </p>
          </div>
          </main>
        </div>
      </div>
    </div>
  );
}
