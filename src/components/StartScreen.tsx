import { useState } from 'react';
import { GameMode, Difficulty } from '../types';
import { Link } from 'react-router-dom';

interface StartScreenProps {
  onStartGame: (mode: GameMode, difficulty: Difficulty, playerNames: string[]) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [mode, setMode] = useState<GameMode>('single');
  const [difficulty, setDifficulty] = useState<Difficulty>('integers');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleStartGame = () => {
    // Clear any previous error messages
    setErrorMessage('');
    
    if (mode === 'single' && player1Name.trim()) {
      onStartGame(mode, difficulty, [player1Name]);
    } else if (mode === 'battle' && player1Name.trim() && player2Name.trim()) {
      // Check for duplicate names in battle mode
      if (player1Name.trim().toLowerCase() === player2Name.trim().toLowerCase()) {
        setErrorMessage('Players cannot have the same name. Please use different names.');
        return;
      }
      onStartGame(mode, difficulty, [player1Name, player2Name]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-2">OPERATIONS INVASION</h1>
        <p className="text-lg text-gray-600">Master mathematical operations and defend against the invasion!</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Game Setup</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Game Mode</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setMode('single')}
              className={`px-6 py-3 rounded-lg ${mode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Single Player
            </button>
            <button
              onClick={() => setMode('battle')}
              className={`px-6 py-3 rounded-lg ${mode === 'battle' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Battle Mode
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Difficulty</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setDifficulty('integers')}
              className={`px-6 py-3 rounded-lg ${difficulty === 'integers' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Integers
            </button>
            <button
              onClick={() => setDifficulty('rational')}
              className={`px-6 py-3 rounded-lg ${difficulty === 'rational' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Rational Numbers
            </button>
            <button
              onClick={() => setDifficulty('complex')}
              className={`px-6 py-3 rounded-lg ${difficulty === 'complex' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Complex Problems
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Player Information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="player1" className="block mb-1">Player 1 Name</label>
              <input
                id="player1"
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter your name"
              />
            </div>
            
            {mode === 'battle' && (
              <div>
                <label htmlFor="player2" className="block mb-1">Player 2 Name</label>
                <input
                  id="player2"
                  type="text"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter player 2 name"
                />
              </div>
            )}
            
            {errorMessage && (
              <div className="mt-2 text-red-600 text-sm">
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleStartGame}
            disabled={mode === 'single' ? !player1Name.trim() : (!player1Name.trim() || !player2Name.trim())}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Game
          </button>
          
          <Link
            to={`/leaderboard?mode=${mode}`}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            View Leaderboard
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">How to Play</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Single Player Mode</h3>
            <p className="text-gray-600">Solve integer operations as quickly as possible to advance through waves of increasing difficulty.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Battle Mode</h3>
            <p className="text-gray-600">Challenge a friend! Take turns solving problems. Correct answers let you attack your opponent.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Difficulty Levels</h3>
            <ul className="list-disc list-inside text-gray-600">
              <li><span className="font-medium">Integers:</span> Operations with whole numbers like –6 – (–2)</li>
              <li><span className="font-medium">Rational Numbers:</span> Operations with fractions and decimals</li>
              <li><span className="font-medium">Complex Problems:</span> Multi-step operations with mixed number types</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;