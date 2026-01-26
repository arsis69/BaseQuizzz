'use client';

import { useEffect, useState } from 'react';
import { useAccount } from '@coinbase/onchainkit/minikit';
import BottomNav from '../components/BottomNav';
import styles from './page.module.css';

interface UserStats {
  username: string;
  totalQuizzes: number;
  correctAnswers: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  lastQuizDate: string;
  achievements: string[];
}

export default function Profile() {
  const { address } = useAccount();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserStats() {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        const { loadUserData } = await import('../userData');
        const data = await loadUserData(address);

        // Calculate achievements
        const achievements = [];
        if (data.totalQuizzes >= 1) achievements.push('First Steps');
        if (data.totalQuizzes >= 10) achievements.push('Quiz Master');
        if (data.totalQuizzes >= 50) achievements.push('Century Club');
        if (data.accuracy >= 80) achievements.push('Accuracy Expert');
        if (data.accuracy === 100 && data.totalQuizzes >= 5) achievements.push('Perfect Scholar');

        setStats({
          username: data.username || 'Crypto Explorer',
          totalQuizzes: data.totalQuizzes || 0,
          correctAnswers: data.correctAnswers || 0,
          accuracy: data.accuracy || 0,
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          lastQuizDate: data.lastQuizDate || 'Never',
          achievements,
        });
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserStats();
  }, [address]);

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
            <div className={styles.statIcon}>🎯</div>
            <div className={styles.statValue}>{stats.totalQuizzes}</div>
            <div className={styles.statLabel}>Total Quizzes</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statValue}>{stats.correctAnswers}</div>
            <div className={styles.statLabel}>Correct Answers</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📈</div>
            <div className={styles.statValue}>{stats.accuracy}%</div>
            <div className={styles.statLabel}>Accuracy</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔥</div>
            <div className={styles.statValue}>{stats.currentStreak}</div>
            <div className={styles.statLabel}>Current Streak</div>
          </div>
        </div>

        {/* Achievements Section */}
        {stats.achievements.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Achievements</h2>
            <div className={styles.achievementGrid}>
              {stats.achievements.map((achievement) => (
                <div key={achievement} className={styles.achievementBadge}>
                  <div className={styles.badgeIcon}>🏆</div>
                  <div className={styles.badgeName}>{achievement}</div>
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
