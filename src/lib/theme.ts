import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'refract-theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function resolveTheme(): Theme {
  const explicit = document.documentElement.dataset.theme
  if (explicit === 'light' || explicit === 'dark') return explicit
  return media().matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(resolveTheme)

  // Follow the operating system until the user picks a theme explicitly.
  useEffect(() => {
    const query = media()
    const onChange = () => setTheme(resolveTheme())
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore storage failures; the theme still applies for this visit.
    }
    setTheme(next)
  }

  return { theme, toggleTheme }
}
