import { gapChallenges } from '../data/gaps'
import { lessons } from '../data/lessons'
import { pairSets } from '../data/pairs'
import { weeks } from '../data/weeks'
import type { ServerProgress } from './api'
import { percent } from './utils'

/** A test counts as passed from this percentage (the API uses the same number). */
export const PASS_MARK = 80
/** One test per week plus the React, Next.js and final exams. */
export const TOTAL_TESTS = weeks.length + 3

const DAY = 86_400_000

export function summarize(progress: ServerProgress) {
  const doneLessons = new Set(progress.lessons.map((lesson) => lesson.slug))
  const doneProjects = new Set(progress.projects.map((project) => project.week))
  const lessonsDone = lessons.filter((lesson) => doneLessons.has(lesson.slug)).length

  return {
    lessonsDone,
    projectsDone: doneProjects.size,
    testsPassed: progress.scores.filter((score) => score.key.startsWith('quiz:') && score.score >= PASS_MARK).length,
    overall: percent(lessonsDone + doneProjects.size, lessons.length + weeks.length),
    nextLesson: lessons.find((lesson) => !doneLessons.has(lesson.slug)),
    streak: streaks(progress),
    weekly: weeks.map((week) => {
      const weekLessons = lessons.filter((lesson) => lesson.week === week.number)
      return {
        week,
        lessonsDone: weekLessons.filter((lesson) => doneLessons.has(lesson.slug)).length,
        lessonsTotal: weekLessons.length,
        projectDone: doneProjects.has(week.number),
      }
    }),
  }
}

export interface ActivityItem {
  id: string
  kind: 'lesson' | 'project' | 'score'
  title: string
  detail: string
  at: string
}

export function recentActivity(progress: ServerProgress, limit = 8): ActivityItem[] {
  const items: ActivityItem[] = [
    ...progress.lessons.map((entry) => ({
      id: `lesson-${entry.slug}`,
      kind: 'lesson' as const,
      title: lessons.find((lesson) => lesson.slug === entry.slug)?.title ?? entry.slug,
      detail: 'Lesson completed',
      at: entry.completedAt,
    })),
    ...progress.projects.map((entry) => ({
      id: `project-${entry.week}`,
      kind: 'project' as const,
      title: weeks[entry.week - 1]?.project.title ?? `Week ${entry.week} project`,
      detail: `Week ${entry.week} project completed`,
      at: entry.completedAt,
    })),
    ...progress.scores.map((entry) => ({
      id: `score-${entry.key}`,
      kind: 'score' as const,
      title: gameLabel(entry.key),
      detail: `New best: ${formatScore(entry.key, entry.score)}`,
      at: entry.updatedAt,
    })),
  ]
  return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, limit)
}

/** Consecutive days with any activity, counted in the viewer's local time zone. */
function streaks(progress: ServerProgress) {
  const dayIndex = (value: string | Date) => {
    const date = new Date(value)
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY
  }

  const timestamps = [
    ...progress.lessons.map((entry) => entry.completedAt),
    ...progress.projects.map((entry) => entry.completedAt),
    ...progress.scores.map((entry) => entry.updatedAt),
  ]
  const days = [...new Set(timestamps.map(dayIndex))].sort((a, b) => a - b)

  let best = 0
  let run = 0
  days.forEach((day, index) => {
    run = index > 0 && day === days[index - 1] + 1 ? run + 1 : 1
    best = Math.max(best, run)
  })

  const lastDay = days.at(-1)
  const current = lastDay !== undefined && dayIndex(new Date()) - lastDay <= 1 ? run : 0
  return { current, best, activeDays: days.length }
}

export function gameLabel(key: string) {
  const [game, id] = key.split(':')
  const setTitle = pairSets.find((set) => set.id === id)?.title ?? id
  if (game === 'quiz') {
    if (id?.startsWith('week-')) return `Week ${id.slice(5)} test`
    return { 'react-exam': 'React exam', 'next-exam': 'Next.js exam', 'final-exam': 'Final exam' }[id] ?? 'Test'
  }
  if (game === 'match') return `Match pairs · ${setTitle}`
  if (game === 'memory') return `Memory cards · ${setTitle}`
  if (game === 'gaps') return 'Fill the gap'
  return key
}

export function formatScore(key: string, score: number) {
  if (key.startsWith('memory:')) return `${score} moves`
  if (key === 'gaps') return `${score}/${gapChallenges.length}`
  return `${score}%`
}

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function relativeTime(value: string | null) {
  if (!value) return 'Never'
  const seconds = Math.round((Date.parse(value) - Date.now()) / 1000)
  const abs = Math.abs(seconds)
  if (abs < 60) return 'Just now'
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute')
  if (abs < 86_400) return relative.format(Math.round(seconds / 3600), 'hour')
  if (abs < 86_400 * 30) return relative.format(Math.round(seconds / 86_400), 'day')
  return new Date(value).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })
}
