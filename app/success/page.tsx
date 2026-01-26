"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useComposeCast } from '@coinbase/onchainkit/minikit';
import { useSendCalls } from 'wagmi';
import { Attribution } from 'ox/erc8021';
import { minikitConfig } from "../../minikit.config";
import styles from "./page.module.css";

// Builder Code attribution suffix
const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_7tz4s96h"],
});

function SuccessContent() {
  const searchParams = useSearchParams();
  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '5');
  const percentage = Math.round((score / total) * 100);
  const [timeToNext, setTimeToNext] = useState('');

  const { composeCastAsync } = useComposeCast();
  const { sendCalls } = useSendCalls();
  const [transactionSent, setTransactionSent] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);

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

  const handleShare = async () => {
    try {
      const text = `I just scored ${score}/${total} (${percentage}%) on the ${minikitConfig.miniapp.name}! ${performance.emoji} Can you beat my score? `;

      const result = await composeCastAsync({
        text: text,
        embeds: [process.env.NEXT_PUBLIC_URL || ""]
      });

      if (result?.cast) {
        console.log("Cast created successfully:", result.cast.hash);
      } else {
        console.log("User cancelled the cast");
      }
    } catch (error) {
      console.error("Error sharing cast:", error);
    }
  };

  const handleClaimAchievement = async () => {
    try {
      setTransactionPending(true);

      // Send a simple transaction with builder code attribution
      // This is a minimal value transaction to record the achievement onchain
      await sendCalls({
        calls: [
          {
            to: "0x0000000000000000000000000000000000000000", // Null address for achievement record
            value: BigInt(0), // No value, just attribution
            data: "0x" as `0x${string}`, // Empty data
          },
        ],
        capabilities: {
          dataSuffix: {
            value: DATA_SUFFIX,
            optional: true,
          },
        },
      });

      setTransactionSent(true);
      setTransactionPending(false);
    } catch (error) {
      console.error("Error claiming achievement:", error);
      setTransactionPending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.successMessage}>
          {/* Score Display */}
          <div style={{
            fontSize: '72px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {performance.emoji}
          </div>

          <h1 className={styles.title}>Quiz Complete!</h1>

          {/* Score */}
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            margin: '20px 0',
            color: percentage >= 60 ? '#28a745' : percentage >= 40 ? '#FFA500' : '#dc3545'
          }}>
            {score}/{total}
          </div>

          <p className={styles.subtitle}>
            {performance.text}
            <br />
            You scored {percentage}% on the crypto basics quiz!
          </p>

          {/* Next Quiz Timer */}
          <div style={{
            marginTop: '25px',
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#fff8f0',
            borderRadius: '12px',
            border: '2px solid #FF6B35',
            boxShadow: '0 4px 12px rgba(255,107,53,0.2)'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666', fontWeight: '600' }}>
              NEXT QUIZ IN
            </p>
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#FF6B35',
              fontFamily: 'monospace',
              letterSpacing: '2px'
            }}>
              {timeToNext || '00:00:00'}
            </div>
          </div>

          <button onClick={handleShare} className={styles.shareButton}>
            SHARE YOUR SCORE
          </button>

          {!transactionSent && (
            <button
              onClick={handleClaimAchievement}
              disabled={transactionPending}
              style={{
                marginTop: '15px',
                padding: '16px 30px',
                backgroundColor: transactionPending ? '#ccc' : '#28a745',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: transactionPending ? 'not-allowed' : 'pointer',
                width: '100%',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(40,167,69,0.3)',
              }}
              onMouseEnter={(e) => {
                if (!transactionPending) {
                  e.currentTarget.style.backgroundColor = '#218838';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!transactionPending) {
                  e.currentTarget.style.backgroundColor = '#28a745';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {transactionPending ? 'CLAIMING...' : '🏆 CLAIM ACHIEVEMENT ONCHAIN'}
            </button>
          )}

          {transactionSent && (
            <div style={{
              marginTop: '15px',
              padding: '16px',
              backgroundColor: '#d4edda',
              borderRadius: '12px',
              border: '2px solid #28a745',
              textAlign: 'center',
              color: '#155724',
              fontWeight: 'bold'
            }}>
              ✅ Achievement Claimed Onchain!
            </div>
          )}

          <button
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '15px',
              padding: '12px 30px',
              backgroundColor: 'transparent',
              border: '2px solid #FF6B35',
              borderRadius: '12px',
              color: '#FF6B35',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FF6B35';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#FF6B35';
            }}
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Success() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.successMessage}>
            <h1 className={styles.title}>Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
