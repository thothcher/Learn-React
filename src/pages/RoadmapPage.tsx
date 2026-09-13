import { ArrowRight, Check, Clock, Hammer, Map as MapIcon, RotateCcw, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressRing } from '../components/ui/ProgressRing'
import { lessons, lessonsForWeek } from '../data/lessons'
import type { Week } from '../data/types'
import { weeks } from '../data/weeks'
import { progress, useProgress } from '../lib/progress'
import { cx, percent } from '../lib/utils'
import styles from './RoadmapPage.module.css'

const phases = [
  { title: 'Month one', subtitle: 'Think in React', weeks: [1, 2, 3, 4] },
  { title: 'Month two', subtitle: 'Real-world React and Next.js', weeks: [5, 6, 7, 8] },
]

export function RoadmapPage() {
  const state = useProgress()
  const doneLessons = state.lessons.length
  const doneProjects = state.projects.length
  const overall = percent(doneLessons + doneProjects, lessons.length + weeks.length)
  const nextLesson = lessons.find((lesson) => !state.lessons.includes(lesson.slug))

  function resetProgress() {
    if (window.confirm('Reset all lesson, project and game progress?')) progress.reset()
  }

  return (
    <>
      <title>Roadmap · Refract</title>
      <PageHeader
        eyebrow={
          <>
            <MapIcon size={16} /> Roadmap
          </>
        }
        title="Eight weeks from Angular to React and Next.js"
        description="Four lessons and a project every week, about five study days. Tick things off as you go; progress is saved in this browser."
      />

      <section className="container">
        <div className={styles.overview}>
          <ProgressRing value={overall} size={132} stroke={11}>
            <div>
              <p className={styles.ringValue}>{overall}%</p>
              <p className={styles.ringLabel}>complete</p>
            </div>
          </ProgressRing>

          <dl className={styles.stats}>
            <div>
              <dt>Lessons</dt>
              <dd>
                {doneLessons}
                <span>/{lessons.length}</span>
              </dd>
            </div>
            <div>
              <dt>Projects</dt>
              <dd>
                {doneProjects}
                <span>/{weeks.length}</span>
              </dd>
            </div>
            <div>
              <dt>Study time</dt>
              <dd>
                {Math.round(lessons.reduce((sum, lesson) => sum + lesson.minutes, 0) / 60)}
                <span>h + projects</span>
              </dd>
            </div>
          </dl>

          <div className={styles.next}>
            {nextLesson ? (
              <>
                <p className={styles.nextLabel}>Next up · Week {nextLesson.week}</p>
                <p className={styles.nextTitle}>{nextLesson.title}</p>
                <Link to={`/lessons/${nextLesson.slug}`} className="btn btn-primary">
                  Continue
                  <ArrowRight size={17} />
                </Link>
              </>
            ) : (
              <>
                <p className={styles.nextLabel}>All lessons done</p>
                <p className={styles.nextTitle}>Time to teach it.</p>
                <Link to="/teach" className="btn btn-primary">
                  Open teaching cards
                  <ArrowRight size={17} />
                </Link>
              </>
            )}
            {(doneLessons > 0 || doneProjects > 0) && (
              <button type="button" className={`btn btn-ghost btn-sm ${styles.reset}`} onClick={resetProgress}>
                <RotateCcw size={15} />
                Reset progress
              </button>
            )}
          </div>
        </div>
      </section>

      {phases.map((phase) => (
        <section key={phase.title} className={`container ${styles.phase}`}>
          <div className={styles.phaseHead}>
            <h2>{phase.title}</h2>
            <p>{phase.subtitle}</p>
          </div>
          <div className={styles.weeks}>
            {phase.weeks.map((number) => (
              <WeekCard key={number} week={weeks[number - 1]} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

function WeekCard({ week }: { week: Week }) {
  const state = useProgress()
  const weekLessons = lessonsForWeek(week.number)
  const projectDone = state.projects.includes(week.number)
  const done = weekLessons.filter((lesson) => state.lessons.includes(lesson.slug)).length + (projectDone ? 1 : 0)
  const total = weekLessons.length + 1
  const minutes = weekLessons.reduce((sum, lesson) => sum + lesson.minutes, 0)

  return (
    <article className={styles.week} id={`week-${week.number}`}>
      <div className={styles.weekInfo}>
        <p className={styles.weekNumber}>Week {String(week.number).padStart(2, '0')}</p>
        <h3 className={styles.weekTitle}>{week.title}</h3>
        <p className={styles.weekGoal}>{week.goal}</p>
        <div className={styles.weekMeta}>
          <span className={cx('chip', week.track === 'next' ? 'chip-next' : 'chip-react')}>
            {week.track === 'next' ? 'Next.js' : 'React'}
          </span>
          <span className="chip">
            <Clock size={13} />
            {Math.round(minutes / 60 * 10) / 10}h of lessons
          </span>
        </div>
        <div className={styles.weekProgress}>
          <div className={styles.bar}>
            <span style={{ width: `${percent(done, total)}%` }} />
          </div>
          <span>
            {done}/{total}
          </span>
        </div>
      </div>

      <ol className={styles.days}>
        {weekLessons.map((lesson) => {
          const complete = state.lessons.includes(lesson.slug)
          return (
            <li key={lesson.slug} className={styles.day} data-complete={complete}>
              <button
                type="button"
                className={styles.check}
                onClick={() => progress.toggleLesson(lesson.slug)}
                aria-pressed={complete}
                aria-label={complete ? `Mark "${lesson.title}" as not done` : `Mark "${lesson.title}" as done`}
              >
                {complete && <Check size={14} strokeWidth={3} />}
              </button>
              <Link to={`/lessons/${lesson.slug}`} className={styles.dayLink}>
                <span className={styles.dayNumber}>Day {lesson.day}</span>
                <span className={styles.dayTitle}>{lesson.title}</span>
                <code className={styles.dayAngular}>{lesson.angular}</code>
              </Link>
            </li>
          )
        })}

        <li className={styles.project} data-complete={projectDone}>
          <details>
            <summary>
              <span className={styles.projectIcon}>
                <Hammer size={16} />
              </span>
              <span className={styles.dayNumber}>Day 5</span>
              <span className={styles.dayTitle}>Project: {week.project.title}</span>
              <ArrowRight size={16} className={styles.summaryArrow} />
            </summary>
            <div className={styles.projectBody}>
              <p>{week.project.brief}</p>
              <div className={styles.projectLists}>
                <div>
                  <p className={styles.listTitle}>Checklist</p>
                  <ul>
                    {week.project.checklist.map((item) => (
                      <li key={item}>
                        <Check size={15} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className={styles.listTitle}>Stretch goals</p>
                  <ul>
                    {week.project.stretch.map((item) => (
                      <li key={item}>
                        <Sparkles size={15} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                type="button"
                className={cx('btn btn-sm', projectDone ? 'btn-soft' : 'btn-primary')}
                onClick={() => progress.toggleProject(week.number)}
              >
                <Check size={15} />
                {projectDone ? 'Project completed' : 'Mark project as done'}
              </button>
            </div>
          </details>
        </li>
      </ol>
    </article>
  )
}
