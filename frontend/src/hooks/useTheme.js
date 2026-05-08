import { useEffect, useState } from 'react'

const THEME_KEY = 'driveshare-theme'

const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'dark'
  return localStorage.getItem(THEME_KEY) || 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState(getStoredTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(current => (current === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggleTheme, isDark: theme === 'dark' }
}
