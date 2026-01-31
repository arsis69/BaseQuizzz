"use client";

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useComposeCast } from '@coinbase/onchainkit/minikit';
import { useAccount, useReadContract, useChainId } from 'wagmi';
import { useSendCalls, useCallsStatus } from 'wagmi/experimental';
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

  const { composeCastAsync } = useComposeCast();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Check if user can check in today
  const { data: canCheckIn, isLoading: isCheckingEligibility } = useReadContract({
    address: CHECKIN_CONTRACT_ADDRESS,
    abi: CHECKIN_CONTRACT_ABI,
    functionName: 'canCheckInToday',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const [callsId, setCallsId] = useState<string>();

  const {
    sendCalls,
    data: sendCallsId,
    isPending: isWriting,
    error: writeError
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

  // Update callsId when sendCalls returns an ID
  useEffect(() => {
    if (sendCallsId) {
      // Extract the ID string from the sendCallsId response
      const id = typeof sendCallsId === 'string' ? sendCallsId : sendCallsId?.id;
      if (id) {
        setCallsId(id);
      }
    }
  }, [sendCallsId]);

  const isConfirmed = callsStatus?.status === 'success';
  const txHash = callsStatus?.receipts?.[0]?.transactionHash;

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

  const handleCheckIn = async () => {
    if (!isConnected || !address) {
      console.error('[CHECKIN] Wallet not connected');
      return;
    }

    try {
      console.log('[CHECKIN] Starting check-in with sendCalls...');
      console.log('[CHECKIN] Contract:', CHECKIN_CONTRACT_ADDRESS);
      console.log('[CHECKIN] User address:', address);
      console.log('[CHECKIN] Chain ID:', chainId);

      // Encode the checkIn function call
      const data = encodeFunctionData({
        abi: CHECKIN_CONTRACT_ABI,
        functionName: 'checkIn',
      });

      console.log('[CHECKIN] Encoded data:', data);

      // Send the call using sendCalls
      sendCalls({
        calls: [
          {
            to: CHECKIN_CONTRACT_ADDRESS,
            data,
          },
        ],
      });
    } catch (error) {
      console.error('[CHECKIN] Error:', error);
    }
  };

  const getButtonText = () => {
    if (isWriting) return 'WAITING FOR APPROVAL...';
    if (isConfirming) return 'CONFIRMING...';
    if (isConfirmed) return 'CHECK-IN COMPLETE! ✅';
    if (canCheckIn === false) return 'ALREADY CHECKED IN TODAY ✓';
    if (!isConnected) return 'CONNECT WALLET';
    return 'CLAIM YOUR DAILY CHECK-IN (FREE!)';
  };

  const getStatusInfo = () => {
    if (writeError) {
      console.error('[CHECKIN] Write error:', writeError);
      return { type: 'error', message: writeError.message };
    }
    if (isConfirmed && txHash) {
      console.log('[CHECKIN] Transaction confirmed:', txHash);
      return { type: 'success', message: `Transaction confirmed! View on BaseScan: https://basescan.org/tx/${txHash}` };
    }
    if (callsStatus?.status === 'pending') {
      console.log('[CHECKIN] Transaction pending, ID:', callsId);
      return { type: 'pending', message: `Transaction pending (ID: ${callsId})` };
    }
    if (callsStatus?.status === 'failure') {
      console.log('[CHECKIN] Transaction failed');
      return { type: 'error', message: 'Transaction failed. Please try again.' };
    }
    if (sendCallsId) {
      console.log('[CHECKIN] Calls sent, ID:', sendCallsId);
      return { type: 'pending', message: `Waiting for confirmation... (ID: ${sendCallsId})` };
    }
    return null;
  };

  const statusInfo = getStatusInfo();

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
              disabled={isWriting || isConfirming || isConfirmed || !isConnected || canCheckIn === false}
              style={{
                width: '100%',
                padding: '18px 30px',
                background: isConfirmed
                  ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                  : writeError
                  ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                  : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(40,167,69,0.3)',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isWriting || isConfirming || isConfirmed ? 'not-allowed' : 'pointer',
                opacity: isWriting || isConfirming ? 0.7 : 1,
              }}
            >
              {getButtonText()}
            </button>

            {/* Status display */}
            {(statusInfo || !isConnected || isCheckingEligibility) && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                background: statusInfo?.type === 'success' ? '#d4edda' : statusInfo?.type === 'error' ? '#f8d7da' : '#fff3cd',
                borderRadius: '8px',
                fontSize: '12px',
                wordBreak: 'break-all'
              }}>
                {!isConnected && <div><strong>Wallet not connected</strong></div>}
                {isConnected && (
                  <>
                    <div><strong>Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</div>
                    <div><strong>Network:</strong> {chainId === 8453 ? 'Base Mainnet ✅' : `Chain ${chainId} ⚠️ (Should be Base: 8453)`}</div>
                    <div><strong>Contract:</strong> {CHECKIN_CONTRACT_ADDRESS.slice(0, 6)}...{CHECKIN_CONTRACT_ADDRESS.slice(-4)}</div>
                    {canCheckIn !== undefined && (
                      <div><strong>Can Check In:</strong> {canCheckIn ? 'Yes ✅' : 'Already checked in today ❌'}</div>
                    )}
                  </>
                )}
                {statusInfo && (
                  <div style={{ marginTop: '5px', color: statusInfo.type === 'error' ? '#721c24' : 'inherit' }}>
                    <strong>{statusInfo.type === 'error' ? 'Error' : 'Status'}:</strong> {statusInfo.message}
                  </div>
                )}
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
