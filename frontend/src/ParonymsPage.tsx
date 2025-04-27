import React, { useState, useEffect } from 'react';
import paronymData from './paronyms';

export default function ParonymsPage() {
    const [currentParonymGroup, setCurrentParonymGroup] = useState<{ group: string[]; paronyms: { word: string; explanation: string; }[]; } | null>(null);
    const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    // Function to shuffle an array
    const shuffleArray = (array: any[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
        }
        return newArray;
    };

    // Function to display a new question
    const displayNewQuestion = () => {
        // Clear previous feedback and explanations
        setShowFeedback(false);
        setShowExplanation(false);
        setSelectedAnswer(null);

        // Select a random paronym group
        const randomGroup = paronymData[Math.floor(Math.random() * paronymData.length)];
        setCurrentParonymGroup(randomGroup);

        // Select a random paronym from the group as the correct answer
        const correctParonymObject = randomGroup.paronyms[Math.floor(Math.random() * randomGroup.paronyms.length)];
        setCorrectAnswer(correctParonymObject.word);
    };

    // Function to handle user's answer
    interface Paronym {
        word: string;
        explanation: string;
    }

    interface ParonymGroup {
        group: string[];
        paronyms: Paronym[];
    }

    const handleAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        setShowFeedback(true);

        if (answer === correctAnswer) {
            setIsCorrect(true);
            setScore(score + 1);
        } else {
            setIsCorrect(false);
        }

        setShowExplanation(true);
    };

    // Initialize with a question on component mount
    useEffect(() => {
        displayNewQuestion();
    }, []);

    if (!currentParonymGroup) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center p-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-auto text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-slate-700 text-lg">Загрузка паронимов...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center p-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-2xl w-full mx-auto my-auto overflow-hidden">
                <h1 className="text-3xl font-bold mb-8 text-center text-slate-800">Тренажер паронимов</h1>

                <div className="flex flex-col items-center">
                    {currentParonymGroup && correctAnswer && (
                        <>
                            <div className="bg-slate-50 p-5 rounded-xl mb-6 w-full">
                                <p className="text-lg text-center text-slate-700 leading-relaxed">
                                    Выберите подходящее слово, соответствующее значению:
                                    <span className="font-medium block mt-2 text-indigo-700">
                                        "{currentParonymGroup.paronyms.find(p => p.word === correctAnswer)?.explanation}"
                                    </span>
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 mb-6 w-full">
                                {shuffleArray(currentParonymGroup.paronyms).map((paronym) => (
                                    <button
                                        key={paronym.word}
                                        onClick={() => handleAnswer(paronym.word)}
                                        disabled={showFeedback}
                                        className={`
                                            py-3 px-6 rounded-xl font-medium text-lg transition-all duration-200 break-words max-w-full
                                            ${showFeedback && paronym.word === correctAnswer
                                                ? 'bg-emerald-500 text-white shadow-md transform scale-105'
                                                : ''}
                                            ${showFeedback && paronym.word === selectedAnswer && paronym.word !== correctAnswer
                                                ? 'bg-rose-500 text-white'
                                                : ''}
                                            ${!showFeedback
                                                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md hover:transform hover:scale-105 active:bg-indigo-50'
                                                : ''}
                                            ${showFeedback && paronym.word !== selectedAnswer && paronym.word !== correctAnswer
                                                ? 'bg-slate-100 text-slate-400 border border-slate-200'
                                                : ''}
                                            focus:outline-none focus:ring-0
                                        `}
                                    >
                                        {paronym.word}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Feedback message - always reserve space for it */}
                    <div className={`text-center font-medium text-lg mb-6 py-4 px-6 rounded-xl w-full max-w-md mx-auto transform transition-all duration-300 ease-in-out min-h-[80px] flex items-center justify-center
                        ${!showFeedback ? 'opacity-0' : ''}
                        ${showFeedback && isCorrect
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : showFeedback ? 'bg-rose-50 text-rose-700 border border-rose-200' : ''}`}>
                        {showFeedback ? (
                            isCorrect
                                ? (
                                    <div className="flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Правильно!
                                    </div>
                                )
                                : (
                                    <div>
                                        <div className="flex items-center justify-center mb-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Неправильно
                                        </div>
                                        <div className="text-sm mt-1">
                                            Правильный ответ: <span className="font-semibold">{correctAnswer}</span>
                                        </div>
                                    </div>
                                )
                        ) : (
                            <span className="invisible">Placeholder for feedback</span>
                        )}
                    </div>

                    {/* Explanation section - always reserve space with min-height */}
                    <div className={`mt-6 border-t border-slate-100 pt-6 w-full transition-opacity duration-300 ${!showExplanation ? 'opacity-0 h-0 overflow-hidden' : ''}`}>
                        <h3 className="text-xl font-semibold mb-4 text-slate-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Объяснения:
                        </h3>
                        <div className="bg-slate-50 rounded-xl p-4 divide-y divide-slate-200">
                            {currentParonymGroup?.paronyms.map((paronym) => (
                                <div key={paronym.word} className="py-3 first:pt-0 last:pb-0">
                                    <p className="text-slate-700">
                                        <span className="font-semibold text-indigo-700">{paronym.word}:</span> {paronym.explanation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {showFeedback && (
                        <div className="flex justify-center w-full mt-8">
                            <button
                                onClick={displayNewQuestion}
                                className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl shadow-md hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 ease-in-out mx-auto focus:outline-none focus:ring-0 transform hover:scale-105"
                            >
                                Следующее слово
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
