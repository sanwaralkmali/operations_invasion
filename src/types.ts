export interface Question {
  question: string;
  options: (string | number)[];
  correctAnswer: string | number;
  level: string;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
}
