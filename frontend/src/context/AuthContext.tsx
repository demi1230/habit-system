import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';
import { authApi } from '@/api/auth';

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
  currentLat: number | null;
  currentLng: number | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, displayName?: string | null) => void;
  logout: () => void;
  setCurrentLocation: (lat: number | null, lng: number | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('access_token');
    const userId = token ? decodePayload(token)?.sub ?? null : null;
    const displayName = localStorage.getItem('display_name');
    const latStr = localStorage.getItem('current_lat');
    const lngStr = localStorage.getItem('current_lng');
    const currentLat = latStr !== null ? parseFloat(latStr) : null;
    const currentLng = lngStr !== null ? parseFloat(lngStr) : null;
    if (token) {
      const payload = decodePayload(token);
      const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!payload?.sub || !uuidRe.test(payload.sub)) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('display_name');
        localStorage.removeItem('current_lat');
        localStorage.removeItem('current_lng');
        return { token: null, userId: null, displayName: null, currentLat: null, currentLng: null };
      }
    }
    return { token, userId, displayName, currentLat, currentLng };
  });

  const [sessionStatus, setSessionStatus] = useState<'checking' | 'ready' | 'error'>(() => state.token ? 'checking' : 'ready');
  const [sessionAttempt, setSessionAttempt] = useState(0);

  useEffect(() => {
    const expire = () => {
      queryClient.clear();
      for (const key of ['access_token', 'user_id', 'display_name', 'current_lat', 'current_lng']) localStorage.removeItem(key);
      setState({ token: null, userId: null, displayName: null, currentLat: null, currentLng: null });
      setSessionStatus('ready');
    };
    window.addEventListener('auth:expired', expire);
    return () => window.removeEventListener('auth:expired', expire);
  }, [queryClient]);

  useEffect(() => {
    if (!state.token || sessionStatus !== 'checking') return;
    let active = true;
    authApi.session().then(() => {
      if (active) setSessionStatus('ready');
    }).catch(() => {
      if (active) setSessionStatus('error');
    });
    return () => { active = false; };
  }, [state.token, sessionStatus, sessionAttempt]);

  const login = (token: string, displayName?: string | null) => {
    const payload = decodePayload(token);
    const userId = payload?.sub ?? null;
    setSessionStatus('ready');
    localStorage.setItem('access_token', token);
    if (userId) localStorage.setItem('user_id', userId);
    if (displayName) localStorage.setItem('display_name', displayName);
    setState((prev) => ({ ...prev, token, userId, displayName: displayName ?? null }));
  };

  const logout = () => {
    queryClient.clear();
    if (state.userId) {
      analyticsApi.log(state.userId, 'session_end').catch(() => {});
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('display_name');
    localStorage.removeItem('current_lat');
    localStorage.removeItem('current_lng');
    setState({ token: null, userId: null, displayName: null, currentLat: null, currentLng: null });
  };

  const setCurrentLocation = useCallback(async (lat: number | null, lng: number | null) => {
    if (!state.userId) return;
    await authApi.updateLocation(state.userId, lat, lng);
    if (lat !== null && lng !== null) {
      localStorage.setItem('current_lat', String(lat));
      localStorage.setItem('current_lng', String(lng));
    } else {
      localStorage.removeItem('current_lat');
      localStorage.removeItem('current_lng');
    }
    setState((prev) => ({ ...prev, currentLat: lat, currentLng: lng }));
  }, [state.userId]);

  // Track app_open / session_start when user is already logged in
  const sessionTracked = useRef(false);
  useEffect(() => {
    if (sessionStatus === 'ready' && state.userId && state.token && !sessionTracked.current) {
      sessionTracked.current = true;
      analyticsApi.log(state.userId, 'app_open').catch(() => {});
      analyticsApi.log(state.userId, 'session_start').catch(() => {});
    }
  }, [state.userId, state.token, sessionStatus]);

  // Auto-detect GPS location on mount and whenever the user returns to the app.
  // Runs silently — no UI feedback, no error shown if permission denied.
  useEffect(() => {
    if (sessionStatus !== 'ready' || !state.userId || !navigator.geolocation) return;

    const detect = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          authApi
            .updateLocation(state.userId!, pos.coords.latitude, pos.coords.longitude)
            .catch(() => {});
          // Keep local state in sync without triggering a server round-trip again
          localStorage.setItem('current_lat', String(pos.coords.latitude));
          localStorage.setItem('current_lng', String(pos.coords.longitude));
          setState((prev) => ({
            ...prev,
            currentLat: pos.coords.latitude,
            currentLng: pos.coords.longitude,
          }));
        },
        () => {}, // permission denied or unavailable — silently skip
        { enableHighAccuracy: true, timeout: 8_000, maximumAge: 60_000 },
      );
    };

    detect(); // on login / first render
    window.addEventListener('focus', detect); // when user tabs back in
    return () => window.removeEventListener('focus', detect);
  }, [state.userId, sessionStatus]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setCurrentLocation }}>
      {state.token && sessionStatus !== 'ready' ? (
        <div className="session-gate" aria-busy={sessionStatus === 'checking'}>
          {sessionStatus === 'error' && <div role="alert">
            <p>Холболтоо шалгаад дахин оролдоно уу.</p>
            <button className="ux-primary" onClick={() => { setSessionStatus('checking'); setSessionAttempt(v => v + 1); }}>Дахин оролдох</button>
            <button className="ux-secondary" onClick={logout}>Нэвтрэх хуудас руу</button>
          </div>}
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

// Splitting this hook into a sibling file would force ~12 import-site changes
// across pages. The exception below keeps the file colocated and only loses
// React Fast Refresh for this single module — an acceptable trade-off here.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
