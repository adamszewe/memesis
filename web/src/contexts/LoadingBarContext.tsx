import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingBarContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingBarContext = createContext<LoadingBarContextType | undefined>(undefined);

export const LoadingBarProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return (
    <LoadingBarContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingBarContext.Provider>
  );
};

export const useLoadingBar = () => {
  const context = useContext(LoadingBarContext);
  if (context === undefined) {
    throw new Error('useLoadingBar must be used within a LoadingBarProvider');
  }
  return context;
};
