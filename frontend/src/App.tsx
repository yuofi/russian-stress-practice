import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StressPracticePage from './pages/StressPracticePage';
import ParonymsPage from './pages/ParonymsPage';
import Navigation from './components/Navigation';
import { TrpcProvider } from './utils/trpc';
import { AppContextProvider } from './utils/ctx';
import { GetLogOut, GetParonymsPractice, GetStressPractice } from './utils/routes';
import { LogOutPage } from './pages/LogOutPage';

export default function App() {
  return (
    <TrpcProvider>
      <AppContextProvider>
        <Router basename="/russian-stress-practice">
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <div className="flex-grow">
              <Routes>
                <Route path={GetStressPractice()} element={<StressPracticePage />} />
                <Route path={GetParonymsPractice()} element={<ParonymsPage />} />
                <Route path={GetLogOut()} element={<LogOutPage />} />
                <Route path="*" element={<div>404</div>} />
              </Routes>
            </div>
          </div>
        </Router>
      </AppContextProvider>
    </TrpcProvider>
  );
}
