import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StressPracticePage from './StressPracticePage';
import ParonymsPage from './ParonymsPage';
import Navigation from './components/Navigation';

export default function App() {
  return (
    <Router basename="/russian-stress-practice">
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<StressPracticePage />} />
            <Route path="/paronyms" element={<ParonymsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
