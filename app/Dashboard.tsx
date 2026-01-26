import Image from 'next/image';
import { UserStats, getAccuracy, hasPlayedToday } from './userData';
import BottomNav from './components/BottomNav';
import styles from './Dashboard.module.css';

interface DashboardProps {
  userData: UserStats;
  onStartQuiz: () => void;
}

export default function Dashboard({ userData, onStartQuiz }: DashboardProps) {
  const accuracy = getAccuracy(userData);
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
              <Image src="/flame.png" alt="Streak" width={56} height={56} />
            </div>
            <div className={styles.streakInfo}>
              <div className={styles.streakNumber}>{userData.currentStreak}</div>
              <div className={styles.streakLabel}>Day Streak</div>
            </div>
          </div>
          {playedToday && (
            <div className={styles.completedBadge}>
              ✓ Today's quiz completed
            </div>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <Image src="/trophy.png" alt="Trophy" width={32} height={32} />
            </div>
            <div className={styles.statValue}>{userData.totalQuizzes}</div>
            <div className={styles.statLabel}>Total Quizzes</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <Image src="/diamond.png" alt="Accuracy" width={32} height={32} />
            </div>
            <div className={styles.statValue}>{accuracy}%</div>
            <div className={styles.statLabel}>Accuracy</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <Image src="/bolt.png" alt="Correct" width={32} height={32} />
            </div>
            <div className={styles.statValue}>{userData.correctAnswers}</div>
            <div className={styles.statLabel}>Correct</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <Image src="/flame.png" alt="Best Streak" width={32} height={32} />
            </div>
            <div className={styles.statValue}>{userData.longestStreak}</div>
            <div className={styles.statLabel}>Best Streak</div>
          </div>
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
              <span>Start Today's Quiz</span>
            </>
          )}
        </button>

        {playedToday && (
          <p className={styles.nextQuizHint}>
            New questions available in 24 hours
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
