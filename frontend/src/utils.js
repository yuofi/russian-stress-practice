// Date utility functions
export function addDays(d, n) {
  const newDate = new Date(d);
  newDate.setDate(d.getDate() + n);
  return newDate;
}

// Compute next review date based on streak
export function computeNextReview(streak, today = new Date()) {
  if (streak <= 1) return addDays(today, 1);
  if (streak === 2) return addDays(today, 3);
  if (streak === 3) return addDays(today, 7);
  return addDays(today, 14);
}

// Initialize words with learning metadata
export function initializeWords(rawWords) {
  const today = new Date();
  
  return rawWords.map(raw => {
    let base = '';
    let accentIdx = null;
    
    if (typeof raw !== 'string') return { 
      word: '', 
      accentIdx: null,
      correctStreak: 0,
      wrongCount: 0,
      nextReview: today,
      retired: false
    };

    for (let i = 0; i < raw.length; i++) {
      const char = raw[i];
      if (typeof char !== 'string') continue;

      if (char === char.toUpperCase() && char !== char.toLowerCase()) {
        accentIdx = base.length;
        base += char.toLowerCase();
      } else {
        base += char;
      }
    }
    
    return { 
      word: base, 
      accentIdx,
      correctStreak: 0,
      wrongCount: 0,
      nextReview: today,
      retired: false
    };
  });
}

// Helper to update a specific word in the words array
export function updateWord(words, targetWord, updateFn) {
  return words.map(word => {
    if (word.word === targetWord.word) {
      // Create a copy of the word
      const updatedWord = { ...word };
      // Apply the update function
      updateFn(updatedWord);
      return updatedWord;
    }
    return word;
  });
}

// Get words that are due for review
export function getDueWords(words, today = new Date()) {
  return words
    .filter(w => !w.retired && w.nextReview <= today)
    .sort(() => Math.random() - 0.5); // Simple shuffle
}
