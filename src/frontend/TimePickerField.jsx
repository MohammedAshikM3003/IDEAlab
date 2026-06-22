import React, { useState, useEffect, useRef } from 'react';
import styles from './TimePickerField.module.css';

// ─── Time Spinner Picker ─────────────────────────────────────────────────────
function TimeSpinnerPicker({ id, value, onChange, hasError }) {
  // Safe-parse: treat missing/invalid hour as 10, minute as 00, period as AM
  const safeHour = (value && value.hour) || '10'
  const safeMinute = (value && value.minute != null) ? value.minute : '00'
  const safePeriod = (value && (value.period === 'AM' || value.period === 'PM'))
    ? value.period
    : 'AM'

  // Resolve numeric base — always a finite integer before clamping
  const numHour = Number(safeHour)
  const numMinute = Number(safeMinute)
  const baseHour = Number.isFinite(numHour) ? numHour : 10
  const baseMinute = Number.isFinite(numMinute) ? numMinute : 0

  function clampHour(n) {
    if (!Number.isFinite(n) || n < 1) return 12   // NaN / < 1 → wrap to 12
    if (n > 12) return 1                           // > 12  → wrap to 1
    return n
  }

  function clampMinute(n) {
    if (!Number.isFinite(n)) return 0   // NaN → reset to 0
    if (n < 0) return 59               // underflow  → wrap to 59
    if (n > 59) return 0               // overflow   → wrap to 0
    return n
  }

  function stepHour(delta) {
    const next = clampHour(baseHour + delta)
    onChange({ ...value, hour: String(next).padStart(2, '0'), minute: safeMinute, period: safePeriod })
  }

  function stepMinute(delta) {
    const next = clampMinute(baseMinute + delta)
    onChange({ ...value, hour: safeHour, minute: String(next).padStart(2, '0'), period: safePeriod })
  }

  function handleHourInput(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 2)
    onChange({ ...value, hour: raw, minute: safeMinute, period: safePeriod })
  }

  function handleHourBlur(e) {
    const n = Number(e.target.value)
    const clamped = Number.isFinite(n) && n >= 1 && n <= 12 ? n : 10
    onChange({ ...value, hour: String(clamped).padStart(2, '0'), minute: safeMinute, period: safePeriod })
  }

  function handleMinuteInput(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 2)
    onChange({ ...value, hour: safeHour, minute: raw, period: safePeriod })
  }

  function handleMinuteBlur(e) {
    const n = Number(e.target.value)
    const clamped = Number.isFinite(n) && n >= 0 && n <= 59 ? n : 0
    onChange({ ...value, hour: safeHour, minute: String(clamped).padStart(2, '0'), period: safePeriod })
  }

  return (
    <div
      className={`${styles.timeSpinnerWrapper}${hasError ? ' ' + styles.timeSpinnerError : ''}`}
      role="group"
      aria-label="Time picker"
    >
      {/* HH spinner */}
      <div className={styles.spinnerUnit}>
        <div className={styles.spinnerLabel}>HH</div>
        <button
          type="button"
          className={styles.spinnerBtn}
          onClick={() => stepHour(1)}
          aria-label="Increase hour"
          tabIndex={-1}
        >
          <svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={safeHour}
          onChange={handleHourInput}
          onBlur={handleHourBlur}
          className={styles.spinnerInput}
          aria-label="Hour"
          maxLength={2}
        />
        <button
          type="button"
          className={styles.spinnerBtn}
          onClick={() => stepHour(-1)}
          aria-label="Decrease hour"
          tabIndex={-1}
        >
          <svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </button>
      </div>

      <span className={styles.spinnerColon}>:</span>

      {/* MM spinner */}
      <div className={styles.spinnerUnit}>
        <div className={styles.spinnerLabel}>MM</div>
        <button
          type="button"
          className={styles.spinnerBtn}
          onClick={() => stepMinute(1)}
          aria-label="Increase minute"
          tabIndex={-1}
        >
          <svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={safeMinute}
          onChange={handleMinuteInput}
          onBlur={handleMinuteBlur}
          className={styles.spinnerInput}
          aria-label="Minute"
          maxLength={2}
        />
        <button
          type="button"
          className={styles.spinnerBtn}
          onClick={() => stepMinute(-1)}
          aria-label="Decrease minute"
          tabIndex={-1}
        >
          <svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </button>
      </div>

    </div>
  )
}

export default function TimePickerField({ id, label, value, onChange, errorMsg }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const formatTime = (h, m) => {
    if (!h && !m) return '';
    return `${h || '10'}:${m || '00'}`;
  };

  const [inputValue, setInputValue] = useState(formatTime(value.hour, value.minute));
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(formatTime(value.hour, value.minute));
  }, [value.hour, value.minute]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleInputChange = (e) => {
    let val = e.target.value.replace(/[^\d:]/g, '');
    
    if (val === '') {
      setInputValue('');
      onChange({ ...value, hour: '', minute: '' });
      return;
    }

    if (val.length === 2 && inputValue.length < 2 && !val.includes(':')) {
      val += ':';
    } else if (val.length > 2 && !val.includes(':')) {
      val = val.slice(0, 2) + ':' + val.slice(2);
    }
    if (val.length > 5) val = val.slice(0, 5);

    setInputValue(val);

    const match = val.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      let h = parseInt(match[1], 10);
      let m = parseInt(match[2], 10);
      if (h > 0 && h <= 12 && m >= 0 && m < 60) {
        onChange({ ...value, hour: String(h).padStart(2, '0'), minute: String(m).padStart(2, '0') });
      }
    }
  };

  const handleInputBlur = () => {
    setInputValue(formatTime(value.hour, value.minute));
  };

  return (
    <div className={styles.field} ref={wrapperRef}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div className={`${styles.control} ${styles.pointerCursor}`} style={{ flex: 1 }} onClick={() => setIsOpen(true)}>
          <input
            type="text"
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`${styles.input} ${styles.hasIcon} ${styles.pointerCursor}`}
            aria-invalid={Boolean(errorMsg)}
            placeholder="HH:MM"
          />
          <div className={styles.inputIcon} onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>

        <div className={styles.inlinePeriodToggle}>
          <button
            type="button"
            className={`${styles.periodBtn}${value.period === 'AM' ? ' ' + styles.periodBtnActive : ''}`}
            onClick={() => onChange({ ...value, period: 'AM' })}
            aria-pressed={value.period === 'AM'}
          >
            AM
          </button>
          <button
            type="button"
            className={`${styles.periodBtn}${value.period === 'PM' ? ' ' + styles.periodBtnActive : ''}`}
            onClick={() => onChange({ ...value, period: 'PM' })}
            aria-pressed={value.period === 'PM'}
          >
            PM
          </button>
        </div>
      </div>

      {isOpen && (
        <div className={styles.timePickerPopup}>
          <TimeSpinnerPicker
            id={`${id}-spinner`}
            value={value}
            onChange={onChange}
            hasError={Boolean(errorMsg)}
          />
        </div>
      )}
      {errorMsg ? <div className={styles.error}>{errorMsg}</div> : null}
    </div>
  );
}
