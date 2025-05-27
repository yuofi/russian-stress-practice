import React from 'react';
import { Loader } from '../Loader';
import { PracticeType } from '../../types/practice';
import trpc from '../../utils/trpc';

// Типы для пропсов компонента
interface PracticeStatsProps {
  type: "STRESS" | "PARONYM";
  period?: number;
  onPeriodChange?: (period?: number) => void;
}

// Типы для данных статистики
interface StatsData {
  summary: {
    totalAttempts: number;
    correctAttempts: number;
    correctRate: number;
    recentStats?: {
      totalAttempts: number;
      correctAttempts: number;
      correctRate: number;
    };
  };
  dailyStats: Array<{
    date: string;
    total: number;
    correct: number;
    rate: number;
  }>;
  problemWords: Array<{
    id: number;
    word: string;
    total: number;
    correct: number;
  }>;
}

// Хук для получения статистики
export const useUserStats = (params: { type: "STRESS" | "PARONYM"; period?: number }) => {
  const { data, isLoading, error, refetch } = trpc.GetUserStats.useQuery(params, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error("Failed to fetch user stats:", error);
    }
  });

  return {
    stats: data as StatsData | undefined,
    isLoading,
    error,
    refetch
  };
};

const PracticeStats: React.FC<PracticeStatsProps> = ({ type, period, onPeriodChange }) => {
  // Получаем статистику с помощью хука
  const { stats, isLoading } = useUserStats({ type, period });

  // Функция для изменения периода
  const handlePeriodChange = (newPeriod?: number) => {
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };

  return (
    <div>
      {/* Заголовок статистики */}
      <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-2 border-slate-100">
        Статистика
      </h2>

      {/* Селектор периода */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => handlePeriodChange(undefined)}
          className={`px-3 py-1 rounded-md text-sm ${
            period === undefined ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Все время
        </button>
        <button
          onClick={() => handlePeriodChange(7)}
          className={`px-3 py-1 rounded-md text-sm ${
            period === 7 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          7 дней
        </button>
        <button
          onClick={() => handlePeriodChange(30)}
          className={`px-3 py-1 rounded-md text-sm ${
            period === 30 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          30 дней
        </button>
      </div>

      {isLoading ? (
        // Показываем индикатор загрузки, пока данные загружаются
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : stats ? (
        // Показываем статистику, когда данные загружены
        <>
          {/* Основная статистика */}
          <div className="mb-6 bg-slate-50 p-4 rounded-xl shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Всего попыток</p>
                <p className="text-xl font-semibold text-slate-800">
                  {stats.summary.totalAttempts}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Правильных</p>
                <p className="text-xl font-semibold text-emerald-600">
                  {stats.summary.correctAttempts}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Неправильных</p>
                <p className="text-xl font-semibold text-amber-600">
                  {stats.summary.totalAttempts - stats.summary.correctAttempts}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Точность</p>
                <p className="text-xl font-semibold text-indigo-600">
                  {Math.round(stats.summary.correctRate * 100)}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Прогресс-бар точности */}
          <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
            <h3 className="text-md font-semibold mb-2 text-slate-700">Точность ответов</h3>
            <div className="w-full bg-slate-100 rounded-full h-4">
              <div 
                className="bg-emerald-500 h-4 rounded-full" 
                style={{ width: `${Math.round(stats.summary.correctRate * 100)}%` }}
              ></div>
            </div>
            <p className="text-right text-sm text-slate-600 mt-1">
              {Math.round(stats.summary.correctRate * 100)}%
            </p>
          </div>
          
          {/* Статистика за последние 7 дней (если доступна) */}
          {stats.summary.recentStats && (
            <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-md font-semibold mb-3 text-slate-700">Последние 7 дней</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Попыток</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {stats.summary.recentStats.totalAttempts}
                  </p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Правильных</p>
                  <p className="text-lg font-semibold text-emerald-600">
                    {stats.summary.recentStats.correctAttempts}
                  </p>
                </div>
              </div>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-3">
                <div 
                  className="bg-indigo-500 h-3 rounded-full" 
                  style={{ 
                    width: `${stats.summary.recentStats.totalAttempts > 0 
                      ? Math.round((stats.summary.recentStats.correctAttempts / stats.summary.recentStats.totalAttempts) * 100) 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Ежедневная статистика (последние 7 дней) */}
          {stats.dailyStats.length > 0 && (
            <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-md font-semibold mb-3 text-slate-700">Ежедневная статистика</h3>
              <div className="space-y-2">
                {stats.dailyStats
                  .slice(0, 7) // Показываем только последние 7 дней
                  .map((day, i) => (
                    <div key={i} className="flex items-center">
                      <span className="text-xs text-slate-500 w-20">{new Date(day.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</span>
                      <div className="flex-1 ml-2">
                        <div className="w-full bg-slate-100 rounded-full h-3">
                          <div 
                            className="bg-emerald-500 h-3 rounded-full" 
                            style={{ width: `${Math.round(day.rate * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs font-medium ml-2 w-12 text-right">
                        {day.correct}/{day.total}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          {/* Проблемные слова */}
          {stats.problemWords.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2 text-slate-700">Сложные слова</h3>
              <ul className="bg-white rounded-xl shadow-sm divide-y divide-slate-100">
                {stats.problemWords.map((word, i) => (
                  <li key={i} className="py-2 px-3 flex justify-between items-center">
                    <span className="text-slate-700">{word.word}</span>
                    <div className="flex items-center">
                      <span className="text-xs text-slate-500 mr-2">
                        {word.correct}/{word.total}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        {Math.round((word.correct / word.total) * 100)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        // Если данных нет
        <div className="text-center py-8 text-slate-500">
          Нет данных о практике
        </div>
      )}
    </div>
  );
};

export default PracticeStats;