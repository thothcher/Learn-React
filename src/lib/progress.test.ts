import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AccountProgressSync, ProgressState } from './progress'

const empty: ProgressState = { lessons: [], projects: [], scores: {} }

/** The store keeps module-level state, so every test loads a fresh copy. */
async function freshStore() {
  vi.resetModules()
  return import('./progress')
}

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => (resolve = done))
  return { promise, resolve }
}

function fakeAccount(calls: string[], overrides: Partial<AccountProgressSync> = {}) {
  const onError = vi.fn()
  const sync: AccountProgressSync = {
    setLesson: async (slug, done) => {
      calls.push(`lesson ${slug} ${done}`)
    },
    setProject: async (week, done) => {
      calls.push(`project ${week} ${done}`)
    },
    recordScore: async (key, score) => {
      calls.push(`score ${key} ${score}`)
    },
    reset: async () => {
      calls.push('reset')
    },
    onError,
    ...overrides,
  }
  return { sync, onError }
}

beforeEach(() => {
  localStorage.clear()
})

describe('visitor progress', () => {
  it('is saved in localStorage', async () => {
    const { progress, readBrowserProgress } = await freshStore()

    progress.toggleLesson('jsx')
    progress.toggleProject(2)
    progress.recordScore('quiz:week-1', 70)

    expect(readBrowserProgress()).toEqual({ lessons: ['jsx'], projects: [2], scores: { 'quiz:week-1': 70 } })
  })

  it('keeps only better scores; fewer moves wins in memory cards', async () => {
    const { progress } = await freshStore()

    expect(progress.recordScore('quiz:week-1', 70)).toBe(true)
    expect(progress.recordScore('quiz:week-1', 60)).toBe(false)
    expect(progress.recordScore('memory:hooks', 20, true)).toBe(true)
    expect(progress.recordScore('memory:hooks', 24, true)).toBe(false)
    expect(progress.recordScore('memory:hooks', 16, true)).toBe(true)
  })

  it('starts empty when the stored data is corrupted', async () => {
    localStorage.setItem('refract-progress-v1', '{not json')
    const { readBrowserProgress } = await freshStore()

    expect(readBrowserProgress()).toEqual(empty)
  })
})

describe('account progress', () => {
  it('sends changes to the account instead of localStorage', async () => {
    const store = await freshStore()
    const calls: string[] = []
    store.connectAccountProgress(empty, fakeAccount(calls).sync)

    store.progress.toggleLesson('jsx')
    store.progress.recordScore('gaps', 9)
    await store.whenProgressSaved()

    expect(calls).toEqual(['lesson jsx true', 'score gaps 9'])
    expect(localStorage.getItem('refract-progress-v1')).toBeNull()
  })

  it('sends saves one after another, so a quick undo reaches the server last', async () => {
    const store = await freshStore()
    const calls: string[] = []
    const slowFirstSave = deferred()
    const { sync } = fakeAccount(calls, {
      setLesson: async (slug, done) => {
        if (done) await slowFirstSave.promise
        calls.push(`lesson ${slug} ${done}`)
      },
    })
    store.connectAccountProgress(empty, sync)

    store.progress.toggleLesson('jsx')
    store.progress.toggleLesson('jsx')
    slowFirstSave.resolve()
    await store.whenProgressSaved()

    expect(calls).toEqual(['lesson jsx true', 'lesson jsx false'])
  })

  it('skips saves still queued when the user signs out', async () => {
    const store = await freshStore()
    const calls: string[] = []
    const slowSave = deferred()
    const { sync, onError } = fakeAccount(calls, {
      setLesson: async (slug, done) => {
        await slowSave.promise
        calls.push(`lesson ${slug} ${done}`)
      },
    })
    store.connectAccountProgress(empty, sync)

    store.progress.toggleLesson('jsx')
    await Promise.resolve() // the first request is now on its way
    store.progress.toggleProject(1)
    store.disconnectAccountProgress()
    slowSave.resolve()
    await store.whenProgressSaved()

    expect(calls).toEqual(['lesson jsx true'])
    expect(onError).not.toHaveBeenCalled()
  })

  it('reports failed saves so the account can be reloaded', async () => {
    const store = await freshStore()
    const failure = new Error('offline')
    const { sync, onError } = fakeAccount([], {
      setLesson: async () => {
        throw failure
      },
    })
    store.connectAccountProgress(empty, sync)

    store.progress.toggleLesson('jsx')
    await store.whenProgressSaved()

    expect(onError).toHaveBeenCalledWith(failure)
  })

  it('returns to the browser copy after signing out', async () => {
    localStorage.setItem('refract-progress-v1', JSON.stringify({ lessons: ['props'], projects: [], scores: {} }))
    const store = await freshStore()
    store.connectAccountProgress({ lessons: ['jsx', 'forms'], projects: [3], scores: {} }, fakeAccount([]).sync)

    store.disconnectAccountProgress()
    store.progress.toggleLesson('use-state')

    expect(store.readBrowserProgress().lessons).toEqual(['props', 'use-state'])
  })
})
