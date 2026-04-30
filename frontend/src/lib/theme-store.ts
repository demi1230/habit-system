import { useSyncExternalStore } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

let themeMode: ThemeMode = (typeof localStorage !== 'undefined' && localStorage.getItem('bloom-theme') as ThemeMode) || 'system';
const themeListeners = new Set<() => void>();

function emit() {
  for (const l of themeListeners) l();
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', mode === 'dark');
  }
}

export function setTheme(mode: ThemeMode) {
  themeMode = mode;
  if (typeof localStorage !== 'undefined') localStorage.setItem('bloom-theme', mode);
  applyTheme(mode);
  emit();
}

export function useTheme(): [ThemeMode, (m: ThemeMode) => void] {
  const mode = useSyncExternalStore(
    (cb) => { themeListeners.add(cb); return () => themeListeners.delete(cb); },
    () => themeMode,
  );
  return [mode, setTheme];
}

export function useIsDark(): boolean {
  const [mode] = useTheme();
  if (mode === 'system') {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return mode === 'dark';
}

// Initialize on load
if (typeof window !== 'undefined') {
  applyTheme(themeMode);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themeMode === 'system') {
      applyTheme('system');
      emit();
    }
  });
}
