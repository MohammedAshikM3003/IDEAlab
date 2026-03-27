import React, { useState } from "react";
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
import venuesData from "../data/venuesData";

const BOOKING_TIMEFRAMES = {
  last6Months: "last-6-months",
  thisYear: "this-year",
};

const bookingTrendsByTimeframe = {
  [BOOKING_TIMEFRAMES.last6Months]: {
    overTime: [
      { month: "JAN", bookings: 42 },
      { month: "FEB", bookings: 58 },
      { month: "MAR", bookings: 54 },
      { month: "APR", bookings: 73 },
      { month: "MAY", bookings: 66 },
      { month: "JUN", bookings: 82 },
    ],
    byDay: [
      { day: "Mon", bookings: 21 },
      { day: "Tue", bookings: 18 },
      { day: "Wed", bookings: 24 },
      { day: "Thu", bookings: 20 },
      { day: "Fri", bookings: 27 },
      { day: "Sat", bookings: 13 },
      { day: "Sun", bookings: 9 },
    ],
  },
  [BOOKING_TIMEFRAMES.thisYear]: {
    overTime: [
      { month: "JAN", bookings: 35 },
      { month: "FEB", bookings: 41 },
      { month: "MAR", bookings: 47 },
      { month: "APR", bookings: 52 },
      { month: "MAY", bookings: 49 },
      { month: "JUN", bookings: 58 },
      { month: "JUL", bookings: 61 },
      { month: "AUG", bookings: 57 },
      { month: "SEP", bookings: 66 },
      { month: "OCT", bookings: 72 },
      { month: "NOV", bookings: 69 },
      { month: "DEC", bookings: 75 },
    ],
    byDay: [
      { day: "Mon", bookings: 38 },
      { day: "Tue", bookings: 34 },
      { day: "Wed", bookings: 41 },
      { day: "Thu", bookings: 36 },
      { day: "Fri", bookings: 44 },
      { day: "Sat", bookings: 22 },
      { day: "Sun", bookings: 17 },
    ],
  },
};

const venueUsageData = venuesData.slice(0, 3).map(venue => ({
  id: venue.id,
  name: venue.name,
  abbreviation: venue.name.split(' ').map(n => n[0]).join(''),
  percentage: Math.floor(Math.random() * 50) + 20, // Placeholder
  booked: Math.floor(Math.random() * 100) + 20, // Placeholder
  totalCapacity: 120, // Placeholder
}));

const recentBookingRequests = [
  {
    id: "BK-2026-0001",
    requesterInitials: "RJ",
    requesterName: "Dr. Rajesh Jain",
    venue: "Main Auditorium",
    date: "Oct 24, 2023",
    statusLabel: "Approved",
    statusClassName: "badgeOk",
    initialsClassName: "initBlue",
  },
  {
    id: "BK-2026-0002",
    requesterInitials: "ST",
    requesterName: "Prof. S. Thara",
    venue: "AICTE Idea Lab",
    date: "Oct 25, 2023",
    statusLabel: "Pending",
    statusClassName: "badgeWarn",
    initialsClassName: "initAmber",
  },
  {
    id: "BK-2026-0003",
    requesterInitials: "MA",
    requesterName: "M. Arunagiri",
    venue: "Board Room",
    date: "Oct 26, 2023",
    statusLabel: "Rejected",
    statusClassName: "badgeErr",
    initialsClassName: "initRose",
  },
  {
    id: "BK-2026-0004",
    requesterInitials: "PK",
    requesterName: "Dr. Priya Kumaran",
    venue: "Main Seminar Hall",
    date: "Oct 27, 2023",
    statusLabel: "Pending",
    statusClassName: "badgeWarn",
    initialsClassName: "initBlue",
  },
  {
    id: "BK-2026-0005",
    requesterInitials: "AN",
    requesterName: "A. Nivetha",
    venue: "AICTE Idea Lab",
    date: "Oct 28, 2023",
    statusLabel: "Approved",
    statusClassName: "badgeOk",
    initialsClassName: "initAmber",
  },
];

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

export default function DashboardPage({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState(BOOKING_TIMEFRAMES.last6Months);
  const currentBookingTrends = bookingTrendsByTimeframe[selectedTimeframe] || bookingTrendsByTimeframe[BOOKING_TIMEFRAMES.last6Months];
  const rankedVenueData = [...venueUsageData]
    .sort((a, b) => b.booked - a.booked)
    .map((venue, index) => ({
      ...venue,
      colorHex: VENUE_COLORS[index % VENUE_COLORS.length],
    }));
  const totalBookings = rankedVenueData.reduce((sum, venue) => sum + venue.booked, 0);

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
                  <span className={styles.tagGreen}>+12%</span>
                </div>
                <h3 className={styles.statLabel}>Total Bookings</h3>
                <p className={styles.statVal}>156</p>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statRow}>
                  <span className={`material-icons ${styles.iconAmber}`}>pending_actions</span>
                  <span className={styles.tagAmber}>Attention</span>
                </div>
                <h3 className={styles.statLabel}>Pending Requests</h3>
                <p className={styles.statVal}>23</p>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statRowSm}>
                  <span className={`material-icons ${styles.iconEmerald}`}>meeting_room</span>
                  <span className="text-sm font-semibold text-emerald-600">8 / 15</span>
                </div>
                <h3 className={styles.statLabel}>Available Venues</h3>
                <div className={styles.progressWrap}>
                  <div className={styles.progressFill} style={{ width: "53.3%" }} />
                </div>
                <p className={styles.progressLabel}>53% Capacity Utilization</p>
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
                        stroke="currentColor" strokeDasharray="100.5" strokeDashoffset="6"
                        strokeWidth="4"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className={styles.statLabel}>Approval Rate</h3>
                <p className={styles.statVal}>94%</p>
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
                              <Cell key={venue.name} fill={venue.colorHex} style={{cursor: 'pointer'}} onClick={() => navigate(`/venue/${venue.id}`)} />
                            ))}
                          </Pie>
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                            <tspan fill="#1e293b" fontSize="24" fontWeight="700" dy="-5">
                              {totalBookings}
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
                        <div className={styles.vuRow} key={venue.name} onClick={() => navigate(`/venue/${venue.id}`)} style={{cursor: 'pointer'}}>
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
                        <th className={styles.th}>Venue</th>
                        <th className={styles.th}>Date</th>
                        <th className={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody className={styles.tBody}>
                      {recentBookingRequests.map((request) => (
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
                          <td className={`${styles.cellMuted} ${styles.cellVenue}`}>{request.venue}</td>
                          <td className={`${styles.cellMuted} ${styles.cellDate}`}>{request.date}</td>
                          <td className={`${styles.cell} ${styles.cellStatus}`}>
                            <span className={styles[request.statusClassName]}>{request.statusLabel}</span>
                          </td>
                        </tr>
                      ))}
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
                <button className={styles.btnGhost} type="button">
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

