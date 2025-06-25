import { useState, useEffect, useCallback } from 'react';
import { Player, Difficulty, Question, Wave } from '../types';
import { generateWaves, formatTime, fetchQuestions } from '../utils/game';
import QuestionDisplay from './QuestionDisplay';
import ProgressBar from './ProgressBar';
import Leaderboard from './Leaderboard';
import { useNavigate } from 'react-router-dom';

interface SinglePlayerGameProps {
  player: Player;
  difficulty: Difficulty;
  onGameOver: (score: number, correctAnswers: number, totalQuestions: number, timeTaken: number) => void;
}

const SinglePlayerGame: React.FC<SinglePlayerGameProps> = ({ player, difficulty, onGameOver }) => {
  const [currentWave, setCurrentWave] = useState<number>(1);
  const [waves, setWaves] = useState<Wave[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'incorrect' | 'showing_correct_answer' | null;
    correctAnswer?: number | string;
    selectedAnswer?: number | string | null;
  }>({ status: null });
  const [gameActive, setGameActive] = useState<boolean>(true);
  const [waveComplete, setWaveComplete] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [lastAnswered, setLastAnswered] = useState<null | { isCorrect: boolean; correctAnswer: number | string; selectedAnswer: number | string | null }>(null);
  const navigate = useNavigate();
  
  const initializeGame = useCallback(async () => {
    setIsLoading(true);
    const allQuestions = await fetchQuestions(difficulty);

    if (allQuestions.length === 0) {
      // Handle error case where questions couldn't be loaded
      console.error("Failed to load questions. Cannot start game.");
      setIsLoading(false);
      // Maybe show an error message to the user
      return;
    }

    const questionData = generateWaves(allQuestions);
    
    const newWaves: Wave[] = questionData.map((questions, index) => {
      let timeLimit;
      switch (difficulty) {
        case 'rational':
          timeLimit = 25;
          break;
        case 'complex':
          timeLimit = 20;
          break;
        default: // integers
          timeLimit = 30;
      }
      timeLimit = Math.max(10, timeLimit - index * 2);

      return {
        number: index + 1,
        questions,
        timeLimit,
        completed: false
      };
    });
    
    setWaves(newWaves);
    setCurrentWave(1);
    setQuestionIndex(0);
    setScore(0);
    setLives(3);
    setStreak(0);
    setGameActive(true);
    setWaveComplete(false);
    setCorrectAnswersCount(0);
    setTotalQuestionsAnswered(0);
    setStartTime(Date.now());
    
    const firstWave = newWaves[0];
    if (firstWave && firstWave.questions.length > 0) {
      startQuestion(firstWave.questions[0], firstWave.timeLimit);
    } else {
      endGame();
    }
    setIsLoading(false);
  }, [difficulty]);

  // Initialize the game
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  // Timer effect
  useEffect(() => {
    if (!gameActive || timeLeft <= 0 || waveComplete) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, waveComplete]);
  
  // Start a new question
  const startQuestion = (question: Question, time: number) => {
    setCurrentQuestion(question);
    setTimeLeft(time);
    setWaveComplete(false);
  };
  
  // Handle answer selection
  const handleAnswer = (selectedAnswer: number | string) => {
    if (!currentQuestion || !gameActive || feedback.status) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      // Calculate points based on time left and difficulty
      let pointsEarned = 10;
      setCorrectAnswersCount(prev => prev + 1);
      
      // Bonus points for answering quickly
      const timeBonus = Math.floor(timeLeft / 5);
      pointsEarned += timeBonus;
      
      // Difficulty multiplier
      let difficultyMultiplier = 1;
      if (difficulty === 'rational') difficultyMultiplier = 1.2;
      if (difficulty === 'complex') difficultyMultiplier = 1.5;
      pointsEarned = Math.floor(pointsEarned * difficultyMultiplier);
      
      // Streak bonus
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      if (newStreak >= 3) {
        const streakMultiplier = Math.min(2, 1 + (newStreak - 3) * 0.1);
        pointsEarned = Math.floor(pointsEarned * streakMultiplier);
      }
      
      setScore(prev => prev + pointsEarned);
      setFeedback({ status: 'correct', selectedAnswer });
      setTimeout(() => {
        setFeedback({ status: null });
        setTotalQuestionsAnswered(prev => prev + 1);
        moveToNextQuestion();
      }, 2000); // 2 seconds for "Correct!"
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      
      const isGameOver = lives <= 1;
      
      setFeedback({ status: 'incorrect', selectedAnswer, correctAnswer: currentQuestion.correctAnswer });
      setTimeout(() => {
        setFeedback({ status: 'showing_correct_answer', selectedAnswer, correctAnswer: currentQuestion.correctAnswer });
        setTimeout(() => {
            if (isGameOver) {
                endGame();
            } else {
                setFeedback({ status: null });
                setTotalQuestionsAnswered(prev => prev + 1);
                moveToNextQuestion();
            }
        }, 3000); // 3s for correct answer
      }, 2000); // 2s for "Incorrect"
    }
  };
  
  // Handle time up
  const handleTimeUp = () => {
    if (!currentQuestion || feedback.status) return;
    setLives(prev => prev - 1);
    setStreak(0);
        
    const isGameOver = lives <= 1;
    
    setFeedback({ status: 'incorrect', selectedAnswer: null, correctAnswer: currentQuestion.correctAnswer });
    setTimeout(() => {
      setFeedback({ status: 'showing_correct_answer', selectedAnswer: null, correctAnswer: currentQuestion.correctAnswer });
      setTimeout(() => {
          if (isGameOver) {
              endGame();
          } else {
              setFeedback({ status: null });
              setTotalQuestionsAnswered(prev => prev + 1);
              moveToNextQuestion();
          }
      }, 3000); // 3s for correct answer
    }, 2000); // 2s for "Incorrect"
  };
  
  // Move to the next question or wave
  const moveToNextQuestion = () => {
    const currentWaveObj = waves[currentWave - 1];
    const nextQuestionIndex = questionIndex + 1;
    
    // Check if wave is complete
    if (nextQuestionIndex >= currentWaveObj.questions.length) {
      // Mark current wave as completed
      const updatedWaves = [...waves];
      updatedWaves[currentWave - 1].completed = true;
      setWaves(updatedWaves);
      
      // Check if all waves are complete
      if (currentWave >= waves.length) {
        // Game completed successfully
        endGame();
        return;
      }
      
      // Move to next wave
      setWaveComplete(true);
      
      setTimeout(() => {
        const nextWave = currentWave + 1;
        setCurrentWave(nextWave);
        setQuestionIndex(0);
        
        // Start first question of next wave
        const nextWaveObj = waves[nextWave - 1];
        startQuestion(nextWaveObj.questions[0], nextWaveObj.timeLimit);
      }, 3000);
    } else {
      // Move to next question in current wave
      setQuestionIndex(nextQuestionIndex);
      startQuestion(currentWaveObj.questions[nextQuestionIndex], currentWaveObj.timeLimit);
    }
  };
  
  // End the game
  const endGame = () => {
    setGameActive(false);

    // Delay before showing game over screen
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    onGameOver(score, correctAnswersCount, totalQuestionsAnswered, timeTaken);
  };
  
  // Calculate progress percentage for current wave
  const calculateProgress = () => {
    if (!waves.length) return 0;
    const currentWaveObj = waves[currentWave - 1];
    if (!currentWaveObj || currentWaveObj.questions.length === 0) return 0;
    return (currentWave - 1) * 100 / waves.length + (questionIndex / currentWaveObj.questions.length) * (100 / waves.length);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-bold">Loading questions...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-bold">No questions found...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 relative">
      <button
        onClick={() => navigate('/')}
        title="Exit to Main Menu"
        className="absolute top-4 right-4 bg-gray-200 hover:bg-red-500 text-gray-700 hover:text-white rounded-full p-2 shadow transition-colors z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-2xl">Loading game...</p>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Game header */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex flex-wrap justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Player</p>
                <p className="text-lg font-bold text-indigo-600">{player.name}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-lg font-bold">{score}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Lives</p>
                <p className="text-lg font-bold">{lives}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Time</p>
                <p className="text-lg font-bold">{formatTime(timeLeft)}</p>
              </div>
              <div className="w-full mt-4">
                <div className="text-center font-bold text-xl mb-2 text-indigo-600">
                  Wave {currentWave} / {waves.length}
                </div>
                <ProgressBar value={calculateProgress()} maxValue={100} />
              </div>
            </div>
          </div>
          
          {/* Wave complete message */}
          {waveComplete ? (
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Wave {currentWave} completed! Preparing next wave...
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          
          {/* Main game area */}
          <div className="bg-white rounded-lg shadow-lg p-6 relative overflow-hidden">
            
            {/* Question display */}
            {currentQuestion && (
              <QuestionDisplay 
                question={currentQuestion} 
                onAnswer={handleAnswer}
                disabled={!gameActive || waveComplete || !!feedback.status}
                feedback={feedback}
              />
            )}
          </div>
          
          {/* Streak indicator */}
          {streak >= 3 && (
            <div className="mt-4 text-center">
              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {streak} Question Streak! 🔥
              </span>
            </div>
          )}
        </div>
      )}

      {/*
      {showLeaderboard && (
        <Leaderboard 
          gameMode="single"
          onClose={() => setShowLeaderboard(false)} 
        />
      )}
      */}
    </div>
  );
};

export default SinglePlayerGame;