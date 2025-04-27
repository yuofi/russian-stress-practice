import { addDays, computeNextReview, initializeWords, updateWord, getDueWords } from './utils';

// Test addDays function
describe('addDays', () => {
  test('adds the correct number of days to a date', () => {
    const baseDate = new Date(2023, 0, 1); // January 1, 2023
    
    // Add 1 day
    expect(addDays(baseDate, 1).getDate()).toBe(2);
    
    // Add 7 days
    expect(addDays(baseDate, 7).getDate()).toBe(8);
    
    // Add 30 days (crossing month boundary)
    expect(addDays(baseDate, 30).getDate()).toBe(31);
    expect(addDays(baseDate, 30).getMonth()).toBe(0); // Still January
    
    // Add 31 days (crossing month boundary)
    expect(addDays(baseDate, 31).getDate()).toBe(1);
    expect(addDays(baseDate, 31).getMonth()).toBe(1); // February
  });
});

// Test computeNextReview function
describe('computeNextReview', () => {
  test('returns correct intervals based on streak', () => {
    const today = new Date(2023, 0, 1); // January 1, 2023
    
    // Streak 0 or 1 -> next day
    expect(computeNextReview(0, today).getDate()).toBe(2); // Jan 2
    expect(computeNextReview(1, today).getDate()).toBe(2); // Jan 2
    
    // Streak 2 -> 3 days later
    expect(computeNextReview(2, today).getDate()).toBe(4); // Jan 4
    
    // Streak 3 -> 7 days later
    expect(computeNextReview(3, today).getDate()).toBe(8); // Jan 8
    
    // Streak 4+ -> 14 days later
    expect(computeNextReview(4, today).getDate()).toBe(15); // Jan 15
    expect(computeNextReview(5, today).getDate()).toBe(15); // Jan 15
  });
});

// Test initializeWords function
describe('initializeWords', () => {
  test('correctly initializes words with metadata', () => {
    const rawWords = ["тЕст", "примЕр"];
    const today = new Date();
    
    const result = initializeWords(rawWords);
    
    expect(result.length).toBe(2);
    expect(result[0].word).toBe("тест");
    expect(result[0].accentIdx).toBe(1);
    expect(result[0].correctStreak).toBe(0);
    expect(result[0].wrongCount).toBe(0);
    expect(result[0].retired).toBe(false);
    expect(result[0].nextReview instanceof Date).toBe(true);
    
    expect(result[1].word).toBe("пример");
    expect(result[1].accentIdx).toBe(4);
  });
  
  test('handles invalid inputs', () => {
    const rawWords = [null, undefined, 123];
    
    const result = initializeWords(rawWords);
    
    expect(result.length).toBe(3);
    expect(result[0].word).toBe("");
    expect(result[0].accentIdx).toBe(null);
    expect(result[0].correctStreak).toBe(0);
  });
});

// Test updateWord function
describe('updateWord', () => {
  test('updates the correct word in the array', () => {
    const words = [
      { word: "тест", accentIdx: 1, correctStreak: 0 },
      { word: "пример", accentIdx: 4, correctStreak: 0 }
    ];
    
    const targetWord = { word: "тест", accentIdx: 1 };
    
    const result = updateWord(words, targetWord, w => {
      w.correctStreak = 1;
    });
    
    expect(result.length).toBe(2);
    expect(result[0].word).toBe("тест");
    expect(result[0].correctStreak).toBe(1);
    expect(result[1].correctStreak).toBe(0);
  });
  
  test('does not modify the original array', () => {
    const words = [
      { word: "тест", accentIdx: 1, correctStreak: 0 }
    ];
    
    const targetWord = { word: "тест", accentIdx: 1 };
    
    const result = updateWord(words, targetWord, w => {
      w.correctStreak = 1;
    });
    
    expect(words[0].correctStreak).toBe(0);
    expect(result[0].correctStreak).toBe(1);
  });
});

// Test getDueWords function
describe('getDueWords', () => {
  test('returns only words that are due and not retired', () => {
    const today = new Date(2023, 0, 1);
    const yesterday = new Date(2022, 11, 31);
    const tomorrow = new Date(2023, 0, 2);
    
    const words = [
      { word: "тест1", nextReview: yesterday, retired: false },
      { word: "тест2", nextReview: today, retired: false },
      { word: "тест3", nextReview: tomorrow, retired: false },
      { word: "тест4", nextReview: yesterday, retired: true }
    ];
    
    const result = getDueWords(words, today);
    
    expect(result.length).toBe(2);
    expect(result.some(w => w.word === "тест1")).toBe(true);
    expect(result.some(w => w.word === "тест2")).toBe(true);
    expect(result.some(w => w.word === "тест3")).toBe(false);
    expect(result.some(w => w.word === "тест4")).toBe(false);
  });
});
