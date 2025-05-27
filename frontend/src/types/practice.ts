export enum PracticeType {
  STRESS = 'STRESS',
  PARONYM = 'PARONYM'
}

// Типы для личного словаря
export interface PersonalDictionaryWord {
  id: number;
  word: string;
  accentIdx: number;
  history: {
    correct: boolean;
    date: string;
  }[];
}

export interface PersonalDictionaryParonym {
  id: number;
  group: string[];
  paronyms: {
    id: number;
    word: string;
    explanation: string;
  }[];
}

export interface PersonalDictionaryResponse {
  words?: PersonalDictionaryWord[];
  paronyms?: PersonalDictionaryParonym[];
}


