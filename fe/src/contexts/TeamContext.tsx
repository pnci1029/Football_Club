import React, { createContext, useContext, ReactNode } from 'react';
import { Team } from '../types/team';
import { useSubdomain } from '../hooks/useSubdomain';

interface TeamContextType {
  currentTeam: Team | null;
  isLoading: boolean;
  isAdminMode: boolean;
  teamNotFound: boolean;
}

const TeamContext = createContext<TeamContextType | null>(null);

interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const { currentTeam, isLoading, isAdminMode, teamNotFound } = useSubdomain();

  return (
    <TeamContext.Provider value={{ currentTeam, isLoading, isAdminMode, teamNotFound }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = (): TeamContextType => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam은 TeamProvider 내에서 사용되어야 합니다');
  }
  return context;
};