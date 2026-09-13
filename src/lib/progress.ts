import { useSyncExternalStore } from 'react'

/*
  A tiny external store kept in localStorage. Components subscribe with
  useSyncExternalStore — the React counterpart of injecting a service
  that exposes a signal.
*/

export interface ProgressState {
  lessons: string[]
  projects: number[]
  scores: Record<string, number>
}

const STORAGE_KEY = 'refract-progress-v1'
const EMPTY: ProgressState = { lessons: [], projects: [], scores: {} }

function read(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    return {
      lessons: Array.isArray(parsed.lessons) ? parsed.lessons : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      scores: parsed.scores && typeof parsed.scores === 'object' ? parsed.scores : {},
    }
  } catch {
    return EMPTY
  }
}

let state = read()
const listeners = new Set<() => void>()

function commit(next: ProgressState) {
  state = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage can be unavailable (private mode); progress then lives in memory only.
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      state = read()
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useProgress() {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY)
}

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export const progress = {
  toggleLesson(slug: string) {
    commit({ ...state, lessons: toggle(state.lessons, slug) })
  },
  completeLesson(slug: string) {
    if (!state.lessons.includes(slug)) commit({ ...state, lessons: [...state.lessons, slug] })
  },
  toggleProject(week: number) {
    commit({ ...state, projects: toggle(state.projects, week) })
  },
  /** Stores a score if it beats the previous best. Returns true for a new record. */
  recordScore(key: string, score: number, lowerIsBetter = false) {
    const best = state.scores[key]
    const isRecord = best === undefined || (lowerIsBetter ? score < best : score > best)
    if (isRecord) commit({ ...state, scores: { ...state.scores, [key]: score } })
    return isRecord
  },
  reset() {
    commit(EMPTY)
  },
}
