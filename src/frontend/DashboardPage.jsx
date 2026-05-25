import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "./PageHeader";
import Sidebar from "./Sidebar";
import styles from "./DashboardPage.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const BOOKING_TIMEFRAMES = {
  last6Months: "last-6-months",
  thisYear: "this-year",
};

const bookingDayTrendsByTimeframe = {
  [BOOKING_TIMEFRAMES.last6Months]: [
    { day: "Mon", bookings: 21 },
    { day: "Tue", bookings: 18 },
    { day: "Wed", bookings: 24 },
    { day: "Thu", bookings: 20 },
    { day: "Fri", bookings: 27 },
    { day: "Sat", bookings: 13 },
    { day: "Sun", bookings: 9 },
  ],
  [BOOKING_TIMEFRAMES.thisYear]: [
    { day: "Mon", bookings: 38 },
    { day: "Tue", bookings: 34 },
    { day: "Wed", bookings: 41 },
    { day: "Thu", bookings: 36 },
    { day: "Fri", bookings: 44 },
    { day: "Sat", bookings: 22 },
    { day: "Sun", bookings: 17 },
  ],
};

const VENUE_COLORS = [
  "#ff9500",
  "#002147",
  "#ff7a59",
  "#f59e0b",
  "#fb923c",
  "#fbbf24",
  "#1d4ed8",
  "#0f172a",
];

