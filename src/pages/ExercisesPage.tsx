import { ArrowRight, ChevronDown, NotebookPen } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { ExerciseBlock } from '../components/lesson/ExerciseBlock'
import { PageHeader } from '../components/ui/PageHeader'
import { Segmented } from '../components/ui/Segmented'
import { lessons } from '../data/lessons'
import type { Difficulty, Track } from '../data/types'
import { cx } from '../lib/utils'
import styles from './ExercisesPage.module.css'

type TrackFilter = 'all' | Track
type DifficultyFilter = 'all' | Difficulty

const difficultyChip = { easy: 'chip-success', medium: 'chip-warning', hard: 'chip-danger' } as const

export function ExercisesPage() {
  const [track, setTrack] = useState<TrackFilter>('all')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  const visible = lessons.filter(
    (lesson) =>
      (track === 'all' || lesson.track === track) &&
      (difficulty === 'all' || lesson.exercise.difficulty === difficulty),
  )

  return (
    <>
      <title>Exercises · Refract</title>
      <PageHeader
        eyebrow={
          <>
            <NotebookPen size={16} /> Exercises
          </>
        }
        title="Practice by building"
        description={`${lessons.length} hands-on tasks. Tick off requirements, unlock hints one at a time, and compare your code with the full solution.`}
      />

      <div className={`container ${styles.filters}`}>
        <Segmented<TrackFilter>
          value={track}
          onChange={setTrack}
          ariaLabel="Track"
          options={[
            { value: 'all', label: 'All tracks' },
            { value: 'react', label: 'React' },
            { value: 'next', label: 'Next.js' },
          ]}
        />
        <Segmented<DifficultyFilter>
          value={difficulty}
          onChange={setDifficulty}
          ariaLabel="Difficulty"
          options={[
            { value: 'all', label: 'Any level' },
            { value: 'easy', label: 'Easy' },
            { value: 'medium', label: 'Medium' },
            { value: 'hard', label: 'Hard' },
          ]}
        />
        <span className={styles.count}>{visible.length} exercises</span>
      </div>

      <ul className={`container ${styles.list}`}>
        {visible.map((lesson) => {
          const open = openSlug === lesson.slug
          return (
            <li key={lesson.slug} className={styles.item} data-open={open}>
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setOpenSlug(open ? null : lesson.slug)}
                aria-expanded={open}
              >
                <span className={styles.week}>
                  W{lesson.week}·D{lesson.day}
                </span>
                <span className={styles.titles}>
                  <span className={styles.title}>{lesson.exercise.title}</span>
                  <span className={styles.lesson}>{lesson.title}</span>
                </span>
                <span className={cx('chip', difficultyChip[lesson.exercise.difficulty])}>
                  {lesson.exercise.difficulty}
                </span>
                <ChevronDown size={18} className={styles.chevron} />
              </button>

              {open && (
                <div className={styles.body}>
                  <ExerciseBlock exercise={lesson.exercise} compact />
                  <Link to={`/lessons/${lesson.slug}`} className={styles.lessonLink}>
                    Read the lesson first
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}
