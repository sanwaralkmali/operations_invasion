// Game state types
export type GameState = 'start' | 'playing' | 'gameOver';
export type GameMode = 'single' | 'battle';
export type Difficulty = 'integers' | 'rational' | 'complex';
export type Rank = 'bronze' | 'silver' | 'gold';
export type QuestionLevel = 'too easy' | 'easy' | 'medium' | 'hard' | 'too hard';

// Player information
export interface Player {
  id: string;
  name: string;
  score: number;
  lives: number;
  rank?: Rank;
}

// Question types
export interface Question {
  id: string;
  question: string;
  options: (number | string)[];
  correctAnswer: number | string;
  difficulty: Difficulty;
  level: QuestionLevel;
}

// Game settings
export interface GameSettings {
  mode: GameMode;
  difficulty: Difficulty;
  timeLimit: number; // in seconds
  questionsPerWave: number;
}

// Leaderboard entry
export interface LeaderboardEntry {
  playerName: string;
  score: number;
  difficulty: Difficulty;
  date: string;
  rank?: Rank;
}

// Wave information for single player mode
export interface Wave {
  number: number;
  questions: Question[];
  timeLimit: number; // in seconds
  completed: boolean;
}

// Battle information for multiplayer mode
export interface Battle {
  players: Player[];
  currentPlayerIndex: number;
  questions: Question[];
  currentQuestionIndex: number;
  timeLeft: number;
}

// Animation types
export type AnimationType = 'attack' | 'shield' | 'correct' | 'incorrect';

// Sound effect types
export type SoundEffectType = 'correct' | 'incorrect' | 'attack' | 'shield' | 'gameOver' | 'levelUp';