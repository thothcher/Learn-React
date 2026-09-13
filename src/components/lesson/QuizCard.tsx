import { CircleCheck, CircleX } from 'lucide-react'
import type { QuizQuestion } from '../../data/types'
import { CodeBlock } from '../ui/CodeBlock'
import { RichText } from '../ui/RichText'
import styles from './QuizCard.module.css'

interface QuizCardProps {
  question: QuizQuestion
  selected: number | null
  onSelect: (index: number) => void
  label?: string
}

const LETTERS = ['A', 'B', 'C', 'D', 'E']

export function QuizCard({ question, selected, onSelect, label }: QuizCardProps) {
  const answered = selected !== null
  const correct = selected === question.answer

  return (
    <div className={styles.card}>
      {label && <p className={styles.label}>{label}</p>}
      <p className={styles.question}>
        <RichText text={question.question} />
      </p>
      {question.code && <CodeBlock code={question.code} bare className={styles.code} />}

      <div className={styles.options} role="group" aria-label="Answers">
        {question.options.map((option, index) => {
          let state = 'idle'
          if (answered) {
            if (index === question.answer) state = 'correct'
            else if (index === selected) state = 'wrong'
            else state = 'muted'
          }
          return (
            <button
              key={option}
              type="button"
              className={styles.option}
              data-state={state}
              disabled={answered}
              onClick={() => onSelect(index)}
            >
              <span className={styles.letter}>
                {state === 'correct' ? (
                  <CircleCheck size={18} />
                ) : state === 'wrong' ? (
                  <CircleX size={18} />
                ) : (
                  LETTERS[index]
                )}
              </span>
              <span className={styles.optionText}>
                <RichText text={option} />
              </span>
            </button>
          )
        })}
      </div>

      {answered && (
        <p className={styles.feedback} data-correct={correct} role="status">
          <strong>{correct ? 'Correct.' : 'Not quite.'}</strong> <RichText text={question.explanation} />
        </p>
      )}
    </div>
  )
}
