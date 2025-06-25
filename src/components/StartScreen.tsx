import { useState } from 'react';
import { GameMode, Difficulty } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import Instructions from './Instructions';

interface StartScreenProps {
  onStartGame: (mode: GameMode, difficulty: Difficulty, playerNames: string[]) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [mode, setMode] = useState<GameMode>('single');
  const [difficulty, setDifficulty] = useState<Difficulty>('integers');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleStartGame = () => {
    // Clear any previous error messages
    setErrorMessage('');
    
    if (mode === 'single' && player1Name.trim()) {
      onStartGame(mode, difficulty, [player1Name]);
      navigate('/game');
    } else if (mode === 'battle' && player1Name.trim() && player2Name.trim()) {
      // Check for duplicate names in battle mode
      if (player1Name.trim().toLowerCase() === player2Name.trim().toLowerCase()) {
        setErrorMessage('Players cannot have the same name. Please use different names.');
        return;
      }
      onStartGame(mode, difficulty, [player1Name, player2Name]);
      navigate('/battle');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center w-full bg-gray-50 dark:bg-gray-800 p-4">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 dark:text-blue-400 mb-2">OPERATIONS INVASION</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Master mathematical operations and defend against the invasion!</p>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Game Setup */}
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Game Mode</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setMode('single')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${mode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                  >
                    Single Player
                  </button>
                  <button
                    onClick={() => setMode('battle')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${mode === 'battle' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                  >
                    Battle Mode
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">2. Difficulty</h3>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setDifficulty('integers')}
                    className={`w-full px-4 py-2 rounded-lg transition-colors ${difficulty === 'integers' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                  >
                    Integers
                  </button>
                  <button
                    onClick={() => setDifficulty('rational')}
                    className={`w-full px-4 py-2 rounded-lg transition-colors ${difficulty === 'rational' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                  >
                    Rational Numbers
                  </button>
                  <button
                    onClick={() => setDifficulty('complex')}
                    className={`w-full px-4 py-2 rounded-lg transition-colors ${difficulty === 'complex' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                  >
                    Complex Problems
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Player Info */}
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-lg font-semibold mb-2">3. Player Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="player1" className="block mb-1 font-medium">Player 1 Name</label>
                    <input
                      id="player1"
                      type="text"
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  {mode === 'battle' && (
                    <div>
                      <label htmlFor="player2" className="block mb-1 font-medium">Player 2 Name</label>
                      <input
                        id="player2"
                        type="text"
                        value={player2Name}
                        onChange={(e) => setPlayer2Name(e.target.value)}
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
                        placeholder="Enter player 2 name"
                      />
                    </div>
                  )}
                  
                  {errorMessage && (
                    <div className="mt-2 text-red-500 text-sm">
                      {errorMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={handleStartGame}
              disabled={mode === 'single' ? !player1Name.trim() : (!player1Name.trim() || !player2Name.trim())}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
            >
              Start Game
            </button>
            
            <Link
              to={`/leaderboard?mode=${mode}`}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-center leading-[2.25rem]"
            >
              View Leaderboard
            </Link>

            <button
              onClick={() => setShowInstructions(true)}
              className="flex-1 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-transform transform hover:scale-105"
            >
              How to Play
            </button>
          </div>
        </div>
      </div>

      {showInstructions && <Instructions onClose={() => setShowInstructions(false)} />}
    </div>
  );
};

export default StartScreen;