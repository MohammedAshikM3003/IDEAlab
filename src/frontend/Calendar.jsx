import React, { useEffect, useMemo, useRef, useState } from "react";

import styles from "./Calendar.module.css";

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getGridStartDate(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  return new Date(year, month, 1 - mondayOffset);
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  availabilityData = {},
  minDate,
}) {
  const initialMonth = selectedDate instanceof Date && !Number.isNaN(selectedDate.getTime())
    ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [showPicker, setShowPicker] = useState(false);
  const [_pickerProgress, setPickerProgress] = useState({ monthSelected: false, yearSelected: false });
  const pickerRef = useRef(null);
  const yearColumnRef = useRef(null);

  const normalizedSelectedDate =
    selectedDate instanceof Date && !Number.isNaN(selectedDate.getTime()) ? startOfDay(selectedDate) : null;
  const normalizedMinDate =
    minDate instanceof Date && !Number.isNaN(minDate.getTime()) ? startOfDay(minDate) : null;

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthIndex = currentMonth.getMonth();
  const currentYear = currentMonth.getFullYear();
  const yearOptions = useMemo(() => Array.from({ length: 11 }, (_, index) => 2020 + index), []);

  const days = useMemo(() => {
    const start = getGridStartDate(currentMonth);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const weekendColumn = index % 7 >= 5;
      const isBeforeMinDate = normalizedMinDate ? date < normalizedMinDate : false;
      const isInactive = !isCurrentMonth;
      const isDisabled = isInactive || isBeforeMinDate;
      const isSelected = normalizedSelectedDate ? isSameDay(date, normalizedSelectedDate) : false;
      return {
        key: formatDateKey(date),
        date,
        day: date.getDate(),
        isInactive,
        isDisabled,
        isSelected,
        weekendColumn,
      };
    });
  }, [currentMonth, normalizedMinDate, normalizedSelectedDate]);

  useEffect(() => {
    if (!showPicker) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showPicker]);

  useEffect(() => {
    if (!showPicker || !yearColumnRef.current) {
      return;
    }

    const targetYearButton = yearColumnRef.current.querySelector(`[data-year='${currentYear}']`);
    if (targetYearButton) {
      targetYearButton.scrollIntoView({ block: "center" });
    }
  }, [showPicker, currentYear]);

  const goToPreviousMonth = () => {
    setCurrentMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1));
  };

  const setMonth = (nextMonthIndex) => {
    setCurrentMonth((previous) => new Date(previous.getFullYear(), nextMonthIndex, 1));

    setPickerProgress((previous) => {
      const next = { ...previous, monthSelected: true };
      if (next.yearSelected) {
        setShowPicker(false);
      }
      return next;
    });
  };

  const setYear = (nextYear) => {
    setCurrentMonth((previous) => new Date(nextYear, previous.getMonth(), 1));

    setPickerProgress((previous) => {
      const next = { ...previous, yearSelected: true };
      if (next.monthSelected) {
        setShowPicker(false);
      }
      return next;
    });
  };

  void availabilityData;

  return (
    <div className={styles.card} ref={pickerRef}>
      <div className={styles.headerRow}>
        <button
          aria-expanded={showPicker}
          className={styles.monthLabelButton}
          onClick={() => {
            setShowPicker((previous) => {
              const nextShowPicker = !previous;
              if (nextShowPicker) {
                setPickerProgress({ monthSelected: false, yearSelected: false });
              }
              return nextShowPicker;
            });
          }}
          type="button"
        >
          <span className={styles.monthLabel}>{monthLabel}</span>
        </button>
        {!showPicker ? (
          <div className={styles.navButtons}>
            <button className={styles.navButton} onClick={goToPreviousMonth} type="button" aria-label="Previous month">
              &lt;
            </button>
            <button className={styles.navButton} onClick={goToNextMonth} type="button" aria-label="Next month">
              &gt;
            </button>
          </div>
        ) : null}
      </div>

      {showPicker ? (
        <div className={styles.monthYearPicker}>
          <div className={styles.pickerColumn}>
            {MONTH_LABELS.map((monthName, index) => (
              <button
                className={`${styles.pickerItem} ${index === monthIndex ? styles.pickerItemActive : ""}`}
                key={monthName}
                onClick={() => setMonth(index)}
                type="button"
              >
                <span className={styles.pickerPill}>{monthName}</span>
              </button>
            ))}
          </div>
          <div className={styles.pickerColumn} ref={yearColumnRef}>
            {yearOptions.map((yearValue) => (
              <button
                className={`${styles.pickerItem} ${yearValue === currentYear ? styles.pickerItemActive : ""}`}
                data-year={yearValue}
                key={yearValue}
                onClick={() => setYear(yearValue)}
                type="button"
              >
                <span className={styles.pickerPill}>{yearValue}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!showPicker ? (
        <div className={styles.grid}>
        {DAY_LABELS.map((label, index) => (
          <div
            className={`${styles.dayHeader} ${index >= 5 ? styles.weekendColumn : ""}`}
            key={label}
          >
            {label}
          </div>
        ))}

        {days.map((entry) => {
          const buttonClasses = [styles.dateButton];

          if (entry.isSelected) {
            buttonClasses.push(styles.selected);
          }
          if (entry.isInactive) {
            buttonClasses.push(styles.inactive);
          }
          if (entry.isDisabled && !entry.isInactive) {
            buttonClasses.push(styles.disabled);
          }

          return (
            <div
              className={`${styles.dateCell} ${entry.weekendColumn ? styles.weekendColumn : ""}`}
              key={entry.key}
            >
              <button
                className={buttonClasses.join(" ")}
                disabled={entry.isDisabled}
                onClick={() => onDateSelect?.(new Date(entry.date))}
                type="button"
              >
                <span className={styles.dateNumber}>{entry.day}</span>
              </button>
            </div>
          );
        })}
        </div>
      ) : null}
    </div>
  );
}
