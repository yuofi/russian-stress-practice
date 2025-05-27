import React, { useState, useEffect } from "react";
import { shuffleArray } from "../../utils/utils";
import { Paronym, ParonymGroup } from "../../types/nodes";
import { Loader } from "../../components/Loader";
import PracticeStats from "../../components/PracticeStats";
import { PracticeType } from "../../types/practice";
import PersonalDictionaryButton from "../../components/PersonalDictionaryButton";
import { useStats } from "../../utils/statsContext";

interface ParonymsInterfaceProps {
  paronymGroups: ParonymGroup[];
  isLoading: boolean;
  statsPeriod: number | undefined;
  setStatsPeriod: (period?: number) => void;
  recordPractice: (paronymId: number, selectedWord: string, correct: boolean) => void;
  isPersonalDictionary: boolean;
}

export default function ParonymsInterface({
  paronymGroups,
  isLoading,
  statsPeriod,
  setStatsPeriod,
  recordPractice,
  isPersonalDictionary,
}: ParonymsInterfaceProps) {
  // Получаем состояние видимости статистики
  const { isStatsVisible } = useStats();

  // State for the current paronym group being practiced
  const [currentParonymGroup, setCurrentParonymGroup] = useState<ParonymGroup | null>(null);

  // State to track the user's selected paronym
  const [selectedParonym, setSelectedParonym] = useState<string | null>(null);

  // State to store feedback message
  const [feedback, setFeedback] = useState("");

  // State to track if all paronyms are completed
  const [allCompleted, setAllCompleted] = useState(false);

  // Load a random paronym group
  const loadRandomParonymGroup = () => {
    if (paronymGroups.length === 0) {
      setCurrentParonymGroup(null);
      setAllCompleted(true);
      return;
    }

    // Get a random paronym group
    const randomIndex = Math.floor(Math.random() * paronymGroups.length);
    const randomGroup = paronymGroups[randomIndex];

    // Shuffle the paronyms in the group
    const shuffledParonyms = shuffleArray([...randomGroup.paronyms]);
    
    setCurrentParonymGroup({
      ...randomGroup,
      paronyms: shuffledParonyms,
    });
    
    setSelectedParonym(null);
    setFeedback("");
  };

  // Handle user selecting a paronym
  const handleSelect = (paronym: Paronym) => {
    // Only allow selection if no feedback is currently shown
    if (feedback) return;

    // Guard against no current paronym group
    if (!currentParonymGroup) return;

    setSelectedParonym(paronym.word);

    // Check if the selected paronym is correct
    const isCorrect = paronym.isCorrect;

    // Record practice attempt to backend
    if (currentParonymGroup.id) {
      recordPractice(currentParonymGroup.id, paronym.word, isCorrect);
    }

    if (isCorrect) {
      setFeedback("✅ Правильно! " + paronym.explanation);
    } else {
      // Find the correct paronym for the explanation
      const correctParonym = currentParonymGroup.paronyms.find(p => p.isCorrect);
      setFeedback(`❌ Неправильно. Правильный ответ: ${correctParonym?.word}. ${correctParonym?.explanation}`);
    }
  };

  // Load initial paronym group
  useEffect(() => {
    if (paronymGroups.length > 0 && !currentParonymGroup) {
      loadRandomParonymGroup();
    } else if (paronymGroups.length === 0 && !isLoading) {
      setAllCompleted(true);
    }
  }, [paronymGroups, isLoading]);

  // Если на мобильном устройстве открыта статистика, не показываем основной контент
  if (isStatsVisible && window.innerWidth < 768) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar for stats - только для десктопов */}
      <div className="hidden md:block w-1/4 bg-white p-6 overflow-y-auto border-r border-slate-200 shadow-sm flex flex-col">
        <PracticeStats
          type="PARONYM"
          period={statsPeriod}
          onPeriodChange={setStatsPeriod}
        />
        
        {/* Source indicator */}
        {isPersonalDictionary && (
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
            Вы практикуете паронимы из личного словаря
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="w-full md:w-3/4 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto my-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-slate-800">
            Тренажер паронимов
          </h1>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : allCompleted ? (
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-800">
                {paronymGroups.length === 0 
                  ? (isPersonalDictionary 
                    ? "В вашем словаре нет паронимов для практики" 
                    : "Список паронимов для практики пуст")
                  : "Поздравляем!"}
              </h2>
              {paronymGroups.length === 0 ? (
                <p className="text-slate-600 mb-6">
                  {isPersonalDictionary
                    ? "Добавьте паронимы в личный словарь во время обычной практики"
                    : "Пожалуйста, обратитесь к администратору для добавления паронимов"}
                </p>
              ) : (
                <>
                  <p className="text-slate-600 mb-6">
                    Вы прошли все доступные паронимы. Хотите продолжить практику?
                  </p>
                  <button
                    onClick={loadRandomParonymGroup}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Практиковаться еще
                  </button>
                </>
              )}
            </div>
          ) : currentParonymGroup ? (
            <>
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg mb-4 sm:mb-6 relative">
                {/* Кнопка для личного словаря (только в обычном режиме) */}
                {!isPersonalDictionary && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <PersonalDictionaryButton
                      type={PracticeType.PARONYM}
                      id={currentParonymGroup.id}
                    />
                  </div>
                )}

                <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
                  {currentParonymGroup.context}
                </h2>
                
                {/* Варианты паронимов */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {currentParonymGroup.paronyms.map((paronym) => (
                    <button
                      key={paronym.word}
                      onClick={() => handleSelect(paronym)}
                      disabled={!!feedback}
                      className={`
                        p-4 rounded-xl text-lg font-medium transition-all duration-200
                        ${!feedback ? 'hover:bg-indigo-50 hover:border-indigo-200 active:bg-indigo-100' : ''}
                        ${selectedParonym === paronym.word && paronym.isCorrect ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : ''}
                        ${selectedParonym === paronym.word && !paronym.isCorrect ? 'bg-rose-100 border-rose-300 text-rose-800' : ''}
                        ${!selectedParonym ? 'bg-white border-slate-200 text-slate-700' : ''}
                        ${feedback && paronym.isCorrect && selectedParonym !== paronym.word ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : ''}
                        border-2
                      `}
                    >
                      {paronym.word}
                    </button>
                  ))}
                </div>
                
                {/* Сообщение с обратной связью */}
                {feedback && (
                  <div className={`mt-4 sm:mt-6 p-4 rounded-xl mx-auto
                    ${feedback.includes('Правильно') 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'}`}
                  >
                    <p className="text-base sm:text-lg mb-2">
                      {feedback.split('.')[0]}
                    </p>
                    <p className="text-sm sm:text-base">
                      {feedback.split('.').slice(1).join('.')}
                    </p>
                  </div>
                )}
                
                {/* Кнопка для перехода к следующему паронимы */}
                {feedback && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={loadRandomParonymGroup}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Следующий пароним
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




