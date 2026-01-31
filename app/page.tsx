"use client";

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import { minikitConfig } from "../minikit.config";
import { getDailyQuestions, QuizQuestion } from "./quizData";
import { getUserData, recordQuizAttempt, UserStats } from "./userData";
import Dashboard from "./Dashboard";
import styles from "./page.module.css";

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const [view, setView] = useState<'dashboard' | 'quiz'>('dashboard');
  const [userData, setUserData] = useState<UserStats | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Timeout for loading state (10 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('[DEBUG] Loading timeout reached - forcing end of loading state');
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Initialize the miniapp and load user data
  useEffect(() => {
    console.log('[DEBUG] Frame ready effect - isFrameReady:', isFrameReady);
    console.log('[DEBUG] setFrameReady function:', typeof setFrameReady);

    // Try to set frame ready, but don't fail if it errors
    try {
      if (!isFrameReady && setFrameReady) {
        console.log('[DEBUG] Calling setFrameReady');
        setFrameReady();
      }
    } catch (err) {
      console.error('[ERROR] setFrameReady failed:', err);
      // Continue anyway - don't block the app
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    // Load user data when context is available (or use default for testing)
    async function loadUserData() {
      try {
        console.log('[DEBUG] Starting loadUserData...');
        console.log('[DEBUG] Context:', context);
        console.log('[DEBUG] isFrameReady:', isFrameReady);
        setLoading(true);
        setError(null);

        let fid = 999999; // Default for local testing
        let username = 'TestUser';

        if (context?.user) {
          console.log('[DEBUG] Context user found');
          fid = context.user.fid;
          username = context.user.displayName || context.user.username || 'User';
        } else {
          console.log('[DEBUG] No context user, using defaults');
        }

        console.log('[DEBUG] FID:', fid, 'Username:', username);

        const data = await getUserData(fid, username);
        console.log('[DEBUG] User data loaded:', data);

        // Always use the username from context (not from database)
        // This ensures we show the real name, not cached "TestUser"
        if (context?.user && data.username !== username) {
          console.log('[DEBUG] Updating username from', data.username, 'to', username);
          data.username = username;
          // Import saveUserData dynamically to avoid circular dependency
          const { saveUserData } = await import('./userData');
          await saveUserData(data);
        }

        // Force the correct username in display
        if (context?.user) {
          data.username = username;
        }

        setUserData(data);
        console.log('[DEBUG] User data state set with username:', data.username);

        // Load daily questions
        const dailyQuestions = getDailyQuestions();
        console.log('[DEBUG] Daily questions:', dailyQuestions.length);
        setQuestions(dailyQuestions);
        console.log('[DEBUG] Questions state set');
      } catch (err) {
        console.error('[ERROR] Error loading user data:', err);
        console.error('[ERROR] Stack:', err instanceof Error ? err.stack : 'No stack');
        setError('Failed to load your data. Please try again.');
      } finally {
        console.log('[DEBUG] Setting loading to false');
        setLoading(false);
      }
    }

    console.log('[DEBUG] useEffect triggered, calling loadUserData');
    loadUserData();
  }, [context, isFrameReady]);

  const handleStartQuiz = () => {
    setView('quiz');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowExplanation(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent changing answer

    setSelectedAnswer(answerIndex);

    // Check if answer is correct
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    setShowExplanation(true);
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz complete - record attempt and navigate to success
      try {
        if (userData) {
          const updatedData = await recordQuizAttempt(userData, score, questions.length);
          setUserData(updatedData);
        }
        router.push(`/success?score=${score}&total=${questions.length}`);
      } catch (err) {
        console.error('Error saving quiz results:', err);
        // Still navigate to success page even if save fails
        router.push(`/success?score=${score}&total=${questions.length}`);
      }
    }
  };

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.waitlistForm}>
            <h1 className={styles.title}>Oops!</h1>
            <p className={styles.subtitle} style={{ color: '#dc3545', marginBottom: '20px' }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '16px 32px',
                backgroundColor: '#FF6B35',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255,107,53,0.3)',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !userData) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.waitlistForm}>
            <h1 className={styles.title}>Loading...</h1>
            <p className={styles.subtitle}>
              Initializing your quiz experience...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If questions didn't load, try to load them again
  if (questions.length === 0) {
    console.log('[DEBUG] Questions empty, loading again...');
    const dailyQuestions = getDailyQuestions();
    if (dailyQuestions.length > 0) {
      setQuestions(dailyQuestions);
    }
  }

  // Dashboard view
  if (view === 'dashboard') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <Dashboard userData={userData} onStartQuiz={handleStartQuiz} />
        </div>
      </div>
    );
  }

  // Quiz view
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.waitlistForm}>
          <h1 className={styles.title}>{minikitConfig.miniapp.name}</h1>

          <p className={styles.subtitle}>
            Hey {context?.user?.displayName || "there"}! Test your blockchain knowledge
          </p>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', marginBottom: '20px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#FF6B35', borderRadius: '5px', transition: 'width 0.5s ease-in-out', boxShadow: '0 2px 4px rgba(255,107,53,0.3)' }} />
          </div>

          {/* Question Counter */}
          <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666', fontWeight: '600' }}>
            Question {currentQuestion + 1} of {questions.length}
          </p>

          {/* Question */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '25px', lineHeight: '1.5', color: '#2c3e50', fontWeight: '700' }}>
              {question.question}
            </h2>

            {/* Answer Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctAnswer;
                const showResult = selectedAnswer !== null;

                let backgroundColor = '#ffffff';
                let borderColor = '#e0e0e0';
                const textColor = '#2c3e50';
                let transform = 'scale(1)';
                let boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

                if (showResult) {
                  if (isCorrect) {
                    backgroundColor = '#d4edda';
                    borderColor = '#28a745';
                    boxShadow = '0 4px 8px rgba(40,167,69,0.2)';
                  } else if (isSelected) {
                    backgroundColor = '#f8d7da';
                    borderColor = '#dc3545';
                    boxShadow = '0 4px 8px rgba(220,53,69,0.2)';
                  }
                } else if (isSelected) {
                  transform = 'scale(0.98)';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    style={{
                      padding: '16px 20px',
                      backgroundColor,
                      border: `3px solid ${borderColor}`,
                      borderRadius: '12px',
                      color: textColor,
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: selectedAnswer !== null ? 'default' : 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform,
                      boxShadow,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedAnswer === null) {
                        e.currentTarget.style.borderColor = '#FF6B35';
                        e.currentTarget.style.transform = 'translateX(8px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,107,53,0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedAnswer === null) {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && question.explanation && (
              <div style={{
                marginTop: '20px',
                padding: '18px',
                backgroundColor: '#fff8f0',
                borderRadius: '12px',
                borderLeft: '5px solid #FF6B35',
                boxShadow: '0 2px 8px rgba(255,107,53,0.15)',
                animation: 'fadeIn 0.4s ease-in'
              }}>
                <p style={{ margin: 0, lineHeight: '1.7', color: '#555', fontSize: '15px' }}>
                  💡 {question.explanation}
                </p>
              </div>
            )}

            {/* Next Button */}
            {showExplanation && (
              <button
                onClick={handleNext}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#FF6B35',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(255,107,53,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff8555';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,107,53,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF6B35';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,107,53,0.3)';
                }}
              >
                {currentQuestion < questions.length - 1 ? 'NEXT QUESTION ➜' : 'SEE RESULTS 🎉'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
