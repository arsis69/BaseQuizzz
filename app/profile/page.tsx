'use client';

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import Image from 'next/image';
import BottomNav from '../components/BottomNav';
import styles from './page.module.css';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

interface UserStats {
  username: string;
  totalQuizzes: number;
  correctAnswers: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  lastQuizDate: string;
  badges: Badge[];
}

export default function Profile() {
  const { context } = useMiniKit();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserStats() {
      let fid = 999999; // Default for local testing
      let username = 'TestUser';

      if (context?.user) {
        fid = context.user.fid;
        username = context.user.displayName || context.user.username || 'User';
      }

      try {
        const { getUserData, getAccuracy } = await import('../userData');
        const data = await getUserData(fid, username);

        const accuracy = getAccuracy(data);

        setStats({
          username: data.username || 'Crypto Explorer',
          totalQuizzes: data.totalQuizzes || 0,
          correctAnswers: data.correctAnswers || 0,
          accuracy: accuracy || 0,
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          lastQuizDate: data.lastQuizDate || 'Never',
          badges: data.badges || [],
        });
      } catch (error) {
        console.error('Error loading user stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    loadUserStats();
  }, [context]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading your profile...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <h2>No Stats Yet</h2>
            <p>Complete your first quiz to start tracking your progress!</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {stats.username.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <h1 className={styles.username}>{stats.username}</h1>
              <p className={styles.subtitle}>Crypto Learner</p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <Image src="/trophy.png" alt="Trophy" width={32} height={32} />
            </div>
            <div className={styles.statValue}>{stats.totalQuizzes}</div>
            <div className={styles.statLabel}>Total Quizzes</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <Image src="/bolt.png" alt="Correct" width={32} height={32} />
            </div>
            <div className={styles.statValue}>{stats.correctAnswers}</div>
            <div className={styles.statLabel}>Correct</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <Image src="/diamond.png" alt="Accuracy" width={32} height={32} />
            </div>
            <div className={styles.statValue}>{stats.accuracy}%</div>
            <div className={styles.statLabel}>Accuracy</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <Image src="/flame.png" alt="Streak" width={32} height={32} />
            </div>
            <div className={styles.statValue}>{stats.currentStreak}</div>
            <div className={styles.statLabel}>Current Streak</div>
          </div>
        </div>

        {/* Badges Section */}
        {stats.badges.filter(b => b.earned).length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Badges Earned</h2>
            <div className={styles.achievementGrid}>
              {stats.badges.filter(b => b.earned).map((badge) => (
                <div key={badge.id} className={styles.achievementBadge} title={badge.description}>
                  <div className={styles.badgeIcon}>{badge.icon}</div>
                  <div className={styles.badgeName}>{badge.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Stats */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Statistics</h2>
          <div className={styles.detailsList}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Longest Streak</span>
              <span className={styles.detailValue}>{stats.longestStreak} days</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Last Quiz</span>
              <span className={styles.detailValue}>
                {stats.lastQuizDate === 'Never'
                  ? 'Never'
                  : new Date(stats.lastQuizDate).toLocaleDateString()}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Success Rate</span>
              <span className={styles.detailValue}>
                {stats.totalQuizzes > 0
                  ? `${Math.round((stats.correctAnswers / (stats.totalQuizzes * 5)) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
