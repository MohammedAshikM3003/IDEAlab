import React, { useEffect, useMemo, useRef, useState } from "react";

import Calendar from "../Calendar";
import styles from "./AdminEditBookingPopUpFM.module.css";

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

function formatDateLabel(isoDate) {
  const parsed = parseISODate(isoDate);
  if (!parsed) {
    return "Select date";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeVenueValue(venues, venueText) {
  if (!venueText) {
    return "";
  }

  const normalized = venueText.trim().toLowerCase();
  const byValue = venues.find((item) => item.value.toLowerCase() === normalized);
  if (byValue) {
    return byValue.value;
  }

  const byLabel = venues.find((item) => item.label.toLowerCase() === normalized);
  if (byLabel) {
    return byLabel.value;
  }

  return "";
}

function formatBookingId(rawId) {
  if (!rawId) {
    return "#BK-0000";
  }

  const withoutPrefix = String(rawId).replace(/^#?BK-/i, "");
  const digits = withoutPrefix.replace(/\D/g, "");
  if (digits.length > 0) {
    return `#BK-${digits.slice(-4).padStart(4, "0")}`;
  }

  const compactSlug = withoutPrefix.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `#BK-${compactSlug.slice(0, 6) || "0000"}`;
}

function to12HourValue(time24) {
  if (!time24 || !/^\d{2}:\d{2}$/.test(time24)) {
    return "";
  }

  const [hourStr, minute] = time24.split(":");
  const hour = Number(hourStr);
  if (Number.isNaN(hour)) {
    return "";
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${minute} ${suffix}`;
}

function to24HourValue(time12) {
  if (!time12) {
    return "";
  }

  const trimmed = time12.trim().toUpperCase();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/);
  if (!match) {
    return "";
  }

  const [, hourRaw, minute, meridiem] = match;
  let hour = Number(hourRaw);
  if (Number.isNaN(hour) || hour < 1 || hour > 12) {
    return "";
  }

  if (meridiem === "AM") {
    hour = hour === 12 ? 0 : hour;
  } else {
    hour = hour === 12 ? 12 : hour + 12;
  }

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

export default function AdminEditBookingPopUpFM({
  onClose,
  onConfirm,
  bookingId = "#BK-2489",
  subtitle = "Modify reservation details",
  prefilledVenue = "",
  organizerHint = "",
  initialEventTitle = "",
  initialDate = "",
  initialStartTime = "",
  initialEndTime = "",
  initialOrganizer = "",
  venues = [
    { value: "aicte-idea-lab", label: "AICTE Idea Lab" },
    { value: "seminar-hall", label: "Seminar Hall" },
    { value: "conference-room-a", label: "Conference Room A" },
    { value: "main-auditorium", label: "Main Auditorium" },
  ],
}) {
  const venueOptions = useMemo(() => {
    const hasPrefilledVenue = Boolean(prefilledVenue);
    const prefilledIsKnown = normalizeVenueValue(venues, prefilledVenue) !== "";
    if (!hasPrefilledVenue || prefilledIsKnown) {
      return venues;
    }

    return [
      {
        value: prefilledVenue.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        label: prefilledVenue,
      },
      ...venues,
    ];
  }, [prefilledVenue, venues]);

  const initialVenueValue = useMemo(
    () => normalizeVenueValue(venueOptions, prefilledVenue),
    [prefilledVenue, venueOptions],
  );

  const [eventTitle, setEventTitle] = useState(initialEventTitle);
  const [venue, setVenue] = useState(initialVenueValue);
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [changeNote, setChangeNote] = useState("");
  const [desktopStartTime, setDesktopStartTime] = useState(to12HourValue(initialStartTime));
  const [desktopEndTime, setDesktopEndTime] = useState(to12HourValue(initialEndTime));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const calendarPopoverRef = useRef(null);
  const dateFieldRef = useRef(null);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isCalendarOpen || isMobile) {
      return undefined;
    }

    const closeOnClickOutside = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const clickedField = dateFieldRef.current?.contains(target);
      const clickedPopover = calendarPopoverRef.current?.contains(target);
      if (!clickedField && !clickedPopover) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnClickOutside);
    return () => document.removeEventListener("mousedown", closeOnClickOutside);
  }, [isCalendarOpen, isMobile]);

  const resolvedVenueLabel = useMemo(() => {
    const selected = venueOptions.find((item) => item.value === venue);
    return selected?.label || subtitle || "venue";
  }, [venue, venueOptions, subtitle]);

  const snapshot = useMemo(
    () => ({
      eventTitle: initialEventTitle || "",
      venue: initialVenueValue || "",
      date: initialDate || "",
      startTime: initialStartTime || "",
      endTime: initialEndTime || "",
      changeNote: "",
    }),
    [initialDate, initialEndTime, initialEventTitle, initialStartTime, initialVenueValue],
  );

  const canSave = useMemo(
    () => Boolean(eventTitle && venue && date && startTime && endTime),
    [eventTitle, venue, date, startTime, endTime],
  );

  const hasChanged = useMemo(
    () =>
      eventTitle !== snapshot.eventTitle ||
      venue !== snapshot.venue ||
      date !== snapshot.date ||
      startTime !== snapshot.startTime ||
      endTime !== snapshot.endTime ||
      changeNote !== snapshot.changeNote,
    [changeNote, date, endTime, eventTitle, snapshot, startTime, venue],
  );

  const handleSave = () => {
    if (!canSave || !onConfirm) {
      return;
    }

    onConfirm({
      eventTitle,
      venue,
      venueLabel: resolvedVenueLabel,
      date,
      startTime,
      endTime,
      organizer: initialOrganizer || organizerHint,
      changeNote,
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.backdrop} role="dialog" aria-modal="true">
        <div className={styles.modal}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>Edit Booking: {formatBookingId(bookingId)}</h2>
              <p className={styles.subtitle}>Modify reservation details for {resolvedVenueLabel}.</p>
            </div>

            <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.section}>
              <label className={styles.label} htmlFor="edit-event-title">
                Event Title
              </label>
              <input
                className={styles.input}
                id="edit-event-title"
                type="text"
                value={eventTitle}
                onChange={(event) => setEventTitle(event.target.value)}
              />
            </div>

            <div className={styles.section}>
              <label className={styles.label} htmlFor="edit-venue">
                Venue
              </label>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  id="edit-venue"
                  value={venue}
                  onChange={(event) => setVenue(event.target.value)}
                >
                  {!initialVenueValue ? <option value="">Select a venue</option> : null}
                  {venueOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className={`${styles.selectIcon} material-symbols-outlined`} aria-hidden="true">
                  expand_more
                </span>
              </div>
            </div>

            <div className={styles.timeGrid}>
              <div className={styles.section}>
                <label className={styles.label} htmlFor="edit-date">
                  Date
                </label>
                <div className={styles.dateControlWrap}>
                  {isMobile ? (
                    <input
                      className={styles.input}
                      id="edit-date"
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                    />
                  ) : (
                    <div className={styles.datePickerFieldWrap}>
                      <button
                        className={styles.dateButton}
                        id="edit-date"
                        onClick={() => setIsCalendarOpen((prev) => !prev)}
                        ref={dateFieldRef}
                        type="button"
                      >
                        <span>{formatDateLabel(date)}</span>
                        <span className="material-symbols-outlined">calendar_month</span>
                      </button>

                      {isCalendarOpen ? (
                        <div className={styles.calendarPopover} ref={calendarPopoverRef}>
                          <Calendar
                            availabilityData={{}}
                            onDateSelect={(dateValue) => {
                              setDate(toISODate(dateValue));
                              setIsCalendarOpen(false);
                            }}
                            selectedDate={parseISODate(date)}
                          />
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.section}>
                <label className={styles.label}>Time Slot</label>
                <div className={styles.slotRow}>
                  <div className={styles.slotField}>
                    <span className={styles.slotLabel}>Start</span>
                    {isMobile ? (
                      <input
                        className={styles.input}
                        type="time"
                        value={startTime}
                        onChange={(event) => setStartTime(event.target.value)}
                      />
                    ) : (
                      <input
                        className={styles.input}
                        type="text"
                        value={desktopStartTime}
                        onBlur={() => {
                          const normalized = to24HourValue(desktopStartTime);
                          if (normalized) {
                            setStartTime(normalized);
                            setDesktopStartTime(to12HourValue(normalized));
                          } else {
                            setDesktopStartTime(to12HourValue(startTime));
                          }
                        }}
                        onChange={(event) => setDesktopStartTime(event.target.value)}
                        placeholder="09:00 AM"
                      />
                    )}
                  </div>

                  <span className={styles.slotSeparator}>-</span>

                  <div className={styles.slotField}>
                    <span className={styles.slotLabel}>End</span>
                    {isMobile ? (
                      <input
                        className={styles.input}
                        type="time"
                        value={endTime}
                        onChange={(event) => setEndTime(event.target.value)}
                      />
                    ) : (
                      <input
                        className={styles.input}
                        type="text"
                        value={desktopEndTime}
                        onBlur={() => {
                          const normalized = to24HourValue(desktopEndTime);
                          if (normalized) {
                            setEndTime(normalized);
                            setDesktopEndTime(to12HourValue(normalized));
                          } else {
                            setDesktopEndTime(to12HourValue(endTime));
                          }
                        }}
                        onChange={(event) => setDesktopEndTime(event.target.value)}
                        placeholder="11:00 AM"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.label} htmlFor="edit-change-note">
                Change Note <span className={styles.optional}>(Optional)</span>
              </label>
              <textarea
                className={styles.textarea}
                id="edit-change-note"
                rows={4}
                placeholder="Note for User: (e.g., Changed venue due to AC failure)"
                value={changeNote}
                onChange={(event) => setChangeNote(event.target.value)}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.discardBtn} type="button" onClick={onClose}>
              Discard Changes
            </button>

            <button className={styles.saveBtn} disabled={!canSave || !hasChanged} type="button" onClick={handleSave}>
              <span className="material-symbols-outlined">check</span>
              Save Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
