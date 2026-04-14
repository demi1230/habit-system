import { createContext, useContext, useState, type ReactNode } from 'react';

/** Decode JWT payload without a library */
function decodePayload(token: string): { sub: string; email: string } | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

interface AuthState {
  token: string | null;
  userId: string | null;
  displayName: string | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, displayName?: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    const displayName = localStorage.getItem('display_name');
    return { token, userId, displayName };
  });

  const login = (token: string, displayName?: string | null) => {
    const payload = decodePayload(token);
    const userId = payload?.sub ?? null;
    localStorage.setItem('access_token', token);
    if (userId) localStorage.setItem('user_id', userId);
    if (displayName) localStorage.setItem('display_name', displayName);
    setState({ token, userId, displayName: displayName ?? null });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('display_name');
    setState({ token: null, userId: null, displayName: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
