import React, { useEffect, useState } from 'react';

interface LeaderboardEntry {
  name: string;
  score: number;
}

interface LeaderboardProps {
  skill: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ skill }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`/leaderboards/${skill}.json`);
        const data = await response.json();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, [skill]);

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Leaderboard - {skill}</h2>
      <ol className="list-decimal list-inside">
        {leaderboard.map((entry, index) => (
          <li key={index} className="flex justify-between">
            <span>{entry.name}</span>
            <span>{entry.score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard;
