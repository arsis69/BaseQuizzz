"use client";
import { useState } from "react";
import { getDailyQuestions } from "../quizData";
import styles from "../page.module.css";

export default function ScreenshotPage() {
  const questions = getDailyQuestions();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.waitlistForm}>
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
