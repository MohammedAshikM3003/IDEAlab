import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

import Calendar from "./Calendar";
import PageHeader from "./PageHeader";
import Sidebar from "./Sidebar";
import layoutStyles from "./DashboardPage.module.css";
import styles from "./HistoryPage.module.css";
import { getBookingTimeStatus } from "./utils/bookingTimeStatus";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

function ChevronDownIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 20 20" width="14" {...props}>
      <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
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

function FileChartIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16" {...props}>
      <path d="M6 3h8l4 4v14H6V3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M14 3v4h4" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M9 17v-4m3 4v-6m3 6v-2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function FilePdfIcon(props) {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16" {...props}>
      <path d="M6 3h8l4 4v14H6V3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M14 3v4h4" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M8.5 15h1.5a1.5 1.5 0 0 0 0-3H8.5V15Zm4 0v-3h1.2m0 0a1.3 1.3 0 0 1 0 2.6h-1.2m3.8.4h-1.8v-3h1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function formatReadableDate(value, emptyLabel = "TBD") {
  if (!value) {
    return { dateISO: "", dateLabel: emptyLabel };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { dateISO: "", dateLabel: emptyLabel };
  }

  return {
    dateISO: parsed.toISOString().slice(0, 10),
    dateLabel: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed),
  };
}

function mapStatusLabel(statusValue, dateISO, startTime, endTime) {
  const normalized = String(statusValue || "").trim().toLowerCase();
  if (normalized === "approved") {
    const timeStatus = getBookingTimeStatus(dateISO, startTime, endTime);
    if (timeStatus === 'upcoming') return 'Upcoming';
    if (timeStatus === 'in_progress') return 'In Progress';
    return 'Completed';
  }
  if (normalized === "rejected") return "Rejected";
  if (normalized === "pending" || normalized === "form_sent" || normalized === "clarification_requested") {
    return "Pending";
  }
  return "Pending";
}

function buildBookingFromApi(item) {
  const idRaw = item && item._id ? String(item._id) : "";
  const bookingId = idRaw ? `#BK-${idRaw.slice(-6).toUpperCase()}` : "#BK-UNKNOWN";
  const requesterName = item?.requesterName ? String(item.requesterName) : "Unknown";
  const venue = item?.confirmedBooking?.venue?.name || item?.extractedDetails?.venue || "Venue TBD";
  const eventTitle = item?.extractedDetails?.eventPurpose || item?.subject || "Booking Request";
  const eventDate = item?.confirmedBooking?.date || item?.extractedDetails?.requestedDate || null;
  const { dateISO, dateLabel } = formatReadableDate(eventDate, "Awaiting form");
  const startTime =
    item?.confirmedBooking?.timeSlot?.start || item?.extractedDetails?.timeSlot?.split("-")[0]?.trim() || null;
  const endTime =
    item?.confirmedBooking?.timeSlot?.end || item?.extractedDetails?.timeSlot?.split("-")[1]?.trim() || null;
  const timeSlot = startTime && endTime ? `${startTime} - ${endTime}` : "TBD";
  const status = mapStatusLabel(item?.status, dateISO, startTime, endTime);
  const submittedAt = item?.createdAt || "";
  const submittedLabel = formatReadableDate(submittedAt).dateLabel;

  const isRejected = status === "Rejected";
  const isApproved = ["Completed", "Upcoming", "In Progress"].includes(status);

  return {
    id: bookingId,
    dateISO,
    date: dateLabel,
    time: timeSlot,
    venue,
    event: eventTitle,
    organizer: requesterName,
    status,
    isFaded: isRejected,
    strike: isRejected,
    actions: isApproved ? ["view", "print"] : isRejected ? ["view", "reason"] : ["view"],
    submittedAt,
    details: {
      department: item?.department || "Not specified",
      organizerFullName: requesterName,
      organizerEmail: item?.requesterEmail || "Not specified",
      organizerRole: item?.organizerRole || "Not specified",
      purpose: item?.eventTitle || item?.subject || "Not specified",
      subject: item?.subject || "",
      message: item?.message || item?.rawEmailContent || "",
      attendance: item?.attendance || "Not specified",
      equipmentNeeded: item?.equipmentNeeded || item?.equipment || "Not specified",
      technicalSupport: item?.technicalSupport || "Not specified",
      requestedOn: submittedLabel,
      eventType: item?.eventType || "Booking",
    },
  };
}

