import React, { useState } from "react";
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
import { GetLogOut, GetParonymsPractice, GetStressPractice } from "../utils/routes";

export default function Navigation() {
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const me = useMe();

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-slate-200 text-slate-700 py-4 px-6 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold text-indigo-600 flex items-center">
            <SymbolLogo />
            Русский язык: Тренажеры
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to={GetStressPractice()}
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium focus:outline-none ${
                location.pathname === "/"
                  ? "bg-indigo-100 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
              }`}
            >
              <div className="flex items-center">
                <StressLogo />
                Ударения
              </div>
            </Link>
            <Link
              to={GetParonymsPractice()}
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium focus:outline-none ${
                location.pathname === "/paronyms"
                  ? "bg-indigo-100 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
              }`}
            >
              <div className="flex items-center">
                <ParonymsLogo />
                Паронимы
              </div>
            </Link>
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

      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
