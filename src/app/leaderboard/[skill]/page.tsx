'use client';

import { useParams } from 'next/navigation';
import Leaderboard from '@/components/Leaderboard';

const LeaderboardPage = () => {
  const { skill } = useParams();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-2xl p-4">
        <Leaderboard skill={skill as string} />
      </div>
    </div>
  );
};

export default LeaderboardPage;
