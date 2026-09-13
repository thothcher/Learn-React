import { useSyncExternalStore } from 'react'

/*
  A tiny external store. Visitors keep progress in localStorage; signed-in users
  keep it on the server. Components subscribe with useSyncExternalStore — the
  React counterpart of injecting a service that exposes a signal.
*/

export interface ProgressState {
  lessons: string[]
  projects: number[]
  scores: Record<string, number>
}

/** Where changes go while a user is signed in. */
export interface AccountProgressSync {
  setLesson(slug: string, done: boolean): Promise<unknown>
  setProject(week: number, done: boolean): Promise<unknown>
  recordScore(key: string, score: number): Promise<unknown>
  reset(): Promise<unknown>
  /** Called when a save fails, so the account state can be reloaded from the server. */
  onError(error: unknown): void
}

const STORAGE_KEY = 'refract-progress-v1'
const EMPTY: ProgressState = { lessons: [], projects: [], scores: {} }

function readBrowser(): ProgressState {
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

let state = readBrowser()
let account: AccountProgressSync | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function commit(next: ProgressState) {
  state = next
  if (!account) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Storage can be unavailable (private mode); progress then lives in memory only.
    }
  }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (!account && event.key === STORAGE_KEY) {
      state = readBrowser()
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

let pendingSaves: Promise<void> = Promise.resolve()

/**
 * The UI updates immediately; the server call follows, and a failure reloads the account state.
 * Calls run one after another, so a quick "done, undone" can't reach the server in the wrong order.
 */
function save(send: (sync: AccountProgressSync) => Promise<unknown>) {
  const sync = account
  if (!sync) return
  pendingSaves = pendingSaves
    // A save still queued when the user signs out must not run with the next session's cookie.
    .then(() => (account === sync ? send(sync) : undefined))
    .then(
      () => {},
      (error: unknown) => {
        // Ignore failures that belong to an account the user has already left.
        if (account === sync) sync.onError(error)
      },
    )
}

/** Resolves when every queued account save has finished, so a fresh server read includes them. */
export function whenProgressSaved() {
  return pendingSaves
}

export const progress = {
  toggleLesson(slug: string) {
    const done = !state.lessons.includes(slug)
    commit({ ...state, lessons: toggle(state.lessons, slug) })
    save((sync) => sync.setLesson(slug, done))
  },
  completeLesson(slug: string) {
    if (state.lessons.includes(slug)) return
    commit({ ...state, lessons: [...state.lessons, slug] })
    save((sync) => sync.setLesson(slug, true))
  },
  toggleProject(week: number) {
    const done = !state.projects.includes(week)
    commit({ ...state, projects: toggle(state.projects, week) })
    save((sync) => sync.setProject(week, done))
  },
  /** Stores a score if it beats the previous best. Returns true for a new record. */
  recordScore(key: string, score: number, lowerIsBetter = false) {
    const best = state.scores[key]
    const isRecord = best === undefined || (lowerIsBetter ? score < best : score > best)
    if (isRecord) {
      commit({ ...state, scores: { ...state.scores, [key]: score } })
      save((sync) => sync.recordScore(key, score))
    }
    return isRecord
  },
  reset() {
    commit(EMPTY)
    save((sync) => sync.reset())
  },
}

/** Progress saved in this browser, for example before the visitor created an account. */
export function readBrowserProgress() {
  return readBrowser()
}

export function clearBrowserProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}

/** Switches the store to a signed-in account: `initial` comes from the server, changes go through `sync`. */
export function connectAccountProgress(initial: ProgressState, sync: AccountProgressSync) {
  account = sync
  commit(initial)
}

/** Replaces the account state, for example after reloading it from the server. */
export function replaceAccountProgress(next: ProgressState) {
  if (account) commit(next)
}

/** Leaves the account and goes back to what this browser has saved. */
export function disconnectAccountProgress() {
  account = null
  state = readBrowser()
  emit()
}
