import { UserStats, getAccuracy, hasPlayedToday } from './userData';
import styles from './page.module.css';

interface DashboardProps {
  userData: UserStats;
  onStartQuiz: () => void;
}

export default function Dashboard({ userData, onStartQuiz }: DashboardProps) {
  const accuracy = getAccuracy(userData);
  const earnedBadges = userData.badges.filter(b => b.earned);
  const playedToday = hasPlayedToday(userData);

  return (
    <div className={styles.waitlistForm}>
      {/* Welcome Header */}
      <h1 className={styles.title} style={{ marginBottom: '10px' }}>
        Welcome back!
      </h1>
      <p className={styles.subtitle} style={{ marginBottom: '30px', fontSize: '18px' }}>
        Hey {userData.username || 'there'} 👋
      </p>

      {/* Streak Display - Prominent */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '2px solid #FF6B35',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <div style={{ fontSize: '48px' }}>🔥</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FF6B35', lineHeight: '1' }}>
              {userData.currentStreak}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              Day Streak
            </div>
          </div>
        </div>
        {playedToday && (
          <div style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#d4edda',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#155724',
            textAlign: 'center'
          }}>
            ✅ Quiz completed today!
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <StatCard icon="📊" label="Total Quizzes" value={userData.totalQuizzes} />
        <StatCard icon="🎯" label="Accuracy" value={`${accuracy}%`} />
        <StatCard icon="✅" label="Correct" value={userData.correctAnswers} />
        <StatCard icon="⚡" label="Best Streak" value={userData.longestStreak} />
      </div>

      {/* Badges Section */}
      {earnedBadges.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#2c3e50' }}>
            🏅 Badges ({earnedBadges.length})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
            gap: '12px'
          }}>
            {earnedBadges.map(badge => (
              <div
                key={badge.id}
                title={`${badge.name}: ${badge.description}`}
                style={{
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: '#fff8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontSize: '32px', marginBottom: '4px' }}>{badge.icon}</div>
                <div style={{ fontSize: '10px', color: '#666', fontWeight: '600' }}>
                  {badge.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Quiz Button */}
      <button
        onClick={onStartQuiz}
        disabled={playedToday}
        style={{
          width: '100%',
          padding: '18px',
          backgroundColor: playedToday ? '#ccc' : '#FF6B35',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: playedToday ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: playedToday ? 'none' : '0 4px 12px rgba(255,107,53,0.3)',
        }}
        onMouseEnter={(e) => {
          if (!playedToday) {
            e.currentTarget.style.backgroundColor = '#ff8555';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,107,53,0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!playedToday) {
            e.currentTarget.style.backgroundColor = '#FF6B35';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,107,53,0.3)';
          }
        }}
      >
        {playedToday ? 'Come Back Tomorrow! ⏰' : 'Start Today\'s Quiz 🚀'}
      </button>

      {playedToday && (
        <p style={{ marginTop: '12px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
          New questions available tomorrow!
        </p>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: '#666' }}>{label}</div>
    </div>
  );
}
