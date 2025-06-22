import React from 'react';
import { LeaderboardEntry, Difficulty, Rank } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, onClose }) => {
  const sortedEntries = [...entries].sort((a, b) => b.score - a.score);
  
  const getDifficultyLabel = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'Hard';
      default: return 'Unknown';
    }
  };
  
  const getRankClass = (rank: Rank): string => {
    switch (rank) {
      case 'bronze': return 'text-amber-700';
      case 'silver': return 'text-gray-400';
      case 'gold': return 'text-yellow-500';
      case 'platinum': return 'text-cyan-400';
      default: return '';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {sortedEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedEntries.map((entry, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-bold ${getRankClass(entry.rank)}`}>
                        {index + 1}. {entry.rank.charAt(0).toUpperCase() + entry.rank.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.playerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">{entry.score}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getDifficultyLabel(entry.difficulty)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(entry.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No entries yet. Be the first to make the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;