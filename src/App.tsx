import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameState, GameMode, Difficulty, Player, LeaderboardEntry } from './types';
import { getLeaderboard, calculateRank } from './utils/game';
import StartScreen from './components/StartScreen';
import SinglePlayerGame from './components/SinglePlayerGame';
import BattleMode from './components/BattleMode';
import GameOver from './components/GameOver';
import Leaderboard from './components/Leaderboard';
import Footer from './components/Footer';
import NotFound from './components/NotFound';

function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [gameMode, setGameMode] = useState<GameMode>('single');
  const [difficulty, setDifficulty] = useState<Difficulty>('integers');
  const [players, setPlayers] = useState<Player[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [winner, setWinner] = useState<string | undefined>(undefined);
  
  // Load leaderboard on mount
  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  // Start a new game
  const startGame = (mode: GameMode, diff: Difficulty, playerNames: string[]) => {
    // Create player objects
    const newPlayers = playerNames.map((name, index) => ({
      id: `player-${index + 1}`,
      name,
      score: 0,
      lives: 3,
      rank: 'bronze' as const
    }));

    setGameMode(mode);
    setDifficulty(diff);
    setPlayers(newPlayers);
    setGameState('playing');
  };

  // End the game and show results
  const endGame = (score: number, correct: number = 0, total: number = 0, time: number = 0, battleWinner?: string) => {
    setFinalScore(score);
    setCorrectAnswers(correct);
    setTotalQuestions(total);
    setTimeTaken(time);
    setWinner(battleWinner);
    setGameState('gameOver');
    
    // Update player rank based on score and difficulty
    const rank = calculateRank(score, difficulty);
    setPlayers(prev => [
      {...prev[0], score, rank},
      ...prev.slice(1)
    ]);
    
    // Refresh leaderboard
    setLeaderboard(getLeaderboard());
  };

  // Return to start screen
  const returnToStart = () => {
    setGameState('start');
  };

  return (
    <BrowserRouter basename="/integer_invasion">
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              gameState === 'start' ? (
                <StartScreen 
                  onStartGame={startGame} 
                  leaderboard={leaderboard}
                />
              ) : gameState === 'playing' ? (
                gameMode === 'single' ? (
                  <SinglePlayerGame 
                    player={players[0]}
                    difficulty={difficulty}
                    onGameOver={endGame}
                  />
                ) : (
                  <BattleMode 
                    players={players}
                    difficulty={difficulty}
                    onGameOver={endGame}
                  />
                )
              ) : (
                <GameOver 
                  playerName={players[0]?.name || 'Player'}
                  score={finalScore}
                  correctAnswers={correctAnswers}
                  totalQuestions={totalQuestions}
                  timeTaken={timeTaken}
                  rank={players[0]?.rank || 'bronze'}
                  difficulty={difficulty}
                  gameMode={gameMode}
                  winner={winner}
                  onRestart={() => {
                    // Reset game state but keep same players and difficulty
                    setGameState('playing');
                  }}
                  onMainMenu={returnToStart}
                />
              )
            } />
            <Route path="/leaderboard" element={<Leaderboard entries={leaderboard} onClose={() => window.history.back()} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;