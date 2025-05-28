import React, { useState, useEffect, useMemo } from "react";
import { Word, UserStats, UserStatsParams } from "../../types/nodes";
import {
  initializeWords,
  updateWord,
  getDueWords,
  computeNextReview,
  addDays,
  shuffleArray,
} from "../../utils/utils";
import trpc from "../../utils/trpc";
import { Loader } from "../../components/Loader";
import { PracticeType } from '../../types/practice';
import { useLocation, useNavigate } from "react-router-dom";
import StressPracticeInterface from "./StressPracticeInterface";
import { useStats } from "../../utils/statsContext";
import PracticeStats from "../../components/PracticeStats";

const vowels = ["а", "е", "ё", "и", "о", "у", "ы", "э", "ю", "я"];

// Calculate streak from history
const calculateStreak = (history: { correct: boolean; date: Date }[]) => {
  let streak = 0;
  // Count consecutive correct answers from most recent
  for (let i = 0; i < history.length; i++) {
    if (history[i].correct) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

// Calculate wrong count from history
const calculateWrongCount = (history: { correct: boolean; date: Date }[]) => {
  return history.filter(h => !h.correct).length;
};

export default function StressPracticePage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Определяем, загружаем ли мы слова из личного словаря
  const params = new URLSearchParams(location.search);
  const isPersonalDictionary = params.get("source") === "dictionary";
  
  // Today's date for scheduling
  const today = useMemo(() => new Date(), []);

  // State for all words with learning metadata
  const [words, setWords] = useState<Word[]>([]);

  // Loading state
  const [isLoadingState, setisLoadingState] = useState(true);
  
  // Параметры для запроса статистики
  const [statsParams, setStatsParams] = useState<UserStatsParams>({
    type: "STRESS",
    period: undefined // По умолчанию без ограничения по времени
  });
  
  // Получаем функции для управления видимостью статистики
  const { isStatsVisible, toggleStats } = useStats();
  
  // Запрос статистики с бэкенда
  const { 
    data: stats, 
    isLoading: isStatsLoading, 
    refetch: refetchStats 
  } = trpc.GetUserStats.useQuery(statsParams, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Заменяем получение слов на запрос к бэкенду
  const { 
    data: fetchedWords, 
    isLoading: loadingWords 
  } = isPersonalDictionary
    ? trpc.GetPersonalDictionary.useQuery(
        { type: PracticeType.STRESS }, 
        { 
          enabled: true,
          onError: (error) => {
            console.error("Failed to fetch dictionary words:", error);
            setisLoadingState(false);
          }
        }
      )
    : trpc.GetPracticeWords.useQuery(
        { type: "STRESS" },
        {
          enabled: true,
          onError: (error) => {
            console.error("Failed to fetch practice words:", error);
            setisLoadingState(false);
          }
        }
      );

  // Record practice attempt
  const recordPractice = trpc.RecordPractice.useMutation({
    onSuccess: () => {
      // Обновляем статистику после успешной записи практики
      refetchStats();
    },
  });

  // Функция для изменения периода статистики
  const changeStatsPeriod = (period?: number) => {
    setStatsParams(prev => ({
      ...prev,
      period
    }));
  };

  // Обработчик записи практики
  const handleRecordPractice = (wordId: number, correct: boolean) => {
    recordPractice.mutate({
      type: "STRESS",
      wordId: wordId,
      correct: correct
    });
  };


  // Initialize words with learning metadata when fetched
  useEffect(() => {
    if (fetchedWords) {
      // Transform the fetched data to match the expected format
      const initializedWords = isPersonalDictionary
        ? (fetchedWords.words ?? []).map(word => ({
            id: word.id,
            word: word.word,
            accentIdx: word.accentIdx,
            correctStreak: calculateStreak(word.history || []),
            wrongCount: calculateWrongCount(word.history || []),
            nextReview: word.history && word.history.length > 0 
              ? computeNextReview(calculateStreak(word.history), today)
              : today,
            retired: calculateStreak(word.history || []) >= 4,
          }))
        : (fetchedWords.words ?? []).map(word => ({
            id: word.id,
            word: word.word,
            accentIdx: word.accentIdx,
            correctStreak: calculateStreak(word.history || []),
            wrongCount: calculateWrongCount(word.history || []),
            nextReview: word.history && word.history.length > 0 
              ? computeNextReview(calculateStreak(word.history), today)
              : today,
            retired: calculateStreak(word.history || []) >= 4,
          }));
      setWords(initializedWords);
      setisLoadingState(false);
    }
  }, [fetchedWords, today, isPersonalDictionary]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Мобильная статистика - показывается только когда isStatsVisible=true на мобильных */}
      {isStatsVisible && (
        <div className="md:hidden w-full p-4 bg-white fixed top-0 left-0 right-0 bottom-0 z-50 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Статистика</h2>
            <button 
              onClick={toggleStats}
              className="p-2 rounded-lg bg-slate-100 text-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <PracticeStats
            type="STRESS"
            period={statsParams.period}
            onPeriodChange={changeStatsPeriod}
          />
        </div>
      )}
      
      {/* Main content - всегда показывается, но может быть перекрыт статистикой на мобильных */}
      <div>
        <StressPracticeInterface
          words={words}
          isLoading={isLoadingState || loadingWords}
          statsParams={statsParams}
          changeStatsPeriod={changeStatsPeriod}
          recordPractice={handleRecordPractice}
          isPersonalDictionary={isPersonalDictionary}
          stats={stats as unknown as UserStats}
          isStatsLoading={isStatsLoading}
          vowels={vowels}
          today={today}
          setWords={setWords}
        />
      </div>
    </div>
  );
}
