import React from 'react';
import { Player } from '../types';

interface PlayerStatsProps {
  player: Player;
  isCurrentTurn?: boolean;
  showAnimation?: 'attack' | 'shield' | null;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ 
  player, 
  isCurrentTurn = false,
  showAnimation = null 
}) => {
  // Render hearts for lives
  const renderLives = () => {
    const hearts = [];
    // Assume max 3 lives for all players
    for (let i = 0; i < 3; i++) {
      if (i < player.lives) {
        // Full heart
        hearts.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        );
      } else {
        // Empty heart
        hearts.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        );
      }
    }
    return hearts;
  };
  
  return (
    <div 
      className={`relative p-4 rounded-lg ${isCurrentTurn ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' : 'bg-gray-100 dark:bg-gray-800'} transition-all duration-300`}
    >
      {/* Attack animation */}
      {showAnimation === 'attack' && (
        <div className="absolute inset-0 attack-animation rounded-lg"></div>
      )}
      
      {/* Shield animation */}
      {showAnimation === 'shield' && (
        <div className="absolute inset-0 shield-animation rounded-lg"></div>
      )}
      
      <div className="relative z-10"> {/* Keep content above animations */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{player.name}</h3>
          <div className="text-xl font-bold">{player.score}</div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex">{renderLives()}</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;