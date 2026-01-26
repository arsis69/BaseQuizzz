"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useComposeCast } from '@coinbase/onchainkit/minikit';
import { Transaction, TransactionButton, TransactionStatus, TransactionStatusLabel, TransactionStatusAction } from '@coinbase/onchainkit/transaction';
import { minikitConfig } from "../../minikit.config";
import { CHECKIN_CONTRACT_ADDRESS, CHECKIN_CONTRACT_ABI } from "../contracts/checkInContract";
import BottomNav from "../components/BottomNav";
import styles from "./page.module.css";

function SuccessContent() {
  const searchParams = useSearchParams();
  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '5');
  const percentage = Math.round((score / total) * 100);
  const [timeToNext, setTimeToNext] = useState('');

  const { composeCastAsync } = useComposeCast();

  // Define the transaction calls for the check-in contract
  const calls = [
    {
      address: CHECKIN_CONTRACT_ADDRESS,
      abi: CHECKIN_CONTRACT_ABI,
      functionName: 'checkIn',
      args: [],
    },
  ];

  // Update countdown timer every second (TEST MODE: 1 minute countdown)
  useEffect(() => {
    const updateTimer = () => {
      // TEST MODE: Show countdown to next minute
      const now = new Date();
      const secondsRemaining = 60 - now.getSeconds();

      setTimeToNext(`00:00:${secondsRemaining.toString().padStart(2, '0')}`);

      // Production code (uncomment for 24h reset):
      // const tomorrow = new Date(now);
      // tomorrow.setHours(24, 0, 0, 0);
      // const diff = tomorrow.getTime() - now.getTime();
      // const hours = Math.floor(diff / (1000 * 60 * 60));
      // const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      // const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      // setTimeToNext(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
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

          <div style={{
            marginTop: '15px',
            width: '100%',
          }}>
            <Transaction
              chainId={8453}
              calls={calls}
              isSponsored={true}
            >
              <div style={{
                padding: '18px 30px',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(40,167,69,0.3)',
                width: '100%',
              }}>
                <TransactionButton text="CLAIM YOUR DAILY CHECK-IN" />
              </div>
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          </div>
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