function getStatusClass(status) {
  switch (status) {
    case "Completed":
      return "ok";
    case "Upcoming":
      return "upcoming";
    case "In Progress":
      return "inProgress";
    case "Cancelled":
      return "no";
    case "Rejected":
      return "err";
    default:
      return "no";
  }
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

function parseISODate(isoDate) {
  if (!isoDate) {
    return null;
  }

  const [year, month, day] = isoDate.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function toISODate(dateValue) {
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

export default function HistoryPage({ isSidebarOpen, setIsSidebarOpen }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedVenue, setSelectedVenue] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openDatePicker, setOpenDatePicker] = useState(null);
  const [dateError, setDateError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);
  const datePickerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    fetch(`${API_URL}/api/bookings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load booking history.");
        }
        return res.json();
      })
      .then((data) => {
        const items = data?.bookings || data?.data || data || [];
        const mapped = Array.isArray(items) ? items.map((item) => buildBookingFromApi(item)) : [];
        setBookings(mapped);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err?.message || "Failed to load booking history.");
        setBookings([]);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const statuses = useMemo(() => {
    return ["All", ...new Set(bookings.map((booking) => booking.status))];
  }, [bookings]);

  const venues = useMemo(() => {
    return ["All", ...new Set(bookings.map((booking) => booking.venue))];
  }, [bookings]);

  const years = useMemo(() => {
    return [
      "All",
      ...new Set(
        bookings
          .map((booking) => booking.dateISO)
          .filter(Boolean)
          .map((dateISO) => new Date(`${dateISO}T00:00:00`).getFullYear().toString()),
      ),
    ];
  }, [bookings]);

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
          if (!booking.dateISO) {
            return false;
          }
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

  useEffect(() => {
    if (!isExportMenuOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isExportMenuOpen]);

  useEffect(() => {
    if (!openDatePicker) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setOpenDatePicker(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openDatePicker]);

  const handleStartDateSelect = (dateValue) => {
    const nextStartDate = toISODate(dateValue);
    setStartDate(nextStartDate);
    setCurrentPage(1);

    if (endDate && nextStartDate > endDate) {
      setEndDate("");
    }

    setDateError("");
    setOpenDatePicker(null);
  };

  const handleEndDateSelect = (dateValue) => {
    const nextEndDate = toISODate(dateValue);

    if (startDate && nextEndDate < startDate) {
      setEndDate("");
      setDateError("End date cannot be before start date");
      setOpenDatePicker(null);
      return;
    }

    setEndDate(nextEndDate);
    setDateError("");
    setCurrentPage(1);
    setOpenDatePicker(null);
  };

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

  const exportToExcel = () => {
    const data = bookings.map((b) => ({
      "Booking ID": b.id,
      "Date & Time": `${b.date} ${b.time}`,
      Venue: b.venue,
      Event: b.event,
      Organizer: b.organizer,
      Department: b.details?.department || "",
      Status: b.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Booking Archive");
    XLSX.writeFile(wb, `booking-archive-${new Date().toISOString().split("T")[0]}.xlsx`);
    setIsExportMenuOpen(false);
  };

  const handleExportPdf = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const printWindow = window.open("", "_blank", "width=1100,height=800");

    if (!printWindow) {
      return;
    }

    const rowsHtml = paginatedBookings
      .map(
        (booking) => `
          <tr>
            <td>${booking.id}</td>
            <td>${booking.date} ${booking.time}</td>
            <td>${booking.venue}</td>
            <td>${booking.event}</td>
            <td>${booking.organizer}</td>
            <td>${booking.status}</td>
          </tr>
        `,
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>booking-archive-${stamp}.pdf</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 8px; font-size: 24px; }
            p { margin: 0 0 18px; color: #475569; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; font-size: 12px; }
            th { background: #f8fafc; text-transform: uppercase; letter-spacing: 0.03em; }
          </style>
        </head>
        <body>
          <h1>Booking Archive</h1>
          <p>Export Date: ${stamp}</p>
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Event</th>
                <th>Organizer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setIsExportMenuOpen(false);
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
    setDateError("");
    setOpenDatePicker(null);
  };

  return (
    <div className={styles.page}>
      <div className={layoutStyles.wrap}>
        <Sidebar activePage="history" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className={layoutStyles.main}>
          <PageHeader title="Booking Archive" setIsSidebarOpen={setIsSidebarOpen} />

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
                  <div className={styles.dateRangeWrap} ref={datePickerRef}>
                    <div className={styles.dateWrap}>
                      <button
                        className={styles.btnDate}
                        onClick={() => {
                          setOpenDatePicker((prev) => (prev === "start" ? null : "start"));
                          setDateError("");
                        }}
                        type="button"
                      >
                        <span className={styles.btnDateMain}>
                          <span className={styles.icon}>
                            <CalendarIcon />
                          </span>
                          <span className={styles.lbl}>{startDate ? formatDateLabel(startDate) : "Start Date"}</span>
                        </span>
                        <span className={`${styles.dateChevron} ${openDatePicker === "start" ? styles.dateChevronOpen : ""}`}>
                          <ChevronDownIcon />
                        </span>
                      </button>

                      {openDatePicker === "start" ? (
                        <div className={styles.datePop}>
                          <Calendar
                            availabilityData={{}}
                            onDateSelect={handleStartDateSelect}
                            selectedDate={parseISODate(startDate) || undefined}
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className={styles.dateWrap}>
                      <button
                        className={styles.btnDate}
                        onClick={() => {
                          setOpenDatePicker((prev) => (prev === "end" ? null : "end"));
                        }}
                        type="button"
                      >
                        <span className={styles.btnDateMain}>
                          <span className={styles.icon}>
                            <CalendarIcon />
                          </span>
                          <span className={styles.lbl}>{endDate ? formatDateLabel(endDate) : "End Date"}</span>
                        </span>
                        <span className={`${styles.dateChevron} ${openDatePicker === "end" ? styles.dateChevronOpen : ""}`}>
                          <ChevronDownIcon />
                        </span>
                      </button>

                      {openDatePicker === "end" ? (
                        <div className={styles.datePop}>
                          <Calendar
                            availabilityData={{}}
                            minDate={parseISODate(startDate) || undefined}
                            onDateSelect={handleEndDateSelect}
                            selectedDate={parseISODate(endDate) || undefined}
                          />
                        </div>
                      ) : null}

                      {dateError ? <p className={styles.dateError}>{dateError}</p> : null}
                    </div>
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

                  <div className={styles.expWrap} ref={exportMenuRef}>
                    <button
                      aria-expanded={isExportMenuOpen}
                      aria-haspopup="menu"
                      className={styles.btnExp}
                      onClick={() => setIsExportMenuOpen((prev) => !prev)}
                      type="button"
                    >
                      <DownloadIcon className={styles.icoExp} />
                      Export
                      <span className={styles.expChevron}>▾</span>
                    </button>

                    {isExportMenuOpen ? (
                      <div className={styles.expMenu} role="menu">
                        <button className={styles.expItem} onClick={exportToExcel} role="menuitem" type="button">
                          <span className={styles.expItemIcon}><FileChartIcon /></span>
                          <span>Export as Excel (.xlsx)</span>
                        </button>
                        <button className={styles.expItem} onClick={handleExportPdf} role="menuitem" type="button">
                          <span className={styles.expItemIcon}><FilePdfIcon /></span>
                          <span>Export as PDF</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className={styles.filters}>
                <span className={styles.tag}>FILTERS:</span>

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
              {loading ? (
                <div className={styles.loadingState}>
                  <span className={styles.spinner} aria-hidden="true" />
                  <span>Loading booking history...</span>
                </div>
              ) : error ? (
                <div className={styles.errorState}>{error}</div>
              ) : null}
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

              <div className={styles.mobileCards}>
                {paginatedBookings.map((booking) => {
                  const statusVariant =
                    booking.status === "Completed"
                      ? "completed"
                      : booking.status === "Cancelled"
                        ? "cancelled"
                        : booking.status === "Pending"
                          ? "pending"
                          : "rejected";

                  return (
                    <article className={`${styles.mobileCard} ${styles[`mobileCard${statusVariant[0].toUpperCase()}${statusVariant.slice(1)}`]}`} key={`mobile-${booking.id}`}>
                      <span className={styles.mobileAccent} aria-hidden="true" />

                      <div className={styles.mobileCardBody}>
                        <div className={styles.mobileTopRow}>
                          <h3 className={styles.mobileEvent}>{booking.event}</h3>
                          <span
                            className={`${styles.mobileStatusPill} ${styles[`mobileStatus${statusVariant[0].toUpperCase()}${statusVariant.slice(1)}`]}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <p className={styles.mobileSubText}>
                          {booking.details?.department || "Department"} · {booking.details?.organizerFullName || booking.organizer}
                        </p>

                        <div className={styles.mobileMetaRow}>
                          <span className={styles.mobileMetaChip}>{booking.venue}</span>
                          <span className={styles.mobileMetaChip}>{booking.date}</span>
                          <span className={styles.mobileMetaChip}>{booking.time}</span>
                        </div>

                        <div className={styles.mobileFooterRow}>
                          <span className={styles.mobileBookingId}>{booking.id}</span>

                          <div className={styles.mobileActions}>
                            <button
                              aria-label="View details"
                              className={styles.mobileActionBtn}
                              onClick={() => handleViewDetails(booking)}
                              title="View Details"
                              type="button"
                            >
                              <EyeIcon />
                            </button>

                            {booking.status === "Completed" ? (
                              <>
                                <button
                                  aria-label="Print record"
                                  className={styles.mobileActionBtn}
                                  onClick={() => handlePrint(booking)}
                                  title="Print Record"
                                  type="button"
                                >
                                  <PrintIcon />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
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
