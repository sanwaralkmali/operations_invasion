import React, { useState } from 'react';
import { Question } from '../types';

interface QuestionDisplayProps {
  question: Question;
  onAnswer: (answer: number | string) => void;
  disabled?: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, onAnswer, disabled = false }) => {
  const [selectedOption, setSelectedOption] = useState<number | string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [showOptions, setShowOptions] = useState<boolean>(true);
  
  const handleOptionClick = (option: number | string) => {
    if (disabled) return;
    
    setSelectedOption(option);
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
    setShowOptions(!showOptions);
    setTypedAnswer('');
    setSelectedOption(null);
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
              className={`answer-option ${selectedOption === option ? 'ring-2 ring-blue-500' : ''}`}
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
      
      {/* General Hint */}
      <div className="mt-6 text-center text-gray-600">
        <p>Tip: Break down complex problems into smaller steps.</p>
        <p>Take your time and double-check your work!</p>
      </div>
    </div>
  );
};

export default QuestionDisplay;