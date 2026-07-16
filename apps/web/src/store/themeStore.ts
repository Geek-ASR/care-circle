import { create } from 'zustand'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'care-circle-theme'

function applyThemeClass(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('light', theme === 'light')
  root.classList.toggle('dark', theme === 'dark')
}

// Dark mode first, by design: does NOT derive from prefers-color-scheme —
// dark is the default until the user explicitly opts into light. Mirrors
// the blocking inline script in index.html.
function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return window.localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

/**
 * Mirrors the blocking inline script in index.html (which prevents a flash of the
 * wrong theme on load) — this store is the source of truth once React has mounted.
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readInitialTheme(),
  setTheme: (theme) => {
    window.localStorage.setItem(STORAGE_KEY, theme)
    applyThemeClass(theme)
    set({ theme })
  },
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },
}))
