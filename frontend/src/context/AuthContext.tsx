import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { analyticsApi } from '@/api/analytics';

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
    // Validate stored token is a real JWT with a uuid sub claim
    if (token) {
      const payload = decodePayload(token);
      const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!payload?.sub || !uuidRe.test(payload.sub)) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('display_name');
        return { token: null, userId: null, displayName: null };
      }
    }
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
    if (state.userId) {
      analyticsApi.log(state.userId, 'session_end').catch(() => {});
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('display_name');
    setState({ token: null, userId: null, displayName: null });
  };

  // Track app_open / session_start when user is already logged in
  const sessionTracked = useRef(false);
  useEffect(() => {
    if (state.userId && state.token && !sessionTracked.current) {
      sessionTracked.current = true;
      analyticsApi.log(state.userId, 'app_open').catch(() => {});
      analyticsApi.log(state.userId, 'session_start').catch(() => {});
    }
  }, [state.userId, state.token]);

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
