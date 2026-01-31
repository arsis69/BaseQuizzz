import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useSendCalls, useCallsStatus } from 'wagmi/experimental';
import { encodeFunctionData } from 'viem';
import { UserStats, hasPlayedToday, resetUserData } from './userData';
import { DID_YOU_KNOW_FACTS } from './didYouKnowFacts';
import { DID_YOU_KNOW_CONTRACT_ADDRESS, DID_YOU_KNOW_CONTRACT_ABI } from './contracts/didYouKnowContract';
import BottomNav from './components/BottomNav';
import styles from './Dashboard.module.css';

interface DashboardProps {
  userData: UserStats;
  onStartQuiz: () => void;
  userContext?: {
    user?: {
      fid?: number;
      username?: string;
      displayName?: string;
      pfpUrl?: string;
    };
  } | null;
}

export default function Dashboard({ userData, onStartQuiz, userContext }: DashboardProps) {
  const playedToday = hasPlayedToday(userData);
  const { address, isConnected } = useAccount();

  // Crypto Tips state
  const [currentFact, setCurrentFact] = useState(DID_YOU_KNOW_FACTS[0]);
  const [callsId, setCallsId] = useState<string>();
  const [isFading, setIsFading] = useState(false);

  const isContractDeployed = DID_YOU_KNOW_CONTRACT_ADDRESS.length === 42 && DID_YOU_KNOW_CONTRACT_ADDRESS.startsWith('0x');

  // Load a random tip (different from current)
  const loadRandomTip = useCallback((avoidCurrentId?: number) => {
    // Pick a random tip that's different from current
    let randomTipId;
    do {
      randomTipId = Math.floor(Math.random() * 20);
    } while (randomTipId === avoidCurrentId && DID_YOU_KNOW_FACTS.length > 1);

    console.log('[TIP] Showing random tip:', randomTipId);

    // Fade out current tip
    setIsFading(true);

    // After fade out, show new tip
    setTimeout(() => {
      setCurrentFact(DID_YOU_KNOW_FACTS[randomTipId]);
      setIsFading(false);
    }, 200);
  }, []);

  // Load random tip on mount
  useEffect(() => {
    loadRandomTip();
  }, [loadRandomTip]);

  // sendCalls for acknowledging facts
  const {
    sendCalls,
    data: sendCallsId,
    isPending: isAcknowledging,
    error: acknowledgeError
  } = useSendCalls();

  const {
    data: callsStatus,
    isLoading: isConfirming
  } = useCallsStatus({
    id: callsId as string,
    query: {
      enabled: !!callsId,
    },
  });

  // Update callsId when sendCalls returns
  useEffect(() => {
    if (sendCallsId) {
      const id = typeof sendCallsId === 'string' ? sendCallsId : sendCallsId?.id;
      if (id) {
        console.log('[FACT] Received sendCallsId:', id);
        setCallsId(id);
      }
    }
  }, [sendCallsId]);

  // Log acknowledge errors
  useEffect(() => {
    if (acknowledgeError) {
      console.error('[TIP] Error:', acknowledgeError);
    }
  }, [acknowledgeError]);


  const isConfirmed = callsStatus?.status === 'success';


  // When transaction is confirmed, show another random tip (different from current)
  useEffect(() => {
    if (isConfirmed) {
      console.log('[TIP] Transaction confirmed, showing another random tip...');

      const reloadAfterTransaction = async () => {
        // Wait 500ms then show another random tip
        await new Promise(resolve => setTimeout(resolve, 500));

        // Show another random tip (avoid current one)
        loadRandomTip(currentFact.id);

        // Clear transaction state
        setTimeout(() => {
          console.log('[TIP] Clearing transaction state');
          setCallsId(undefined);
        }, 300);
      };

      reloadAfterTransaction();
    }
  }, [isConfirmed, loadRandomTip, currentFact.id]);

  const handleAcknowledgeTip = async () => {
    if (!isConnected || !address) {
      console.log('[TIP] Wallet not connected');
      return;
    }

    try {
      const data = encodeFunctionData({
        abi: DID_YOU_KNOW_CONTRACT_ABI,
        functionName: 'acknowledgeTip',
        args: [BigInt(currentFact.id)],
      });

      console.log('[TIP] Calling sendCalls for tip:', currentFact.id);
      console.log('[TIP] User:', address);
      console.log('[TIP] Contract:', DID_YOU_KNOW_CONTRACT_ADDRESS);

      sendCalls({
        calls: [
          {
            to: DID_YOU_KNOW_CONTRACT_ADDRESS as `0x${string}`,
            data,
          },
        ],
      });

      console.log('[TIP] Transaction sent!');
    } catch (error) {
      console.error('[TIP] Error:', error);
    }
  };

  // Show loading state while refetching after confirmation
  const [isRefetchingData, setIsRefetchingData] = useState(false);

  useEffect(() => {
    if (isConfirmed && !isRefetchingData) {
      setIsRefetchingData(true);
    }
    if (!isConfirmed && isRefetchingData && !callsId) {
      setIsRefetchingData(false);
    }
  }, [isConfirmed, isRefetchingData, callsId]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.greeting}>
            {userContext?.user?.pfpUrl && (
              <Image
                src={userContext.user.pfpUrl}
                alt="Profile"
                width={48}
                height={48}
                style={{
                  borderRadius: '50%',
                  marginRight: '12px',
                  objectFit: 'cover',
                  border: '2px solid #FF6B35'
                }}
              />
            )}
            <div>
              <h1 className={styles.welcomeText}>Welcome back,</h1>
              <h2 className={styles.username}>
                {userContext?.user?.displayName || userContext?.user?.username || userData.username || 'Crypto Explorer'}!
              </h2>
            </div>
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

        {/* Did You Know Section */}
        {isContractDeployed && (
          <div style={{
            marginTop: '20px',
            marginBottom: '20px',
            padding: '20px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '16px',
            border: '2px solid #0ea5e9',
            boxShadow: '0 4px 12px rgba(14,165,233,0.15)'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0369a1' }}>
                💡 Web3 Wisdom
              </h3>
            </div>

            <div style={{
              marginBottom: '15px',
              padding: '16px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #bae6fd',
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center',
              transition: 'opacity 0.2s ease-in-out',
              opacity: isFading ? 0 : 1
            }}>
              <p style={{ margin: 0, lineHeight: '1.6', color: '#1e293b', fontSize: '14px' }}>
                {currentFact.fact}
              </p>
            </div>

            <div style={{
              fontSize: '11px',
              color: '#64748b',
              marginBottom: '12px',
              fontWeight: '600',
              transition: 'opacity 0.2s ease-in-out',
              opacity: isFading ? 0 : 1
            }}>
              Category: {currentFact.category}
            </div>

            <button
              onClick={handleAcknowledgeTip}
              disabled={isAcknowledging || isConfirming || !isConnected || isRefetchingData}
              style={{
                width: '100%',
                padding: '14px',
                background: isConfirmed
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                borderRadius: '12px',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: (isAcknowledging || isConfirming || !isConnected || isRefetchingData) ? 'not-allowed' : 'pointer',
                opacity: (isAcknowledging || isConfirming || isRefetchingData) ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(14,165,233,0.25)',
              }}
            >
              {!isConnected ? 'CONNECT WALLET' :
               isAcknowledging ? 'SIGNING...' :
               isConfirming ? 'SAVING ON-CHAIN...' :
               isRefetchingData ? 'LOADING...' :
               isConfirmed ? 'SAVED ✅' :
               'GOT IT! (FREE)'}
            </button>

            {isConfirmed && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                background: '#d1fae5',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#065f46',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                <div style={{ marginBottom: '5px' }}>🎉 Fact acknowledged on-chain!</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>Loading your next fact...</div>
              </div>
            )}

            {acknowledgeError && (
              <div style={{
                marginTop: '10px',
                padding: '8px',
                background: '#fee2e2',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#991b1b',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                ❌ Error: {typeof acknowledgeError === 'object' && 'message' in acknowledgeError ? String(acknowledgeError.message) : 'Transaction failed'}
              </div>
            )}


          </div>
        )}

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
            New questions available tomorrow
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
