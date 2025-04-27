import React, { useState, useEffect, useMemo } from 'react';
import { initializeWords, updateWord, getDueWords, computeNextReview, addDays } from './utils';

// Raw list with uppercase marking the stressed vowel
const rawWords = [
  "Августовский",
  "агЕнт",
  "алфавИт",
  "алкогОль",
  "аэропОрты",
  "аристокрАтия",
  "апострОф",
  "агронОмия",
  "асимметрИя",
  // Б
  "балОванный",
  "баловАть",
  "баловАться",
  "балУясь",
  "бАнты",
  "безУдержный",
  "бОроду",
  "бОчковый",
  "бухгАлтеров",
  "благоволИть",
  "блАговест",
  "бряцАть",
  "бУнгало",
  "брОня на билеты",
  "бронЯ у танка",
  "бюрокрАтия",
  "брюшкО",
  "бракОвщик",
  // В
  "вЕчеря",
  "вероисповЕдание",
  "взбешЕнный",
  "ворожеЯ",
  "вОзрастов",
  "втрИдешева",
  // Г
  "гЕнезис",
  "гЕрбовый",
  "граждАнство",
  "грУшевый",
  "граффИти",
  "гастронОмия",
  "грАблями",
  // Д
  "давнИшний",
  "дефИс",
  "деньгАх",
  "дешевИзна",
  "дозИровать",
  "долбЯщий",
  "докраснА",
  "донЕльзя",
  "дОнизу",
  "досУг",
  "дОсуха",
  "доЯр",
  "духовнИк",
  "домОвая книга",
  // Е
  "еретИк",
  // Ж
  "жалюзИ",
  "жилОсь",
  "жерлОз",
  // З
  "завсегдАтай",
  "завИдно",
  "зАгодя",
  "закУпорив",
  "зАтемно",
  "знАчимый",
  "зимОвщик",
  "зубчАтый",
  "знАмение",
  // И
  "ирИс",
  "Ирис",
  "искрА зажигания",
  "Иконопись",
  "Исподволь",
  "избалОванный",
  "издрЕвле",
  "Иксы с Иксом",
  "исключИт",
  "Исстари",
  "исчЕрпав",
  "исчЕрпать",
  // К
  "каталОг",
  "кАмбала",
  "крапИва",
  "кАшлянуть",
  "квартАл",
  "киломЕтр",
  "клАла",
  "кремЕнь",
  "кремнЯ",
  "крЕмы",
  "костюмирОванный",
  "кулинАрия",
  "коклЮш",
  "красИвее",
  "крАны",
  "корЫсть",
  "кровоточИть",
  "кровоточАщий",
  "кУхонный",
  "кладовАя",
  "опОшлят",
  "оптОвый",
  "освЕдомиться",
  "отзЫв",
  "откУпорил",
  "отрочество",
  "oполОснутый",
  "озвУчение",
  "одновремЕнно",
  "крАдучись",
  "куркУма",
  "кичИться",
  "кедрОвый",
  // Л
  "лЕкторов",
  "ловкА",
  "лососЕвый",
  "лыжнЯ",
  // М
  "мастерскИ",
  "мЕстностей",
  "мозаИчный",
  "мещанИн",
  "молЯщий",
  "мусоропровОд",
  "мытАрство",
  "мЕльком",
  // Н
  "наделИт",
  "надОлго",
  "намЕрение",
  "нарОст",
  "насорИт",
  "нЕдруг",
  "недУг",
  "насквОзь",
  "назвАный брат",
  "наговОр",
  "ненадОлго",
  "низведЕн",
  "нОвости",
  "новостЕй",
  "нОгтя",
  "нормировАть",
  // О
  "обеспЕчение",
  "ободрИть",
  "ободренА",
  "одолжИт",
  "озлОбить",
  "окружИт",
  "опломбировАть",
  // П
  "партЕр",
  "пАмятуя",
  "пЕрчит",
  "плЕсневеть",
  "плодоносИть",
  "пОручни",
  "послАла",
  "прИбыл",
  "придАное",
  "принУдить",
  "прИнятый",
  "принялсЯ",
  "прозорлИва",
  "прожОрлива",
  "подчАс",
  "тОтчас",
  "пЕтля",
  "пЕтелька",
  "пЕня",
  "простынЯ",
  "пУрпур",
  "платО",
  "прИкус",
  "пулОвер",
  "поутрУ",
  "пригУбить",
  "плешИна",
  // Р
  "ржавЕть",
  "расклЕшенный",
  // С
  "свЕкла",
  "сверлИт",
  "сверлИшь",
  "серА",
  "сЕры",
  "сЕтчатый",
  "сирОты",
  "слИвовый",
  "сОгнутый",
  "созЫв",
  "сорИт",
  "срЕдства",
  "срЕдствами",
  "стАтуя",
  "столЯр",
  "сосредотОчение",
  "скулА",
  "скобА",
  "страхОвщик",
  // Т
  "тЕплится",
  "тОрты",
  "тОтчас",
  "танцОвщица",
  "толИка",
  "тУфля",
  // У
  "убыстрИть",
  "углубИть",
  "украИнский",
  "укрепИт",
  "умЕрший",
  "усугубИт",
  "упрОчение",
  // Ф
  "фенОмен",
  "фОрзац",
  "фетИш",
  "факсИмиле",
  // Х
  "ходАтайствовать",
  "христианИн",
  "хозЯева",
  "хОленный",
  // Ц
  "цемЕнт",
  "цЕнтнер",
  "цепОчка",
  "цыгАн",
  // Ч
  "чЕлюстей",
  "чЕрпать",
  // Ш
  "шАрфы",
  "шофЕр",
  "шпрИцы",
  // Щ
  "щавЕль",
  "щемИт",
  "щЕлкать",
  "щепА",
  // Э
  "экспЕрт",
  "эпилОг"
];

