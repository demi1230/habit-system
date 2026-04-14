import { useSyncExternalStore } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

// ── Reactive theme store ──────────────────────────────

let currentMode: ThemeMode =
  (typeof localStorage !== 'undefined' && (localStorage.getItem('bloom-theme') as ThemeMode)) || 'system';

let listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function getSystemDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(mode: ThemeMode) {
  const isDark = mode === 'dark' || (mode === 'system' && getSystemDark());
  document.documentElement.classList.toggle('dark', isDark);
}

// Apply on load
applyTheme(currentMode);

// Listen for system preference changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentMode === 'system') {
      applyTheme('system');
      emit();
    }
  });
}

export function setTheme(mode: ThemeMode) {
  currentMode = mode;
  if (typeof localStorage !== 'undefined') localStorage.setItem('bloom-theme', mode);
  applyTheme(mode);
  emit();
}

export function getTheme(): ThemeMode {
  return currentMode;
}

export function useTheme(): ThemeMode {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => currentMode,
  );
}

/** Returns whether dark mode is currently active (resolved from system if needed) */
export function useIsDark(): boolean {
  const mode = useTheme();
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return getSystemDark();
}
