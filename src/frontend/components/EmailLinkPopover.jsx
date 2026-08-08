import React, { useState, useRef, useEffect } from 'react';
import styles from './EmailLinkPopover.module.css';

export default function EmailLinkPopover({ email, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGmail = () => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleDefault = () => {
    window.location.href = `mailto:${email}`;
    setIsOpen(false);
  };

  return (
    <span className={styles.popoverContainer} ref={popoverRef}>
      <span className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        {children}
      </span>
      {isOpen && (
        <div className={styles.popoverMenu}>
          <button className={styles.optionBtn} onClick={handleGmail}>
            Open in Gmail
          </button>
          <button className={styles.optionBtn} onClick={handleDefault}>
            Open in default mail app
          </button>
        </div>
      )}
    </span>
  );
}
