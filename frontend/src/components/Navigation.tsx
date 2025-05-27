import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Login from "./Login";
import {
  LogoutIcon,
  ParonymsLogo,
  SignInLogo,
  StressLogo,
  SymbolLogo,
} from "./svg/svgNative";
import { useMe } from "../utils/ctx";
import { useStats } from "../utils/statsContext";
import { GetLogOut, GetParonymsPractice, GetStressPractice, GetPersonalDictionary } from "../utils/routes";

export default function Navigation() {
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const me = useMe();
  const { toggleStats } = useStats();

  // Содержимое навигации, которое будет использоваться и вверху, и внизу
  const navigationContent = (
    <>
      <Link
        to={GetStressPractice()}
        className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium focus:outline-none ${
          location.pathname === GetStressPractice()
            ? "bg-indigo-100 text-indigo-700 shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
        }`}
      >
        <div className="flex items-center">
          <StressLogo />
          <span className="hidden md:inline">Ударения</span>
        </div>
      </Link>
      <Link
        to={GetParonymsPractice()}
        className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium focus:outline-none ${
          location.pathname === GetParonymsPractice()
            ? "bg-indigo-100 text-indigo-700 shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
        }`}
      >
        <div className="flex items-center">
          <ParonymsLogo />
          <span className="hidden md:inline">Паронимы</span>
        </div>
      </Link>
      <Link
        to={GetPersonalDictionary()}
        className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium focus:outline-none ${
          location.pathname === GetPersonalDictionary()
            ? "bg-indigo-100 text-indigo-700 shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
        }`}
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          <span className="hidden md:inline">Личный словарь</span>
        </div>
      </Link>
    </>
  );

  return (
    <>
      {/* Верхняя навигация - видна только на десктопах */}
      <nav className="bg-white shadow-sm border-b border-slate-200 text-slate-700 py-4 px-6 sticky top-0 z-10 hidden md:block">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold text-indigo-600 flex items-center">
            <SymbolLogo />
            Русский язык: Тренажеры
          </div>
          <div className="flex items-center space-x-2">
            {navigationContent}
            {me ? (
              <div className="flex items-center">
                <div className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {me.name || me.email}
                  <div className="ml-3 p-1 bg-white rounded-lg">
                    <Link to={GetLogOut()}>
                      <button
                        className="px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200 flex items-center"
                      >
                        <LogoutIcon />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex">
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="ml-4 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                >
                  <SignInLogo />
                  Войти
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Верхняя мини-навигация для мобильных - только заголовок и кнопка статистики */}
      <nav className="bg-white shadow-sm border-b border-slate-200 text-slate-700 py-3 px-4 sticky top-0 z-10 md:hidden">
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-indigo-600 flex items-center">
            <SymbolLogo />
            <span className="ml-1">Тренажеры</span>
          </div>
          <button 
            id="stats-toggle-button"
            onClick={toggleStats}
            className="p-2 rounded-lg bg-slate-100 text-slate-700"
            aria-label="Показать статистику"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Нижняя навигация - видна только на мобильных */}
      <nav className="bg-white shadow-lg border-t border-slate-200 text-slate-700 py-2 px-4 fixed bottom-0 left-0 right-0 z-10 md:hidden">
        <div className="flex justify-around items-center">
          {navigationContent}
          {me ? (
            <Link to={GetLogOut()} className="px-3 py-2 rounded-lg text-red-600">
              <LogoutIcon />
            </Link>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-3 py-2 rounded-lg text-indigo-600"
            >
              <SignInLogo />
            </button>
          )}
        </div>
      </nav>

      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
