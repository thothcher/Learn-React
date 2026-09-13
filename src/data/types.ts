export type Track = 'react' | 'next'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface QuizQuestion {
  id: string
  question: string
  code?: string
  options: string[]
  answer: number
  explanation: string
}

export interface TeachingCard {
  term: string
  definition: string
  analogy: string
  remember: string
}

export interface Exercise {
  title: string
  difficulty: Difficulty
  task: string
  requirements: string[]
  hints: string[]
  solution: string
}

export interface Lesson {
  slug: string
  week: number
  day: number
  track: Track
  title: string
  summary: string
  minutes: number
  angular: string
  analogy: { title: string; body: string }
  body: string[]
  compare: { angular: string; react: string; angularLabel?: string; reactLabel?: string }
  keyPoints: string[]
  pitfall?: string
  card: TeachingCard
  exercise: Exercise
  quiz: QuizQuestion[]
}

export interface Week {
  number: number
  track: Track
  title: string
  goal: string
  project: {
    title: string
    brief: string
    checklist: string[]
    stretch: string[]
  }
}
