// Define interfaces for better type safety
import {Word} from "../types/nodes"

// Date utility functions
export function addDays(d: Date, n: number): Date {
  const newDate = new Date(d);
  newDate.setDate(d.getDate() + n);
  return newDate;
}

// Compute next review date based on streak
export function computeNextReview(streak: number, today: Date = new Date()): Date {
  if (streak <= 1) return addDays(today, 1);
  if (streak === 2) return addDays(today, 3);
  if (streak === 3) return addDays(today, 7);
  return addDays(today, 14);
}

// Initialize words with learning metadata
export function initializeWords(rawWords: string[]): Word[] {
  const today = new Date();
  
  return rawWords.map(raw => {
    let base = '';
    let accentIdx: number | null = null;
    
    if (typeof raw !== 'string') return { 
      word: '', 
      accentIdx: -1,
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
      accentIdx: accentIdx !== null ? accentIdx : -1,
      correctStreak: 0,
      wrongCount: 0,
      nextReview: today,
      retired: false
    };
  });
}

// Helper to update a specific word in the words array
export function updateWord(words: Word[], targetWord: Word, updateFn: (word: Word) => void): Word[] {
  //console.log("Updating word:", targetWord.word);
  
  return words.map(word => {
    if (word.id === targetWord.id) {
      // Create a copy of the word
      const updatedWord = { ...word };
      // Apply the update function
      updateFn(updatedWord);
      //console.log("Word updated:", updatedWord);
      return updatedWord;
    }
    return word;
  });
}

// Get words that are due for review today
export function getDueWords(words: Word[], today: Date): Word[] {
  //console.log("Getting due words from", words.length, "total words");
  //console.log("Today's date:", today);
  
  // Если список слов пуст, возвращаем пустой массив
  if (!words || words.length === 0) {
    //console.log("Words list is empty");
    return [];
  }
  
  // Фильтруем слова, которые нужно повторить сегодня
  const dueWords = words.filter(word => {
    // Проверяем, что nextReview - это действительно дата
    if (!(word.nextReview instanceof Date)) {
      //console.log("Invalid nextReview date for word:", word);
      return true; // Если дата некорректна, считаем слово доступным для практики
    }
    
    const isDue = !word.retired && word.nextReview <= today;
    if (!isDue) {
      //console.log("Word not due:", word.word, "nextReview:", word.nextReview, "today:", today);
    }
    
    return isDue;
  });
  
  //console.log("Found", dueWords.length, "due words");
  return dueWords;
}

export const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Форматирование даты для отображения
export function formatDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  // Сравниваем только даты без времени
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  if (isToday) {
    return "Сегодня";
  } else if (isTomorrow) {
    return "Завтра";
  } else {
    // Форматируем дату как "ДД.ММ.ГГГГ"
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

// Форматирование короткой даты для графиков
export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'numeric'
  });
}
