'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Question } from '@/types';
import QuestionDisplay from '@/components/QuestionDisplay';
import PlayerStats from '@/components/PlayerStats';
import GameOver from '@/components/GameOver';
import ProgressBar from '@/components/ProgressBar';

const QuizPage = () => {
  const { skill } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState('easy');
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/questions/${skill}.json`);
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    if (skill) {
      fetchQuestions();
    }
  }, [skill]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleAnswer(false);
    }
    if (!gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, gameOver]);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prevScore) => prevScore + 10);
    } else {
      setLives((prevLives) => prevLives - 1);
    }

    if (lives === 1) {
      setGameOver(true);
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setTimeLeft(10);
    }
  };

  const handlePlayAgain = () => {
    setScore(0);
    setLives(3);
    setCurrentQuestionIndex(0);
    setGameOver(false);
    setTimeLeft(10);
  };

  if (gameOver) {
    return <GameOver score={score} onPlayAgain={handlePlayAgain} />;
  }

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-2xl p-4">
        <PlayerStats score={score} lives={lives} level={currentQuestion.level} />
        <div className="mt-4">
          <ProgressBar progress={(timeLeft / 10) * 100} />
        </div>
        <div className="mt-4">
          <QuestionDisplay
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
