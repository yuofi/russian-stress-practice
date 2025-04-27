import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 text-slate-700 py-4 px-6 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold text-indigo-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          Русский язык: Тренажеры
        </div>
        <div className="flex space-x-2">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium focus:outline-none ${
              location.pathname === '/'
                ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
            }`}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Ударения
            </div>
          </Link>
          <Link
            to="/paronyms"
            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium focus:outline-none ${
              location.pathname === '/paronyms'
                ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
            }`}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Паронимы
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
