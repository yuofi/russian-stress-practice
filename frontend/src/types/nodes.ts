export interface Word {
  id?: number;
  word: string;
  accentIdx: number;
  retired?: boolean;
  correctStreak: number;
  wrongCount: number;
  nextReview: Date;
}

export interface PracticeHistory {
  correct: boolean;
  date: Date;
}

export interface UserStatsSummary {
  totalAttempts: number;
  correctAttempts: number;
  correctRate: number;
  recentStats?: {
    totalAttempts: number;
    correctAttempts: number;
  };
}

export interface DailyStats {
  date: string;
  total: number;
  correct: number;
  rate: number;
}

export interface ProblemWord {
  word: string;
  total: number;
  correct: number;
  type: string;
}

export interface UserStats {
  summary: UserStatsSummary;
  dailyStats: DailyStats[];
  problemWords: ProblemWord[];
}

export interface UserStatsParams {
  type: 'STRESS' | 'PARONYM';
  period?: number;
}

export interface Paronym {
  word: string;
  explanation: string;
  id: number
}

export interface ParonymGroup {
  id: number;
  group: string[];
  paronyms: Paronym[];
  context: string;
}
