import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Calendar from "./Calendar";
import PageHeader from "./PageHeader";
import Sidebar from "./Sidebar";
import styles from "./FacilitiesManagementPage.module.css";
import venuesData from "../data/venuesData";

const DONUT_RADIUS = 70;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const TOTAL_EQUIPMENT_ITEMS = 47;
const TOOLTIP_ESTIMATED_WIDTH = 180;
const TOOLTIP_ESTIMATED_HEIGHT = 64;

const EQUIPMENT_SEGMENTS = [
  { id: "projectors", label: "Projectors & Screens", percentage: 40, color: "#f97316" },
  { id: "audio", label: "Audio Systems", percentage: 25, color: "#ef4444" },
  { id: "network", label: "Network Equipment", percentage: 20, color: "#3B82F6" },
  { id: "other", label: "Others", percentage: 15, color: "#d1d5db" },
];

const INITIAL_MAINTENANCE_TASKS = [
  { id: "task-projector", title: "Projector Calibration", location: "Room 304, IT Block", date: "2026-10-24", time: "10:00" },
  { id: "task-audio", title: "Audio System Check", location: "Auditorium Main Stage", date: "2026-10-26", time: "11:00" },
  { id: "task-network", title: "Network Maintenance", location: "Campus Wide (11 PM - 2 AM)", date: "2026-10-28", time: "23:00" },
];

function formatMonthDay(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (!year || !month || !day) {
    return { month: "--", day: "--" };
  }

  return {
    month: shortMonths[month - 1] || "--",
    day: String(day),
  };
}

