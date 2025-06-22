import { useState, useEffect, useCallback } from 'react';
import { Player, Difficulty, Question, LeaderboardEntry } from '../types';
import { fetchQuestions, shuffleArray, formatTime } from '../utils/game';
import QuestionDisplay from './QuestionDisplay';
import ProgressBar from './ProgressBar';

type BattlePhase = 'regular' | 'lastChance' | 'suddenDeath';
type StatusMessageType = 'info' | 'success' | 'warning' | 'error' | 'special';

interface PlayerStats extends Player {
  correctAnswers: number;
  questionsAnswered: number;
  suddenDeathTime?: number;
}

interface BattleModeProps {
  players: Player[];
  difficulty: Difficulty;
  onGameOver: (score: number, winner?: string, stats?: Omit<PlayerStats, 'id' | 'rank'>) => void;
}

const BattleMode: React.FC<BattleModeProps> = ({ players, difficulty, onGameOver }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [battlePlayers, setBattlePlayers] = useState<PlayerStats[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(true);
  const [battlePhase, setBattlePhase] = useState<BattlePhase>('regular');
  const [lastChancePlayerIndex, setLastChancePlayerIndex] = useState<number | null>(null);
  
  // Animation and log state
  const [showAnimation, setShowAnimation] = useState<'attack' | 'shield' | 'correct' | 'incorrect' | null>(null);
  const [attackingPlayer, setAttackingPlayer] = useState<number | null>(null);
  const [defendingPlayer, setDefendingPlayer] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: StatusMessageType }>({ text: '', type: 'info' });
  
  // Loading and UI state
  const [isLoading, setIsLoading] = useState(true);
  const [showSuddenDeathIntro, setShowSuddenDeathIntro] = useState(false);
  const [showPostGameSummary, setShowPostGameSummary] = useState(false);
  const [postGameWinnerData, setPostGameWinnerData] = useState<PlayerStats | null>(null);
  const [summaryTimeLeft, setSummaryTimeLeft] = useState(15);

  // Add a state to track if the current question has been answered
  const [answered, setAnswered] = useState(false);
  const [turnComplete, setTurnComplete] = useState(false);

  const initializeGame = useCallback(() => {
    // ... (logic from previous implementation is mostly fine)
    const allQuestions = fetchQuestions(difficulty).then(allQuestions => {
      if (allQuestions.length < 22) { // Need enough for sudden death
        console.error("Not enough questions for a full battle.");
        // Handle this case - maybe show an error
        return;
      }
      const shuffledQuestions = shuffleArray(allQuestions);
      setQuestions(shuffledQuestions);
      setBattlePlayers(players.map(p => ({ 
        ...p, 
        lives: 3, 
        score: 0, 
        correctAnswers: 0,
        questionsAnswered: 0 
      })));
      setCurrentPlayerIndex(0);
      setCurrentQuestionIndex(0);
      setGameActive(true);
      setBattlePhase('regular');
      setLastChancePlayerIndex(null);
      setStatusMessage({ text: `The battle begins! ${players[0].name} starts!`, type: 'info' });
      startTurn();
      setIsLoading(false);
    });
  }, [players, difficulty]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  const startTurn = () => {
    setShowAnimation(null);
    setAttackingPlayer(null);
    setDefendingPlayer(null);
    setTimeLeft(30); // Reset timer to 30 seconds
    setAnswered(false);
  };

  // Timer effect
  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAnswer(null); // Timeout is an incorrect answer
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, currentPlayerIndex]);

  const handleAnswer = (selectedAnswer: string | number | null) => {
    if (!gameActive || answered) return;
    setAnswered(true);
    
    const correct = selectedAnswer !== null && selectedAnswer === questions[currentQuestionIndex]?.correctAnswer;
    const answerTime = 30 - timeLeft;

    setBattlePlayers(currentPlayers => {
      const newPlayers = [...currentPlayers];
      const attacker = { ...newPlayers[currentPlayerIndex] };
      const defenderIndex = (currentPlayerIndex + 1) % 2;
      const defender = { ...newPlayers[defenderIndex] };

      attacker.questionsAnswered += 1;
      
      if (correct) {
        attacker.correctAnswers += 1;
        const scoreGain = 10 + Math.max(0, 15 - answerTime);
        attacker.score += scoreGain;

        if (battlePhase === 'suddenDeath') {
            attacker.suddenDeathTime = answerTime;
            setStatusMessage({ text: `${attacker.name} answered correctly in ${answerTime}s!`, type: 'success' });
        } else {
            setShowAnimation('correct');
            setStatusMessage({ text: 'A direct hit!', type: 'success' });
            
            if (battlePhase === 'lastChance' && currentPlayerIndex === lastChancePlayerIndex) {
                attacker.lives = 1;
                setBattlePhase('regular');
                setLastChancePlayerIndex(null);
                setTimeout(() => setStatusMessage({ text: `${attacker.name} is back in the game!`, type: 'special' }), 500);
            } else {
                defender.lives -= 1;
                newPlayers[defenderIndex] = defender;
                setAttackingPlayer(currentPlayerIndex);
                setDefendingPlayer(defenderIndex);
                setTimeout(() => setShowAnimation('attack'), 500);

                if (defender.lives <= 0) {
                    setBattlePhase('lastChance');
                    setLastChancePlayerIndex(defenderIndex);
                    setTimeout(() => setStatusMessage({ text: `${defender.name}'s life is on the line!`, type: 'warning' }), 500);
                }
            }
        }
      } else { // Incorrect Answer
          setShowAnimation('incorrect');
          setStatusMessage({ text: 'A swing and a miss!', type: 'error' });
          
          if (battlePhase === 'lastChance' && currentPlayerIndex === lastChancePlayerIndex) {
              setTimeout(() => endGame(newPlayers), 1500);
              return newPlayers;
          }
          if (battlePhase === 'suddenDeath') {
              attacker.suddenDeathTime = Infinity; // Mark as incorrect (or timed out)
          }
      }

      newPlayers[currentPlayerIndex] = attacker;

      // Check for sudden death
      if (battlePhase === 'regular' && newPlayers.every(p => p.questionsAnswered >= 10)) {
          setBattlePhase('suddenDeath');
          setShowSuddenDeathIntro(true);
          setGameActive(false); // Pause game for intro screen
          setStatusMessage({ text: 'The tension is palpable! It all comes down to this...', type: 'special' });
          return newPlayers; // Return early to show intro
      }
      
      setTurnComplete(true);
      return newPlayers;
    });
  };

  const handleProceedToGameOver = useCallback(() => {
    if (!postGameWinnerData) return;
    const { id, rank, ...winnerStats } = postGameWinnerData;
    onGameOver(postGameWinnerData.score, postGameWinnerData.name, winnerStats);

    const newEntry: LeaderboardEntry = {
      playerName: postGameWinnerData.name,
      score: postGameWinnerData.score,
      difficulty,
      date: new Date().toISOString(),
    };
    
    fetch('http://localhost:3001/leaderboards/battle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    });
  }, [postGameWinnerData, onGameOver, difficulty]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPostGameSummary) {
        if (summaryTimeLeft <= 0) {
            handleProceedToGameOver();
        } else {
            timer = setInterval(() => {
                setSummaryTimeLeft(prev => prev - 1);
            }, 1000);
        }
    }
    return () => clearInterval(timer);
  }, [showPostGameSummary, summaryTimeLeft, handleProceedToGameOver]);

  const endGame = (finalPlayers: PlayerStats[]) => {
    if (!gameActive && battlePhase !== 'suddenDeath') return;
    setGameActive(false);

    let winner: PlayerStats | undefined;
    let finalPlayersWithBonus = [...finalPlayers];
    
    const showSummary = (finalWinner: PlayerStats, finalPlayerList: PlayerStats[]) => {
      setBattlePlayers(finalPlayerList);
      setPostGameWinnerData(finalWinner);
      setShowPostGameSummary(true);
    };

    if (battlePhase === 'suddenDeath') {
        const p1 = finalPlayersWithBonus[0];
        const p2 = finalPlayersWithBonus[1];
        const p1Time = p1.suddenDeathTime;
        const p2Time = p2.suddenDeathTime;
        const p1Correct = p1Time !== undefined && p1Time !== Infinity;
        const p2Correct = p2Time !== undefined && p2Time !== Infinity;
        
        let bonusPlayer: PlayerStats | null = null;

        if (p1Correct && !p2Correct) bonusPlayer = p1;
        else if (!p1Correct && p2Correct) bonusPlayer = p2;
        else if (p1Correct && p2Correct) bonusPlayer = p1Time! < p2Time! ? p1 : p2;

        if (bonusPlayer) {
            setStatusMessage({ text: `${bonusPlayer.name} was faster! +50 points!`, type: 'special' });
            finalPlayersWithBonus = finalPlayersWithBonus.map(p => 
                p.id === bonusPlayer!.id ? { ...p, score: p.score + 50 } : p
            );
        } else {
            setStatusMessage({ text: 'Neither player could land a final blow!', type: 'info' });
        }

        winner = finalPlayersWithBonus.reduce((a, b) => a.score > b.score ? a : (b.score > a.score ? b : (a.suddenDeathTime ?? Infinity) < (b.suddenDeathTime ?? Infinity) ? a : b));
        
        const finalWinner = winner;
        const finalPlayerStates = finalPlayersWithBonus;

        setTimeout(() => {
            setStatusMessage({ text: `${finalWinner.name} is the victor!`, type: 'special' });
            setTimeout(() => showSummary(finalWinner, finalPlayerStates), 1500);
        }, 1500);

    } else {
        winner = finalPlayers.find(p => p.lives > 0);
        if (!winner) {
          winner = finalPlayers.reduce((a, b) => a.score > b.score ? a : b);
        }
        const finalWinner = winner;
        setStatusMessage({ text: `${finalWinner.name} is the victor!`, type: 'special' });
        setTimeout(() => showSummary(finalWinner, finalPlayers), 1500);
    }
  };
  
  const currentQuestionData = questions[currentQuestionIndex];

  // useEffect to advance the turn when turnComplete is set
  useEffect(() => {
    if (turnComplete) {
      setTimeout(() => {
        // End game after both players have had their sudden death turn
        if (battlePhase === 'suddenDeath' && currentPlayerIndex === 1) {
          endGame(battlePlayers);
          return;
        }

        let nextPlayerIndex: number;
        if (battlePhase === 'lastChance' && lastChancePlayerIndex !== null) {
          // It's the defender's last chance, so their turn now.
          nextPlayerIndex = lastChancePlayerIndex;
          setCurrentPlayerIndex(lastChancePlayerIndex);
        } else {
          // Regular turn change
          nextPlayerIndex = (currentPlayerIndex + 1) % 2;
          setCurrentPlayerIndex(prev => (prev + 1) % 2);
        }

        if (gameActive) {
            const nextPlayer = battlePlayers[nextPlayerIndex];
            if(nextPlayer) {
                if (battlePhase === 'suddenDeath') {
                    setStatusMessage({ text: 'SUDDEN DEATH! Fastest correct answer wins!', type: 'special' });
                } else if (battlePhase === 'lastChance' && lastChancePlayerIndex === nextPlayerIndex) {
                    setStatusMessage({ text: `Survive, ${nextPlayer.name}! This is your last chance!`, type: 'warning' });
                }
                else {
                    setStatusMessage({ text: `Your turn, ${nextPlayer.name}!`, type: 'info' });
                }
            }
        }

        // Check for game over before advancing question
        const activePlayer = battlePlayers.find(p => p.lives > 0);
        if (!activePlayer && battlePhase !== 'lastChance') {
          endGame(battlePlayers);
          return;
        }
        
        // Always advance the question index to ensure a new question for the next player
        setCurrentQuestionIndex(prev => prev + 1);
        
        startTurn(); // This will reset timer and answered state
        setTurnComplete(false);
      }, 1500); 
    }
  }, [turnComplete, battlePlayers, battlePhase, lastChancePlayerIndex]);

  const getStatusClass = (type: StatusMessageType) => {
    switch (type) {
      case 'success': return 'text-green-400 scale-110';
      case 'error': return 'text-red-500 scale-110';
      case 'warning': return 'text-yellow-400 font-bold scale-110';
      case 'special': return 'text-cyan-400 font-bold scale-110 animate-pulse';
      case 'info':
      default: return 'text-white';
    }
  };

  const statusDisplay = (
    <div className="text-center my-4 p-4 bg-gray-800 rounded-lg min-h-[7rem] flex items-center justify-center transition-all duration-300">
        <p className={`text-xl font-mono transition-all duration-300 ${getStatusClass(statusMessage.type)}`}>
            {statusMessage.text}
        </p>
    </div>
  );

  if (showPostGameSummary) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-white text-center">
        <h1 className="text-5xl font-bold mb-4">Battle Over!</h1>
        {statusDisplay}
        
        <div className="flex justify-around my-8">
          {battlePlayers.map(player => (
            <div key={player.id} className="p-6 rounded-lg w-2/5 bg-gray-800 shadow-lg">
              <h2 className="text-3xl font-bold text-white mb-4">{player.name}</h2>
              <p className="text-2xl text-green-400">Final Score: {player.score}</p>
            </div>
          ))}
        </div>

        <div className='w-full max-w-md mx-auto'>
            <p className="mb-2">Proceeding in {summaryTimeLeft}s...</p>
            <ProgressBar value={15 - summaryTimeLeft} maxValue={15} />
        </div>
        
        <button 
            onClick={handleProceedToGameOver} 
            className="mt-6 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-transform transform hover:scale-105"
        >
          Continue to Score Screen
        </button>
      </div>
    );
  }

  if (showSuddenDeathIntro) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-white text-center">
        <h1 className="text-6xl font-bold text-cyan-400 animate-pulse mb-4">SUDDEN DEATH</h1>
        <p className="text-xl mb-8">The score is tied or time is up! One final question decides the winner. Fastest correct answer gets a bonus!</p>
        
        <div className="flex justify-around mb-8">
          {battlePlayers.map(player => (
            <div key={player.id} className="p-6 rounded-lg w-2/5 bg-gray-800 shadow-lg">
              <h2 className="text-3xl font-bold text-white mb-4">{player.name}</h2>
              <p className="text-2xl text-green-400">Score: {player.score}</p>
              <div className="mt-4 text-lg text-left">
                <p>Correct Answers: {player.correctAnswers}</p>
                <p>Incorrect Answers: {player.questionsAnswered - player.correctAnswers}</p>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => {
            setShowSuddenDeathIntro(false);
            setGameActive(true);
            setCurrentPlayerIndex(0); // Start sudden death with player 1
            startTurn();
            setStatusMessage({ text: `Final question! It's your turn, ${battlePlayers[0].name}!`, type: 'special'});
          }}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-8 rounded-lg text-2xl transition-transform transform hover:scale-105"
        >
          Begin Final Round!
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl relative">
      <div className="flex justify-around mb-4 text-center">
        {battlePlayers.map((player, index) => (
          <div key={player.id} className={`p-4 rounded-lg w-2/5 transition-all duration-300 ${index === currentPlayerIndex && gameActive ? 'bg-blue-900 shadow-lg scale-105' : 'bg-gray-700'}`}>
            <h2 className="text-2xl font-bold text-white">{player.name}</h2>
            <p className="text-3xl my-2">
              {'❤️'.repeat(player.lives) + '♡'.repeat(Math.max(0, 3 - player.lives))}
            </p>
            <p className="text-lg text-gray-300">Score: {player.score}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center">
          <p className="text-2xl text-white">Loading Battle...</p>
        </div>
      ) : gameActive && currentQuestionData ? (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">
                {battlePhase === 'suddenDeath' ? 'SUDDEN DEATH' : `${battlePlayers[currentPlayerIndex]?.name}'s turn`}
              </h2>
              <ProgressBar value={timeLeft} maxValue={30} />
            </div>
            <QuestionDisplay
              question={currentQuestionData}
              onAnswer={handleAnswer}
              disabled={!gameActive || showAnimation !== null || answered}
            />
          </div>
          {statusDisplay}
        </>
      ) : (
        <>
            {statusDisplay}
            <div className="text-center text-2xl font-bold p-10">Battle Over!</div>
        </>
      )}
    </div>
  );
};

export default BattleMode;