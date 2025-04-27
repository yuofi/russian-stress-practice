import React, { useState, useEffect, useMemo } from "react";
import {
  initializeWords,
  updateWord,
  getDueWords,
  computeNextReview,
  addDays,
} from "./utils";
import rawWords from "./words";

// Define interfaces for better type safety
interface Word {
  word: string;
  accentIdx: number;
  retired?: boolean;
  correctStreak: number;
  wrongCount: number;
  nextReview: Date;
}

// List of Russian vowels
const vowels = ["а", "е", "ё", "и", "о", "у", "ы", "э", "ю", "я"];

export default function StressPracticePage() {
  // Today's date for scheduling
  const today = useMemo(() => new Date(), []);

  // State for all words with learning metadata
  const [words, setWords] = useState<Word[]>(() => initializeWords(rawWords));

  // State for the current word being practiced
  const [currentWord, setCurrentWord] = useState<Word | null>(null);

  // State to track if we need a retry on the current word
  const [requireRetry, setRequireRetry] = useState(false);

  // State to track the user's selected letter index
  const [selected, setSelected] = useState<number | null>(null);

  // State to store feedback message
  const [feedback, setFeedback] = useState("");

  // State to track the number of incorrect answers
  const [incorrectCount, setIncorrectCount] = useState(0);

  // State to determine if we're showing all words or just due words
  const [showAllWords, setShowAllWords] = useState(false);

  // State to track if all words are learned
  const [allLearned, setAllLearned] = useState(false);

  // Get due words and set the first one as current on mount
  useEffect(() => {
    loadNextWord();
  }, []);

  // Get words that are due for review
  const dueWords = useMemo(() => {
    return getDueWords(words, today);
  }, [words, today]);

  // Get retired words (for stats)
  const retiredWords = useMemo(() => {
    return words.filter((w) => w.retired);
  }, [words]);

  // Split the current word into an array of letters
  const letters = currentWord?.word ? currentWord.word.split("") : [];

  // Load the next word to practice
  const loadNextWord = (): void => {
    const due = getDueWords(words, today);

    if (due.length > 0) {
      setCurrentWord(due[0]);
      setAllLearned(false);
    } else {
      setCurrentWord(null);
      setAllLearned(true);
    }

    setSelected(null);
    setFeedback("");
    setRequireRetry(false);
  };

  // Handle first correct answer
  const handleFirstCorrect = (): void => {
    setFeedback("✅ Правильно! Попробуй ещё раз.");
    setRequireRetry(true);
  };

  // Handle first wrong answer
  const handleFirstWrong = (selectedIdx: number): void => {
    setFeedback("❌ Неправильно. Попробуй ещё раз.");
    setRequireRetry(true);
    setIncorrectCount((prev) => prev + 1);
  };

  // Handle the retry attempt
  const finalizeRetry = (selectedIdx: number): void => {
    if (!currentWord) return;

    if (selectedIdx === currentWord.accentIdx) {
      // Correct on retry
      setFeedback("✅ Правильно!");

      // Update the word's learning metadata
      setWords((prevWords: Word[]) => {
        return updateWord(prevWords, currentWord, (word: Word) => {
          word.correctStreak += 1;

          // If streak reaches 4, retire the word
          if (word.correctStreak >= 4) {
            word.retired = true;
          } else {
            // Otherwise, schedule next review based on streak
            word.nextReview = computeNextReview(word.correctStreak, today);
          }
        });
      });
    } else {
      // Wrong on retry
      setFeedback("❌ Неправильно. Правильный ответ выделен.");

      // Reset the word's streak
      setWords((prevWords: Word[]) => {
        return updateWord(prevWords, currentWord, (word: Word) => {
          word.correctStreak = 0;
          word.wrongCount += 1;
          word.nextReview = addDays(today, 1); // Review again tomorrow
        });
      });

      setIncorrectCount((prev) => prev + 1);
    }

    // No longer require retry
    setRequireRetry(false);
  };

  // Handle user clicking on a letter
  const handleSelect = (idx: number): void => {
    // Only allow selection if no feedback is currently shown (prevents multiple clicks)
    if (feedback && !requireRetry) return;

    // Guard against no current word
    if (!currentWord) return;

    const clickedLetter = letters[idx].toLowerCase();

    // Only proceed if the clicked letter is a vowel
    if (!vowels.includes(clickedLetter)) {
      return; // Do nothing if it's not a vowel
    }

    // Set the selected letter index
    setSelected(idx);

    // Handle based on whether this is first attempt or retry
    if (!requireRetry) {
      // First attempt
      if (idx === currentWord.accentIdx) {
        handleFirstCorrect();
      } else {
        handleFirstWrong(idx);
      }
    } else {
      // Retry attempt
      finalizeRetry(idx);
    }
  };

  // Toggle between showing all words or just due words
  const toggleWordDisplay = (): void => {
    setShowAllWords((prev) => !prev);
  };

  return (
    // Main container with flex layout for sidebar and main content
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar for word stats */}
      <div className="w-1/4 bg-white p-6 overflow-y-auto border-r border-slate-200 shadow-sm flex flex-col">
        <div>
          {" "}
          {/* Container for the stats */}
          <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-2 border-slate-100">
            Статистика
          </h2>
          <div className="mb-6 bg-slate-50 p-4 rounded-xl shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Всего слов</p>
                <p className="text-xl font-semibold text-slate-800">
                  {words.length}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Выучено</p>
                <p className="text-xl font-semibold text-emerald-600">
                  {retiredWords.length}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Осталось</p>
                <p className="text-xl font-semibold text-indigo-600">
                  {words.length - retiredWords.length}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Ошибок</p>
                <p className="text-xl font-semibold text-amber-600">
                  {incorrectCount}
                </p>
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-3 text-slate-700 flex items-center">
            <span className="mr-2">
              {showAllWords ? "Все слова" : "Слова на изучении"}
            </span>
            <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
              {(showAllWords ? words : words.filter((w) => !w.retired)).length}
            </span>
          </h3>
          <ul className="max-h-96 overflow-y-auto mb-4 bg-white rounded-xl shadow-sm divide-y divide-slate-100">
            {(showAllWords ? words : words.filter((w) => !w.retired)).map(
              (wordObj, i) => (
                <li
                  key={i}
                  className="py-2 px-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <span className="text-slate-700">{wordObj.word}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      wordObj.retired
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {wordObj.retired ? "✓" : `${wordObj.correctStreak}/4`}
                  </span>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Toggle button */}
        <button
          onClick={toggleWordDisplay}
          className="mt-auto px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 ease-in-out text-sm w-full focus:outline-none focus:ring-0"
        >
          {showAllWords ? "Показать изучаемые" : "Показать все слова"}
        </button>
      </div>

      {/* Main content area */}
      <div className="w-3/4 p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto my-auto">
          <h1 className="text-3xl font-bold mb-8 text-center text-slate-800">
            Тренажер ударений
          </h1>

          {allLearned ? (
            // Show congratulations message when all words are learned
            <div className="text-center py-12 px-8 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-emerald-600 mb-4">
                Поздравляем!
              </h2>
              <p className="text-lg mb-4 text-slate-700">
                Вы выучили все слова на сегодня.
              </p>
              <p className="text-md text-slate-500">
                Приходите завтра для повторения.
              </p>
            </div>
          ) : (
            // Regular practice UI
            <>
              {/* Progress display */}
              <div className="mb-6 flex justify-between text-slate-600 bg-white px-4 py-3 rounded-xl shadow-sm">
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Выучено:{" "}
                  <span className="font-semibold ml-1">
                    {retiredWords.length}/{words.length}
                  </span>
                </span>
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Осталось сегодня:{" "}
                  <span className="font-semibold ml-1">{dueWords.length}</span>
                </span>
              </div>

              {/* Word display */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg mb-4 flex flex-col items-center w-full max-w-full">
                {/* Word display with overflow handling */}
                <div className="w-full overflow-x-auto mb-8 py-2">
                  <div className="flex justify-center items-center space-x-2 text-4xl md:text-5xl min-w-min mx-auto">
                    {letters.map((letter, idx) => {
                      const isVowel = vowels.includes(letter.toLowerCase());
                      const isCorrect = idx === currentWord?.accentIdx;
                      const isSelected = selected === idx;
                      const showCorrect =
                        requireRetry === false && feedback && isCorrect;

                      return (
                        <span
                          key={idx}
                          onClick={() => handleSelect(idx)}
                          className={`
                            relative cursor-pointer px-2 py-1 rounded-lg transition-all duration-200
                            ${
                              isVowel
                                ? "hover:bg-slate-100 hover:transform hover:scale-110"
                                : ""
                            }
                            ${
                              isSelected && isCorrect
                                ? "bg-emerald-500 text-white transform scale-110"
                                : ""
                            }
                            ${
                              isSelected && !isCorrect
                                ? "bg-rose-500 text-white"
                                : ""
                            }
                            ${
                              showCorrect
                                ? "bg-emerald-500 text-white transform scale-110"
                                : ""
                            }
                          `}
                        >
                          {letter}
                          {isVowel && (
                            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-slate-300 rounded-full"></span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback message - always reserve space for it */}
                <div
                  className={`text-center my-6 text-lg font-medium py-3 px-6 rounded-xl w-full max-w-md mx-auto transform transition-all duration-300 ease-in-out min-h-[60px] flex items-center justify-center
                  ${!feedback ? "opacity-0" : ""}
                  ${
                    feedback && feedback.includes("Правильно")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : feedback
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : ""
                  }`}
                >
                  {feedback || "Placeholder for feedback"}
                </div>

                {/* Next word button - changes text based on retry state */}
                <div className="flex justify-center w-full mt-6">
                  {requireRetry ? (
                    <button
                      onClick={() => {
                        // Clear feedback and reset selected state to prepare for retry
                        setFeedback("");
                        setSelected(null);
                      }}
                      className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl shadow-md hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 ease-in-out mx-auto focus:outline-none focus:ring-0 transform hover:scale-105"
                    >
                      Попробуй ещё раз
                    </button>
                  ) : (
                    <button
                      onClick={loadNextWord}
                      className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl shadow-md hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 ease-in-out mx-auto focus:outline-none focus:ring-0 transform hover:scale-105"
                      disabled={feedback !== "" && requireRetry}
                    >
                      Следующее слово
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
