import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "./PageHeader";
import Sidebar from "./Sidebar";
import styles from "./FacilitiesManagementPage.module.css";

const DONUT_RADIUS = 70;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

const EQUIPMENT_SEGMENTS = [
  { id: "projectors", label: "Projectors & Screens", percentage: 40, color: "#FF9400" },
  { id: "audio", label: "Audio Systems", percentage: 25, color: "#FF7A59" },
  { id: "network", label: "Network Equipment", percentage: 20, color: "#3B82F6" },
  { id: "other", label: "Others", percentage: 15, color: "#E5E7EB" },
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

export default function FacilitiesManagementPage() {
  const navigate = useNavigate();

  const [maintenanceTasks, setMaintenanceTasks] = useState(INITIAL_MAINTENANCE_TASKS);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedMaintenanceTask, setSelectedMaintenanceTask] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const chartSegments = useMemo(
    () =>
      EQUIPMENT_SEGMENTS.reduce(
        (acc, segment, index) => {
          const segmentLength = (segment.percentage / 100) * DONUT_CIRCUMFERENCE;
          const nextSegment = {
            ...segment,
            segmentLength,
            segmentOffset: -acc.totalLength,
            delay: index * 0.14,
          };

          return {
            totalLength: acc.totalLength + segmentLength,
            items: [...acc.items, nextSegment],
          };
        },
        { totalLength: 0, items: [] },
      ).items,
    [],
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
      <input className="hidden" id="mobile-menu-toggle" type="checkbox" />

      <label
        className="hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        htmlFor="mobile-menu-toggle"
      />

      <div className={styles.mainContainer}>
        <Sidebar activePage="facilities" />

        <div className={styles.mainContent}>
          <PageHeader title="Facilities Management" />

          <main className={styles.content}>
            <div className={styles.summaryCards}>
              <div className={styles.summaryCard}>
                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.cardIconOrange}`}>
                    <span className="material-icons">apartment</span>
                  </div>
                  <span className={`${styles.cardBadge} ${styles.badgeGreen}`}>+2</span>
                </div>
                <div className={styles.cardContent}>
                  <p className={styles.cardLabel}>Total Facilities</p>
                  <h3 className={styles.cardValue}>15</h3>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.cardIconBlue}`}>
                    <span className="material-icons">verified</span>
                  </div>
                  <span className={`${styles.cardBadge} ${styles.badgeAmber}`}>Attention</span>
                </div>
                <div className={styles.cardContent}>
                  <p className={styles.activeNowLabel}>Active Now</p>
                  <h3 className={styles.cardValue}>12</h3>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.cardIconGreen}`}>
                    <span className="material-icons">door_sliding</span>
                  </div>
                  <span className={`${styles.cardBadge} ${styles.badgeGray}`}>12 / 15</span>
                </div>
                <div className={styles.cardContent}>
                  <p className={styles.cardLabel}>Capacity Utilization</p>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: "78%" }} />
                  </div>
                  <p className={styles.progressText}>78% Occupancy Rate</p>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.cardIconIndigo}`}>
                    <span className="material-icons">inventory_2</span>
                  </div>
                  <div className={styles.circularProgress}>
                    <svg className="w-10 h-10" viewBox="0 0 40 40">
                      <circle
                        className="text-blue-500"
                        cx="20"
                        cy="20"
                        fill="white"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                    </svg>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <p className={styles.cardLabel}>Equipment Status</p>
                  <h3 className={styles.cardValue}>
                    47<span className={styles.cardValueSmall}>Items</span>
                  </h3>
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
                  <div className={styles.facilityCard}>
                    <div className={styles.facilityImage}>
                      <img
                        alt="Idea Lab"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKe8XC4f8NYr6XLZEJuTQ4T8aTSnvIE2nmJlDWmYRJXTBTd2csfBpYFRhGePKi8_a_KETh4JZ98JviL9o-YV-zFUdX3qnvdnaveznh_x6kTEsa65Yer-P-yS6W10QnF5hE1_6M6239ww3iYRX6LWpvIpoHCkTosooZJ3LAWsmJM6F7xq0XzBAqil2XzQRLS9g4SuEtdAaznISteudX8rJwJzS0_01MJZCKF0MbBHiy9bt2sGGWEWUAj9lMtqjT2Fmn7OOS4jEC_aM"
                      />
                      <span className={`${styles.facilityStatus} ${styles.statusActive}`}>Active</span>
                    </div>
                    <div className={styles.facilityDetails}>
                      <h4 className={styles.facilityName}>AICTE Idea Lab</h4>
                      <p className={styles.facilityLocation}>Ground Floor, Block A</p>
                      <div className={styles.facilityStats}>
                        <div className={styles.statItem}>
                          <span className="material-icons statIcon">groups</span>
                          <span className={styles.statValue}>45/60</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className="material-icons statIcon">wifi</span>
                          <span className={`${styles.statValue} ${styles.statGood}`}>Good</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.facilityCard}>
                    <div className={styles.facilityImage}>
                      <img
                        alt="Seminar Hall"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2v_7M0itnps2kVbgugpSEnLEd5uyQU4GiBbonvwNHdqxslFtw7P4m6xR5AIMWPHQ_zhUDtQkgTI0cy8rfavn0MOuInZb2TNsl7IxvsY3LsgIi1xYzMmmO0oChm0_H78hn08FnjT-Jd5WTnkfma_i8m03cR_i4IfHJNgrILNCtl4xNgCZdK4hy9aovEO4B0nnhsDQgLAyFzQzvo4N2n-ywPXi40GOvU6TtxVv4Zba8S7ewKfkYlbQBxaEXcMpRQf7aLO0ohQUnnjA"
                      />
                      <span className={`${styles.facilityStatus} ${styles.statusCleaning}`}>Cleaning</span>
                    </div>
                    <div className={styles.facilityDetails}>
                      <h4 className={styles.facilityName}>Platinum Hall</h4>
                      <p className={styles.facilityLocation}>First Floor, Admin Block</p>
                      <div className={styles.facilityStats}>
                        <div className={styles.statItem}>
                          <span className="material-icons statIcon">groups</span>
                          <span className={styles.statValue}>0/250</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className="material-icons statIcon">ac_unit</span>
                          <span className={styles.statValue}>On</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.facilityCard}>
                    <div className={styles.facilityImage}>
                      <img
                        alt="Meeting Room"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB25Qiv52e1m10K3-72nMnyYvmeEUi22FU1ql2TeABLz09uIyL_tMYH7JaUlcMF6qj9bj5E3DDXzRi_vZ231DweMi1e4O749SMCXLAmoxzpGTYDXnqeip70xe2H5wcJFBST1goN-h51NsA9SM0qCXgYyDcebz7VqNoQcjXq3vPdjrW3gsd5qgUREHA1JgeDKqb21l9huoPYwigpUFB1EYA45pyJ8nmnJUqnYR_nHcYydZjxg0KoxnMMqW00VMeC4Baq82yGckyWG50"
                      />
                      <span className={`${styles.facilityStatus} ${styles.statusActive}`}>Active</span>
                    </div>
                    <div className={styles.facilityDetails}>
                      <h4 className={styles.facilityName}>Board Meeting Room</h4>
                      <p className={styles.facilityLocation}>Second Floor, East Wing</p>
                      <div className={styles.facilityStats}>
                        <div className={styles.statItem}>
                          <span className="material-icons statIcon">groups</span>
                          <span className={styles.statValue}>12/15</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className="material-icons statIcon">tv</span>
                          <span className={styles.statValue}>Avail</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.facilityCard}>
                    <div className={styles.facilityImage}>
                      <img
                        alt="Conference Room"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuATVU30fHz2IM0XBtfqyXoej2Lp_Oon_ltWHoQfF7G5GA2G7JYzCoByVk3Ei6k0fdKKJSroqi0d7KdVqP-dZdh1PNaLaenv_aASeGXeIK1rCH1kpR3yxCtYhcAqCIiU8OroU73fLVPrKbfrSrgYaEMjX-4Eo2U32G0tAv0ohZh0vEbldPJORI8HHxgmuoBxMCZfync74YfAQnwyjhAOD8s5zCAyf89NUJotm58op8fydhDsoEqDFL5Tbukk3DOpY7XHS1jt3vW8VDc"
                      />
                      <span className={`${styles.facilityStatus} ${styles.statusReserved}`}>Reserved</span>
                    </div>
                    <div className={styles.facilityDetails}>
                      <h4 className={styles.facilityName}>Conference Room B</h4>
                      <p className={styles.facilityLocation}>Third Floor, West Wing</p>
                      <div className={styles.facilityStats}>
                        <div className={styles.statItem}>
                          <span className="material-icons statIcon">groups</span>
                          <span className={styles.statValue}>--/30</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className="material-icons statIcon">videocam</span>
                          <span className={styles.statValue}>Setup</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.equipmentDistribution}>
                <h3 className={styles.sectionTitle}>Equipment Distribution</h3>
                <div className={styles.chartContainer}>
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
                          style={{
                            "--circumference": DONUT_CIRCUMFERENCE,
                            "--segment-length": segment.segmentLength,
                            "--segment-offset": segment.segmentOffset,
                            "--draw-delay": `${segment.delay}s`,
                          }}
                        />
                      ))}
                    </svg>
                    <div className={styles.chartCenter}>
                      <h2 className={styles.chartTotal}>47</h2>
                      <p className={styles.chartLabel}>Total Items</p>
                    </div>
                  </div>
                </div>

                <div className={styles.legend}>
                  {EQUIPMENT_SEGMENTS.map((segment) => (
                    <div className={styles.legendItem} key={segment.id}>
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
                <input className={styles.modalInput} onChange={(event) => setRescheduleDate(event.target.value)} type="date" value={rescheduleDate} />
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
