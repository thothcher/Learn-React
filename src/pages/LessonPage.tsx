import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  Clock,
  Lightbulb,
  Presentation,
  TriangleAlert,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ExerciseBlock } from '../components/lesson/ExerciseBlock'
import { QuizCard } from '../components/lesson/QuizCard'
import { TeachingCard } from '../components/lesson/TeachingCard'
import { CodeCompare } from '../components/ui/CodeCompare'
import { RichText } from '../components/ui/RichText'
import { getAdjacentLessons, getLesson } from '../data/lessons'
import type { Lesson } from '../data/types'
import { weeks } from '../data/weeks'
import { progress, useProgress } from '../lib/progress'
import { cx } from '../lib/utils'
import styles from './LessonPage.module.css'
import { NotFoundPage } from './NotFoundPage'

export function LessonPage() {
  const { slug = '' } = useParams()
  const lesson = getLesson(slug)

  if (!lesson) return <NotFoundPage />

  // A new key per lesson resets local state (quiz answers) on navigation.
  return <LessonView key={lesson.slug} lesson={lesson} />
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const state = useProgress()
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const { previous, next } = getAdjacentLessons(lesson.slug)
  const week = weeks[lesson.week - 1]
  const complete = state.lessons.includes(lesson.slug)
  const correct = lesson.quiz.filter((question) => answers[question.id] === question.answer).length
  const answeredAll = Object.keys(answers).length === lesson.quiz.length
  const reactName = lesson.track === 'next' ? 'Next.js' : 'React'

  return (
    <article className={styles.page}>
      <title>{`${lesson.title} · Refract`}</title>

      <header className={cx('container', styles.header)}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/lessons">Lessons</Link>
          <ChevronRight size={14} />
          <Link to={`/roadmap#week-${lesson.week}`}>
            Week {lesson.week}: {week.title}
          </Link>
          <ChevronRight size={14} />
          <span>Day {lesson.day}</span>
        </nav>
        <h1 className={styles.title}>{lesson.title}</h1>
        <p className={styles.summary}>{lesson.summary}</p>
        <div className={styles.meta}>
          <span className={cx('chip', lesson.track === 'next' ? 'chip-next' : 'chip-react')}>{reactName}</span>
          <span className="chip">
            <Clock size={13} />
            {lesson.minutes} min
          </span>
          <span className="chip chip-angular">Angular: {lesson.angular}</span>
          <button
            type="button"
            className={cx('btn btn-sm', complete ? 'btn-soft' : 'btn-primary', styles.completeTop)}
            onClick={() => progress.toggleLesson(lesson.slug)}
          >
            <Check size={15} />
            {complete ? 'Completed' : 'Mark as complete'}
          </button>
        </div>
      </header>

      <section className={styles.narrow}>
        <SectionTitle number="01" title="The idea" />
        <div className={styles.prose}>
          {lesson.body.map((paragraph) => (
            <p key={paragraph}>
              <RichText text={paragraph} />
            </p>
          ))}
        </div>

        <aside className={styles.analogy}>
          <span className={styles.analogyIcon}>
            <Lightbulb size={20} />
          </span>
          <div>
            <p className={styles.calloutLabel}>Real-life analogy · {lesson.analogy.title}</p>
            <p>{lesson.analogy.body}</p>
          </div>
        </aside>
      </section>

      <section className={cx('container', styles.wide)}>
        <div className={styles.narrowInner}>
          <SectionTitle number="02" title={`Angular vs ${reactName}`} />
          <p className={styles.sectionLead}>The same feature in both frameworks. Read the Angular side first, then spot what disappeared.</p>
        </div>
        <CodeCompare
          angular={lesson.compare.angular}
          react={lesson.compare.react}
          angularLabel={lesson.compare.angularLabel}
          reactLabel={lesson.compare.reactLabel}
          track={lesson.track}
        />
      </section>

      <section className={styles.narrow}>
        <SectionTitle number="03" title="Key points" />
        <ul className={styles.points}>
          {lesson.keyPoints.map((point) => (
            <li key={point}>
              <span className={styles.pointIcon}>
                <Check size={14} strokeWidth={3} />
              </span>
              <span>
                <RichText text={point} />
              </span>
            </li>
          ))}
        </ul>

        {lesson.pitfall && (
          <aside className={styles.pitfall}>
            <TriangleAlert size={20} />
            <div>
              <p className={styles.calloutLabel}>Common pitfall</p>
              <p>
                <RichText text={lesson.pitfall} />
              </p>
            </div>
          </aside>
        )}
      </section>

      <section className={styles.narrow}>
        <SectionTitle number="04" title="Teaching card" />
        <TeachingCard
          card={lesson.card}
          week={lesson.week}
          track={lesson.track}
          footer={
            <Link to={`/teach?present=${lesson.slug}`} className="btn btn-sm">
              <Presentation size={16} />
              Present this card
            </Link>
          }
        />
      </section>

      <section className={styles.narrow}>
        <SectionTitle number="05" title="Exercise" />
        <ExerciseBlock exercise={lesson.exercise} />
      </section>

      <section className={styles.narrow}>
        <SectionTitle number="06" title="Quick check" />
        <div className={styles.quiz}>
          {lesson.quiz.map((question, index) => (
            <QuizCard
              key={question.id}
              question={question}
              label={`Question ${index + 1} of ${lesson.quiz.length}`}
              selected={answers[question.id] ?? null}
              onSelect={(choice) => setAnswers((current) => ({ ...current, [question.id]: choice }))}
            />
          ))}
          {answeredAll && (
            <div className={styles.quizResult}>
              <CircleCheck size={22} />
              <p>
                {correct} of {lesson.quiz.length} correct.{' '}
                {complete ? 'This lesson is marked as complete.' : 'Ready to mark this lesson as complete?'}
              </p>
              {!complete && (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => progress.completeLesson(lesson.slug)}>
                  Complete lesson
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <nav className={cx(styles.narrow, styles.pager)} aria-label="Lesson navigation">
        {previous ? (
          <Link to={`/lessons/${previous.slug}`} className={styles.pagerLink}>
            <span className={styles.pagerLabel}>
              <ArrowLeft size={15} /> Previous
            </span>
            <span className={styles.pagerTitle}>{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/lessons/${next.slug}`} className={cx(styles.pagerLink, styles.pagerNext)}>
            <span className={styles.pagerLabel}>
              Next <ArrowRight size={15} />
            </span>
            <span className={styles.pagerTitle}>{next.title}</span>
          </Link>
        ) : (
          <Link to="/practice/quiz" className={cx(styles.pagerLink, styles.pagerNext)}>
            <span className={styles.pagerLabel}>
              Finish <ArrowRight size={15} />
            </span>
            <span className={styles.pagerTitle}>Take the final exam</span>
          </Link>
        )}
      </nav>
    </article>
  )
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <h2 className={styles.sectionTitle}>
      <span>{number}</span>
      {title}
    </h2>
  )
}
