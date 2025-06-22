import React from 'react';
import { Rank, Difficulty, GameMode } from '../types';
import { formatTime } from '../utils/game';

interface GameOverProps {
  playerName: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  rank: Rank;
  difficulty: Difficulty;
  gameMode: GameMode;
  onRestart: () => void;
  onMainMenu: () => void;
  winner?: string; // For battle mode
}

const GameOver: React.FC<GameOverProps> = ({
  playerName,
  score,
  correctAnswers,
  totalQuestions,
  timeTaken,
  rank,
  difficulty,
  gameMode,
  onRestart,
  onMainMenu,
  winner,
}) => {
  // Calculate accuracy correctly based on correct answers and total questions
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  const getRankClass = (rank: Rank): string => {
    switch (rank) {
      case 'bronze': return 'text-amber-700';
      case 'silver': return 'text-gray-400';
      case 'gold': return 'text-yellow-500';
      case 'platinum': return 'text-cyan-400';
      default: return '';
    }
  };
  
  const getDifficultyLabel = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'integers': return 'Integers';
      case 'rational': return 'Rational Numbers';
      case 'complex': return 'Complex Problems';
      default: return 'Unknown';
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Game Over</h1>
      
      {gameMode === 'battle' && winner && (
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">
            {winner === playerName ? 'You Won! 🏆' : `${winner} Won! 🏆`}
          </h2>
        </div>
      )}
      
      <div className="w-full mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-medium">Player:</span>
          <span>{playerName}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="font-medium">Score:</span>
          <span className="font-bold">{score}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="font-medium">Correct Answers:</span>
          <span>{correctAnswers} / {totalQuestions}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="font-medium">Accuracy:</span>
          <span>{accuracy}%</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="font-medium">Time:</span>
          <span>{formatTime(timeTaken)}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="font-medium">Difficulty:</span>
          <span>{getDifficultyLabel(difficulty)}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="font-medium">Rank:</span>
          <span className={`font-bold ${getRankClass(rank)}`}>
            {rank.charAt(0).toUpperCase() + rank.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          onClick={onRestart}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Play Again
        </button>
        
        <button
          onClick={onMainMenu}
          className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};

export default GameOver;