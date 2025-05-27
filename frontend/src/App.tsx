import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StressPracticePage from './pages/StressPracticePage';
import ParonymsPage from './pages/ParonymsPage';
import PersonalDictionaryPage from './pages/PersonalDictionaryPage';
import { TrpcProvider } from './utils/trpc';
import { AppContextProvider } from './utils/ctx';
import { StatsProvider } from './utils/statsContext';
import { GetLogOut, GetParonymsPractice, GetPersonalDictionary, GetStressPractice } from './utils/routes';
import { LogOutPage } from './pages/LogOutPage';
import Navigation from './components/Navigation';

export default function App() {
  return (
    <TrpcProvider>
      <AppContextProvider>
        <StatsProvider>
          <Router basename="/russian-stress-practice">
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <div className="flex-grow pb-16 md:pb-0"> {/* Добавляем отступ снизу для мобильной навигации */}
                <Routes>
                  <Route path={GetStressPractice()} element={<StressPracticePage />} />
                  <Route path={GetParonymsPractice()} element={<ParonymsPage />} />
                  <Route path={GetPersonalDictionary()} element={<PersonalDictionaryPage />} />
                  <Route path={GetLogOut()} element={<LogOutPage />} />
                  <Route path="*" element={<div>404</div>} />
                </Routes>
              </div>
            </div>
          </Router>
        </StatsProvider>
      </AppContextProvider>
    </TrpcProvider>
  );
}
