import React, { useState, useEffect, useMemo } from "react";
import { Word, UserStats, UserStatsParams } from "../../types/nodes";
import {
  updateWord,
  getDueWords,
  computeNextReview,
  addDays,
} from "../../utils/utils";
import { Loader } from "../../components/Loader";
import PracticeStats from "../../components/PracticeStats";
import { PracticeType } from "../../types/practice";
import PersonalDictionaryButton from "../../components/PersonalDictionaryButton";
import { useStats } from "../../utils/statsContext";

interface StressPracticeInterfaceProps {
  words: Word[];
  isLoading: boolean;
  statsParams: UserStatsParams;
  changeStatsPeriod: (period?: number) => void;
  recordPractice: (wordId: number, correct: boolean) => void;
  isPersonalDictionary: boolean;
  stats?: UserStats;
  isStatsLoading: boolean;
  vowels: string[];
  today: Date;
  setWords?: (updater: (prevWords: Word[]) => Word[]) => void;
}

export default function StressPracticeInterface({
  words,
  isLoading,
  statsParams,
  changeStatsPeriod,
  recordPractice,
  isPersonalDictionary,
  stats,
  isStatsLoading,
  vowels,
  today,
  setWords,
}: StressPracticeInterfaceProps) {
  // Получаем состояние видимости статистики
  const { isStatsVisible } = useStats();

  // State for the current word being practiced
  const [currentWord, setCurrentWord] = useState<Word | null>(null);

  // State to track if we need a retry on the current word
  const [requireRetry, setRequireRetry] = useState(false);

  // State to track the user's selected letter index
  const [selected, setSelected] = useState<number | null>(null);

  // State to store feedback message
  const [feedback, setFeedback] = useState("");

  // State to determine if we're showing all words or just due words
  const [showAllWords, setShowAllWords] = useState(false);

  // State to track if all words are learned
  const [allLearned, setAllLearned] = useState(false);
  const [isInitialWordLoadPending, setIsInitialWordLoadPending] =
    useState(false);

  // Добавим новое состояние для отслеживания пустого списка слов
  const [emptyWordsList, setEmptyWordsList] = useState(false);

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
    // console.log(
    //   "Loading next word. Due words:",
    //   due.length,
    //   "Total words:",
    //   words.length
    // );

    if (due.length > 0) {
      setCurrentWord(due[0]);
      setAllLearned(false);
    } else if (words.length > 0) {
      // Если есть слова, но нет доступных для практики сегодня
      setCurrentWord(null);
      setAllLearned(true);
    } else {
      // Если список слов пуст
      setCurrentWord(null);
      setAllLearned(false);
    }

    setSelected(null);
    setFeedback("");
    setRequireRetry(false);
  };

  // Handle user clicking on a letter
  const handleSelect = (idx: number): void => {
    // Only allow selection if no feedback is currently shown (prevents multiple clicks)
    if (feedback) return;

    // Guard against no current word
    if (!currentWord) return;

    const clickedLetter = letters[idx].toLowerCase();

    // Only proceed if the clicked letter is a vowel
    if (!vowels.includes(clickedLetter)) {
      return; // Do nothing if it's not a vowel
    }

    // Set the selected letter index
    setSelected(idx);

    // Проверяем ответ
    const isCorrect = idx === currentWord.accentIdx;

    // Record practice attempt to backend
    if (currentWord.id) {
      recordPractice(currentWord.id, isCorrect);
    }

    if (isCorrect) {
      // Правильный ответ - показываем успех
      setFeedback("✅ Правильно!");

      // Update the word's learning metadata locally
      if (setWords) {
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
      }
    } else {
      // Неправильный ответ
      setFeedback("❌ Неправильно. Правильный ответ выделен.");

      // Reset the word's streak locally
      if (setWords) {
        setWords((prevWords: Word[]) => {
          return updateWord(prevWords, currentWord, (word: Word) => {
            word.correctStreak = 0;
            word.wrongCount += 1;
            word.nextReview = addDays(today, 1); // Review again tomorrow
          });
        });
      }
    }
  };

  // Toggle between showing all words or just due words
  const toggleWordDisplay = (): void => {
    setShowAllWords((prev) => !prev);
  };

  // Load initial word when words are loaded
  useEffect(() => {
    if (words.length > 0 && !currentWord) {
      loadNextWord();
      setEmptyWordsList(false);
    } else if (words.length === 0 && !isLoading) {
      // Если список слов пуст, устанавливаем соответствующий флаг
      setEmptyWordsList(true);
      setAllLearned(false);
    }
  }, [words, isLoading]);

  // Если на мобильном устройстве открыта статистика, не показываем основной контент
  if (isStatsVisible && window.innerWidth < 768) {
    return null;
  }

  return (
    // Main container with flex layout for sidebar and main content
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar for word stats - только для десктопов */}
      <div className="hidden md:block w-1/4 bg-white p-6 overflow-y-auto border-r border-slate-200 shadow-sm flex flex-col">
        <PracticeStats
          type="STRESS"
          period={statsParams.period}
          onPeriodChange={changeStatsPeriod}
        />

        {/* Toggle button */}
        <button
          onClick={toggleWordDisplay}
          className="mt-4 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 ease-in-out text-sm w-full focus:outline-none focus:ring-0"
        >
          {showAllWords ? "Показать изучаемые" : "Показать все слова"}
        </button>

        {/* Source indicator */}
        {isPersonalDictionary && (
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
            Вы практикуете слова из личного словаря
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="w-full md:w-3/4 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto my-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-slate-800">
            Тренажер ударений
          </h1>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : emptyWordsList ? (
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-800">
                {isPersonalDictionary
                  ? "В вашем словаре нет слов для практики"
                  : "Список слов для практики пуст"}
              </h2>
              <p className="text-slate-600 mb-6">
                {isPersonalDictionary
                  ? "Добавьте слова в личный словарь во время обычной практики"
                  : "Пожалуйста, обратитесь к администратору для добавления слов"}
              </p>
            </div>
          ) : allLearned ? (
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-800">
                Поздравляем!
              </h2>
              <p className="text-slate-600 mb-6">
                Вы повторили все слова на сегодня. Возвращайтесь завтра для
                новой практики!
              </p>
              <button
                onClick={() => setAllLearned(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Практиковаться еще
              </button>
            </div>
          ) : currentWord ? (
            <>
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg mb-4 sm:mb-6 relative">
                {/* Кнопка для личного словаря (только в обычном режиме) */}
                {!isPersonalDictionary && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <PersonalDictionaryButton
                      type={PracticeType.STRESS}
                      id={currentWord.id}
                    />
                  </div>
                )}

                <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
                  Выберите ударный слог
                </h2>
                
                {/* Адаптивный интерфейс для отображения слова */}
                <div className="w-full overflow-x-auto mb-6 sm:mb-8 py-2">
                  <div className="flex justify-center items-center space-x-1 sm:space-x-2 text-3xl sm:text-4xl md:text-5xl min-w-min mx-auto">
                    {letters.map((letter, idx) => {
                      const isVowel = vowels.includes(letter.toLowerCase());
                      const isCorrect = idx === currentWord?.accentIdx;
                      const isSelected = selected === idx;
                      const showCorrect = feedback && isCorrect;

                      return (
                        <span
                          key={idx}
                          onClick={() => handleSelect(idx)}
                          className={`
                            relative cursor-pointer px-1 sm:px-2 py-1 rounded-lg transition-all duration-200
                            ${isVowel ? 'hover:bg-slate-100 hover:transform hover:scale-110 active:bg-slate-200 active:scale-105' : 'cursor-default'}
                            ${isSelected && isCorrect ? 'bg-emerald-500 text-white transform scale-110' : ''}
                            ${isSelected && !isCorrect ? 'bg-rose-500 text-white' : ''}
                            ${showCorrect && !isSelected ? 'bg-emerald-500 text-white transform scale-110' : ''}
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
                
                {/* Сообщение с обратной связью */}
                {feedback && (
                  <div className={`mt-4 sm:mt-6 text-center py-2 sm:py-3 px-3 sm:px-4 rounded-xl mx-auto max-w-md
                    ${feedback.includes('Правильно') 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'}`}
                  >
                    <p className="text-base sm:text-lg flex items-center justify-center">
                      {feedback}
                    </p>
                  </div>
                )}
                
                {/* Кнопка для перехода к следующему слову */}
                {feedback && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={loadNextWord}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Следующее слово
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}









