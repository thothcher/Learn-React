import { Activity, ChevronRight, GraduationCap, MailWarning, RotateCcw, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Alert } from '../../components/ui/Alert'
import { Avatar } from '../../components/ui/Avatar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Segmented } from '../../components/ui/Segmented'
import { Spinner } from '../../components/ui/Spinner'
import { lessons } from '../../data/lessons'
import { weeks } from '../../data/weeks'
import { teacherApi, type StudentSummary } from '../../lib/api'
import { relativeTime, TOTAL_TESTS } from '../../lib/stats'
import { useApiData } from '../../lib/useApiData'
import { percent } from '../../lib/utils'
import styles from './TeacherPage.module.css'

type Sort = 'progress' | 'active' | 'name'

const WEEK = 7 * 86_400_000

const sorters: Record<Sort, (a: StudentSummary, b: StudentSummary) => number> = {
  progress: (a, b) => b.lessonsCompleted + b.projectsCompleted - (a.lessonsCompleted + a.projectsCompleted),
  active: (a, b) => Date.parse(b.lastActiveAt ?? '0') - Date.parse(a.lastActiveAt ?? '0'),
  name: (a, b) => a.displayName.localeCompare(b.displayName),
}

export function TeacherPage() {
  const { data, error, loading, reload } = useApiData(teacherApi.students, 'students')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('progress')
  // Read the clock once, when the page opens, so renders stay pure.
  const [openedAt] = useState(() => Date.now())

  const students = data ?? []
  const search = query.trim().toLowerCase()
  const visible = students
    .filter((student) => `${student.displayName} ${student.email}`.toLowerCase().includes(search))
    .sort(sorters[sort])

  const activeThisWeek = students.filter(
    (student) => student.lastActiveAt && openedAt - Date.parse(student.lastActiveAt) < WEEK,
  ).length
  const averageLessons = students.length
    ? Math.round(students.reduce((sum, student) => sum + student.lessonsCompleted, 0) / students.length)
    : 0
  const unconfirmed = students.filter((student) => !student.emailConfirmed).length

  return (
    <>
      <title>Teacher dashboard · Refract</title>
      <PageHeader
        eyebrow={
          <>
            <GraduationCap size={16} /> Teacher
          </>
        }
        title="Your students"
        description="Follow every student's lessons, projects and test results. Open a student to see their full progress."
      />

      <section className="container">
        {loading && <Spinner label="Loading students…" />}
        {error && (
          <Alert tone="error" title="Students could not be loaded">
            <p>{error.message}</p>
            <button type="button" onClick={reload}>
              <RotateCcw size={14} /> Try again
            </button>
          </Alert>
        )}

        {data && (
          <>
            <div className={styles.stats}>
              <Stat icon={Users} label="Students" value={students.length} />
              <Stat icon={Activity} label="Active this week" value={activeThisWeek} />
              <Stat icon={GraduationCap} label="Average lessons done" value={`${averageLessons}/${lessons.length}`} />
              <Stat icon={MailWarning} label="Email not confirmed" value={unconfirmed} />
            </div>

            <div className={styles.toolbar}>
              <label className={styles.search}>
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Search by name or email"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <Segmented<Sort>
                value={sort}
                onChange={setSort}
                ariaLabel="Sort students"
                options={[
                  { value: 'progress', label: 'Most progress' },
                  { value: 'active', label: 'Recently active' },
                  { value: 'name', label: 'Name' },
                ]}
              />
            </div>

            {students.length === 0 ? (
              <div className={styles.empty}>
                <Users size={28} />
                <h2>No students yet</h2>
                <p>Share the site with your class. Students appear here as soon as they register.</p>
              </div>
            ) : visible.length === 0 ? (
              <p className={styles.noMatch}>No students match "{query}".</p>
            ) : (
              <ul className={styles.list}>
                {visible.map((student) => (
                  <li key={student.id}>
                    <Link to={`/teacher/students/${student.id}`} className={styles.row}>
                      <Avatar name={student.displayName} size={42} />
                      <span className={styles.identity}>
                        <span className={styles.name}>{student.displayName}</span>
                        <span className={styles.email}>{student.email}</span>
                        {!student.emailConfirmed && <span className="chip chip-warning">Email not confirmed</span>}
                      </span>
                      <span className={styles.progress}>
                        <span className={styles.progressLabel}>
                          {student.lessonsCompleted}/{lessons.length} lessons
                        </span>
                        <span className={styles.bar}>
                          <span style={{ width: `${percent(student.lessonsCompleted, lessons.length)}%` }} />
                        </span>
                      </span>
                      <span className={styles.metric}>
                        <strong>
                          {student.projectsCompleted}/{weeks.length}
                        </strong>
                        projects
                      </span>
                      <span className={styles.metric}>
                        <strong>
                          {student.testsPassed}/{TOTAL_TESTS}
                        </strong>
                        tests
                      </span>
                      <span className={styles.lastActive}>{relativeTime(student.lastActiveAt)}</span>
                      <ChevronRight size={18} className={styles.chevron} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statIcon}>
        <Icon size={19} />
      </span>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statLabel}>{label}</p>
    </div>
  )
}
