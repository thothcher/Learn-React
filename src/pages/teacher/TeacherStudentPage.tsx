import { ArrowLeft, RotateCcw } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ProgressOverview } from '../../components/dashboard/ProgressOverview'
import { Alert } from '../../components/ui/Alert'
import { Avatar } from '../../components/ui/Avatar'
import { Spinner } from '../../components/ui/Spinner'
import { teacherApi } from '../../lib/api'
import { relativeTime } from '../../lib/stats'
import { useApiData } from '../../lib/useApiData'
import styles from './TeacherStudentPage.module.css'

export function TeacherStudentPage() {
  const { id = '' } = useParams()
  const { data, error, loading, reload } = useApiData(() => teacherApi.student(id), id)

  return (
    <section className={`container ${styles.page}`}>
      <title>{data ? `${data.student.displayName} · Teacher · Refract` : 'Student · Refract'}</title>
      <Link to="/teacher" className={styles.back}>
        <ArrowLeft size={16} />
        All students
      </Link>

      {loading && <Spinner label="Loading student…" />}

      {error && (
        <Alert tone="error" title={error.status === 404 ? 'Student not found' : 'This student could not be loaded'}>
          <p>{error.status === 404 ? 'The account may have been deleted.' : error.message}</p>
          {error.status !== 404 && (
            <button type="button" onClick={reload}>
              <RotateCcw size={14} /> Try again
            </button>
          )}
        </Alert>
      )}

      {data && (
        <>
          <header className={styles.header}>
            <Avatar name={data.student.displayName} size={64} />
            <div className={styles.identity}>
              <h1>{data.student.displayName}</h1>
              <p>{data.student.email}</p>
              <div className={styles.meta}>
                <span className="chip">
                  Joined {new Date(data.student.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="chip">Last active {relativeTime(data.student.lastActiveAt).toLowerCase()}</span>
                {data.student.emailConfirmed ? (
                  <span className="chip chip-success">Email confirmed</span>
                ) : (
                  <span className="chip chip-warning">Email not confirmed</span>
                )}
              </div>
            </div>
          </header>
          <ProgressOverview progress={data.progress} />
        </>
      )}
    </section>
  )
}