function parseISODate(isoDate) {
  if (!isoDate) {
    return undefined;
  }

  const [year, month, day] = isoDate.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
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

export default function FacilitiesManagementPage({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();

  const [maintenanceTasks, setMaintenanceTasks] = useState(INITIAL_MAINTENANCE_TASKS);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedMaintenanceTask, setSelectedMaintenanceTask] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [activeSegmentId, setActiveSegmentId] = useState("");
  const [tooltipState, setTooltipState] = useState({ visible: false, x: 0, y: 0, mode: "desktop" });
  const chartContainerRef = useRef(null);
  const equipmentSectionRef = useRef(null);

  const chartSegments = useMemo(() => {
    return EQUIPMENT_SEGMENTS.reduce(
      (acc, segment, index) => {
          const segmentLength = (segment.percentage / 100) * DONUT_CIRCUMFERENCE;
          const centerPercentage = acc.totalPercentage + segment.percentage / 2;
          const centerAngle = (centerPercentage / 100) * (Math.PI * 2) - Math.PI / 2;
          const nextSegment = {
            ...segment,
            segmentLength,
            segmentOffset: -acc.totalLength,
            delay: index * 0.14,
            itemCount: Math.round((TOTAL_EQUIPMENT_ITEMS * segment.percentage) / 100),
            centerAngle,
          };

          return {
            totalLength: acc.totalLength + segmentLength,
            totalPercentage: acc.totalPercentage + segment.percentage,
            items: [...acc.items, nextSegment],
          };
        },
      { totalLength: 0, totalPercentage: 0, items: [] },
    ).items;
  }, []);

  const activeSegment = useMemo(
    () => chartSegments.find((segment) => segment.id === activeSegmentId) || null,
    [activeSegmentId, chartSegments],
  );

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToastMessage("");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!tooltipState.visible || tooltipState.mode !== "mobile") {
      return undefined;
    }

    const handlePointerOutside = (event) => {
      if (equipmentSectionRef.current?.contains(event.target)) {
        return;
      }

      setActiveSegmentId("");
      setTooltipState((previous) => ({ ...previous, visible: false }));
    };

    document.addEventListener("pointerdown", handlePointerOutside);
    return () => document.removeEventListener("pointerdown", handlePointerOutside);
  }, [tooltipState.mode, tooltipState.visible]);

  const updateDesktopTooltipPosition = (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const horizontalOverflow = mouseX + TOOLTIP_ESTIMATED_WIDTH + 16 > window.innerWidth;
    const verticalOverflow = mouseY + TOOLTIP_ESTIMATED_HEIGHT + 16 > window.innerHeight;

    const nextX = horizontalOverflow
      ? mouseX - TOOLTIP_ESTIMATED_WIDTH - 12
      : mouseX + 12;
    const nextY = verticalOverflow
      ? mouseY - TOOLTIP_ESTIMATED_HEIGHT - 12
      : mouseY + 12;

    setTooltipState({
      visible: true,
      x: Math.max(12, nextX),
      y: Math.max(12, nextY),
      mode: "desktop",
    });
  };

  const showMobileTooltip = () => {
    const chartRect = chartContainerRef.current?.getBoundingClientRect();
    if (!chartRect) {
      return;
    }

    const tooltipHalfWidth = TOOLTIP_ESTIMATED_WIDTH / 2;
    const centerX = chartRect.left + chartRect.width / 2;
    const clampedX = Math.max(tooltipHalfWidth, Math.min(window.innerWidth - tooltipHalfWidth, centerX));
    const clampedY = Math.max(12, chartRect.top - TOOLTIP_ESTIMATED_HEIGHT - 12);

    setTooltipState({
      visible: true,
      x: clampedX,
      y: clampedY,
      mode: "mobile",
    });
  };

  const activateSegment = (segmentId, event, mode) => {
    setActiveSegmentId(segmentId);

    if (mode === "mobile") {
      showMobileTooltip();
      return;
    }

    if (event) {
      updateDesktopTooltipPosition(event);
    }
  };

  const handleDesktopLeave = () => {
    if (tooltipState.mode === "mobile") {
      return;
    }

    setActiveSegmentId("");
    setTooltipState((previous) => ({ ...previous, visible: false }));
  };

  const openRescheduleModal = (task) => {
    setSelectedMaintenanceTask(task);
    setRescheduleDate(task.date);
    setRescheduleTime(task.time || "09:00");
    setIsRescheduleModalOpen(true);
  };

  const closeRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setSelectedMaintenanceTask(null);
    setRescheduleDate("");
    setRescheduleTime("");
  };

  const confirmReschedule = () => {
    if (!selectedMaintenanceTask || !rescheduleDate || !rescheduleTime) {
      return;
    }

    setMaintenanceTasks((prev) =>
      prev.map((task) =>
        task.id === selectedMaintenanceTask.id
          ? {
              ...task,
              date: rescheduleDate,
              time: rescheduleTime,
            }
          : task,
      ),
    );

    closeRescheduleModal();
    setToastMessage("Schedule Updated");
  };

  return (
    <div className={styles.page}>
      <div className={styles.mainContainer}>
        <Sidebar activePage="facilities" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className={styles.mainContent}>
          <PageHeader title="Facilities Management" setIsSidebarOpen={setIsSidebarOpen} />

          <main className={styles.content}>
            <div className={styles.summaryCards}>
              <div className={styles.summaryCard}>
                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.cardIconOrange}`}>
                    <span className={`${styles.cardIconGlyph} material-icons`}>apartment</span>
                  </div>
                  <span className={`${styles.cardBadge} ${styles.badgeGreen}`}>+2</span>
                </div>
                <div className={styles.cardContent}>
                  <p className={styles.cardLabel}>Total Facilities</p>
                  <div className={styles.cardMetricGroup}>
                    <h3 className={styles.cardValue}>15</h3>
                  </div>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.cardIconBlue}`}>
                    <span className={`${styles.cardIconGlyph} material-icons`}>verified</span>
                  </div>
                  <span className={`${styles.cardBadge} ${styles.badgeAmber}`}>Attention</span>
                </div>
                <div className={styles.cardContent}>
                  <p className={styles.cardLabel}>Active Now</p>
                  <div className={styles.cardMetricGroup}>
                    <h3 className={styles.cardValue}>12</h3>
                  </div>
                </div>
              </div>

              <div className={`${styles.summaryCard} ${styles.capacityCard}`}>
                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.cardIconGreen}`}>
                    <span className={`${styles.cardIconGlyph} material-icons`}>door_sliding</span>
                  </div>
                  <span className={`${styles.cardBadge} ${styles.badgeGray}`}>12/15</span>
                </div>
                <div className={styles.cardContent}>
                  <p className={styles.cardLabel}>Capacity Utilization</p>
                  <div className={styles.cardMetricGroup}>
                    <h3 className={styles.cardValue}>78%</h3>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: "78%" }} />
                    </div>
                    <p className={styles.cardUnit}>Occupancy Rate</p>
                  </div>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.cardIconIndigo}`}>
                    <span className={`${styles.cardIconGlyph} material-icons`}>build</span>
                  </div>
                  <span className={`${styles.cardBadge} ${styles.badgeGreen}`}>Good</span>
                </div>
                <div className={styles.cardContent}>
                  <p className={styles.cardLabel}>Equipment Status</p>
                  <div className={styles.cardMetricGroup}>
                    <div className={styles.cardInlineMetric}>
                      <span className={styles.cardValue}>47</span>
                      <span className={styles.cardUnit}>Items</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.sectionsContainer}>
              <div className={styles.facilityOverview}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Facility Overview</h3>
                  <div className={styles.sectionActions}>
                    <button className={styles.btnViewAll} type="button">
                      View All
                    </button>
                    <button className={styles.btnAddFacility} onClick={() => navigate("/facilities/add")} type="button">
                      <span className="material-icons">add</span>
                      Add Facility
                    </button>
                  </div>
                </div>

                <div className={styles.facilityCards}>
                  {venuesData.slice(0, 4).map(venue => (
                    <div className={styles.facilityCard} key={venue.id} onClick={() => navigate(`/facilities/venue/${venue.id}`)}>
                      <div className={styles.facilityImage}>
                        <img
                          alt={venue.name}
                          src={venue.images.hero}
                        />
                        <span className={`${styles.facilityStatus} ${styles.statusActive}`}>Active</span>
                      </div>
                      <div className={styles.facilityDetails}>
                        <h4 className={styles.facilityName}>{venue.name}</h4>
                        <p className={styles.facilityLocation}>{venue.location}</p>
                        <div className={styles.facilityStats}>
                          <div className={styles.statItem}>
                            <span className="material-icons statIcon">groups</span>
                            <span className={styles.statValue}>{Math.floor(venue.capacity * 0.7)}/{venue.capacity}</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className="material-icons statIcon">wifi</span>
                            <span className={`${styles.statValue} ${styles.statGood}`}>Good</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.equipmentDistribution} ref={equipmentSectionRef}>
                <h3 className={styles.sectionTitle}>Equipment Distribution</h3>
                <div className={styles.chartContainer} ref={chartContainerRef} onMouseLeave={handleDesktopLeave}>
                  <div className={styles.donutChart}>
                    <svg className={styles.donutSvg} viewBox="0 0 180 180" aria-label="Equipment distribution chart" role="img">
                      <circle className={styles.donutTrack} cx="90" cy="90" r={DONUT_RADIUS} />
                      {chartSegments.map((segment) => (
                        <circle
                          className={styles.donutSegment}
                          cx="90"
                          cy="90"
                          key={segment.id}
                          r={DONUT_RADIUS}
                          stroke={segment.color}
                          onMouseEnter={(event) => activateSegment(segment.id, event, "desktop")}
                          onMouseMove={(event) => {
                            if (activeSegmentId === segment.id && tooltipState.mode === "desktop") {
                              updateDesktopTooltipPosition(event);
                            }
                          }}
                          onTouchStart={() => activateSegment(segment.id, null, "mobile")}
                          style={{
                            "--circumference": DONUT_CIRCUMFERENCE,
                            "--segment-length": segment.segmentLength,
                            "--segment-offset": segment.segmentOffset,
                            "--draw-delay": `${segment.delay}s`,
                            "--segment-translate-x":
                              activeSegmentId === segment.id ? `${Math.cos(segment.centerAngle) * 4}px` : "0px",
                            "--segment-translate-y":
                              activeSegmentId === segment.id ? `${Math.sin(segment.centerAngle) * 4}px` : "0px",
                            opacity: activeSegmentId && activeSegmentId !== segment.id ? 0.5 : 1,
                          }}
                        />
                      ))}
                    </svg>
                    <div className={styles.chartCenter}>
                      <h2 className={styles.chartTotal}>{TOTAL_EQUIPMENT_ITEMS}</h2>
                      <p className={styles.chartLabel}>Total Items</p>
                    </div>
                  </div>

                  {tooltipState.visible && activeSegment ? (
                    <div
                      className={
                        tooltipState.mode === "mobile"
                          ? `${styles.chartTooltip} ${styles.chartTooltipMobile}`
                          : styles.chartTooltip
                      }
                      style={
                        tooltipState.mode === "mobile"
                          ? { left: tooltipState.x, top: tooltipState.y }
                          : { left: tooltipState.x, top: tooltipState.y }
                      }
                    >
                      <div className={styles.tooltipTitleRow}>
                        <span className={styles.tooltipDot} style={{ backgroundColor: activeSegment.color }} />
                        <span className={styles.tooltipTitle}>{activeSegment.label}</span>
                      </div>
                      <div className={styles.tooltipMeta}>
                        {activeSegment.itemCount} items  •  {activeSegment.percentage}%
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className={styles.legend}>
                  {EQUIPMENT_SEGMENTS.map((segment) => (
                    <div
                      className={
                        activeSegmentId === segment.id
                          ? `${styles.legendItem} ${styles.legendItemActive}`
                          : styles.legendItem
                      }
                      key={segment.id}
                      onMouseEnter={(event) => activateSegment(segment.id, event, "desktop")}
                      onMouseMove={(event) => {
                        if (activeSegmentId === segment.id && tooltipState.mode === "desktop") {
                          updateDesktopTooltipPosition(event);
                        }
                      }}
                      onMouseLeave={handleDesktopLeave}
                      onTouchStart={() => activateSegment(segment.id, null, "mobile")}
                    >
                      <div className={styles.legendItemLeft}>
                        <div className={styles.legendColor} style={{ backgroundColor: segment.color }} />
                        <span className={styles.legendLabel}>{segment.label}</span>
                      </div>
                      <span className={styles.legendValue}>{segment.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.additionalSections}>
              <div className={styles.upcomingMaintenance}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Upcoming Maintenance</h3>
                  <span className={styles.next7DaysBadge}>Next 7 Days</span>
                </div>
                <div className={styles.maintenanceList}>
                  {maintenanceTasks.map((task) => {
                    const formattedDate = formatMonthDay(task.date);

                    return (
                      <div className={styles.maintenanceItem} key={task.id}>
                        <div className={styles.maintenanceItemLeft}>
                          <div className={styles.dateCard}>
                            <span className={styles.monthLabel}>{formattedDate.month}</span>
                            <span className={styles.dateNumber}>{formattedDate.day}</span>
                          </div>
                          <div className={styles.maintenanceDetails}>
                            <h5 className={styles.maintenanceTitle}>{task.title}</h5>
                            <p className={styles.maintenanceLocation}>{task.location}</p>
                          </div>
                        </div>
                        <button className={styles.rescheduleBtn} onClick={() => openRescheduleModal(task)} type="button">Reschedule</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.recentUpdates}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Recent Facility Updates</h3>
                  <button className={styles.moreBtn} type="button">
                    <span className="material-icons">more_horiz</span>
                  </button>
                </div>
                <div className={styles.updatesList}>
                  <div className={styles.updateItem}>
                    <div className={`${styles.updateIcon} ${styles.updateIconBlue}`}>
                      <span className="material-icons">build</span>
                    </div>
                    <div className={styles.updateContent}>
                      <div className={styles.updateHeader}>
                        <h5 className={styles.updateTitle}>AC Maintenance Completed</h5>
                        <span className={styles.updateTime}>2h ago</span>
                      </div>
                      <p className={styles.updateDescription}>Seminar Hall cooling system serviced and filters replaced.</p>
                    </div>
                  </div>

                  <div className={styles.updateItem}>
                    <div className={`${styles.updateIcon} ${styles.updateIconOrange}`}>
                      <span className="material-icons">event_available</span>
                    </div>
                    <div className={styles.updateContent}>
                      <div className={styles.updateHeader}>
                        <h5 className={styles.updateTitle}>New Booking Request</h5>
                        <span className={styles.updateTime}>4h ago</span>
                      </div>
                      <p className={styles.updateDescription}>Dr. Smith requested Idea Lab for "Innovation Workshop" on Oct 25.</p>
                    </div>
                  </div>

                  <div className={styles.updateItem}>
                    <div className={`${styles.updateIcon} ${styles.updateIconGreen}`}>
                      <span className="material-icons">check_circle</span>
                    </div>
                    <div className={styles.updateContent}>
                      <div className={styles.updateHeader}>
                        <h5 className={styles.updateTitle}>Cleaning Verified</h5>
                        <span className={styles.updateTime}>6h ago</span>
                      </div>
                      <p className={styles.updateDescription}>Housekeeping staff marked "Conference Room B" as ready.</p>
                    </div>
                  </div>

                  <div className={styles.updateItem}>
                    <div className={`${styles.updateIcon} ${styles.updateIconOrange}`}>
                      <span className="material-icons">event_available</span>
                    </div>
                    <div className={styles.updateContent}>
                      <div className={styles.updateHeader}>
                        <h5 className={styles.updateTitle}>New Booking Request</h5>
                        <span className={styles.updateTime}>7h ago</span>
                      </div>
                      <p className={styles.updateDescription}>Prof. Maan requested Dhenuka Hall for "Seminar on AI Ethics" on Oct 25.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {isRescheduleModalOpen && selectedMaintenanceTask && (
        <div className={styles.modalOverlay} onClick={closeRescheduleModal} role="presentation">
          <div className={styles.modalCard} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <h4 className={styles.modalTitle}>Reschedule Maintenance</h4>
            <p className={styles.modalTask}>{selectedMaintenanceTask.title}</p>

            <div className={styles.modalGrid}>
              <label className={styles.modalField}>
                <span className={styles.modalLabel}>Date</span>
                <div className={styles.modalCalendar}>
                  <Calendar
                    availabilityData={{}}
                    onDateSelect={(dateValue) => setRescheduleDate(toISODate(dateValue))}
                    selectedDate={parseISODate(rescheduleDate)}
                  />
                </div>
              </label>

              <label className={styles.modalField}>
                <span className={styles.modalLabel}>Time</span>
                <input className={styles.modalInput} onChange={(event) => setRescheduleTime(event.target.value)} type="time" value={rescheduleTime} />
              </label>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={closeRescheduleModal} type="button">Cancel</button>
              <button className={styles.modalConfirmBtn} onClick={confirmReschedule} type="button">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}
    </div>
  );
}
