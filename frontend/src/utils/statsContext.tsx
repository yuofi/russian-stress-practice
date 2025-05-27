import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StatsContextType {
  isStatsVisible: boolean;
  toggleStats: () => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [isStatsVisible, setIsStatsVisible] = useState(false);

  const toggleStats = () => {
    setIsStatsVisible(prev => !prev);
  };

  return (
    <StatsContext.Provider value={{ isStatsVisible, toggleStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}

