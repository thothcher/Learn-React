import { Check, Eye, EyeOff, Lightbulb, NotebookPen } from 'lucide-react'
import { useState } from 'react'
import type { Exercise } from '../../data/types'
import { cx } from '../../lib/utils'
import { CodeBlock } from '../ui/CodeBlock'
import { RichText } from '../ui/RichText'
import styles from './ExerciseBlock.module.css'

const difficultyChip = {
  easy: 'chip-success',
  medium: 'chip-warning',
  hard: 'chip-danger',
} as const

export function ExerciseBlock({ exercise, compact = false }: { exercise: Exercise; compact?: boolean }) {
  const [done, setDone] = useState<number[]>([])
  const [hintsShown, setHintsShown] = useState(0)
  const [showSolution, setShowSolution] = useState(false)

  function toggleRequirement(index: number) {
    setDone((current) => (current.includes(index) ? current.filter((i) => i !== index) : [...current, index]))
  }

  return (
    <div className={cx(styles.exercise, compact && styles.compact)}>
      {!compact && (
        <div className={styles.head}>
          <span className={styles.icon}>
            <NotebookPen size={20} />
          </span>
          <div className={styles.headText}>
            <p className={styles.kicker}>Exercise</p>
            <h3 className={styles.title}>{exercise.title}</h3>
          </div>
          <span className={cx('chip', difficultyChip[exercise.difficulty])}>{exercise.difficulty}</span>
        </div>
      )}

      <p className={styles.task}>
        <RichText text={exercise.task} />
      </p>

      <div>
        <p className={styles.subhead}>
          Requirements
          <span>
            {done.length}/{exercise.requirements.length}
          </span>
        </p>
        <ul className={styles.requirements}>
          {exercise.requirements.map((requirement, index) => {
            const checked = done.includes(index)
            return (
              <li key={requirement}>
                <button
                  type="button"
                  className={styles.requirement}
                  data-checked={checked}
                  onClick={() => toggleRequirement(index)}
                  aria-pressed={checked}
                >
                  <span className={styles.box}>{checked && <Check size={13} strokeWidth={3} />}</span>
                  <span>
                    <RichText text={requirement} />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {hintsShown > 0 && (
        <ol className={styles.hints}>
          {exercise.hints.slice(0, hintsShown).map((hint, index) => (
            <li key={hint} className={styles.hint}>
              <Lightbulb size={16} />
              <span>
                <strong>Hint {index + 1}.</strong> <RichText text={hint} />
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn-soft btn-sm"
          disabled={hintsShown >= exercise.hints.length}
          onClick={() => setHintsShown((count) => count + 1)}
        >
          <Lightbulb size={16} />
          {hintsShown >= exercise.hints.length
            ? 'All hints shown'
            : `Show hint ${hintsShown + 1} of ${exercise.hints.length}`}
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setShowSolution((show) => !show)}>
          {showSolution ? <EyeOff size={16} /> : <Eye size={16} />}
          {showSolution ? 'Hide solution' : 'Show solution'}
        </button>
      </div>

      {showSolution && (
        <div className={styles.solution}>
          <CodeBlock code={exercise.solution} label="solution.tsx" />
        </div>
      )}
    </div>
  )
}
