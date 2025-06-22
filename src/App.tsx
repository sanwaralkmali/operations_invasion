import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameState, GameMode, Difficulty, Player } from './types';
import { calculateRank } from './utils/game';
import StartScreen from './components/StartScreen';
import SinglePlayerGame from './components/SinglePlayerGame';
import BattleMode from './components/BattleMode';
import GameOver from './components/GameOver';
import LeaderboardWrapper from './components/LeaderboardWrapper';
import Footer from './components/Footer';
import NotFound from './components/NotFound';

function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [gameMode, setGameMode] = useState<GameMode>('single');
  const [difficulty, setDifficulty] = useState<Difficulty>('integers');
  const [players, setPlayers] = useState<Player[]>([]);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [winner, setWinner] = useState<string | undefined>(undefined);
  
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
    
    // Update player rank based on score and difficulty
    const rank = calculateRank(newPlayers[0].score, difficulty);
    setPlayers(prev => [
      {...prev[0], score: newPlayers[0].score, rank},
      ...prev.slice(1)
    ]);
  };

  // End the game and show results
  const endGame = (score: number, options: { correct?: number; total?: number; time?: number; winner?: string, winnerStats?: any } = {}) => {
    const { correct = 0, total = 0, time = 0, winner, winnerStats } = options;
    setFinalScore(score);
    if (winnerStats) {
      setCorrectAnswers(winnerStats.correctAnswers);
      setTotalQuestions(winnerStats.questionsAnswered);
    } else {
      setCorrectAnswers(correct);
      setTotalQuestions(total);
    }
    setTimeTaken(time);
    setWinner(winner);
    setGameState('gameOver');
    
    // Update player rank based on score and difficulty
    const rank = calculateRank(score, difficulty);
    setPlayers(prev => {
      if (prev.length === 0) return [];
      return [
        {...prev[0], score, rank},
        ...prev.slice(1)
      ];
    });
  };

  // Return to start screen
  const returnToStart = () => {
    setGameState('start');
  };

  return (
    <BrowserRouter basename="/operations_invasion">
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              gameState === 'start' ? (
                <StartScreen 
                  onStartGame={startGame} 
                />
              ) : gameState === 'playing' ? (
                gameMode === 'single' ? (
                  <SinglePlayerGame 
                    player={players[0]}
                    difficulty={difficulty}
                    onGameOver={(score, correct, total, time) =>
                      endGame(score, {
                        correct,
                        total,
                        time,
                      })
                    }
                  />
                ) : (
                  <BattleMode 
                    players={players}
                    difficulty={difficulty}
                    onGameOver={(score, winner, stats) =>
                      endGame(score, { winner, winnerStats: stats })
                    }
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
            <Route 
              path="/leaderboard" 
              element={<LeaderboardWrapper />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;