const STATUS_PENDING = new Set(["pending", "form_sent", "clarification_requested"]);

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function getStatusPresentation(statusValue) {
  const normalized = normalizeStatus(statusValue);
  if (normalized === "approved") {
    return { label: "Approved", className: "badgeOk" };
  }
  if (normalized === "rejected") {
    return { label: "Rejected", className: "badgeErr" };
  }
  return { label: "Pending", className: "badgeWarn" };
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "NA";
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

function formatShortDate(value) {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function normalizeVenueName(value) {
  return String(value || "").trim().toLowerCase();
}

function getVenueAbbreviation(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "--";
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

function buildMonthlyCounts(bookings, monthsBack) {
  const now = new Date();
  const months = [];
  const monthKeys = [];

  for (let offset = monthsBack - 1; offset >= 0; offset -= 1) {
    const bucketDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`;
    months.push(bucketDate);
    monthKeys.push(key);
  }

  const counts = monthKeys.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

  bookings.forEach((booking) => {
    const createdAt = booking?.createdAt;
    const date = createdAt ? new Date(createdAt) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (counts[key] !== undefined) {
      counts[key] += 1;
    }
  });

  return months.map((bucket, index) => ({
    month: bucket.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    bookings: counts[monthKeys[index]] || 0,
  }));
}

function buildYearMonthlyCounts(bookings) {
  const now = new Date();
  const year = now.getFullYear();
  const monthKeys = Array.from({ length: 12 }, (_, index) => `${year}-${index}`);
  const counts = monthKeys.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

  bookings.forEach((booking) => {
    const createdAt = booking?.createdAt;
    const date = createdAt ? new Date(createdAt) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    if (date.getFullYear() !== year) return;
    const key = `${year}-${date.getMonth()}`;
    if (counts[key] !== undefined) {
      counts[key] += 1;
    }
  });

  return monthKeys.map((key, index) => {
    const monthDate = new Date(year, index, 1);
    return {
      month: monthDate.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      bookings: counts[key] || 0,
    };
  });
}

export default function DashboardPage({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState(BOOKING_TIMEFRAMES.last6Months);
  const last6MonthsTrends = useMemo(() => buildMonthlyCounts(bookings, 6), [bookings]);
  const thisYearTrends = useMemo(() => buildYearMonthlyCounts(bookings), [bookings]);
  const bookingTrendsByTimeframe = useMemo(
    () => ({
      [BOOKING_TIMEFRAMES.last6Months]: {
        overTime: last6MonthsTrends,
        byDay: bookingDayTrendsByTimeframe[BOOKING_TIMEFRAMES.last6Months],
      },
      [BOOKING_TIMEFRAMES.thisYear]: {
        overTime: thisYearTrends,
        byDay: bookingDayTrendsByTimeframe[BOOKING_TIMEFRAMES.thisYear],
      },
    }),
    [last6MonthsTrends, thisYearTrends],
  );
  const currentBookingTrends = bookingTrendsByTimeframe[selectedTimeframe]
    || bookingTrendsByTimeframe[BOOKING_TIMEFRAMES.last6Months];

  const totalBookingCount = bookings.length;
  const pendingCount = useMemo(
    () => bookings.filter((booking) => STATUS_PENDING.has(normalizeStatus(booking?.status))).length,
    [bookings],
  );
  const approvedCount = useMemo(
    () => bookings.filter((booking) => normalizeStatus(booking?.status) === "approved").length,
    [bookings],
  );
  const rejectedCount = useMemo(
    () => bookings.filter((booking) => normalizeStatus(booking?.status) === "rejected").length,
    [bookings],
  );
  const approvalRate = approvedCount + rejectedCount > 0
    ? Math.round((approvedCount / (approvedCount + rejectedCount)) * 100)
    : 0;

  const totalVenues = venues.length;
  const activeVenueCount = useMemo(
    () => venues.filter((venue) => venue?.status === "active").length,
    [venues],
  );
  const availableUtilization = totalVenues > 0 ? Math.round((activeVenueCount / totalVenues) * 100) : 0;
  const approvalDashOffset = Math.max(0, 100.5 - (approvalRate / 100) * 100.5);
  const venueUsageData = useMemo(() => {
    const venueList = Array.isArray(venues) ? venues : [];
    const venueIdByName = new Map();
    const venueIds = new Set();

    venueList.forEach((venue) => {
      const id = venue?._id ? String(venue._id) : "";
      if (id) {
        venueIds.add(id);
      }
      const name = String(venue?.name || "").trim();
      if (name && id) {
        venueIdByName.set(normalizeVenueName(name), id);
      }
    });

    const counts = new Map();
    venueIds.forEach((id) => counts.set(id, 0));
    let unassignedCount = 0;

    bookings.forEach((booking) => {
      const confirmedVenue = booking?.confirmedBooking?.venue;
      let resolvedId = null;

      if (confirmedVenue) {
        if (typeof confirmedVenue === "string") {
          resolvedId = venueIds.has(confirmedVenue) ? confirmedVenue : null;
        } else if (confirmedVenue?._id) {
          const id = String(confirmedVenue._id);
          resolvedId = venueIds.has(id) ? id : null;
        } else if (confirmedVenue?.name) {
          const key = normalizeVenueName(confirmedVenue.name);
          resolvedId = venueIdByName.get(key) || null;
        }
      }

      if (!resolvedId) {
        const extractedVenue = booking?.extractedDetails?.venue;
        if (extractedVenue) {
          const key = normalizeVenueName(extractedVenue);
          resolvedId = venueIdByName.get(key) || null;
        }
      }

      if (resolvedId) {
        counts.set(resolvedId, (counts.get(resolvedId) || 0) + 1);
      } else if (booking) {
        unassignedCount += 1;
      }
    });

    const total = bookings.length;
    const items = venueList.map((venue) => {
      const id = venue?._id ? String(venue._id) : String(venue?.name || "");
      const booked = counts.get(id) || 0;
      const percentage = total > 0 ? Math.round((booked / total) * 100) : 0;
      return {
        id,
        name: venue?.name || "Unknown",
        abbreviation: getVenueAbbreviation(venue?.name),
        percentage,
        booked,
        totalCapacity: venue?.capacity || 0,
      };
    });

    if (unassignedCount > 0) {
      items.push({
        id: "unassigned",
        name: "Unassigned",
        abbreviation: "UA",
        percentage: total > 0 ? Math.round((unassignedCount / total) * 100) : 0,
        booked: unassignedCount,
        totalCapacity: 0,
        isUnassigned: true,
      });
    }

    return items;
  }, [bookings, venues]);

  const rankedVenueData = useMemo(() => {
    return [...venueUsageData]
      .sort((a, b) => b.booked - a.booked)
      .map((venue, index) => ({
        ...venue,
        colorHex: VENUE_COLORS[index % VENUE_COLORS.length],
      }));
  }, [venueUsageData]);

  const totalVenueBookings = useMemo(
    () => venueUsageData.reduce((sum, venue) => sum + venue.booked, 0),
    [venueUsageData],
  );

  const recentBookingRequests = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => {
      const timeA = new Date(a?.createdAt || 0).getTime();
      const timeB = new Date(b?.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return sorted.slice(0, 5).map((booking, index) => {
      const presenter = getStatusPresentation(booking?.status);
      const requesterName = booking?.requesterName || "Unknown";
      const subject = booking?.subject || "Booking Request";
      const initialsClassName = ["initBlue", "initAmber", "initRose"][index % 3];
      return {
        id: String(booking?._id || index),
        requesterInitials: getInitials(requesterName),
        requesterName,
        subject,
        createdAt: booking?.createdAt || "",
        dateLabel: formatShortDate(booking?.createdAt),
        statusLabel: presenter.label,
        statusClassName: presenter.className,
        initialsClassName,
      };
    });
  }, [bookings]);

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    setIsLoading(true);
    setError("");

    Promise.all([
      fetch(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      }),
      fetch(`${API_URL}/api/venues`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      }),
    ])
      .then(async ([bookingsResponse, venuesResponse]) => {
        if (!bookingsResponse.ok) {
          throw new Error("Failed to load bookings");
        }
        if (!venuesResponse.ok) {
          throw new Error("Failed to load venues");
        }

        const bookingsPayload = await bookingsResponse.json();
        const venuesPayload = await venuesResponse.json();
        const bookingsData = bookingsPayload?.bookings || bookingsPayload?.data || bookingsPayload || [];
        const venuesList = venuesPayload?.venues || venuesPayload?.data || venuesPayload || [];

        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setVenues(Array.isArray(venuesList) ? venuesList : []);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err?.message || "Failed to load dashboard data");
        setBookings([]);
        setVenues([]);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <Sidebar
          activePage="dashboard"
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <div className={styles.main}>
          <PageHeader title="Operational Analytics" setIsSidebarOpen={setIsSidebarOpen} />

          <main className={styles.body}>
            {/* â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statRow}>
                  <span className={`material-icons ${styles.iconPrimary}`}>event_note</span>
                  <span className={styles.tagGreen}>{approvedCount} approved</span>
                </div>
                <h3 className={styles.statLabel}>Total Bookings</h3>
                <p className={styles.statVal}>{totalBookingCount}</p>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statRow}>
                  <span className={`material-icons ${styles.iconAmber}`}>pending_actions</span>
                  <span className={styles.tagAmber}>{rejectedCount} rejected</span>
                </div>
                <h3 className={styles.statLabel}>Pending Requests</h3>
                <p className={styles.statVal}>{pendingCount}</p>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statRowSm}>
                  <span className={`material-icons ${styles.iconEmerald}`}>meeting_room</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {activeVenueCount} / {totalVenues}
                  </span>
                </div>
                <h3 className={styles.statLabel}>Total Venues</h3>
                <div className={styles.progressWrap}>
                  <div className={styles.progressFill} style={{ width: `${availableUtilization}%` }} />
                </div>
                <p className={styles.progressLabel}>{availableUtilization}% Capacity Utilization</p>
              </div>

              <div className={`${styles.statCard} ${styles.ovh}`}>
                <div className={styles.statRowSm}>
                  <span className={`material-icons ${styles.iconBlue}`}>verified</span>
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
                      <circle
                        className="text-slate-100 dark:text-slate-800"
                        cx="20" cy="20" fill="transparent" r="16"
                        stroke="currentColor" strokeWidth="4"
                      />
                      <circle
                        className="text-blue-500"
                        cx="20" cy="20" fill="transparent" r="16"
                        stroke="currentColor" strokeDasharray="100.5" strokeDashoffset={approvalDashOffset}
                        strokeWidth="4"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className={styles.statLabel}>Approval Rate</h3>
                <p className={styles.statVal}>{approvalRate}%</p>
              </div>
            </div>

            {/* â”€â”€ Charts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className={styles.chartsGrid}>
              <div className={styles.chartCard}>
                <div className={styles.chartHead}>
                  <h3 className={styles.sectionTitle}>Booking Trends</h3>
                  <select
                    className={styles.chartSelect}
                    value={selectedTimeframe}
                    onChange={(event) => setSelectedTimeframe(event.target.value)}
                  >
                    <option value={BOOKING_TIMEFRAMES.last6Months}>Last 6 Months</option>
                    <option value={BOOKING_TIMEFRAMES.thisYear}>This Year</option>
                  </select>
                </div>

                <div className={styles.trendsGrid}>
                  <div className={styles.lineChartPanel}>
                    <h4 className={styles.chartSubTitle}>Bookings Over Time</h4>
                    <div className={styles.lineChartBox}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={currentBookingTrends.overTime} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                          <CartesianGrid stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="bookings"
                            stroke="#ff9500"
                            strokeWidth={3}
                            dot={{ fill: "#ff9500", strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={styles.dayChartPanel}>
                    <h4 className={styles.chartSubTitle}>Bookings by Day</h4>
                    <div className={styles.dayChartBox}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={currentBookingTrends.byDay} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                          <CartesianGrid stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip />
                          <Bar dataKey="bookings" fill="#ff9500" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.venueCard}>
                <h3 className={styles.venueTitle}>Venue Usage Distribution</h3>
                <div className={styles.venueInner}>
                  <div className={styles.vuGrid}>
                    <div className={styles.vuDonut}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={rankedVenueData}
                            dataKey="booked"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            cornerRadius={5}
                            stroke="none"
                            isAnimationActive
                            animationDuration={900}
                            animationEasing="ease-out"
                          >
                            {rankedVenueData.map((venue) => (
                              <Cell
                                key={venue.id}
                                fill={venue.colorHex}
                                style={{ cursor: venue.isUnassigned ? "default" : "pointer" }}
                                onClick={venue.isUnassigned ? undefined : () => navigate(`/facilities/venue/${venue.id}`)}
                              />
                            ))}
                          </Pie>
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                            <tspan fill="#1e293b" fontSize="24" fontWeight="700" dy="-5">
                              {totalVenueBookings}
                            </tspan>
                            <tspan x="50%" dy="20" fill="#64748b" fontSize="12">
                              Total
                            </tspan>
                          </text>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className={styles.vuList}>
                      {rankedVenueData.map((venue) => (
                        <div
                          className={styles.vuRow}
                          key={venue.id}
                          onClick={venue.isUnassigned ? undefined : () => navigate(`/facilities/venue/${venue.id}`)}
                          style={{ cursor: venue.isUnassigned ? "default" : "pointer" }}
                        >
                          <div className={styles.vuTop}>
                            <div className={styles.vuHead}>
                              <span className={styles.vuDot} style={{ backgroundColor: venue.colorHex }} />
                              <span className={styles.vuName}>{venue.name}</span>
                            </div>
                            <span className={styles.vuCount}>{venue.booked}</span>
                          </div>
                          <div className={styles.vuTrack}>
                            <div
                              className={styles.vuFill}
                              style={{
                                width: `${venue.percentage}%`,
                                backgroundColor: venue.colorHex,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* â”€â”€ Bottom â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className={styles.bottomGrid}>
              <div className={styles.tableCard}>
                <div className={styles.tableHead}>
                  <h3 className={styles.sectionTitle}>Recent Booking Requests</h3>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.requestsTable}>
                    <thead className={styles.tHead}>
                      <tr>
                        <th className={styles.th}>Requester</th>
                        <th className={styles.th}>Subject</th>
                        <th className={styles.th}>Created</th>
                        <th className={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody className={styles.tBody}>
                      {isLoading ? (
                        <tr className={styles.tRow}>
                          <td className={styles.cell} colSpan={4}>Loading recent requests...</td>
                        </tr>
                      ) : error ? (
                        <tr className={styles.tRow}>
                          <td className={styles.cell} colSpan={4}>{error}</td>
                        </tr>
                      ) : recentBookingRequests.length === 0 ? (
                        <tr className={styles.tRow}>
                          <td className={styles.cell} colSpan={4}>No recent booking requests.</td>
                        </tr>
                      ) : (
                        recentBookingRequests.map((request) => (
                          <tr
                            className={styles.tRow}
                            key={request.id}
                            onClick={() => navigate(`/inbox?requestId=${request.id}`)}
                          >
                            <td className={styles.cell}>
                              <div className={styles.cellInner}>
                                <div className={styles[request.initialsClassName]}>{request.requesterInitials}</div>
                                <span className={styles.cellText}>{request.requesterName}</span>
                              </div>
                            </td>
                            <td className={`${styles.cellMuted} ${styles.cellVenue}`}>{request.subject}</td>
                            <td className={`${styles.cellMuted} ${styles.cellDate}`}>{request.dateLabel}</td>
                            <td className={`${styles.cell} ${styles.cellStatus}`}>
                              <span className={styles[request.statusClassName]}>{request.statusLabel}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.timelineCard}>
                <div className={styles.chartHead}>
                  <h3 className={styles.sectionTitle}>Upcoming - Next 7 Days</h3>
                  <span className={styles.dateBadge}>Oct 24 - Oct 31</span>
                </div>

                <div className={styles.timeline}>
                  <div className={styles.event}>
                    <div className={styles.evtDot} />
                    <div className={styles.eventBox}>
                      <div className={styles.eventHead}>
                        <p className={styles.eventName}>IEEE Regional Meeting</p>
                        <span className={styles.tagSoon}>Tomorrow</span>
                      </div>
                      <p className={styles.eventDetail}>Conference Hall B â€¢ 09:00 AM - 01:00 PM</p>
                    </div>
                  </div>

                  <div className={styles.event}>
                    <div className={styles.evtDotIdle} />
                    <div className={styles.eventBox}>
                      <div className={styles.eventHead}>
                        <p className={styles.eventName}>Hackathon 2023 Prelims</p>
                        <span className={styles.tagDate}>Oct 26</span>
                      </div>
                      <p className={styles.eventDetail}>IT Seminar Hall â€¢ 10:00 AM onwards</p>
                    </div>
                  </div>

                  <div className={styles.event}>
                    <div className={styles.evtDotIdle} />
                    <div className={styles.eventBox}>
                      <div className={styles.eventHead}>
                        <p className={styles.eventName}>Alumni Guest Lecture</p>
                        <span className={styles.tagDate}>Oct 28</span>
                      </div>
                      <p className={styles.eventDetail}>Main Seminar Hall â€¢ 02:30 PM - 04:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* â”€â”€ Quick Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className={styles.quickBar}>
              <div className={styles.quickInfo}>
                <div className={styles.quickText}>
                  <h4 className={styles.quickTitle}>Real-time Operations</h4>
                  <p className={styles.quickSub}>Quick access to essential admin utilities</p>
                </div>
              </div>
              <div className={styles.quickBtns}>
                <button
                  className={styles.btnPrimary}
                  onClick={() => navigate("/inbox", { state: { initialTab: "UNREAD" } })}
                  type="button"
                >
                  <span className="material-icons text-sm">pending_actions</span>
                  View pending requests
                </button>
                <button className={styles.btnGhost} onClick={() => navigate("/status")} type="button">
                  <span className="material-icons text-sm">today</span>
                  Check today&apos;s bookings
                </button>
           
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

