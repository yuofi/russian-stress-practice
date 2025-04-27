import React, { useState, useEffect } from 'react'; // Import useEffect for shuffling on mount

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
  "жерлОЗ",
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
  "отзыв",
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
  "лососЁвый",
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
  "низведЁн",
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
  "расклЁшенный",
  // С
  "свЁкла",
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
  "шофЁр",
  "шпрИцы",
  // Щ
  "щавЕль",
  "щемИт",
  "щЁлкать",
  "щепА",
  // Э
  "экспЕрт",
  "эпилОг"
];

// Define Russian vowels (lowercase)
const vowels = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я'];

// Function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = (array) => {
  const shuffledArray = [...array]; // Create a copy to avoid mutating the original array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
  }
  return shuffledArray;
};

// Parse rawWords into objects with base word and accent position
// Converts uppercase letters marking accent to lowercase and stores the index
const words = rawWords.map(raw => {
  let base = '';
  let accentIdx = null;
  if (typeof raw !== 'string') return { word: '', accentIdx: null }; // defensive check

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    if (typeof char !== 'string') continue; // skip invalid characters

    if (char === char.toUpperCase() && char !== char.toLowerCase()) {
      accentIdx = base.length;
      base += char.toLowerCase();
    } else {
      base += char;
    }
  }
  return { word: base, accentIdx };
});

