import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import trpc from '../../utils/trpc';
import { Loader } from '../../components/Loader';
import PersonalDictionaryButton from '../../components/PersonalDictionaryButton';
import { PracticeType, PersonalDictionaryWord, PersonalDictionaryParonym } from '../../types/practice';
import { useMe } from '../../utils/ctx';
import { Link } from 'react-router-dom';
import { GetStressPractice, GetParonymsPractice } from '../../utils/routes';

const PersonalDictionaryPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const me = useMe();
  
  // Получаем слова с ударениями из личного словарика
  const { 
    data: stressData, 
    isLoading: isLoadingStress,
    refetch: refetchStressData
  } = trpc.GetPersonalDictionary.useQuery(
    { type: PracticeType.STRESS },
    { 
      enabled: selectedTab === 0 && !!me,
      onError: (error) => {
        console.error("Ошибка при загрузке слов:", error);
      }
    }
  );
  
  // Получаем паронимы из личного словарика
  const { 
    data: paronymsData, 
    isLoading: isLoadingParonyms,
    refetch: refetchParonymsData
  } = trpc.GetPersonalDictionary.useQuery(
    { type: PracticeType.PARONYM },
    { 
      enabled: selectedTab === 1 && !!me,
      onError: (error) => {
        console.error("Ошибка при загрузке паронимов:", error);
      }
    }
  );
  
  // Обработчик удаления элемента из словаря
  const handleToggle = (isPersonal: boolean) => {
    if (selectedTab === 0) {
      refetchStressData();
    } else {
      refetchParonymsData();
    }
  };
  
  // Функция для отображения слова с ударением
  const renderWordWithStress = (word: string, accentIdx: number) => {
    return (
      <>
        {word.substring(0, accentIdx)}
        <span className="text-indigo-600 font-bold">
          {word.charAt(accentIdx)}
        </span>
        {word.substring(accentIdx + 1)}
      </>
    );
  };
  
  // Если пользователь не авторизован
  if (!me) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center py-12 bg-white rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold mb-6 text-slate-800">
            Личный словарик
          </h1>
          <p className="text-slate-500 mb-6">
            Для доступа к личному словарику необходимо авторизоваться.
          </p>
          <button
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => window.location.href = "/auth/login"}
          >
            Войти
          </button>
        </div>
      </div>
    );
  }
  
  // Функция для создания URL с параметром source=dictionary
  const getPracticeUrlWithDictionarySource = (baseUrl: string) => {
    return `${baseUrl}?source=dictionary`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">
          Личный словарик
        </h1>
        
        <Tab.Group onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 mb-6 shadow-sm">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                ${
                  selected
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              Ударения
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                ${
                  selected
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              Паронимы
            </Tab>
          </Tab.List>
          
          <Tab.Panels>
            {/* Панель с ударениями */}
            <Tab.Panel>
              {isLoadingStress ? (
                <div className="flex justify-center py-12">
                  <Loader />
                </div>
              ) : stressData?.words && stressData.words.length > 0 ? (
                <div>
                  <div className="mb-4 flex justify-end">
                    <Link 
                      to={getPracticeUrlWithDictionarySource(GetStressPractice())}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Практиковать слова из словаря
                    </Link>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <ul className="divide-y divide-slate-100">
                      {stressData.words.map((word) => (
                        <li key={word.id} className="p-4 flex justify-between items-center">
                          <div>
                            <p className="text-lg font-medium text-slate-800">
                              {renderWordWithStress(word.word, word.accentIdx)}
                            </p>
                            {word.history.length > 0 && (
                              <p className="text-xs text-slate-500 mt-1">
                                Последняя практика: {new Date(word.history[0].date).toLocaleDateString()}
                                {word.history[0].correct ? ' ✓' : ' ✗'}
                              </p>
                            )}
                          </div>
                          <PersonalDictionaryButton
                            type={PracticeType.STRESS}
                            id={word.id}
                            initialIsPersonal={true}
                            onToggle={handleToggle}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <p className="text-slate-500">
                    В вашем личном словарике пока нет слов с ударениями.
                  </p>
                  <p className="text-slate-500 mt-2 mb-6">
                    Добавьте слова из практики, нажав на иконку закладки.
                  </p>
                  <Link 
                    to={GetStressPractice()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Перейти к практике ударений
                  </Link>
                </div>
              )}
            </Tab.Panel>
            
            {/* Панель с паронимами */}
            <Tab.Panel>
              {isLoadingParonyms ? (
                <div className="flex justify-center py-12">
                  <Loader />
                </div>
              ) : paronymsData?.paronyms && paronymsData.paronyms.length > 0 ? (
                <div>
                  <div className="mb-4 flex justify-end">
                    <Link 
                      to={getPracticeUrlWithDictionarySource(GetParonymsPractice())}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Практиковать паронимы из словаря
                    </Link>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <ul className="divide-y divide-slate-100">
                      {paronymsData.paronyms.map((pair) => (
                        <li key={pair.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-lg font-medium text-slate-800">
                                {pair.group.join(' / ')}
                              </p>
                            </div>
                            <PersonalDictionaryButton
                              type={PracticeType.PARONYM}
                              id={pair.id}
                              initialIsPersonal={true}
                              onToggle={handleToggle}
                            />
                          </div>
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {pair.paronyms.map((paronym) => (
                              <div key={paronym.id} className="bg-slate-50 p-3 rounded-lg">
                                <p className="font-medium text-indigo-700">{paronym.word}</p>
                                <p className="text-sm text-slate-600 mt-1">{paronym.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <p className="text-slate-500">
                    В вашем личном словарике пока нет паронимов.
                  </p>
                  <p className="text-slate-500 mt-2 mb-6">
                    Добавьте паронимы из практики, нажав на иконку закладки.
                  </p>
                  <Link 
                    to={GetParonymsPractice()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Перейти к практике паронимов
                  </Link>
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default PersonalDictionaryPage;