// Define Russian vowels (lowercase)
const vowels = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я'];

export default function App() {
  // Today's date for scheduling
  const today = useMemo(() => new Date(), []);

  // State for all words with learning metadata
  const [words, setWords] = useState(() => initializeWords(rawWords));

  // State for the current word being practiced
  const [currentWord, setCurrentWord] = useState(null);

  // State to track if we need a retry on the current word
  const [requireRetry, setRequireRetry] = useState(false);

  // State to track the user's selected letter index
  const [selected, setSelected] = useState(null);

  // State to store feedback message
  const [feedback, setFeedback] = useState('');

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
    return words.filter(w => w.retired);
  }, [words]);

  // Split the current word into an array of letters
  const letters = currentWord?.word ? currentWord.word.split('') : [];

  // Load the next word to practice
  const loadNextWord = () => {
    const due = getDueWords(words, today);

    if (due.length > 0) {
      setCurrentWord(due[0]);
      setAllLearned(false);
    } else {
      setCurrentWord(null);
      setAllLearned(true);
    }

    setSelected(null);
    setFeedback('');
    setRequireRetry(false);
  };

  // Handle first correct answer
  const handleFirstCorrect = () => {
    setFeedback('✅ Правильно! Попробуй ещё раз.');
    setRequireRetry(true);
    // Don't reset selected state here - we want to show the green highlight
  };

  // Handle first wrong answer
  const handleFirstWrong = (idx) => {
    // Increment incorrect count
    setIncorrectCount(prevCount => prevCount + 1);

    // Simplified feedback - just show "Неправильно"
    setFeedback(`❌ Неправильно`);

    // Update the word's stats
    setWords(prevWords =>
      updateWord(prevWords, currentWord, w => {
        w.correctStreak = 0;
        w.wrongCount += 1;
        w.nextReview = addDays(today, 1);
      })
    );

    setRequireRetry(true);
    // Don't reset selected state here - we want to show the red highlight
  };

  // Handle the second attempt (retry)
  const finalizeRetry = (idx) => {
    // First, update the word stats if correct and show feedback
    if (idx === currentWord.accentIdx) {
      // Show feedback for correct answer
      setFeedback('✅ Правильно!');

      // Update word stats - increase streak and schedule next review
      setWords(prevWords =>
        updateWord(prevWords, currentWord, w => {
          w.correctStreak += 1;
          w.nextReview = computeNextReview(w.correctStreak, today);
          if (w.correctStreak >= 4) w.retired = true;
        })
      );
    } else {
      // Show simplified feedback for incorrect answer
      setFeedback(`❌ Неправильно`);
    }

    // Mark retry as complete, but don't move to next word yet
    // User will need to click "Next word" button
    setRequireRetry(false);
  };

  // Handle user clicking on a letter
  const handleSelect = (idx) => {
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
  const toggleWordDisplay = () => {
    setShowAllWords(prev => !prev);
  };

  return (
    // Main container with flex layout for sidebar and main content
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar for word stats */}
      <div className="w-1/4 bg-gray-200 p-4 overflow-y-auto border-r border-gray-300 flex flex-col">
        <div> {/* Container for the stats */}
          <h2 className="text-xl font-bold mb-4 text-gray-800">Статистика</h2>

          <div className="mb-4">
            <p className="font-semibold text-gray-700">Всего слов: {words.length}</p>
            <p className="font-semibold text-green-700">Выучено: {retiredWords.length}</p>
            <p className="font-semibold text-blue-700">Осталось: {words.length - retiredWords.length}</p>
            <p className="font-semibold text-orange-700">На сегодня: {dueWords.length}</p>
            <p className="font-semibold text-red-700">Ошибок: {incorrectCount}</p>
          </div>

          <h3 className="text-lg font-bold mb-2 text-gray-800">
            {showAllWords ? 'Все слова' : 'Слова на изучении'}
          </h3>

          <ul className="max-h-96 overflow-y-auto mb-4">
            {(showAllWords ? words : words.filter(w => !w.retired)).map((wordObj, i) => (
              <li key={i} className="mb-2 text-gray-700 border-b border-gray-300 pb-1 last:border-b-0 flex justify-between">
                <span>{wordObj.word}</span>
                <span className={`${wordObj.retired ? 'text-green-600' : 'text-blue-600'}`}>
                  {wordObj.retired ? '✓' : `${wordObj.correctStreak}/4`}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Toggle button */}
        <button
          onClick={toggleWordDisplay}
          className="mt-auto px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition duration-200 ease-in-out text-sm w-full"
        >
          {showAllWords ? 'Показать изучаемые' : 'Показать все слова'}
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg text-center">
          {/* Title */}
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Практика ударений</h1>

          {allLearned ? (
            // Show congratulations message when all words are learned
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-green-600 mb-4">Поздравляем!</h2>
              <p className="text-lg mb-4">Вы выучили все слова на сегодня.</p>
              <p className="text-md text-gray-600">Приходите завтра для повторения.</p>
            </div>
          ) : (
            // Regular practice UI
            <>
              {/* Progress display */}
              <div className="mb-4 flex justify-between text-gray-700">
                <span>Выучено: {retiredWords.length}/{words.length}</span>
                <span>Осталось сегодня: {dueWords.length}</span>
              </div>

                {/* Current word info */}
                {currentWord && (
                  <div className="mb-2 text-sm text-gray-500">
                    Серия правильных: {currentWord.correctStreak}/4
                    {currentWord.wrongCount > 0 && ` • Ошибок: ${currentWord.wrongCount}`}
                  </div>
                )}

                {/* Word display area */}
                <div className="mb-6 text-2xl font-medium text-gray-700 whitespace-nowrap overflow-x-auto">
                  {letters.map((l, i) => {
                    const isVowel = vowels.includes(l.toLowerCase());
                    // Clickable if it's a vowel AND (no feedback OR requireRetry is true)
                    const isClickable = isVowel && (feedback === '' || requireRetry);

                    return (
                      // Button for each letter, allowing selection
                      <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        className={`
                        px-2 py-1 mx-0.5 rounded
                        transition duration-200 ease-in-out
                        ${selected === i
                          ? (i === currentWord?.accentIdx ? 'bg-green-400 text-white' : 'bg-red-400 text-white')
                          : (feedback && feedback.includes('Неправильно') && i === currentWord?.accentIdx ? 'bg-green-400 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800')
                        }
                        ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `}
                        disabled={!isClickable}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback message area */}
                {feedback && (
                  <div
                    className={`my-4 p-3 rounded-md ${feedback.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {feedback}
                  </div>
                )}

                {/* Next word button - changes text based on retry state */}
                {requireRetry ? (
                  <button
                    onClick={() => {
                      // Clear feedback and reset selected state to prepare for retry
                      setFeedback('');
                      setSelected(null);
                    }}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200 ease-in-out"
                  >
                    Попробуй ещё раз
                  </button>
                ) : (
                  <button
                    onClick={loadNextWord}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200 ease-in-out"
                    disabled={feedback !== '' && requireRetry}
                  >
                    Следующее слово
                  </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
