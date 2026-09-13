import { BookOpen, Check, Flame, Hammer, ListChecks, Trophy } from 'lucide-react'
import { Link } from 'react-router'
import type { ServerProgress } from '../../lib/api'
import { formatScore, gameLabel, recentActivity, relativeTime, summarize, TOTAL_TESTS } from '../../lib/stats'
import { cx, percent } from '../../lib/utils'
import { ProgressRing } from '../ui/ProgressRing'
import styles from './ProgressOverview.module.css'

const activityIcons = { lesson: BookOpen, project: Hammer, score: Trophy }

/** The progress picture shared by the student dashboard and the teacher's student view. */
export function ProgressOverview({ progress }: { progress: ServerProgress }) {
  const summary = summarize(progress)
  const activity = recentActivity(progress)
  const scores = [...progress.scores].sort((a, b) => gameLabel(a.key).localeCompare(gameLabel(b.key)))

  return (
    <div className={styles.overview}>
      <div className={styles.tiles}>
        <div className={cx(styles.tile, styles.ringTile)}>
          <ProgressRing value={summary.overall} size={84} stroke={8}>
            <span className={styles.ringValue}>{summary.overall}%</span>
          </ProgressRing>
          <div>
            <p className={styles.tileLabel}>Course progress</p>
            <p className={styles.tileHint}>Lessons and projects</p>
          </div>
        </div>
        <Stat icon={BookOpen} label="Lessons" value={summary.lessonsDone} total={summary.weekly.reduce((sum, w) => sum + w.lessonsTotal, 0)} />
        <Stat icon={Hammer} label="Projects" value={summary.projectsDone} total={summary.weekly.length} />
        <Stat icon={ListChecks} label="Tests passed" value={summary.testsPassed} total={TOTAL_TESTS} />
        <div className={styles.tile}>
          <span className={cx(styles.tileIcon, styles.flame)}>
            <Flame size={20} />
          </span>
          <p className={styles.tileValue}>
            {summary.streak.current}
            <span> {summary.streak.current === 1 ? 'day' : 'days'}</span>
          </p>
          <p className={styles.tileLabel}>Current streak · best {summary.streak.best}</p>
        </div>
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Weekly progress</h2>
          <ol className={styles.weeks}>
            {summary.weekly.map(({ week, lessonsDone, lessonsTotal, projectDone }) => {
              const done = lessonsDone + (projectDone ? 1 : 0)
              const total = lessonsTotal + 1
              return (
                <li key={week.number} className={styles.week}>
                  <span className={styles.weekNumber}>W{week.number}</span>
                  <div className={styles.weekBody}>
                    <div className={styles.weekTop}>
                      <span className={styles.weekTitle}>{week.title}</span>
                      <span className={styles.weekCount}>
                        {done}/{total}
                      </span>
                    </div>
                    <div className={styles.bar} data-complete={done === total}>
                      <span style={{ width: `${percent(done, total)}%` }} />
                    </div>
                  </div>
                  <span className={styles.projectMark} data-done={projectDone} title={projectDone ? 'Project done' : 'Project open'}>
                    {projectDone ? <Check size={14} strokeWidth={3} /> : <Hammer size={14} />}
                  </span>
                </li>
              )
            })}
          </ol>
        </section>

        <div className={styles.side}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Recent activity</h2>
            {activity.length === 0 ? (
              <p className={styles.empty}>Nothing yet. Completed lessons, projects and new best scores appear here.</p>
            ) : (
              <ul className={styles.activity}>
                {activity.map((item) => {
                  const Icon = activityIcons[item.kind]
                  return (
                    <li key={item.id}>
                      <span className={styles.activityIcon} data-kind={item.kind}>
                        <Icon size={15} />
                      </span>
                      <span className={styles.activityText}>
                        <span className={styles.activityTitle}>{item.title}</span>
                        <span className={styles.activityDetail}>
                          {item.detail} · {relativeTime(item.at)}
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Best scores</h2>
            {scores.length === 0 ? (
              <p className={styles.empty}>
                No games played yet. <Link to="/practice">Open the practice hub</Link>.
              </p>
            ) : (
              <ul className={styles.scores}>
                {scores.map((score) => (
                  <li key={score.key}>
                    <span>{gameLabel(score.key)}</span>
                    <strong>{formatScore(score.key, score.score)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

interface StatProps {
  icon: typeof BookOpen
  label: string
  value: number
  total: number
}

function Stat({ icon: Icon, label, value, total }: StatProps) {
  return (
    <div className={styles.tile}>
      <span className={styles.tileIcon}>
        <Icon size={20} />
      </span>
      <p className={styles.tileValue}>
        {value}
        <span>/{total}</span>
      </p>
      <p className={styles.tileLabel}>{label}</p>
    </div>
  )
}
