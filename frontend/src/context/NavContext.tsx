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

// Colocated with the Provider; see comment in `AuthContext.tsx` for why we
// accept the Fast-Refresh trade-off rather than split this hook out.
// eslint-disable-next-line react-refresh/only-export-components
export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
