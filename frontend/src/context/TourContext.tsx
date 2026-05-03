import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface TourContextValue {
  run: boolean;
  stepIndex: number;
  startTour: () => void;
  skipTour: () => void;
  finishTour: () => void;
  setStepIndex: (i: number) => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setRun(true);
  }, []);

  const skipTour = useCallback(() => setRun(false), []);

  const finishTour = useCallback(() => setRun(false), []);

  return (
    <TourContext.Provider value={{ run, stepIndex, startTour, skipTour, finishTour, setStepIndex }}>
      {children}
    </TourContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
}
