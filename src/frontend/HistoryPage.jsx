import React, { useMemo, useState } from "react";

import PageHeader from "./PageHeader";
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
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" />
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
      <path d="M7 8V4h10v4M7 17h10v3H7v-3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
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
      <path d="M9 9h10v10H9V9Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
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

const INITIAL_BOOKINGS = [
  {
    id: "#BK-2026-0156",
    dateISO: "2026-10-24",
    date: "Oct 24, 2026",
    time: "09:00 AM - 01:00 PM",
    venue: "Main Auditorium",
    event: "Annual Engineering Summit",
    organizer: "Dept. of Mech • John Doe",
    status: "Completed",
    isFaded: false,
    strike: false,
    actions: ["view", "print", "duplicate"],
    details: {
      department: "Mechanical Engineering",
      organizerFullName: "John Doe",
      organizerEmail: "john.doe@ksrce.ac.in",
      organizerRole: "Faculty Coordinator",
      purpose: "Annual summit to showcase department research projects and host keynote sessions.",
      subject: "Annual Engineering Summit - Main Auditorium Booking",
      message:
        "We request the Main Auditorium for the Annual Engineering Summit with keynote talks, poster presentations, and student project demos.",
      attendance: "350 participants",
      equipmentNeeded: "Projector, PA System, 4 Wireless Mics, Live Streaming Setup",
      technicalSupport: "AV Team + Electrical Standby",
      requestedOn: "Oct 10, 2026",
      eventType: "Academic Conference",
    },
  },
  {
    id: "#BK-2026-0155",
    dateISO: "2026-10-22",
    date: "Oct 22, 2026",
    time: "02:00 PM - 04:00 PM",
    venue: "Seminar Hall B",
    event: "Guest Lecture: AI Ethics",
    organizer: "Dept. of CSE • Sarah Smith",
    status: "Cancelled",
    isFaded: true,
    strike: true,
    actions: ["view"],
    details: {
      department: "Computer Science and Engineering",
      organizerFullName: "Sarah Smith",
      organizerEmail: "sarah.smith@ksrce.ac.in",
      organizerRole: "Associate Professor",
      purpose: "Guest lecture focused on ethical AI systems and responsible model deployment.",
      subject: "Guest Lecture Request - AI Ethics",
      message:
        "The CSE department invited an industry expert for an AI Ethics lecture and requested AV-enabled seminar seating for 180 attendees.",
      attendance: "180 participants",
      equipmentNeeded: "Projector, Podium Mic, Recording Camera",
      technicalSupport: "Network Support for live demo",
      requestedOn: "Oct 08, 2026",
      eventType: "Guest Lecture",
    },
  },
  {
    id: "#BK-2026-0154",
    dateISO: "2026-10-20",
    date: "Oct 20, 2026",
    time: "10:00 AM - 11:30 AM",
    venue: "Open Air Theatre",
    event: "Cultural Fest Rehearsal",
    organizer: "Student Council • Mike R.",
    status: "Rejected",
    isFaded: false,
    strike: false,
    actions: ["view", "reason"],
    details: {
      department: "Student Council",
      organizerFullName: "Mike Raj",
      organizerEmail: "mike.raj@ksrce.ac.in",
      organizerRole: "Cultural Secretary",
      purpose: "Stage rehearsal for annual cultural event with dance and drama teams.",
      subject: "Open Air Theatre Rehearsal Slot",
      message:
        "Student council requested a rehearsal window for 12 teams to prepare for the annual fest opening ceremony.",
      attendance: "220 participants",
      equipmentNeeded: "Stage Lights, 6 Cordless Mics, Sound Mixer",
      technicalSupport: "Stage Team + Security Support",
      requestedOn: "Oct 07, 2026",
      eventType: "Cultural Event",
    },
  },
  {
    id: "#BK-2026-0153",
    dateISO: "2026-10-18",
    date: "Oct 18, 2026",
    time: "09:00 AM - 05:00 PM",
    venue: "AICTE Lab",
    event: "Workshop on IoT",
    organizer: "Dept. of EEE • Prof. Alan",
    status: "Completed",
    isFaded: false,
    strike: false,
    actions: ["view", "print", "duplicate"],
    details: {
      department: "Electrical and Electronics Engineering",
      organizerFullName: "Prof. Alan Joseph",
      organizerEmail: "alan.joseph@ksrce.ac.in",
      organizerRole: "Workshop Lead",
      purpose: "Hands-on IoT training program for second-year students.",
      subject: "AICTE Lab Booking - IoT Workshop",
      message:
        "The EEE department requested AICTE Lab for practical IoT sessions including gateway setup, sensor integration, and cloud dashboards.",
      attendance: "90 participants",
      equipmentNeeded: "IoT Kits, LAN Ports (20), Soldering Station, Projector",
      technicalSupport: "Lab Assistant + IT Network Team",
      requestedOn: "Oct 04, 2026",
      eventType: "Technical Workshop",
    },
  },
  {
    id: "#BK-2026-0152",
    dateISO: "2026-10-15",
    date: "Oct 15, 2026",
    time: "02:00 PM - 03:00 PM",
    venue: "Conference Room 1",
    event: "Department Meeting",
    organizer: "Dept. of Civil • HOD",
    status: "Completed",
    isFaded: false,
    strike: false,
    actions: ["view", "print", "duplicate"],
    details: {
      department: "Civil Engineering",
      organizerFullName: "Dr. N. Kumar",
      organizerEmail: "hod.civil@ksrce.ac.in",
      organizerRole: "Head of Department",
      purpose: "Monthly department review and syllabus planning.",
      subject: "Civil Department Monthly Meeting",
      message:
        "Civil department requested Conference Room 1 for curriculum discussion and faculty planning review.",
      attendance: "32 participants",
      equipmentNeeded: "Smart Display, Conference Mic, Whiteboard",
      technicalSupport: "Admin Support",
      requestedOn: "Oct 02, 2026",
      eventType: "Department Meeting",
    },
  },
];

