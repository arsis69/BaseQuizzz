"use client";

import { useState, useEffect } from 'react';
import BottomNav from "../components/BottomNav";
import styles from "../success/page.module.css";

export default function ScreenshotSuccess() {
  const score = 4; // Example: 4 out of 5
  const total = 5;
  const percentage = Math.round((score / total) * 100);
  const [timeToNext, setTimeToNext] = useState('');

  // Update countdown timer every second
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeToNext(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get performance message based on score
  const getPerformanceMessage = () => {
    if (percentage === 100) return { emoji: '🏆', text: 'Perfect Score! You\'re a crypto expert!' };
    if (percentage >= 80) return { emoji: '🌟', text: 'Excellent! You know your blockchain!' };
    if (percentage >= 60) return { emoji: '👍', text: 'Good job! You\'re learning fast!' };
    if (percentage >= 40) return { emoji: '📚', text: 'Not bad! Keep learning!' };
    return { emoji: '💪', text: 'Keep trying! Practice makes perfect!' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.successMessage}>
          {/* Score Display */}
          <div style={{
            fontSize: '56px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {performance.emoji}
          </div>

          <h1 className={styles.title} style={{ fontSize: '1.75rem', marginBottom: '15px' }}>Quiz Complete!</h1>

          {/* Score */}
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '15px 0',
            color: percentage >= 60 ? '#28a745' : percentage >= 40 ? '#FFA500' : '#dc3545'
          }}>
            {score}/{total}
          </div>

          <p className={styles.subtitle} style={{ fontSize: '0.95rem', marginBottom: '15px' }}>
            {performance.text}
            <br />
            You scored {percentage}% on the crypto basics quiz!
          </p>

          {/* Next Quiz Timer */}
          <div style={{
            marginTop: '20px',
            marginBottom: '20px',
            padding: '18px',
            background: 'linear-gradient(135deg, #fff8f0 0%, #ffe8dd 100%)',
            borderRadius: '16px',
            border: '2px solid #FF6B35',
            boxShadow: '0 8px 25px rgba(255,107,53,0.15)'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666', fontWeight: '600' }}>
              NEXT QUIZ IN
            </p>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#FF6B35',
              fontFamily: 'monospace',
              letterSpacing: '2px'
            }}>
              {timeToNext || '00:00:00'}
            </div>
          </div>

          <button
            className={styles.shareButton}
            onClick={() => alert('Share button - screenshot only')}
            style={{ padding: '14px 24px', fontSize: '14px' }}
          >
            SHARE YOUR SCORE
          </button>

          <button
            style={{
              marginTop: '12px',
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              border: 'none',
              borderRadius: '14px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 30px rgba(40,167,69,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'var(--font-poppins), sans-serif',
            }}
            onClick={() => alert('Check-in button - screenshot only')}
          >
            CLAIM YOUR DAILY CHECK-IN
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
