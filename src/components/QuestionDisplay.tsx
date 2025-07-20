import React from 'react';

interface Question {
  question: string;
  options: (string | number)[];
  correctAnswer: string | number;
}

interface QuestionDisplayProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  onAnswer,
}) => {
  const handleAnswer = (answer: string | number) => {
    onAnswer(answer === question.correctAnswer);
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{question.question}</h2>
      <div className="grid grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="p-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionDisplay;
