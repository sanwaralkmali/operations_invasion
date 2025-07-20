import React from 'react';

interface GameOverProps {
  score: number;
  onPlayAgain: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, onPlayAgain }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Game Over</h1>
      <p className="text-2xl mb-8">Your final score is: {score}</p>
      <button
        onClick={onPlayAgain}
        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
      >
        Play Again
      </button>
    </div>
  );
};

export default GameOver;
