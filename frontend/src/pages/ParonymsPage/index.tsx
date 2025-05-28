import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ParonymsInterface from "./ParonymsInterface";
import { useStats } from "../../utils/statsContext";
import trpc from "../../utils/trpc";
import PracticeStats from "../../components/PracticeStats";

export default function ParonymsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isPersonalDictionary = searchParams.get("personal") === "true";
  const [statsPeriod, setStatsPeriod] = useState<number | undefined>(undefined);
  
  // Получаем функции для управления видимостью статистики
  const { isStatsVisible, toggleStats } = useStats();

  // Получаем паронимы
  const { data: paronymsData, isLoading: isParonymsLoading } = trpc.GetParonyms.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Получаем статистику
  const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } = trpc.GetUserStats.useQuery(
    { type: "PARONYM", period: statsPeriod },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Обработчик записи практики
  const recordPracticeMutation = trpc.RecordPractice.useMutation({
    onSuccess: () => {
      // Обновляем статистику после успешной записи практики
      refetchStats();
    },
  });

  // Обработчик ответа пользователя
  const handleRecordPractice = async (paronymId: number, selectedWord: string, isCorrect: boolean) => {
    try {
      // Получаем данные о паронимах
      const paronymPair = paronymsData?.paronyms.find(p => p.id === paronymId);
      if (!paronymPair) {
        console.error("Не удалось найти пару паронимов с ID:", paronymId);
        return;
      }
      
      // Находим ID выбранного слова
      const selectedParonym = paronymPair.paronyms.find(p => p.word === selectedWord);
      if (!selectedParonym) {
        console.error("Не удалось найти выбранное слово:", selectedWord);
        return;
      }
      
      // Находим ID правильного слова (то, которое соответствует заданию)
      // Предполагаем, что ParonymsInterface передает нам правильное значение isCorrect
      const correctParonym = paronymPair.paronyms.find(p => 
        isCorrect ? p.word === selectedWord : p.word !== selectedWord
      );
      
      if (!correctParonym) {
        console.error("Не удалось определить правильное слово");
        return;
      }
      
      await recordPracticeMutation.mutateAsync({
        type: "PARONYM",
        paronymPairId: paronymId,
        selectedWordId: selectedParonym.id,
        correctWordId: correctParonym.id,
        correct: isCorrect
      });
    } catch (error) {
      console.error("Failed to record practice:", error);
    }
  };

  // Обработчик изменения периода статистики
  const handlePeriodChange = (period?: number) => {
    setStatsPeriod(period);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Мобильная статистика - показывается только когда isStatsVisible=true */}
      {isStatsVisible && (
        <div className="md:hidden w-full p-4 bg-white">
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
            type="PARONYM"
            period={statsPeriod}
            onPeriodChange={handlePeriodChange}
          />
        </div>
      )}
      
      {/* Main content - показывается всегда на десктопе и когда статистика скрыта на мобильных */}
      <div className={isStatsVisible ? 'hidden md:block' : ''}>
        <ParonymsInterface
          paronymGroups={(paronymsData?.paronyms || []).map(pg => ({ ...pg, context: "" }))}
          isLoading={isParonymsLoading}
          statsPeriod={statsPeriod}
          setStatsPeriod={handlePeriodChange}
          recordPractice={handleRecordPractice}
          isPersonalDictionary={isPersonalDictionary}
        />
      </div>
    </div>
  );
}
