import Image from 'next/image';
import { UserStats, hasPlayedToday, resetUserData } from './userData';
import BottomNav from './components/BottomNav';
import styles from './Dashboard.module.css';

interface DashboardProps {
  userData: UserStats;
  onStartQuiz: () => void;
}

export default function Dashboard({ userData, onStartQuiz }: DashboardProps) {
  const playedToday = hasPlayedToday(userData);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.greeting}>
            <h1 className={styles.welcomeText}>Welcome back,</h1>
            <h2 className={styles.username}>{userData.username || 'Crypto Explorer'}!</h2>
          </div>
        </header>

        {/* Streak Card - Hero Section */}
        <div className={styles.heroCard}>
          <div className={styles.streakDisplay}>
            <div className={styles.flameIcon}>
              <Image src="/flame.png" alt="Streak" width={48} height={48} />
            </div>
            <div className={styles.streakInfo}>
              <div className={styles.streakNumber}>{userData.currentStreak}</div>
              <div className={styles.streakLabel}>Day Streak</div>
            </div>
          </div>
          {playedToday && (
            <div className={styles.completedBadge}>
              ✓ Today&apos;s quiz completed
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={onStartQuiz}
          disabled={playedToday}
          className={`${styles.ctaButton} ${playedToday ? styles.disabled : ''}`}
        >
          {playedToday ? (
            <>
              <span className={styles.buttonIcon}>⏰</span>
              <span>Come Back Tomorrow</span>
            </>
          ) : (
            <>
              <span className={styles.buttonIcon}>🚀</span>
              <span>Start Today&apos;s Quiz</span>
            </>
          )}
        </button>

        {playedToday && (
          <p className={styles.nextQuizHint}>
            New questions available in 24 hours
          </p>
        )}

        {/* Dev Reset Button - Only shows on localhost */}
        {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
          <button
            onClick={async () => {
              if (confirm('⚠️ This will delete all your quiz data. Continue?')) {
                try {
                  console.log('Resetting data for FID:', userData.fid);
                  await resetUserData(userData.fid);

                  // Clear all browser storage
                  localStorage.clear();
                  sessionStorage.clear();

                  // Hard reload with cache clear
                  window.location.href = window.location.href + '?reset=' + Date.now();
                } catch (error) {
                  console.error('Reset failed:', error);
                  alert('Reset failed. Check console for details.');
                }
              }
            }}
            className={styles.devResetButton}
            title="Development only: Delete user from database and reload"
          >
            🔧 DEV: Reset Quiz Data
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
