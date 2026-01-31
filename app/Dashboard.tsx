import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
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
}

export default function Dashboard({ userData, onStartQuiz }: DashboardProps) {
  const playedToday = hasPlayedToday(userData);
  const { address, isConnected } = useAccount();

  // Did You Know state
  const [currentFact, setCurrentFact] = useState(DID_YOU_KNOW_FACTS[0]);
  const [callsId, setCallsId] = useState<string>();

  const isContractDeployed = DID_YOU_KNOW_CONTRACT_ADDRESS.length === 42 && DID_YOU_KNOW_CONTRACT_ADDRESS.startsWith('0x');

  // Get total acknowledged count (this works)
  const { data: totalAcknowledged, refetch: refetchTotalAcknowledged } = useReadContract({
    address: DID_YOU_KNOW_CONTRACT_ADDRESS as `0x${string}`,
    abi: DID_YOU_KNOW_CONTRACT_ABI,
    functionName: 'totalAcknowledged',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isContractDeployed,
    },
  });

  // Use the public mapping hasAcknowledged directly
  const { data: hasAcknowledgedCurrent, error: fetchFactsError } = useReadContract({
    address: DID_YOU_KNOW_CONTRACT_ADDRESS as `0x${string}`,
    abi: DID_YOU_KNOW_CONTRACT_ABI,
    functionName: 'hasAcknowledged',
    args: address ? [address, BigInt(currentFact.id)] : undefined,
    query: {
      enabled: !!address && isContractDeployed,
    },
  });

  // Debug contract read
  useEffect(() => {
    console.log('[CONTRACT] Reading contract for fact:', currentFact.id);
    console.log('[CONTRACT] Address:', address);
    console.log('[CONTRACT] Has acknowledged current?:', hasAcknowledgedCurrent);
    console.log('[CONTRACT] Total acknowledged:', totalAcknowledged);
    console.log('[CONTRACT] Error:', fetchFactsError);
  }, [hasAcknowledgedCurrent, totalAcknowledged, fetchFactsError, address, currentFact.id]);

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

  // Log acknowledge errors and show on screen
  useEffect(() => {
    if (acknowledgeError) {
      console.error('[FACT] Error:', acknowledgeError);
      if (acknowledgeError instanceof Error) {
        setDebugMessage(`❌ ERROR: ${acknowledgeError.message}`);
      } else {
        setDebugMessage(`❌ ERROR: Transaction failed`);
      }
    }
  }, [acknowledgeError]);

  // Manually find next unacknowledged fact when current one is acknowledged
  const findNextUnacknowledgedFact = useCallback(async () => {
    if (!address) return;

    console.log('[FACT] Finding next unacknowledged fact...');

    // Try each fact starting from 0
    for (let i = 0; i < 20; i++) {
      try {
        // Skip the current fact we just acknowledged
        if (i === currentFact.id) continue;

        // We'll just cycle through facts in order
        console.log('[FACT] Trying fact:', i);
        setCurrentFact(DID_YOU_KNOW_FACTS[i]);
        return;
      } catch (err) {
        console.error('[FACT] Error checking fact', i, err);
      }
    }

    // If all facts checked, start from beginning
    console.log('[FACT] All facts checked, showing fact 0');
    setCurrentFact(DID_YOU_KNOW_FACTS[0]);
  }, [address, currentFact.id]);

  const isConfirmed = callsStatus?.status === 'success';

  // Update debug message based on transaction status
  useEffect(() => {
    if (isAcknowledging) {
      setDebugMessage('⏳ Waiting for wallet approval...');
    } else if (isConfirming) {
      setDebugMessage('⏳ Confirming transaction on blockchain...');
    } else if (isConfirmed) {
      setDebugMessage('🎉 Success! Loading next fact...');
    }
  }, [isAcknowledging, isConfirming, isConfirmed]);

  // When transaction is confirmed, refetch data and load next fact
  useEffect(() => {
    if (isConfirmed) {
      console.log('[FACT] Transaction confirmed, loading next fact...');

      const loadNextFact = async () => {
        // Wait 2 seconds for blockchain to update
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Refetch total count
        await refetchTotalAcknowledged();

        // Load next fact
        await findNextUnacknowledgedFact();

        // Clear transaction state
        setTimeout(() => {
          console.log('[FACT] Clearing transaction state');
          setCallsId(undefined);
        }, 1000);
      };

      loadNextFact();
    }
  }, [isConfirmed, refetchTotalAcknowledged, findNextUnacknowledgedFact]);

  const handleAcknowledgeFact = async () => {
    setDebugMessage('');

    if (!isConnected || !address) {
      setDebugMessage('❌ Wallet not connected');
      return;
    }

    // Double-check we haven't already acknowledged this fact
    if (hasAcknowledgedCurrent === true) {
      setDebugMessage(`❌ Already acknowledged fact #${currentFact.id}`);
      return;
    }

    try {
      setDebugMessage(`🚀 Acknowledging fact #${currentFact.id}...`);

      const data = encodeFunctionData({
        abi: DID_YOU_KNOW_CONTRACT_ABI,
        functionName: 'acknowledgeFact',
        args: [BigInt(currentFact.id)],
      });

      console.log('[FACT] Calling sendCalls for fact:', currentFact.id);
      console.log('[FACT] User:', address);
      console.log('[FACT] Contract:', DID_YOU_KNOW_CONTRACT_ADDRESS);

      sendCalls({
        calls: [
          {
            to: DID_YOU_KNOW_CONTRACT_ADDRESS as `0x${string}`,
            data,
          },
        ],
      });

      setDebugMessage(`✅ Transaction sent! Waiting for approval...`);
    } catch (error) {
      console.error('[FACT] Error:', error);
      if (error instanceof Error) {
        setDebugMessage(`❌ Error: ${error.message}`);
      } else {
        setDebugMessage(`❌ Error: ${JSON.stringify(error)}`);
      }
    }
  };

  // Show loading state while refetching after confirmation
  const [isRefetchingData, setIsRefetchingData] = useState(false);
  const [debugMessage, setDebugMessage] = useState<string>('');

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
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0369a1' }}>
                💡 Did You Know? {hasAcknowledgedCurrent && '⚠️'}
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                {Number(totalAcknowledged || 0)}/20 Facts
              </span>
            </div>

            {hasAcknowledgedCurrent && (
              <div style={{
                marginBottom: '10px',
                padding: '8px',
                background: '#fef3c7',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#92400e',
                fontWeight: '600'
              }}>
                ⚠️ You already acknowledged this fact. Refresh page to see a new one.
              </div>
            )}

            <div style={{
              marginBottom: '15px',
              padding: '16px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #bae6fd',
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <p style={{ margin: 0, lineHeight: '1.6', color: '#1e293b', fontSize: '14px' }}>
                {currentFact.fact}
              </p>
            </div>

            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px', fontWeight: '600' }}>
              Category: {currentFact.category}
            </div>

            {hasAcknowledgedCurrent === true ? (
              <button
                onClick={() => {
                  console.log('[FACT] Manual load next fact requested');
                  findNextUnacknowledgedFact();
                  setDebugMessage('🔄 Loading next fact...');
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '12px',
                  border: 'none',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
                }}
              >
                ✅ ACKNOWLEDGED - SHOW NEXT FACT
              </button>
            ) : (
              <button
                onClick={handleAcknowledgeFact}
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
                 isAcknowledging ? 'WAITING FOR APPROVAL...' :
                 isConfirming ? 'CONFIRMING...' :
                 isRefetchingData ? 'LOADING NEXT FACT...' :
                 isConfirmed ? 'ACKNOWLEDGED ✅' :
                 'ACKNOWLEDGE (FREE!)'}
              </button>
            )}

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

            {/* Debug message */}
            {debugMessage && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                background: debugMessage.includes('❌') ? '#fee2e2' : debugMessage.includes('🎉') ? '#d1fae5' : '#fef3c7',
                borderRadius: '8px',
                fontSize: '12px',
                color: debugMessage.includes('❌') ? '#991b1b' : debugMessage.includes('🎉') ? '#065f46' : '#92400e',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {debugMessage}
              </div>
            )}

            {/* Debug info - shows acknowledged facts */}
            <div style={{
              marginTop: '10px',
              padding: '8px',
              background: '#f3f4f6',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#374151',
            }}>
              <div><strong>📋 Current Fact ID:</strong> {currentFact.id}</div>
              <div><strong>📊 Total Acknowledged:</strong> {totalAcknowledged ? String(totalAcknowledged) : '0'} / 20</div>
              <div><strong>🔍 This Fact Status:</strong> {hasAcknowledgedCurrent === true ? 'Already Done ✅' : hasAcknowledgedCurrent === false ? 'Not Done Yet' : 'Checking...'}</div>
              {isConnected && <div><strong>👛 Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</div>}
              {fetchFactsError && <div style={{ color: '#dc3545' }}><strong>❌ Error:</strong> {String(fetchFactsError).slice(0, 100)}</div>}
            </div>
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