function getStatusClass(status) {
  switch (status) {
    case "Completed":
      return "ok";
    case "Cancelled":
      return "no";
    case "Rejected":
      return "err";
    default:
      return "no";
  }
}

function createCsv(rows) {
  const headers = ["Booking ID", "Date", "Time", "Venue", "Event", "Organizer", "Status"];
  const toCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const body = rows.map((row) => [row.id, row.date, row.time, row.venue, row.event, row.organizer, row.status].map(toCell).join(","));
  return [headers.join(","), ...body].join("\n");
}

function downloadCsv(fileName, csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function formatDateLabel(isoDate) {
  if (!isoDate) {
    return "Select date range";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`));
}

const PAGE_SIZE = 5;

function buildPaginationItems(currentPage, totalPages) {
  if (totalPages <= 1) {
    return [1];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-right", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis-left", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis-left", currentPage - 1, currentPage, currentPage + 1, "ellipsis-right", totalPages];
}

export default function HistoryPage() {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedVenue, setSelectedVenue] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const statuses = useMemo(() => {
    return ["All", ...new Set(bookings.map((booking) => booking.status))];
  }, [bookings]);

  const venues = useMemo(() => {
    return ["All", ...new Set(bookings.map((booking) => booking.venue))];
  }, [bookings]);

  const years = useMemo(() => {
    return [
      "All",
      ...new Set(bookings.map((booking) => new Date(`${booking.dateISO}T00:00:00`).getFullYear().toString())),
    ];
  }, [bookings]);

  const dateRangeLabel = startDate && endDate ? `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}` : "Select date range";

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        if (!query) {
          return true;
        }

        const haystack = [
          booking.id,
          booking.date,
          booking.time,
          booking.venue,
          booking.event,
          booking.organizer,
          booking.status,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .filter((booking) => {
        if (selectedStatus !== "All" && booking.status !== selectedStatus) {
          return false;
        }

        if (selectedVenue !== "All" && booking.venue !== selectedVenue) {
          return false;
        }

        if (selectedYear !== "All") {
          const bookingYear = new Date(`${booking.dateISO}T00:00:00`).getFullYear().toString();
          if (bookingYear !== selectedYear) {
            return false;
          }
        }

        if (startDate && booking.dateISO < startDate) {
          return false;
        }

        if (endDate && booking.dateISO > endDate) {
          return false;
        }

        return true;
      });
  }, [bookings, searchQuery, selectedStatus, selectedVenue, selectedYear, startDate, endDate]);

  const activeFilters = useMemo(() => {
    const filters = [];

    if (selectedStatus !== "All") {
      filters.push({ key: "status", label: `Status: ${selectedStatus}` });
    }

    if (selectedVenue !== "All") {
      filters.push({ key: "venue", label: `Venue: ${selectedVenue}` });
    }

    if (selectedYear !== "All") {
      filters.push({ key: "year", label: `Year: ${selectedYear}` });
    }

    if (startDate || endDate) {
      filters.push({
        key: "date",
        label: `Date: ${startDate ? formatDateLabel(startDate) : "Any"} - ${endDate ? formatDateLabel(endDate) : "Any"}`,
      });
    }

    return filters;
  }, [selectedStatus, selectedVenue, selectedYear, startDate, endDate]);

  const totalResults = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBookings = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredBookings.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredBookings, safeCurrentPage]);

  const paginationItems = useMemo(() => {
    return buildPaginationItems(safeCurrentPage, totalPages);
  }, [safeCurrentPage, totalPages]);

  const startResult = totalResults === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const endResult = totalResults === 0 ? 0 : Math.min(safeCurrentPage * PAGE_SIZE, totalResults);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
  };

  const handlePrint = (booking) => {
    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print ${booking.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin-bottom: 16px; }
            .row { margin: 8px 0; }
            .label { font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>Booking Record</h1>
          <div class="row"><span class="label">ID:</span> ${booking.id}</div>
          <div class="row"><span class="label">Event:</span> ${booking.event}</div>
          <div class="row"><span class="label">Venue:</span> ${booking.venue}</div>
          <div class="row"><span class="label">Date:</span> ${booking.date}</div>
          <div class="row"><span class="label">Time:</span> ${booking.time}</div>
          <div class="row"><span class="label">Organizer:</span> ${booking.organizer}</div>
          <div class="row"><span class="label">Status:</span> ${booking.status}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleDuplicateBooking = (booking) => {
    const nextIndex =
      bookings.reduce((max, item) => {
        const match = item.id.match(/(\d+)$/);
        if (!match) {
          return max;
        }
        return Math.max(max, Number(match[1]));
      }, 0) + 1;

    const nextId = `#BK-2026-${String(nextIndex).padStart(4, "0")}`;
    const duplicate = {
      ...booking,
      id: nextId,
      status: "Completed",
      isFaded: false,
      strike: false,
      actions: ["view", "print", "duplicate"],
    };

    setBookings((prev) => [duplicate, ...prev]);
  };

  const handleExport = () => {
    const csv = createCsv(filteredBookings);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`booking-archive-${stamp}.csv`, csv);
  };

  const handleRemoveFilter = (key) => {
    if (key === "status") {
      setSelectedStatus("All");
    }

    if (key === "venue") {
      setSelectedVenue("All");
    }

    if (key === "year") {
      setSelectedYear("All");
    }

    if (key === "date") {
      setStartDate("");
      setEndDate("");
    }
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedVenue("All");
    setSelectedYear("All");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className={styles.page}>
      <input className={styles.hide} id="mobile-menu-toggle" type="checkbox" />

      <label className={styles.overlay} htmlFor="mobile-menu-toggle" />

      <div className={layoutStyles.wrap}>
        <Sidebar activePage="history" />

        <div className={layoutStyles.main}>
          <PageHeader title="Booking Archive" />

          <main className={`${styles.scroll} ${styles.main}`}>
            <section className={styles.box}>
              <div className={styles.head}>
                <div className={styles.meta}>
                  <div className={styles.row}>
                    <h2 className={styles.title}>Booking Archive</h2>
                    <span className={styles.badge}>{bookings.length.toLocaleString()} bookings archived</span>
                  </div>
                  <p className={styles.sub}>Historical record of all venue reservations for audit and compliance.</p>
                </div>

                <div className={styles.ctrls}>
                  <div className={styles.dateWrap}>
                    <button className={styles.btnDate} onClick={() => setIsDatePickerOpen((prev) => !prev)} type="button">
                      <span className={styles.icon}>
                        <CalendarIcon />
                      </span>
                      <span className={styles.lbl}>{dateRangeLabel}</span>
                    </button>

                    {isDatePickerOpen ? (
                      <div className={styles.datePop}>
                        <label className={styles.dateFld}>
                          <span>Start Date</span>
                          <input
                            className={styles.dateInput}
                            onChange={(event) => {
                              setStartDate(event.target.value);
                              setCurrentPage(1);
                            }}
                            type="date"
                            value={startDate}
                          />
                        </label>
                        <label className={styles.dateFld}>
                          <span>End Date</span>
                          <input
                            className={styles.dateInput}
                            min={startDate || undefined}
                            onChange={(event) => {
                              setEndDate(event.target.value);
                              setCurrentPage(1);
                            }}
                            type="date"
                            value={endDate}
                          />
                        </label>
                      </div>
                    ) : null}
                  </div>

                  <div className={styles.search}>
                    <span className={styles.icon}>
                      <SearchIcon />
                    </span>
                    <input
                      className={styles.input}
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search archive (ID, Event, Name)..."
                      type="text"
                      value={searchQuery}
                    />
                  </div>

                  <button className={styles.btnExp} onClick={handleExport} type="button">
                    <DownloadIcon className={styles.icoExp} />
                    Export
                  </button>
                </div>
              </div>

              <div className={styles.filters}>
                <span className={styles.tag}>Filters:</span>

                <label className={styles.selWrap}>
                  <span className={styles.selLbl}>Status</span>
                  <select
                    className={styles.sel}
                    onChange={(event) => {
                      setSelectedStatus(event.target.value);
                      setCurrentPage(1);
                    }}
                    value={selectedStatus}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label className={styles.selWrap}>
                  <span className={styles.selLbl}>Venue</span>
                  <select
                    className={styles.sel}
                    onChange={(event) => {
                      setSelectedVenue(event.target.value);
                      setCurrentPage(1);
                    }}
                    value={selectedVenue}
                  >
                    {venues.map((venue) => (
                      <option key={venue} value={venue}>{venue}</option>
                    ))}
                  </select>
                </label>

                <label className={styles.selWrap}>
                  <span className={styles.selLbl}>Year</span>
                  <select
                    className={styles.sel}
                    onChange={(event) => {
                      setSelectedYear(event.target.value);
                      setCurrentPage(1);
                    }}
                    value={selectedYear}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </label>

                {activeFilters.map((filter, index) => (
                  <span className={`${styles.pill} ${index % 3 === 0 ? styles.blue : index % 3 === 1 ? styles.purple : styles.pink}`} key={filter.key}>
                    {filter.label}
                    <button
                      aria-label="Remove filter"
                      className={styles.btnRm}
                      onClick={() => {
                        handleRemoveFilter(filter.key);
                        setCurrentPage(1);
                      }}
                      type="button"
                    >
                      x
                    </button>
                  </span>
                ))}

                <button
                  className={styles.btnClr}
                  onClick={() => {
                    handleClearAllFilters();
                    setCurrentPage(1);
                  }}
                  type="button"
                >
                  Clear all
                </button>
              </div>
            </section>

            <section className={`${styles.tblBox} ${styles.wm}`}>
              <div className={styles.tblWrap}>
                <table className={styles.table}>
                  <thead className={styles.thead}>
                    <tr>
                      <th className={styles.th}>Booking ID</th>
                      <th className={styles.th}>Date &amp; Time</th>
                      <th className={styles.th}>Venue</th>
                      <th className={styles.th}>Event &amp; Organizer</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>
                        <span className={styles.sr}>Actions</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className={styles.tbody}>
                    {paginatedBookings.map((booking) => {
                      const rowClass = booking.isFaded ? styles.trCancel : styles.tr;
                      const cellClass = booking.isFaded ? styles.tdFaded : styles.td;
                      const wrapClass = booking.isFaded ? styles.tdWrapFaded : styles.tdWrap;
                      const statusClass = styles[getStatusClass(booking.status)];

                      return (
                        <tr className={rowClass} key={booking.id}>
                          <td className={cellClass}>
                            <a className={styles.idLink} href="#">{booking.id}</a>
                          </td>
                          <td className={cellClass}>
                            <div className={`${styles.txtMain} ${booking.strike ? styles.strike : ""}`}>{booking.date}</div>
                            <div className={styles.txtSub}>{booking.time}</div>
                          </td>
                          <td className={cellClass}>
                            <div className={styles.flexRow}>
                              <span className={styles.pin}><PinIcon /></span>
                              <span className={styles.txtNorm}>{booking.venue}</span>
                            </div>
                          </td>
                          <td className={wrapClass}>
                            <div className={`${styles.txtMain} ${booking.strike ? styles.strike : ""}`}>{booking.event}</div>
                            <div className={styles.txtSub}>{booking.organizer}</div>
                          </td>
                          <td className={styles.td}>
                            <span className={`${styles.status} ${statusClass}`}>{booking.status}</span>
                          </td>
                          <td className={styles.tdRight}>
                            <div className={styles.actions}>
                              {booking.actions.includes("view") ? (
                                <button className={styles.actBtn} onClick={() => handleViewDetails(booking)} title="View Details" type="button"><EyeIcon /></button>
                              ) : null}
                              {booking.actions.includes("print") ? (
                                <button className={styles.actBtn} onClick={() => handlePrint(booking)} title="Print Record" type="button"><PrintIcon /></button>
                              ) : null}
                              {booking.actions.includes("duplicate") ? (
                                <button className={styles.actBtn} onClick={() => handleDuplicateBooking(booking)} title="Duplicate Booking" type="button"><CopyIcon /></button>
                              ) : null}
                              {booking.actions.includes("reason") ? (
                                <button className={styles.actBtn} onClick={() => handleViewDetails(booking)} title="View Reason" type="button"><InfoIcon /></button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className={styles.foot}>
                <div className={styles.footInner}>
                  <div>
                    <p className={styles.footTxt}>
                      Showing <span className={styles.footNum}>{startResult}</span> to <span className={styles.footNum}>{endResult}</span> of{" "}
                      <span className={styles.footNum}>{totalResults}</span> results
                    </p>
                  </div>
                  <div>
                    <nav aria-label="Pagination" className={styles.pager}>
                      <button
                        className={styles.navBtn}
                        disabled={safeCurrentPage === 1}
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        type="button"
                      >
                        <span className={styles.sr}>Previous</span>
                        <ChevronLeftIcon />
                      </button>

                      {paginationItems.map((item) => {
                        if (typeof item === "string") {
                          return <span className={styles.dots} key={item}>...</span>;
                        }

                        const isActive = item === safeCurrentPage;

                        return (
                          <button
                            aria-current={isActive ? "page" : undefined}
                            className={isActive ? styles.active : styles.pageBtn}
                            key={item}
                            onClick={() => setCurrentPage(item)}
                            type="button"
                          >
                            {item}
                          </button>
                        );
                      })}

                      <button
                        className={styles.navBtn}
                        disabled={safeCurrentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        type="button"
                      >
                        <span className={styles.sr}>Next</span>
                        <ChevronRightIcon />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </section>

            <div className={styles.footerNote}>
              <p className={styles.footerTxt}>
                KSR College of Engineering • Venue Booking Portal Admin System v2.4 • Confidential Record
              </p>
            </div>
          </main>
        </div>
      </div>

      {selectedBooking ? (
        <div
          className={styles.modalOverlay}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
          role="presentation"
        >
          <div aria-labelledby="booking-detail-title" aria-modal="true" className={styles.detailsModal} role="dialog">
            <div className={styles.modalHead}>
              <div>
                <h3 className={styles.modalTitle} id="booking-detail-title">Booking Details</h3>
                <p className={styles.modalSub}>{selectedBooking.id} • {selectedBooking.status}</p>
              </div>
              <button aria-label="Close booking details" className={styles.modalClose} onClick={handleCloseModal} type="button">
                <CloseIcon />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}><span className={styles.detailK}>Event</span><span className={styles.detailV}>{selectedBooking.event}</span></div>
                <div className={styles.detailItem}><span className={styles.detailK}>Venue</span><span className={styles.detailV}>{selectedBooking.venue}</span></div>
                <div className={styles.detailItem}><span className={styles.detailK}>Date</span><span className={styles.detailV}>{selectedBooking.date}</span></div>
                <div className={styles.detailItem}><span className={styles.detailK}>Time</span><span className={styles.detailV}>{selectedBooking.time}</span></div>
                <div className={styles.detailItem}><span className={styles.detailK}>Department</span><span className={styles.detailV}>{selectedBooking.details.department}</span></div>
                <div className={styles.detailItem}><span className={styles.detailK}>Event Type</span><span className={styles.detailV}>{selectedBooking.details.eventType}</span></div>
                <div className={styles.detailItem}><span className={styles.detailK}>Organizer Name</span><span className={styles.detailV}>{selectedBooking.details.organizerFullName}</span></div>
                <div className={styles.detailItem}><span className={styles.detailK}>Organizer Role</span><span className={styles.detailV}>{selectedBooking.details.organizerRole}</span></div>
                <div className={styles.detailItem}><span className={styles.detailK}>Organizer Email</span><span className={styles.detailV}>{selectedBooking.details.organizerEmail}</span></div>
                <div className={styles.detailItem}><span className={styles.detailK}>Expected Attendance</span><span className={styles.detailV}>{selectedBooking.details.attendance}</span></div>
                <div className={styles.detailItem}><span className={styles.detailK}>Equipment Needed</span><span className={styles.detailV}>{selectedBooking.details.equipmentNeeded}</span></div>
                <div className={styles.detailItem}><span className={styles.detailK}>Technical Support</span><span className={styles.detailV}>{selectedBooking.details.technicalSupport}</span></div>
                <div className={styles.detailItem}><span className={styles.detailK}>Request Subject</span><span className={styles.detailV}>{selectedBooking.details.subject}</span></div>
                <div className={styles.detailItem}><span className={styles.detailK}>Requested On</span><span className={styles.detailV}>{selectedBooking.details.requestedOn}</span></div>
              </div>

              <div className={styles.messagePanel}>
                <p className={styles.messageTitle}>Request Purpose</p>
                <p className={styles.messageText}>{selectedBooking.details.purpose}</p>
              </div>

              <div className={styles.messagePanel}>
                <p className={styles.messageTitle}>Original Email Content</p>
                <p className={styles.messageText}>{selectedBooking.details.message}</p>
              </div>
            </div>

            <div className={styles.modalFoot}>
              <button className={styles.modalBtn} onClick={handleCloseModal} type="button">Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
