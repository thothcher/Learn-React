import { ArrowRight, BookOpen, CircleCheck, CircleX, ListChecks, RotateCcw, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { QuizCard } from '../../components/lesson/QuizCard'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { RichText } from '../../components/ui/RichText'
import { questionBank, type BankQuestion } from '../../data/lessons'
import { weeks } from '../../data/weeks'
import { progress, useProgress } from '../../lib/progress'
import { cx, percent, shuffle } from '../../lib/utils'
import { GameHeader } from './GameHeader'
import styles from './QuizGame.module.css'
import shared from './games.module.css'

interface TestDefinition {
  id: string
  title: string
  subtitle: string
  size: number
  build: () => BankQuestion[]
}

const weeklyTests: TestDefinition[] = weeks.map((week) => {
  const pool = questionBank.filter((question) => question.week === week.number)
  return { id: `week-${week.number}`, title: `Week ${week.number}`, subtitle: week.title, size: pool.length, build: () => pool }
})

function exam(id: string, title: string, subtitle: string, pool: BankQuestion[], size: number): TestDefinition {
  return { id, title, subtitle, size: Math.min(size, pool.length), build: () => shuffle(pool).slice(0, size) }
}

const exams: TestDefinition[] = [
  exam('react-exam', 'React exam', 'Weeks 1 to 5, random questions', questionBank.filter((q) => q.track === 'react'), 15),
  exam('next-exam', 'Next.js exam', 'Weeks 6 to 8, random questions', questionBank.filter((q) => q.track === 'next'), 12),
  exam('final-exam', 'Final exam', 'The whole course, random questions', questionBank, 20),
]

function verdict(score: number) {
  if (score >= 90) return 'Ready to teach this material'
  if (score >= 70) return 'Solid work. Review the misses'
  if (score >= 50) return 'Getting there. Revisit the lessons below'
  return 'Worth another pass through the lessons'
}

export function QuizGame() {
  const [test, setTest] = useState<TestDefinition | null>(null)
  const [questions, setQuestions] = useState<BankQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [finished, setFinished] = useState(false)
  const [isRecord, setIsRecord] = useState(false)

  const question = questions[index]
  const selected = answers[index] ?? null
  const correctCount = questions.filter((q, i) => answers[i] === q.answer).length

  function start(definition: TestDefinition) {
    setTest(definition)
    setQuestions(definition.build())
    setIndex(0)
    setAnswers([])
    setFinished(false)
    setIsRecord(false)
    window.scrollTo({ top: 0 })
  }

  function answer(choice: number) {
    if (answers[index] !== undefined) return
    const next = [...answers]
    next[index] = choice
    setAnswers(next)
  }

  function next() {
    if (index < questions.length - 1) {
      setIndex(index + 1)
    } else {
      setFinished(true)
      setIsRecord(progress.recordScore(`quiz:${test!.id}`, percent(correctCount, questions.length)))
    }
  }

  // Number keys answer, Enter moves on.
  useEffect(() => {
    if (!test || finished || !question) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLButtonElement && event.key === 'Enter') return
      const number = Number(event.key)
      if (number >= 1 && number <= question.options.length) answer(number - 1)
      else if (event.key === 'Enter' && selected !== null) next()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return (
    <>
      <title>Tests · Refract</title>
      <GameHeader
        icon={ListChecks}
        title="Tests"
        description="A test for every week and three exams, built from the lesson questions. Aim for 80% before you teach a topic."
      />

      {!test && <TestPicker onStart={start} />}

      {test && !finished && question && (
        <section className={cx('container', styles.play)}>
          <div className={styles.playHead}>
            <div>
              <p className={styles.testName}>
                {test.title} · {test.subtitle}
              </p>
              <p className={styles.counter}>
                Question {index + 1} of {questions.length}
              </p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTest(null)}>
              Quit
            </button>
          </div>
          <div className={styles.progress}>
            <span style={{ width: `${percent(index + (selected !== null ? 1 : 0), questions.length)}%` }} />
          </div>

          <div className={styles.questionCard}>
            <QuizCard
              key={question.id}
              question={question}
              selected={selected}
              onSelect={answer}
              label={`Week ${question.week} · ${question.lessonTitle}`}
            />
            <div className={styles.playFooter}>
              <span className={styles.keys}>
                <kbd>1</kbd>–<kbd>{question.options.length}</kbd> to answer · <kbd>Enter</kbd> to continue
              </span>
              {selected !== null && (
                <Link to={`/lessons/${question.lessonSlug}`} className={styles.reviewLink}>
                  <BookOpen size={15} />
                  Review lesson
                </Link>
              )}
              <button type="button" className="btn btn-primary" disabled={selected === null} onClick={next}>
                {index < questions.length - 1 ? 'Next question' : 'See results'}
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </section>
      )}

      {test && finished && (
        <Results
          test={test}
          questions={questions}
          answers={answers}
          correctCount={correctCount}
          isRecord={isRecord}
          onRetake={() => start(test)}
          onBack={() => setTest(null)}
        />
      )}
    </>
  )
}

function TestPicker({ onStart }: { onStart: (test: TestDefinition) => void }) {
  const { scores } = useProgress()

  const renderTest = (test: TestDefinition, large = false) => {
    const best = scores[`quiz:${test.id}`]
    return (
      <button key={test.id} type="button" className={cx(styles.test, large && styles.testLarge)} onClick={() => onStart(test)}>
        <span className={styles.testTop}>
          <span className={styles.testTitle}>{test.title}</span>
          {best !== undefined && (
            <span className={cx('chip', best >= 80 ? 'chip-success' : 'chip-warning')}>Best {best}%</span>
          )}
        </span>
        <span className={styles.testSubtitle}>{test.subtitle}</span>
        <span className={styles.testMeta}>
          {test.size} questions
          <ArrowRight size={15} />
        </span>
      </button>
    )
  }

  return (
    <section className="container">
      <h2 className={styles.groupTitle}>Weekly tests</h2>
      <div className={styles.weekGrid}>{weeklyTests.map((test) => renderTest(test))}</div>
      <h2 className={styles.groupTitle}>Exams</h2>
      <div className={styles.examGrid}>{exams.map((test) => renderTest(test, true))}</div>
    </section>
  )
}

interface ResultsProps {
  test: TestDefinition
  questions: BankQuestion[]
  answers: number[]
  correctCount: number
  isRecord: boolean
  onRetake: () => void
  onBack: () => void
}

function Results({ test, questions, answers, correctCount, isRecord, onRetake, onBack }: ResultsProps) {
  const score = percent(correctCount, questions.length)
  const missed = questions.filter((question, i) => answers[i] !== question.answer)

  return (
    <section className={cx('container', styles.play)}>
      <div className={styles.summary}>
        <ProgressRing value={score} size={148} stroke={12}>
          <div>
            <p className={styles.score}>{score}%</p>
            <p className={styles.scoreLabel}>
              {correctCount}/{questions.length}
            </p>
          </div>
        </ProgressRing>
        <div className={styles.summaryText}>
          <p className={styles.testName}>
            {test.title} · {test.subtitle}
          </p>
          <h2 className={styles.summaryTitle}>{verdict(score)}</h2>
          {isRecord && (
            <span className="chip chip-success">
              <Trophy size={13} />
              New best score
            </span>
          )}
          <div className={shared.resultActions}>
            <button type="button" className="btn btn-primary" onClick={onRetake}>
              <RotateCcw size={17} />
              Retake
            </button>
            <button type="button" className="btn" onClick={onBack}>
              All tests
            </button>
          </div>
        </div>
      </div>

      {missed.length > 0 && (
        <div className={styles.review}>
          <h3>Review {missed.length === 1 ? 'the missed question' : `${missed.length} missed questions`}</h3>
          <ul>
            {missed.map((question) => (
              <li key={question.id}>
                <CircleX size={20} className={styles.missIcon} />
                <div>
                  <p className={styles.reviewQuestion}>
                    <RichText text={question.question} />
                  </p>
                  <p className={styles.reviewAnswer}>
                    <CircleCheck size={16} />
                    <span>
                      <RichText text={question.options[question.answer]} />
                    </span>
                  </p>
                  <Link to={`/lessons/${question.lessonSlug}`} className={styles.reviewLink}>
                    <BookOpen size={15} />
                    {question.lessonTitle}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
