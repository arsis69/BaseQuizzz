"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useComposeCast } from '@coinbase/onchainkit/minikit';
import { useAccount, useSendCalls, useCallsStatus } from 'wagmi';
import { encodeFunctionData } from 'viem';
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
  const [txStatus, setTxStatus] = useState<string>('');
  const [txError, setTxError] = useState<string>('');
  const [callsId, setCallsId] = useState<string | null>(null);

  const { composeCastAsync } = useComposeCast();
  const { address, isConnected } = useAccount();

  const { sendCalls, isPending: isSending } = useSendCalls({
    mutation: {
      onSuccess: (result) => {
        console.log('sendCalls success, result:', result);
        setCallsId(result.id);
        setTxStatus('pending');
        setTxError('');
      },
      onError: (error) => {
        console.error('sendCalls error:', error);
        setTxStatus('error');
        setTxError(error.message || JSON.stringify(error));
      },
    },
  });

  // Check transaction status
  const { data: callsStatus } = useCallsStatus({
    id: callsId as string,
    query: {
      enabled: !!callsId,
      refetchInterval: (data) => {
        if (data.state.data?.status === 'CONFIRMED') return false;
        return 1000;
      },
    },
  });

  useEffect(() => {
    if (callsStatus?.status === 'CONFIRMED') {
      setTxStatus('success');
      setTxError('');
    }
  }, [callsStatus]);

  // Update countdown timer every second (TEST MODE: 1 minute countdown)
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const secondsRemaining = 60 - now.getSeconds();
      setTimeToNext(`00:00:${secondsRemaining.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

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
      }
    } catch (error) {
      console.error("Error sharing cast:", error);
    }
  };

  const handleCheckIn = () => {
    if (!isConnected || !address) {
      setTxError('Wallet not connected');
      setTxStatus('error');
      return;
    }

    setTxStatus('sending');
    setTxError('');

    // Encode the checkIn function call
    const data = encodeFunctionData({
      abi: CHECKIN_CONTRACT_ABI,
      functionName: 'checkIn',
      args: [],
    });

    sendCalls({
      calls: [
        {
          to: CHECKIN_CONTRACT_ADDRESS,
          data: data,
        },
      ],
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.successMessage}>
          <div style={{ fontSize: '72px', marginBottom: '20px', textAlign: 'center' }}>
            {performance.emoji}
          </div>

          <h1 className={styles.title}>Quiz Complete!</h1>

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

          <div style={{ marginTop: '15px', width: '100%' }}>
            <button
              onClick={handleCheckIn}
              disabled={isSending || txStatus === 'pending' || txStatus === 'success'}
              style={{
                width: '100%',
                padding: '18px 30px',
                background: txStatus === 'success'
                  ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                  : txStatus === 'error'
                  ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                  : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(40,167,69,0.3)',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isSending || txStatus === 'pending' || txStatus === 'success' ? 'not-allowed' : 'pointer',
                opacity: isSending || txStatus === 'pending' ? 0.7 : 1,
              }}
            >
              {isSending || txStatus === 'sending'
                ? 'PREPARING...'
                : txStatus === 'pending'
                ? 'CONFIRMING...'
                : txStatus === 'success'
                ? 'CHECK-IN COMPLETE!'
                : 'CLAIM YOUR DAILY CHECK-IN'}
            </button>

            {/* Status display */}
            {(txStatus || txError) && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                background: txStatus === 'success' ? '#d4edda' : txStatus === 'error' ? '#f8d7da' : '#fff3cd',
                borderRadius: '8px',
                fontSize: '12px',
                wordBreak: 'break-all'
              }}>
                <strong>Status:</strong> {txStatus}
                {txError && <div style={{ color: '#721c24', marginTop: '5px' }}><strong>Error:</strong> {txError}</div>}
                {isConnected && <div style={{ marginTop: '5px' }}><strong>Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</div>}
              </div>
            )}
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
