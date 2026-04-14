import { createContext, useContext, useState } from 'react';

export type PageName = 'home' | 'add-habit' | 'stats' | 'habit-detail' | 'reminders' | 'learn';

export interface NavState {
  page: PageName;
  params: Record<string, string>;
}

interface NavContextValue {
  nav: NavState;
  navigate: (page: PageName, params?: Record<string, string>) => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [nav, setNav] = useState<NavState>({ page: 'home', params: {} });

  const navigate = (page: PageName, params: Record<string, string> = {}) =>
    setNav({ page, params });

  return (
    <NavContext.Provider value={{ nav, navigate }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
