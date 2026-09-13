import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ServerProgress } from './api'
import { formatScore, gameLabel, recentActivity, relativeTime, summarize } from './stats'

const empty: ServerProgress = { lessons: [], projects: [], scores: [] }

/** 10:00 local time on a day in September 2026. */
const septemberDay = (day: number) => new Date(2026, 8, day, 10).toISOString()

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 8, 13, 12))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('summarize', () => {
  it('starts at zero with lesson one next', () => {
    const summary = summarize(empty)
    expect(summary.lessonsDone).toBe(0)
    expect(summary.overall).toBe(0)
    expect(summary.nextLesson?.slug).toBe('components-are-functions')
    expect(summary.streak).toEqual({ current: 0, best: 0, activeDays: 0 })
  })

  it('counts known lessons, projects and passed tests only', () => {
    const summary = summarize({
      lessons: [
        { slug: 'components-are-functions', completedAt: septemberDay(13) },
        { slug: 'a-lesson-that-was-removed', completedAt: septemberDay(13) },
      ],
      projects: [{ week: 1, completedAt: septemberDay(12) }],
      scores: [
        { key: 'quiz:week-1', score: 80, updatedAt: septemberDay(12) },
        { key: 'quiz:week-2', score: 79, updatedAt: septemberDay(12) },
        { key: 'match:hooks', score: 100, updatedAt: septemberDay(12) },
      ],
    })

    expect(summary.lessonsDone).toBe(1)
    expect(summary.projectsDone).toBe(1)
    expect(summary.testsPassed).toBe(1)
    expect(summary.nextLesson?.slug).toBe('jsx')
    expect(summary.weekly[0]).toMatchObject({ lessonsDone: 1, lessonsTotal: 4, projectDone: true })
  })

  it('counts consecutive active days as a streak', () => {
    const summary = summarize({
      ...empty,
      lessons: [7, 8, 11, 12, 13].map((day, index) => ({ slug: `lesson-${index}`, completedAt: septemberDay(day) })),
    })
    expect(summary.streak).toEqual({ current: 3, best: 3, activeDays: 5 })
  })

  it('keeps the streak until the end of the next day, then resets it', () => {
    const yesterday = summarize({ ...empty, lessons: [{ slug: 'jsx', completedAt: septemberDay(12) }] })
    expect(yesterday.streak.current).toBe(1)

    const twoDaysAgo = summarize({ ...empty, lessons: [{ slug: 'jsx', completedAt: septemberDay(11) }] })
    expect(twoDaysAgo.streak.current).toBe(0)
    expect(twoDaysAgo.streak.best).toBe(1)
  })
})

describe('labels', () => {
  it('names every kind of game score', () => {
    expect(gameLabel('quiz:week-3')).toBe('Week 3 test')
    expect(gameLabel('quiz:final-exam')).toBe('Final exam')
    expect(gameLabel('match:angular-react')).toBe('Match pairs · Angular to React')
    expect(gameLabel('memory:hooks')).toBe('Memory cards · Hooks and their jobs')
    expect(gameLabel('gaps')).toBe('Fill the gap')
  })

  it('formats scores in the unit of each game', () => {
    expect(formatScore('quiz:week-1', 85)).toBe('85%')
    expect(formatScore('memory:hooks', 18)).toBe('18 moves')
    expect(formatScore('gaps', 9)).toMatch(/^9\/\d+$/)
  })

  it('describes times relative to now', () => {
    expect(relativeTime(null)).toBe('Never')
    expect(relativeTime(new Date(Date.now() - 30_000).toISOString())).toBe('Just now')
    expect(relativeTime(new Date(Date.now() - 2 * 3_600_000).toISOString())).toBe('2 hours ago')
    expect(relativeTime(new Date(Date.now() - 86_400_000).toISOString())).toBe('yesterday')
  })
})

describe('recentActivity', () => {
  it('lists the newest events first, up to the limit', () => {
    const activity = recentActivity(
      {
        lessons: [{ slug: 'jsx', completedAt: septemberDay(10) }],
        projects: [{ week: 1, completedAt: septemberDay(12) }],
        scores: [{ key: 'gaps', score: 9, updatedAt: septemberDay(11) }],
      },
      2,
    )
    expect(activity.map((item) => item.kind)).toEqual(['project', 'score'])
  })
})
