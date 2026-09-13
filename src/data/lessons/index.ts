import type { Lesson, QuizQuestion, Track } from '../types'
import { week1 } from './week1'
import { week2 } from './week2'
import { week3 } from './week3'
import { week4 } from './week4'
import { week5 } from './week5'
import { week6 } from './week6'
import { week7 } from './week7'
import { week8 } from './week8'

export const lessons: Lesson[] = [
  ...week1,
  ...week2,
  ...week3,
  ...week4,
  ...week5,
  ...week6,
  ...week7,
  ...week8,
]

export function getLesson(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug)
}

export function lessonsForWeek(week: number) {
  return lessons.filter((lesson) => lesson.week === week)
}

export function getAdjacentLessons(slug: string) {
  const index = lessons.findIndex((lesson) => lesson.slug === slug)
  return { previous: lessons[index - 1], next: lessons[index + 1] }
}

export interface BankQuestion extends QuizQuestion {
  lessonSlug: string
  lessonTitle: string
  week: number
  track: Track
}

export const questionBank: BankQuestion[] = lessons.flatMap((lesson) =>
  lesson.quiz.map((question) => ({
    ...question,
    lessonSlug: lesson.slug,
    lessonTitle: lesson.title,
    week: lesson.week,
    track: lesson.track,
  })),
)
