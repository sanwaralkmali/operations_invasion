import React, { useState, useEffect, ReactNode } from 'react';
import { Question } from '../types';

interface QuestionDisplayProps {
  question: Question;
  onAnswer: (answer: number | string) => void;
  disabled?: boolean;
  feedback: {
    status: 'correct' | 'incorrect' | 'showing_correct_answer' | null;
    correctAnswer?: number | string;
    selectedAnswer?: number | string | null;
  };
  hideFeedbackMessage?: boolean;
  feedbackMessage?: ReactNode;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, onAnswer, disabled = false, feedback, hideFeedbackMessage = false, feedbackMessage }) => {
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [showOptions, setShowOptions] = useState<boolean>(true);

  // Reset input when question changes
  useEffect(() => {
    setTypedAnswer('');
  }, [question]);
  
  const handleOptionClick = (option: number | string) => {
    if (disabled) return;
    onAnswer(option);
  };
  
  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !typedAnswer) return;
    
    const numericAnswer = parseFloat(typedAnswer);
    if (!isNaN(numericAnswer)) {
      onAnswer(numericAnswer);
    }
  };
  
  const toggleAnswerMode = () => {
    if (disabled) return;
    setShowOptions(!showOptions);
    setTypedAnswer('');
  };
  
  const getOptionClass = (option: number | string) => {
    const { status, selectedAnswer, correctAnswer } = feedback;
    let className = 'answer-option';

    if (status === null) {
      return className;
    }

    const isSelected = option === selectedAnswer;
    const isCorrect = option === correctAnswer;

    if (status === 'correct' && isSelected) {
      className += ' bg-green-200 border-green-500';
    } else if (status === 'incorrect' && isSelected) {
      className += ' bg-red-200 border-red-500';
    } else if (status === 'showing_correct_answer') {
      if (isSelected) {
         className += ' bg-red-200 border-red-500';
      }
      if (isCorrect) {
        className += ' bg-green-200 border-green-500';
      }
    }
    return className;
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">Solve the problem:</h2>
      
      {/* Operation display */}
      <div className="operation-card w-full max-w-md p-8 mb-6 flex items-center justify-center">
        <span className="text-3xl md:text-4xl font-bold">{question.question}</span>
      </div>
      
      {/* Toggle between multiple choice and typed answer */}
      <div className="mb-4">
        <button 
          onClick={toggleAnswerMode}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
          disabled={disabled}
        >
          {showOptions ? 'Type your answer instead' : 'Show multiple choice options'}
        </button>
      </div>
      
      {/* Answer options */}
      {showOptions ? (
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {question.options?.map((option, index) => (
            <div
              key={index}
              onClick={() => handleOptionClick(option)}
              className={getOptionClass(option)}
            >
              {option}
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleTypedSubmit} className="w-full max-w-md">
          <div className="flex">
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Type your answer"
              className="flex-1 p-4 border-2 border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={disabled}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-4 rounded-r-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={disabled || !typedAnswer}
            >
              Submit
            </button>
          </div>
        </form>
      )}
      
      {/* Feedback message (custom or default) */}
      {!hideFeedbackMessage && (
        feedbackMessage ? (
          <div className="mt-6">{feedbackMessage}</div>
        ) : (
          <div className="mt-6 text-center text-lg font-semibold min-h-[28px]">
            {feedback.status === 'correct' && (
                <span className="text-green-600">Correct! 🎉</span>
            )}
            {feedback.status === 'incorrect' && (
                <span className="text-red-600">Incorrect!</span>
            )}
            {feedback.status === 'showing_correct_answer' && (
                <span className="text-green-600">The correct answer is <span className="font-bold">{feedback.correctAnswer}</span>.</span>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default QuestionDisplay;