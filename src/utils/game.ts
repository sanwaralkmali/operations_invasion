import { Question, Difficulty, Rank, LeaderboardEntry, QuestionLevel } from '../types';

// Fetch questions from the corresponding JSON file
export const fetchQuestions = async (difficulty: Difficulty): Promise<Question[]> => {
  try {
    const response = await fetch(`/integer_invasion/questions/${difficulty}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Omit<Question, 'id' | 'difficulty'>[] = await response.json();
    
    // Add unique ID and difficulty to each question
    return data.map((q, index) => ({
      ...q,
      id: `${difficulty}-${index}`,
      difficulty: difficulty,
      options: shuffleArray([...q.options]),
    }));
  } catch (error) {
    console.error("Could not fetch questions:", error);
    return [];
  }
};

// Shuffle array elements
export const shuffleArray = <T>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
};

// Format time from seconds to MM:SS
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Calculate rank based on score and difficulty
export const calculateRank = (score: number, difficulty: Difficulty): Rank => {
  let goldThreshold = 1000;
  let silverThreshold = 500;

  if (difficulty === 'rational') {
    goldThreshold = 1200;
    silverThreshold = 600;
  } else if (difficulty === 'complex') {
    goldThreshold = 1500;
    silverThreshold = 750;
  }

  if (score >= goldThreshold) return 'gold';
  if (score >= silverThreshold) return 'silver';
  return 'bronze';
};

// Generate waves of questions from a loaded question set
export const generateWaves = (allQuestions: Question[], numWaves: number = 5, questionsPerWave: number = 5): Question[][] => {
  const levels: QuestionLevel[] = ['too easy', 'easy', 'medium', 'hard', 'too hard'];
  const waves: Question[][] = [];

  for (let i = 0; i < numWaves; i++) {
    const level = levels[i] || levels[levels.length - 1]; // Current wave's target level
    let questionsForLevel = allQuestions.filter(q => q.level === level);
    
    // If not enough questions found for the specific level, use a fallback
    if (questionsForLevel.length < questionsPerWave) {
      // Create a fallback pool starting with the current questions
      let fallbackPool = [...questionsForLevel];
      
      // Add questions from nearby levels to ensure we have enough
      for (let j = 1; j < levels.length; j++) {
        const levelUp = levels[i + j];
        const levelDown = levels[i - j];
        
        if (levelUp) {
          fallbackPool.push(...allQuestions.filter(q => q.level === levelUp));
        }
        if (levelDown) {
          fallbackPool.push(...allQuestions.filter(q => q.level === levelDown));
        }
        // If we have enough questions, we can stop searching
        if (fallbackPool.length >= questionsPerWave) break;
      }
      questionsForLevel = fallbackPool;
    }
    
    const shuffled = shuffleArray(questionsForLevel);
    waves.push(shuffled.slice(0, questionsPerWave));
  }
  
  return waves;
};