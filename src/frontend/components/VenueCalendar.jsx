import React, { useState } from 'react';
import styles from './VenueCalendar.module.css';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function VenueCalendar({ bookings = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
  };

  const getBookingsForDate = (date) => {
    const dStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return bookings.filter(b => {
      if (!b.date) return false;
      const bDate = new Date(b.date);
      const bStr = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}-${String(bDate.getDate()).padStart(2, '0')}`;
      return bStr === dStr;
    });
  };

  const days = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className={styles.emptySlot} />);
  }

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentYear, currentMonth, d);
    const dayBookings = getBookingsForDate(dateObj);
    const isBooked = dayBookings.length > 0;
    
    // Check if it's past
    const isPast = new Date() > new Date(currentYear, currentMonth, d + 1);
    
    const isSelected = selectedDate && selectedDate.getTime() === dateObj.getTime();

    days.push(
      <button
        key={d}
        className={`${styles.dayBtn} ${isBooked ? styles.booked : ''} ${isSelected ? styles.selected : ''} ${isPast ? styles.past : ''}`}
        onClick={() => {
          if (!isPast) setSelectedDate(dateObj);
        }}
        disabled={isPast}
      >
        <span className={styles.dayNumber}>{d}</span>
        {isBooked && <span className={styles.dot} />}
      </button>
    );
  }

  const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <button onClick={handlePrevMonth} className={styles.navBtn}>
          <span className="material-icons">chevron_left</span>
        </button>
        <h3 className={styles.monthTitle}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={handleNextMonth} className={styles.navBtn}>
          <span className="material-icons">chevron_right</span>
        </button>
      </div>

      <div className={styles.gridHeader}>
        {daysOfWeek.map(day => (
          <div key={day} className={styles.dayName}>{day}</div>
        ))}
      </div>

      <div className={styles.gridContainer}>
        {days}
      </div>

      <div className={styles.detailsContainer}>
        {selectedDate ? (
          <div>
            <h4 className={styles.detailsTitle}>
              Bookings on {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </h4>
            {selectedBookings.length > 0 ? (
              <ul className={styles.bookingsList}>
                {selectedBookings.map((b, idx) => (
                  <li key={idx} className={styles.bookingItem}>
                    <span className="material-icons">schedule</span>
                    <span>{b.timeSlot?.start} - {b.timeSlot?.end}</span>
                    <span className={styles.bookedTag}>Booked</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noBookings}>No bookings for this date. It is fully available!</p>
            )}
          </div>
        ) : (
          <p className={styles.selectPrompt}>Select a date to see availability details.</p>
        )}
      </div>
    </div>
  );
}