export default function App() {
  // State to store the shuffled word list
  const [shuffledWords, setShuffledWords] = useState([]);
  // State to track the current word index in the shuffled list
  const [index, setIndex] = useState(0);
  // State to track the user's selected letter index
  const [selected, setSelected] = useState(null);
  // State to store feedback message
  const [feedback, setFeedback] = useState('');
  // State to track the number of incorrect answers
  const [incorrectCount, setIncorrectCount] = useState(0);
  // State to store the list of incorrectly answered words (as full word objects)
  const [incorrectWords, setIncorrectWords] = useState([]);
  // State to determine if practicing all words or just incorrect ones
  const [practiceIncorrect, setPracticeIncorrect] = useState(false);
  // State to track the index when practicing incorrect words
  const [incorrectIndex, setIncorrectIndex] = useState(0);

  // Shuffle words on initial component mount
  useEffect(() => {
    setShuffledWords(shuffleArray(words));
  }, []); // Empty dependency array ensures this runs only once

  // Get the current word object based on practice mode
  const currentWordList = practiceIncorrect && incorrectWords.length > 0 ? incorrectWords : shuffledWords; // Use shuffledWords here
  const currentIndex = practiceIncorrect && incorrectWords.length > 0 ? incorrectIndex : index;
  const current = currentWordList[currentIndex] || { word: '', accentIdx: null };

  // Split the current word into an array of letters
  const letters = current.word ? current.word.split('') : [];

  // Handle user clicking on a letter
  const handleSelect = (idx) => {
    // Only allow selection if no feedback is currently shown (prevents multiple clicks)
    if (feedback) return;

    const clickedLetter = letters[idx].toLowerCase();

    // Only proceed if the clicked letter is a vowel
    if (!vowels.includes(clickedLetter)) {
        return; // Do nothing if it's not a vowel
    }

    setSelected(idx);
    // Check if the selected index matches the correct accent index
    if (idx === current.accentIdx) {
      setFeedback('✅ Правильно!');
    } else {
      // Add word to incorrect list only if not already present
      // We store the full word object here to retain accent info for practice
      if (!incorrectWords.some(wordObj => wordObj.word === current.word)) {
        setIncorrectWords(prevWords => [...prevWords, current]);
      }
      // Increment incorrect count if the answer is wrong
      setIncorrectCount(prevCount => prevCount + 1);
      // Provide feedback with the correct stressed letter if available
      if (current.word && typeof current.accentIdx === 'number' && current.accentIdx < current.word.length) {
        setFeedback(`❌ Неправильно. Правильный слог: ${current.word[current.accentIdx].toUpperCase()}`);
      } else {
        // Fallback for unexpected data issues
        setFeedback('❌ Ошибка в слове.');
      }
    }
  };

  // Move to the next word
  const nextWord = () => {
    setSelected(null);
    setFeedback('');

    if (practiceIncorrect && incorrectWords.length > 0) {
        // Move to the next incorrect word
        setIncorrectIndex((prevIdx) => (prevIdx + 1) % incorrectWords.length);
    } else {
        // Move to the next word in the shuffled list
        setIndex((prevIdx) => (prevIdx + 1) % shuffledWords.length); // Loop back to the beginning
    }
  };

  // Toggle between practicing all words and incorrect words
  const togglePracticeMode = () => {
      setPracticeIncorrect(prevMode => !prevMode);
      // Reset index when changing mode
      setIndex(0);
      setIncorrectIndex(0);
      setSelected(null);
      setFeedback('');
  };

  return (
    // Main container with flex layout for sidebar and main content
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar for incorrect words */}
      {/* Added flex-col and justify-between for bottom alignment of the button */}
      <div className="w-1/4 bg-gray-200 p-4 overflow-y-auto border-r border-gray-300 flex flex-col">
        <div> {/* Container for the list */}
            <h2 className="text-xl font-bold mb-4 text-gray-800">Ошибки</h2>
            {incorrectWords.length === 0 ? (
              <p className="text-gray-600">Пока нет ошибок.</p>
            ) : (
              <ul>
                {incorrectWords.map((wordObj, i) => (
                  <li key={i} className="mb-2 text-gray-700 border-b border-gray-300 pb-1 last:border-b-0">
                    {wordObj.word}
                  </li>
                ))}
              </ul>
            )}
        </div>

        {/* Practice mode toggle button - Moved to the bottom of the sidebar */}
        {/* Added mt-auto to push it to the bottom */}
        <button
          onClick={togglePracticeMode}
          className="mt-auto px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition duration-200 ease-in-out text-sm w-full"
        >
          {practiceIncorrect ? 'Практиковать все слова' : 'Практиковать ошибки'}
        </button>
      </div>

      {/* Main content area */}
      {/* Increased max-w-md to max-w-lg to make the area wider */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg text-center"> {/* Changed max-w-md to max-w-lg */}
          {/* Title */}
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Практика ударений</h1>

          {/* Incorrect count display */}
          <div className="mb-4 text-lg text-red-600">
            Ошибок: {incorrectCount}
          </div>

          {/* Display current practice mode */}
          <div className="mb-4 text-gray-700">
              Режим: {practiceIncorrect && incorrectWords.length > 0 ? `Ошибки (${incorrectWords.length})` : 'Все слова'}
              {practiceIncorrect && incorrectWords.length === 0 && <span className="text-red-500 ml-2">Нет ошибок для практики</span>}
          </div>


          {/* Word display area */}
          {/* Added whitespace-nowrap to prevent wrapping */}
          <div className="mb-6 text-2xl font-medium text-gray-700 whitespace-nowrap overflow-x-auto">
            {letters.map((l, i) => {
                const isVowel = vowels.includes(l.toLowerCase());
                // Clickable if it's a vowel AND no feedback is shown AND there are incorrect words if in practiceIncorrect mode
                const isClickable = isVowel && feedback === '' && !(practiceIncorrect && incorrectWords.length === 0);

                return (
                  // Button for each letter, allowing selection
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    // Dynamic styling based on selection and feedback - removed vowel/non-vowel specific styling
                    className={`
                      px-2 py-1 mx-0.5 rounded
                      transition duration-200 ease-in-out
                      ${selected === i
                        ? (i === current.accentIdx ? 'bg-green-400 text-white' : 'bg-red-400 text-white') // Green for correct, Red for incorrect
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800' // Default styling for all letters
                      }
                      ${feedback && i === current.accentIdx && selected !== current.accentIdx ? 'bg-green-400 text-white' : ''} // Highlight correct answer after incorrect attempt
                      ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'} // Only change cursor for non-clickable letters
                    `}
                    disabled={!isClickable} // Disable buttons if not clickable
                  >
                    {/* Display the letter */}
                    {l}
                  </button>
                );
            })}
          </div>

          {/* Feedback message area */}
          {feedback && (
            <div
              className={`my-4 p-3 rounded-md ${
                feedback.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {feedback}
            </div>
          )}

          {/* Next word button */}
          <button
            onClick={nextWord}
            className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200 ease-in-out"
            disabled={practiceIncorrect && incorrectWords.length === 0} // Disable if no incorrect words to practice
          >
            Следующее слово
          </button>
        </div>
      </div>
    </div>
  );
}
