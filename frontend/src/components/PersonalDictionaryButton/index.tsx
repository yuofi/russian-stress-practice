import React, { useState, useEffect } from 'react';
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import trpc from '../../utils/trpc';

interface PersonalDictionaryButtonProps {
  type: 'STRESS' | 'PARONYM';
  id: number | undefined;
  initialIsPersonal?: boolean;
  onToggle?: (isPersonal: boolean) => void;
}

const PersonalDictionaryButton: React.FC<PersonalDictionaryButtonProps> = ({
  type,
  id,
  initialIsPersonal,
  onToggle,
}) => {
  const [isPersonal, setIsPersonal] = useState(initialIsPersonal || false);
  
  // Проверяем, находится ли элемент в личном словарике
  const { data: checkResult } = trpc.CheckPersonalItem.useQuery(
    { type, id: id! },
    { enabled: id !== undefined && initialIsPersonal === undefined }
  );
  
  // Обновляем состояние, когда получаем результат проверки
  useEffect(() => {
    if (checkResult) {
      setIsPersonal(checkResult.isPersonal);
    }
  }, [checkResult]);
  
  // Мутации для добавления/удаления из личного словарика
  const togglePersonalWord = trpc.TogglePersonalWord.useMutation({
    onSuccess: () => {
      setIsPersonal(!isPersonal);
      if (onToggle) {
        onToggle(!isPersonal);
      }
      // Инвалидируем кеш для обновления списка личного словарика
      trpc.useContext().GetPersonalDictionary.invalidate();
      trpc.useContext().CheckPersonalItem.invalidate();
    },
  });

  const togglePersonalParonym = trpc.TogglePersonalParonym.useMutation({
    onSuccess: () => {
      setIsPersonal(!isPersonal);
      if (onToggle) {
        onToggle(!isPersonal);
      }
      // Инвалидируем кеш для обновления списка личного словарика
      trpc.useContext().GetPersonalDictionary.invalidate();
      trpc.useContext().CheckPersonalItem.invalidate();
    },
  });

  const handleToggle = () => {
    if (!id) return;
    if (type === 'STRESS') {
      togglePersonalWord.mutate({
        wordId: id,
        isPersonal: !isPersonal,
      });
    } else if (type === 'PARONYM') {
      togglePersonalParonym.mutate({
        paronymPairId: id,
        isPersonal: !isPersonal,
      });
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full hover:bg-slate-100 transition-colors"
      title={isPersonal ? "Удалить из личного словарика" : "Добавить в личный словарик"}
    >
      {isPersonal ? (
        <BookmarkSolidIcon className="h-5 w-5 text-indigo-600" />
      ) : (
        <BookmarkOutlineIcon className="h-5 w-5 text-slate-500" />
      )}
    </button>
  );
};

export default PersonalDictionaryButton;