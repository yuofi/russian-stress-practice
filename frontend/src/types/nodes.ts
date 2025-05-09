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
