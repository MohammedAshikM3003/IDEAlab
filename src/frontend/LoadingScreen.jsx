import React, { useState, useEffect } from 'react';
import styles from './LoadingScreen.module.css';
import collegeLogo from '../assets/collegelogo.jpg';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  // Simulate progress bar filling up
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) return 100;
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.dotOverlay}></div>
      
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <div className={styles.iconContainer}>
            <img
              src={collegeLogo}
              alt="College Logo"
              className={styles.logoImg}
            />
          </div>
        </div>
        
        <h2 className={styles.title}>Preparing your Dashboard...</h2>
        <p className={styles.subtitle}>
          Authenticating credentials and retrieving your latest administrative reports.
        </p>
        
        <div className={styles.progressTrack}>
          <div 
            className={styles.progressBar} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;