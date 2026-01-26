"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useComposeCast } from '@coinbase/onchainkit/minikit';
import { useSendCalls, useAccount, useCapabilities } from 'wagmi';
import { Attribution } from 'ox/erc8021';
import { encodeFunctionData } from 'viem';
import { base } from 'wagmi/chains';
import { minikitConfig } from "../../minikit.config";
import { CHECKIN_CONTRACT_ABI, CHECKIN_CONTRACT_ADDRESS } from "../contracts/checkInContract";
import BottomNav from "../components/BottomNav";
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
  const { address } = useAccount();
  const { data: capabilities } = useCapabilities({ account: address });
  const [transactionSent, setTransactionSent] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

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
      setTransactionError(null);

      // Encode the checkIn function call
      const checkInData = encodeFunctionData({
        abi: CHECKIN_CONTRACT_ABI,
        functionName: 'checkIn',
        args: [],
      });

      // Check if paymaster is supported
      const baseCapabilities = capabilities?.[base.id];
      const supportsPaymaster = baseCapabilities?.paymasterService?.supported;

      // Build capabilities object
      const txCapabilities: any = {
        dataSuffix: {
          value: DATA_SUFFIX,
          optional: true,
        },
      };

      // Only add paymaster if supported
      if (supportsPaymaster && process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY) {
        txCapabilities.paymasterService = {
          url: `https://api.developer.coinbase.com/rpc/v1/base/${process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}`,
        };
      }

      // Send transaction with capabilities
      await sendCalls({
        calls: [
          {
            to: CHECKIN_CONTRACT_ADDRESS,
            value: BigInt(0),
            data: checkInData,
          },
        ],
        capabilities: txCapabilities,
      });

      setTransactionSent(true);
      setTransactionPending(false);
    } catch (error) {
      console.error("Error claiming achievement:", error);
      setTransactionPending(false);
      setTransactionError('Transaction failed. You may have already checked in today, or there was a network error. Your score is still saved!');
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
            padding: '24px',
            background: 'linear-gradient(135deg, #fff8f0 0%, #ffe8dd 100%)',
            borderRadius: '20px',
            border: '2px solid #FF6B35',
            boxShadow: '0 10px 30px rgba(255,107,53,0.15)'
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
                padding: '18px 30px',
                background: transactionPending ? 'linear-gradient(135deg, #ccc 0%, #aaa 100%)' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700',
                cursor: transactionPending ? 'not-allowed' : 'pointer',
                width: '100%',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: transactionPending ? 'none' : '0 10px 40px rgba(40,167,69,0.3)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: 'var(--font-poppins), sans-serif',
              }}
            >
              {transactionPending ? 'CHECKING IN...' : 'CLAIM YOUR DAILY CHECK-IN'}
            </button>
          )}

          {transactionSent && (
            <div style={{
              marginTop: '15px',
              padding: '20px',
              background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
              borderRadius: '16px',
              border: '2px solid #28a745',
              textAlign: 'center',
              color: '#155724',
              fontWeight: '700',
              boxShadow: '0 10px 30px rgba(40,167,69,0.15)',
              fontSize: '16px',
              fontFamily: 'var(--font-poppins), sans-serif',
              animation: 'scaleIn 0.4s ease-out'
            }}>
              ✅ Daily Check-In Complete! Streak Recorded Onchain!
            </div>
          )}

          {transactionError && (
            <div style={{
              marginTop: '15px',
              padding: '16px',
              background: '#fff3cd',
              borderRadius: '12px',
              border: '2px solid #ffc107',
              textAlign: 'center',
              color: '#856404',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              ⚠️ {transactionError}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
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
        <BottomNav />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
