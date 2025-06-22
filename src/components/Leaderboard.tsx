import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';

type LeaderboardTab = 'integers' | 'rational' | 'complex';

interface LeaderboardProps {
  gameMode: 'single' | 'battle';
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ gameMode, onClose }) => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('integers');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      try {
        let url = '';
        if (gameMode === 'battle') {
          url = '/operations_invasion/leaderboards/battle.json';
        } else {
          url = `/operations_invasion/leaderboards/${activeTab}.json`;
        }
        const response = await fetch(url);
        const data: LeaderboardEntry[] = await response.json();
        setEntries(data.sort((a, b) => b.score - a.score));
      } catch (error) {
        console.error('Failed to fetch leaderboard data:', error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [gameMode, activeTab]);

  const renderTabs = () => (
    <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-4">
      <button
        className={`flex-grow sm:flex-grow-0 px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base ${activeTab === 'integers' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
        onClick={() => setActiveTab('integers')}
      >
        Integers
      </button>
      <button
        className={`flex-grow sm:flex-grow-0 px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base ${activeTab === 'rational' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
        onClick={() => setActiveTab('rational')}
      >
        Rational
      </button>
      <button
        className={`flex-grow sm:flex-grow-0 px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base ${activeTab === 'complex' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
        onClick={() => setActiveTab('complex')}
      >
        Complex
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold">Leaderboard</h2>
          <button 
            onClick={onClose}
            title="Close"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {gameMode === 'single' && renderTabs()}

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : entries.length > 0 ? (
          <div className="overflow-y-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Player</th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {entries.map((entry, index) => (
                  <tr key={index} className="text-sm sm:text-base">
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                      <span className="font-bold">{index + 1}</span>
                    </td>
                    <td className="px-2 sm:px-6 py-4 break-words">{entry.playerName}</td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap font-bold">{entry.score}</td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">{new Date(entry.date).toLocaleDateString()}</td>
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