// contexts/MillisecondsContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface MillisecondsContextType {
  isMillisecondsMode: boolean;
  toggleMillisecondsMode: () => void;
}

const MillisecondsContext = createContext<MillisecondsContextType | undefined>(undefined);

interface MillisecondsProviderProps {
  children: ReactNode;
}

export function MillisecondsProvider({ children }: MillisecondsProviderProps) {
  const [isMillisecondsMode, setIsMillisecondsMode] = useState(false);

  const toggleMillisecondsMode = () => {
    setIsMillisecondsMode(prev => !prev);
  };

  return (
    <MillisecondsContext.Provider value={{
      isMillisecondsMode,
      toggleMillisecondsMode
    }}>
      {children}
    </MillisecondsContext.Provider>
  );
}

// Hook personnalisé pour utiliser le context
export function useMilliseconds() {
  const context = useContext(MillisecondsContext);
  if (context === undefined) {
    throw new Error('useMilliseconds must be used within a MillisecondsProvider');
  }
  return context;
}
