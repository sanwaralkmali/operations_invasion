import React from 'react';

interface PlayerStatsProps {
  score: number;
  lives: number;
  level: string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ score, lives, level }) => {
  return (
    <div className="flex justify-between p-4 bg-gray-800 text-white rounded-lg">
      <div>
        <span className="font-bold">Score:</span> {score}
      </div>
      <div>
        <span className="font-bold">Lives:</span> {lives}
      </div>
      <div>
        <span className="font-bold">Level:</span> {level}
      </div>
    </div>
  );
};

export default PlayerStats;
