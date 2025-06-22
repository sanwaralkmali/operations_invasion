import { useState, useEffect, useCallback } from 'react';
import { Player, Difficulty, Question } from '../types';
import { fetchQuestions, shuffleArray, formatTime, playSound } from '../utils/game';
import QuestionDisplay from './QuestionDisplay';
import ProgressBar from './ProgressBar';

interface BattleModeProps {
  players: Player[];
  difficulty: Difficulty;
  onGameOver: (score: number, winner?: string) => void;
}

const BattleMode: React.FC<BattleModeProps> = ({ players, difficulty, onGameOver }) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [animationType, setAnimationType] = useState<'attack' | 'shield' | 'correct' | 'incorrect'>('correct');
  const [gameActive, setGameActive] = useState<boolean>(true);
  const [battlePlayers, setBattlePlayers] = useState<Player[]>([...players]);
  const [attackingPlayer, setAttackingPlayer] = useState<number | null>(null);
  const [defendingPlayer, setDefendingPlayer] = useState<number | null>(null);
  
  const initializeGame = useCallback(async () => {
    setIsLoading(true);
    const allQuestions = await fetchQuestions(difficulty);

    if (allQuestions.length === 0) {
      console.error("Failed to load questions. Cannot start battle.");
      setIsLoading(false);
      return;
    }
    
    const shuffledQuestions = shuffleArray(allQuestions);
    setQuestions(shuffledQuestions);
    setBattlePlayers(players.map(player => ({ ...player, lives: 3, score: 0 })));
    setCurrentPlayerIndex(0);
    setGameActive(true);
    
    if (shuffledQuestions.length > 0) {
      startQuestion(shuffledQuestions[0]);
    } else {
      endGame(0);
    }
    setIsLoading(false);
  }, [difficulty, players]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);
  
  const startQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setTimeLeft(getTimeLimit());
    setShowAnimation(false);
  };

  const getTimeLimit = () => {
    switch (difficulty) {
      case 'rational':
        return 25;
      case 'complex':
        return 20;
      default:
        return 30;
    }
  };
  
  const handleAnswer = (selectedAnswer: number | string) => {
    if (!currentQuestion || !gameActive) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    // Disable input while processing answer
    setShowAnimation(true);
    
    if (isCorrect) {
      setAnimationType('correct');
      playSound('correct');
      
      // Use a functional update to ensure we have the latest state
      setBattlePlayers(currentPlayers => {
        const attackerIndex = currentPlayerIndex;
        const defenderIndex = (currentPlayerIndex + 1) % currentPlayers.length;
        
        // 1. Update attacker's score
        let pointsEarned = 10;
        if (difficulty === 'rational') pointsEarned = 15;
        else if (difficulty === 'complex') pointsEarned = 20;
        
        const updatedPlayers = [...currentPlayers];
        updatedPlayers[attackerIndex] = {
          ...updatedPlayers[attackerIndex],
          score: updatedPlayers[attackerIndex].score + pointsEarned
        };

        // Show attack animation after a brief delay
        setTimeout(() => {
          setAttackingPlayer(attackerIndex);
          setDefendingPlayer(defenderIndex);
          setAnimationType('attack');
          playSound('attack');

          // 2. Update defender's lives
          setBattlePlayers(prevPlayers => {
            const newPlayers = [...prevPlayers];
            const defender = newPlayers[defenderIndex];
            newPlayers[defenderIndex] = { ...defender, lives: Math.max(0, defender.lives - 1) };

            // 3. Check for game over
            if (newPlayers[defenderIndex].lives === 0) {
              const winner = newPlayers[attackerIndex];
              setTimeout(() => endGame(winner.score, winner.name), 1500);
            } else {
              // 4. Move to next player
              setTimeout(() => moveToNextPlayer(), 1500);
            }
            return newPlayers;
          });
        }, 1000);
        
        return updatedPlayers;
      });

    } else { // Incorrect answer
      setAnimationType('incorrect');
      playSound('incorrect');
      setTimeout(() => moveToNextPlayer(), 1500);
    }
  };
  
  const handleTimeUp = () => {
    setAnimationType('incorrect');
    playSound('incorrect');
    setShowAnimation(true);
    setTimeout(() => moveToNextPlayer(), 1000);
  };
  
  const moveToNextPlayer = () => {
    const nextPlayerIndex = (currentPlayerIndex + 1) % battlePlayers.length;
    setCurrentPlayerIndex(nextPlayerIndex);
    setAttackingPlayer(null);
    setDefendingPlayer(null);
    
    const questionIndex = questions.findIndex(q => q === currentQuestion);
    const nextQuestionIndex = questionIndex + 1;
    
    if (nextQuestionIndex >= questions.length) {
      const winner = battlePlayers.reduce(
        (maxPlayer, currentPlayer) => 
          currentPlayer.score > maxPlayer.score ? currentPlayer : maxPlayer, 
        battlePlayers[0]
      );
      endGame(winner.score, winner.name);
      return;
    }
    
    startQuestion(questions[nextQuestionIndex]);
  };
  
  const endGame = (finalScore: number, winnerName?: string) => {
    setGameActive(false);
    playSound('gameOver');
    
    setTimeout(() => {
      onGameOver(finalScore, winnerName);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-bold">Loading Battle...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-bold">No questions available for battle.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6 relative">
        {/* Animation Overlay */}
        {showAnimation && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-20">
            <div className="text-6xl animate-ping">
              {animationType === 'correct' && '✅'}
              {animationType === 'incorrect' && '❌'}
              {animationType === 'attack' && '⚔️'}
              {animationType === 'shield' && '🛡️'}
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center">
          <h2 className="text-xl font-bold mb-4 w-full">Battle Mode</h2>
          <div className="flex flex-wrap justify-between w-full">
            {battlePlayers.map((player, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg shadow-md ${index === currentPlayerIndex ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">{player.name}</span>
                  <span className="text-lg font-semibold">{player.score} pts</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Lives:</span>
                  <ProgressBar value={player.lives} maxValue={3} />
                </div>
                {/* Animation indicators */}
                {attackingPlayer === index && (
                  <div className="mt-2 text-center text-sm font-bold text-red-600">ATTACKING!</div>
                )}
                {defendingPlayer === index && (
                  <div className="mt-2 text-center text-sm font-bold text-blue-600">DEFENDING!</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {currentQuestion && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-lg">
              <span className="font-bold">{battlePlayers[currentPlayerIndex].name}'s</span> turn
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
              <ProgressBar value={timeLeft} maxValue={getTimeLimit()} />
            </div>
            <p className="text-sm text-gray-600">Time Left: {formatTime(timeLeft)}</p>
          </div>
          
          <QuestionDisplay
            question={currentQuestion}
            onAnswer={handleAnswer}
            disabled={!gameActive || showAnimation}
          />
        </div>
      )}
    </div>
  );
};

export default BattleMode;