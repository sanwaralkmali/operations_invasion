import { useState, useEffect, useCallback } from 'react';
import { Player, Difficulty, Question } from '../types';
import { fetchQuestions, shuffleArray } from '../utils/game';
import QuestionDisplay from './QuestionDisplay';
import ProgressBar from './ProgressBar';
import { useNavigate } from 'react-router-dom';

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
  const [suddenDeathResolved, setSuddenDeathResolved] = useState(false);
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'incorrect' | 'showing_correct_answer' | null;
    correctAnswer?: number | string;
    selectedAnswer?: number | string | null;
  } | null>(null);
  const [hitPlayerIndex, setHitPlayerIndex] = useState<number | null>(null);
  const [projectile, setProjectile] = useState<null | { from: number; to: number }>(null);

  const navigate = useNavigate();

  const initializeGame = useCallback(() => {
    fetchQuestions(difficulty).then(allQuestions => {
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
      setSuddenDeathResolved(false);
      startTurn();
      setIsLoading(false);
    });
  }, [players, difficulty]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  const startTurn = () => {
    setShowAnimation(null);
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
    if (!gameActive || answered || feedback) return;
    setAnswered(true);
    
    const correct = selectedAnswer !== null && selectedAnswer === questions[currentQuestionIndex]?.correctAnswer;
    const answerTime = 30 - timeLeft;
    const correctAnswer = questions[currentQuestionIndex]?.correctAnswer;

    if (correct) {
      setFeedback({ status: 'correct', selectedAnswer });
      setTimeout(() => {
        setFeedback(null);
        setBattlePlayers(currentPlayers => {
          const newPlayers = [...currentPlayers];
          const attacker = { ...newPlayers[currentPlayerIndex] };
          const defenderIndex = (currentPlayerIndex + 1) % 2;
          const defender = { ...newPlayers[defenderIndex] };

          attacker.correctAnswers += 1;
          attacker.questionsAnswered += 1;
          
          if (battlePhase === 'suddenDeath') {
            attacker.suddenDeathTime = answerTime;
            setStatusMessage({ text: `${attacker.name} answered correctly in ${answerTime}s!`, type: 'success' });
          } else {
            const scoreGain = 10 + Math.max(0, 15 - answerTime);
            attacker.score += scoreGain;
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
                setHitPlayerIndex(defenderIndex);
                setProjectile({ from: currentPlayerIndex, to: defenderIndex });
                setTimeout(() => setProjectile(null), 1100);
                setTimeout(() => setHitPlayerIndex(null), 700);
                setTimeout(() => setShowAnimation('attack'), 500);

                if (defender.lives <= 0) {
                    setBattlePhase('lastChance');
                    setLastChancePlayerIndex(defenderIndex);
                    setTimeout(() => setStatusMessage({ text: `${defender.name}'s life is on the line!`, type: 'warning' }), 500);
                }
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
        setAnswered(false);
      }, 1200);
    } else {
      setFeedback({ status: 'incorrect', selectedAnswer, correctAnswer });
      setTimeout(() => {
        setFeedback({ status: 'showing_correct_answer', selectedAnswer, correctAnswer });
        setTimeout(() => {
          setFeedback(null);
          setBattlePlayers(currentPlayers => {
            const newPlayers = [...currentPlayers];
            const attacker = { ...newPlayers[currentPlayerIndex] };
            attacker.questionsAnswered += 1;
            setShowAnimation('incorrect');
            setStatusMessage({ text: 'A swing and a miss!', type: 'error' });
            
            if (battlePhase === 'lastChance' && currentPlayerIndex === lastChancePlayerIndex) {
              setTimeout(() => endGame(newPlayers), 1500);
              return newPlayers;
            }
            if (battlePhase === 'suddenDeath') {
              attacker.suddenDeathTime = Infinity; // Mark as incorrect (or timed out)
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
          setAnswered(false);
        }, 3000);
      }, 1200);
    }
  };

  const handleProceedToGameOver = useCallback(() => {
    if (!postGameWinnerData) return;
    const { id, rank, ...winnerStats } = postGameWinnerData;
    onGameOver(postGameWinnerData.score, postGameWinnerData.name, winnerStats);

    // On static hosting, POST is not supported. Optionally, show a message or skip this step.
    // const newEntry: LeaderboardEntry = {
    //   playerName: postGameWinnerData.name,
    //   score: postGameWinnerData.score,
    //   difficulty,
    //   date: new Date().toISOString(),
    // };
    // 
    // fetch('/operations_invasion/leaderboards/battle.json', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newEntry),
    // });
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
    if (battlePhase === 'suddenDeath' && suddenDeathResolved) return;
    if (battlePhase === 'suddenDeath') setSuddenDeathResolved(true);
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

  // Prepare feedback message for in-card display
  const feedbackMessage = feedback ? (
    <div className={`text-center font-bold text-xs sm:text-lg min-h-[1.2rem] sm:min-h-[2.5rem] ${
      feedback.status === 'correct' ? 'text-green-600' :
      feedback.status === 'incorrect' ? 'text-red-600' :
      feedback.status === 'showing_correct_answer' ? 'text-green-600' :
      ''
    }`}>
      {feedback.status === 'correct' && 'Correct! 🎉'}
      {feedback.status === 'incorrect' && 'Incorrect!'}
      {feedback.status === 'showing_correct_answer' && (
        <>The correct answer is <span className="font-bold">{feedback.correctAnswer}</span>.</>
      )}
    </div>
  ) : null;

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
    <div className="flex-1 flex flex-col min-h-0 items-center justify-center w-full max-w-full bg-gray-50 dark:bg-gray-900 p-0 sm:p-4 relative">
      <button
        onClick={() => navigate('/')}
        title="Exit to Main Menu"
        className="absolute top-3 right-3 bg-gray-200 hover:bg-red-500 text-gray-700 hover:text-white rounded-full p-1.5 shadow transition-colors z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Player Info Row */}
      <div className="flex flex-row w-full justify-between items-center mb-2 sm:mb-6 gap-1 sm:gap-4 relative">
        {battlePlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex-1 flex flex-col items-center p-1 sm:p-3 rounded-lg transition-all duration-300
              ${index === currentPlayerIndex && gameActive ? 'bg-blue-50 dark:bg-blue-900 shadow-lg scale-105 border-2 border-blue-400' : 'bg-gray-100 dark:bg-gray-800 opacity-60'}
              ${hitPlayerIndex === index ? 'animate-hit' : ''}
            `}
            style={{ minWidth: 0, maxWidth: '100%' }}
          >
            <div className={`text-xs sm:text-lg font-bold ${index === currentPlayerIndex ? 'text-blue-700 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>{player.name}</div>
            <div className="text-sm sm:text-lg my-1">
              <span className="inline-block" style={{ fontSize: '1em' }}>{'❤️'.repeat(player.lives) + '♡'.repeat(Math.max(0, 3 - player.lives))}</span>
            </div>
            <div className="text-xs sm:text-base text-gray-700 dark:text-gray-300 font-semibold">Score: {player.score}</div>
          </div>
        ))}
        {/* Projectile animation */}
        {projectile && (
          <div
            className={`absolute top-1/2 left-0 w-full pointer-events-none z-30`}
            style={{ height: 0 }}
          >
            <span
              className={`block absolute transition-transform duration-700 ease-in-out text-3xl select-none`}
              style={{
                left: projectile.from === 0 ? '12%' : '88%',
                transform: projectile.from === 0
                  ? 'translateY(-50%) translateX(0)' // start left
                  : 'translateY(-50%) translateX(-100%)', // start right
                animation: projectile.from === 0
                  ? 'projectile-move-right 1.5s forwards'
                  : 'projectile-move-left 1.5s forwards',
              }}
            >
              🔥
            </span>
          </div>
        )}
      </div>

      {/* Main Question Area */}
      <div className="w-full flex flex-col items-center">
        <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl p-1 sm:p-6 mb-1 sm:mb-4 flex flex-col items-center">
          <div className="mb-1 sm:mb-2 text-center">
            <span className="text-sm sm:text-xl font-bold text-indigo-700 dark:text-indigo-300">
              {battlePhase === 'suddenDeath' ? 'SUDDEN DEATH' : `${battlePlayers[currentPlayerIndex]?.name}'s turn`}
            </span>
            <ProgressBar value={timeLeft} maxValue={30} />
          </div>
          {currentQuestionData ? (
            <QuestionDisplay
              question={currentQuestionData}
              onAnswer={handleAnswer}
              disabled={!gameActive || showAnimation !== null || answered || !!feedback}
              feedback={feedback || { status: null }}
              feedbackMessage={feedbackMessage}
            />
          ) : (
            <div className="text-center text-xs sm:text-lg text-gray-500">No question available.</div>
          )}
        </div>
      </div>

      {/* Feedback is now shown inside the card via feedbackMessage */}

      {isLoading && (
        <div className="text-center mt-8">
          <p className="text-2xl text-white">Loading Battle...</p>
        </div>
      )}
      {/* Game Over fallback (should not show during active game) */}
      {!gameActive && !showPostGameSummary && !showSuddenDeathIntro && (
        <div className="text-center text-2xl font-bold p-10">Battle Over!</div>
      )}
    </div>
  );
};

export default BattleMode;