// User data management using Supabase with Farcaster ID
import { supabase } from './supabaseClient';

export interface QuizAttempt {
  date: string; // YYYY-MM-DD format
  score: number;
  total: number;
  timestamp: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export interface UserStats {
  fid: number; // Farcaster ID
  username: string;
  totalQuizzes: number;
  correctAnswers: number;
  totalAnswers: number;
  currentStreak: number;
  longestStreak: number;
  lastQuizDate: string | null; // YYYY-MM-DD
  quizHistory: QuizAttempt[];
  badges: Badge[];
}

const BADGES_CONFIG: Omit<Badge, 'earned' | 'earnedDate'>[] = [
  { id: 'first-quiz', name: 'First Steps', description: 'Complete your first quiz', icon: '🎯' },
  { id: 'perfect-score', name: 'Perfect!', description: 'Get 100% on a quiz', icon: '🏆' },
  { id: 'streak-3', name: '3-Day Streak', description: 'Quiz 3 days in a row', icon: '🔥' },
  { id: 'streak-7', name: 'Week Warrior', description: 'Quiz 7 days in a row', icon: '⚡' },
  { id: 'streak-30', name: 'Monthly Master', description: 'Quiz 30 days in a row', icon: '👑' },
  { id: 'quiz-10', name: 'Dedicated', description: 'Complete 10 quizzes', icon: '📚' },
  { id: 'quiz-50', name: 'Expert', description: 'Complete 50 quizzes', icon: '🌟' },
  { id: 'accuracy-80', name: 'Sharp Mind', description: 'Maintain 80%+ accuracy over 10 quizzes', icon: '🧠' },
];

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function createNewUser(fid: number, username: string): UserStats {
  return {
    fid,
    username,
    totalQuizzes: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastQuizDate: null,
    quizHistory: [],
    badges: BADGES_CONFIG.map(b => ({ ...b, earned: false })),
  };
}

// Database row type
interface DbUserStats {
  fid: number;
  username: string;
  total_quizzes: number;
  correct_answers: number;
  total_answers: number;
  current_streak: number;
  longest_streak: number;
  last_quiz_date: string | null;
  quiz_history: QuizAttempt[];
  badges: Badge[];
}

// Convert database row to UserStats
function dbToUserStats(row: DbUserStats): UserStats {
  return {
    fid: row.fid,
    username: row.username,
    totalQuizzes: row.total_quizzes,
    correctAnswers: row.correct_answers,
    totalAnswers: row.total_answers,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastQuizDate: row.last_quiz_date,
    quizHistory: row.quiz_history || [],
    badges: row.badges || BADGES_CONFIG.map(b => ({ ...b, earned: false })),
  };
}

// Convert UserStats to database format
function userStatsToDb(userData: UserStats) {
  return {
    fid: userData.fid,
    username: userData.username,
    total_quizzes: userData.totalQuizzes,
    correct_answers: userData.correctAnswers,
    total_answers: userData.totalAnswers,
    current_streak: userData.currentStreak,
    longest_streak: userData.longestStreak,
    last_quiz_date: userData.lastQuizDate,
    quiz_history: userData.quizHistory,
    badges: userData.badges,
    updated_at: new Date().toISOString(),
  };
}

export async function getUserData(fid: number, username: string): Promise<UserStats> {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('fid', fid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No user found, create new one
        const newUser = createNewUser(fid, username);
        await saveUserData(newUser);
        return newUser;
      }
      throw error;
    }

    return dbToUserStats(data);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return createNewUser(fid, username);
  }
}

export async function saveUserData(userData: UserStats): Promise<void> {
  try {
    const dbData = userStatsToDb(userData);

    const { error } = await supabase
      .from('user_stats')
      .upsert(dbData, { onConflict: 'fid' });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

export async function recordQuizAttempt(
  userData: UserStats,
  score: number,
  total: number
): Promise<UserStats> {
  const today = getTodayString();
  const newAttempt: QuizAttempt = {
    date: today,
    score,
    total,
    timestamp: Date.now(),
  };

  // Update basic stats
  userData.totalQuizzes += 1;
  userData.correctAnswers += score;
  userData.totalAnswers += total;
  userData.quizHistory.push(newAttempt);

  // Update streak
  if (userData.lastQuizDate === today) {
    // Already did quiz today, don't change streak
  } else if (userData.lastQuizDate === getYesterdayString()) {
    // Continuing streak
    userData.currentStreak += 1;
  } else {
    // Streak broken, start new
    userData.currentStreak = 1;
  }

  userData.longestStreak = Math.max(userData.longestStreak, userData.currentStreak);
  userData.lastQuizDate = today;

  // Check and award badges
  userData.badges = checkBadges(userData);

  await saveUserData(userData);
  return userData;
}

function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

function checkBadges(userData: UserStats): Badge[] {
  const badges = [...userData.badges];

  // First quiz
  if (userData.totalQuizzes >= 1) {
    earnBadge(badges, 'first-quiz');
  }

  // Perfect score
  const lastAttempt = userData.quizHistory[userData.quizHistory.length - 1];
  if (lastAttempt && lastAttempt.score === lastAttempt.total) {
    earnBadge(badges, 'perfect-score');
  }

  // Streak badges
  if (userData.currentStreak >= 3) earnBadge(badges, 'streak-3');
  if (userData.currentStreak >= 7) earnBadge(badges, 'streak-7');
  if (userData.currentStreak >= 30) earnBadge(badges, 'streak-30');

  // Total quiz badges
  if (userData.totalQuizzes >= 10) earnBadge(badges, 'quiz-10');
  if (userData.totalQuizzes >= 50) earnBadge(badges, 'quiz-50');

  // Accuracy badge (80%+ over last 10 quizzes)
  if (userData.quizHistory.length >= 10) {
    const last10 = userData.quizHistory.slice(-10);
    const correct = last10.reduce((sum, q) => sum + q.score, 0);
    const total = last10.reduce((sum, q) => sum + q.total, 0);
    const accuracy = (correct / total) * 100;
    if (accuracy >= 80) {
      earnBadge(badges, 'accuracy-80');
    }
  }

  return badges;
}

function earnBadge(badges: Badge[], badgeId: string): void {
  const badge = badges.find(b => b.id === badgeId);
  if (badge && !badge.earned) {
    badge.earned = true;
    badge.earnedDate = getTodayString();
  }
}

export function hasPlayedToday(userData: UserStats): boolean {
  return userData.lastQuizDate === getTodayString();
}

export function getAccuracy(userData: UserStats): number {
  if (userData.totalAnswers === 0) return 0;
  return Math.round((userData.correctAnswers / userData.totalAnswers) * 100);
}

// Dev-only function to reset user data
export async function resetUserData(fid: number): Promise<void> {
  try {
    console.log('Attempting to delete user with FID:', fid);

    const { data, error } = await supabase
      .from('user_stats')
      .delete()
      .eq('fid', fid)
      .select();

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    console.log('Delete successful. Deleted rows:', data?.length || 0);
    console.log('User data reset successfully for FID:', fid);
  } catch (error) {
    console.error('Error resetting user data:', error);
    throw error; // Re-throw so the UI can handle it
  }
}
