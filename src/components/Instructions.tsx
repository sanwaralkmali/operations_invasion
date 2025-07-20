import React from 'react';

const Instructions: React.FC = () => {
  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">How to Play</h2>
      <p>
        Welcome to Integer Invasion! The goal of the game is to answer as many
        math questions as you can before the time runs out.
      </p>
      <ul className="list-disc list-inside mt-4">
        <li>Select a skill to practice.</li>
        <li>Answer the questions as quickly and accurately as possible.</li>
        <li>
          For each correct answer, you will earn points and advance to the next
          level.
        </li>
        <li>
          If you answer incorrectly, you will lose a life. You have 3 lives in
          total.
        </li>
      </ul>
    </div>
  );
};

export default Instructions;
