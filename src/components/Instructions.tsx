import React from 'react';

interface InstructionsProps {
  onClose: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col relative">
        <button 
            onClick={onClose}
            title="Close"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-600 dark:text-indigo-400">How to Play</h2>
        
        <div className="overflow-y-auto pr-2">
          <div className="space-y-6">
            {/* Single Player Instructions */}
            <div>
              <h3 className="text-2xl font-semibold mb-3 border-b-2 border-indigo-200 pb-2">Single Player Mode</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Objective:</strong> Answer questions correctly to survive waves and get the highest score.</li>
                <li><strong>Waves:</strong> The game is divided into waves of increasing difficulty.</li>
                <li><strong>Lives:</strong> You start with 3 lives. An incorrect answer or running out of time on a question costs one life.</li>
                <li><strong>Scoring:</strong> Earn points for each correct answer. Get bonus points for answering quickly and for maintaining a streak of correct answers!</li>
                <li><strong>Game Over:</strong> The game ends when you run out of lives. Your final score is added to the leaderboards.</li>
              </ul>
            </div>

            {/* Battle Mode Instructions */}
            <div>
              <h3 className="text-2xl font-semibold mb-3 border-b-2 border-indigo-200 pb-2">Battle Mode (1v1)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Objective:</strong> Deplete your opponent's 3 lives to win the battle.</li>
                <li><strong>Turns:</strong> Players take turns answering questions.</li>
                <li><strong>Attacking:</strong> A correct answer damages your opponent, removing one of their lives.</li>
                <li><strong>Missing:</strong> An incorrect answer or running out of time means you miss your attack, and the turn passes to the opponent.</li>
                <li><strong>Last Chance:</strong> If a player loses their last life, they get one "Last Chance" turn. Answering correctly restores 1 life, but failing ends the game.</li>
                <li><strong>Sudden Death:</strong> If both players answer 10 questions, a Sudden Death round begins! The first player to answer a final question correctly wins. Faster answers can lead to bonus points!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructions; 