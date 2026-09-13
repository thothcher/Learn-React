import { describe, expect, it } from 'vitest'
import { cheatSheet } from './cheatsheet'
import { gapChallenges, splitGapCode } from './gaps'
import { getAdjacentLessons, lessons, questionBank } from './lessons'
import { pairSets } from './pairs'
import { weeks } from './weeks'

// The API accepts the same shapes (see backend/Refract.Api/Progress/ProgressRules.cs).
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

describe('course content', () => {
  it('has 8 weeks of 4 lessons each, on the track of their week', () => {
    expect(weeks.map((week) => week.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    for (const week of weeks) {
      const weekLessons = lessons.filter((lesson) => lesson.week === week.number)
      expect(weekLessons.map((lesson) => lesson.day)).toEqual([1, 2, 3, 4])
      expect(weekLessons.every((lesson) => lesson.track === week.track)).toBe(true)
    }
  })

  it('uses unique lesson slugs the API accepts', () => {
    const slugs = lessons.map((lesson) => lesson.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) {
      expect(slug).toMatch(SLUG)
      expect(slug.length).toBeLessThanOrEqual(100)
    }
  })

  it('fills every part of the lesson page', () => {
    for (const lesson of lessons) {
      expect(lesson.body.length, lesson.slug).toBeGreaterThan(0)
      expect(lesson.keyPoints.length, lesson.slug).toBeGreaterThan(0)
      expect(lesson.compare.angular.trim(), lesson.slug).not.toBe('')
      expect(lesson.compare.react.trim(), lesson.slug).not.toBe('')
      expect(lesson.exercise.requirements.length, lesson.slug).toBeGreaterThan(0)
      expect(lesson.exercise.hints.length, lesson.slug).toBeGreaterThan(0)
      expect(lesson.exercise.solution.trim(), lesson.slug).not.toBe('')
      expect(lesson.card.term.trim(), lesson.slug).not.toBe('')
    }
  })

  it('gives every quiz question distinct options and a valid answer', () => {
    const ids = questionBank.map((question) => question.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const question of questionBank) {
      expect(new Set(question.options).size, question.id).toBe(question.options.length)
      expect(question.options.length, question.id).toBeGreaterThanOrEqual(2)
      expect(question.answer, question.id).toBeGreaterThanOrEqual(0)
      expect(question.answer, question.id).toBeLessThan(question.options.length)
    }
  })

  it('links lessons in course order', () => {
    expect(getAdjacentLessons(lessons[0].slug).previous).toBeUndefined()
    expect(getAdjacentLessons(lessons[1].slug).previous?.slug).toBe(lessons[0].slug)
    expect(getAdjacentLessons(lessons[lessons.length - 1].slug).next).toBeUndefined()
  })
})

describe('game content', () => {
  it('keeps every fill-the-gap challenge solvable', () => {
    for (const challenge of gapChallenges) {
      const markers = splitGapCode(challenge.code)
        .filter((_, index) => index % 2 === 1)
        .map(Number)
      expect(markers, challenge.id).toEqual(challenge.blanks.map((_, index) => index))
      for (const blank of challenge.blanks) expect(blank.options, challenge.id).toContain(blank.answer)
      expect(lessons.some((lesson) => lesson.slug === challenge.lessonSlug), challenge.id).toBe(true)
    }
  })

  it('has enough unique pairs for match (6) and memory (8)', () => {
    for (const set of pairSets) {
      expect(set.id).toMatch(SLUG)
      expect(set.pairs.length, set.id).toBeGreaterThanOrEqual(8)
      expect(new Set(set.pairs.map((pair) => pair.left)).size, set.id).toBe(set.pairs.length)
      expect(new Set(set.pairs.map((pair) => pair.right)).size, set.id).toBe(set.pairs.length)
    }
  })

  it('has no duplicate cheat sheet rows', () => {
    const rows = cheatSheet.flatMap((section) => section.rows.map((row) => row.angular))
    expect(new Set(rows).size).toBe(rows.length)
  })
})
