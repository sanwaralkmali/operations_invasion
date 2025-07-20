import React from 'react';
import Link from 'next/link';

const skills = ['integers', 'rational', 'complex', 'battle'];

const StartScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to Integer Invasion!</h1>
      <p className="text-2xl mb-8">Please select a skill to practice:</p>
      <div className="grid grid-cols-2 gap-4">
        {skills.map((skill) => (
          <Link
            key={skill}
            href={`/quiz/${skill}`}
            className="p-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
          >
            {skill.charAt(0).toUpperCase() + skill.slice(1)}
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <Link
          href="/leaderboard/integers"
          className="p-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700"
        >
          View Leaderboard
        </Link>
      </div>
    </div>
  );
};

export default StartScreen;
