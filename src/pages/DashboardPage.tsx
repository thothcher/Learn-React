import { ArrowRight, LayoutDashboard, RotateCcw, Users } from 'lucide-react'
import { Link } from 'react-router'
import { ProgressOverview } from '../components/dashboard/ProgressOverview'
import { Alert } from '../components/ui/Alert'
import { PageHeader } from '../components/ui/PageHeader'
import { Spinner } from '../components/ui/Spinner'
import { lessons } from '../data/lessons'
import { progressApi } from '../lib/api'
import { useAuth } from '../lib/auth-context'
import { whenProgressSaved } from '../lib/progress'
import { summarize } from '../lib/stats'
import { useApiData } from '../lib/useApiData'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { user } = useAuth()
  // Wait for saves still on their way (for example a lesson marked just before opening the
  // dashboard), so the numbers include them.
  const { data, error, loading, reload } = useApiData(() => whenProgressSaved().then(progressApi.get), 'my-progress')

  const firstName = user?.displayName.split(' ')[0] ?? 'there'
  const summary = data ? summarize(data) : null

  return (
    <>
      <title>Dashboard · Refract</title>
      <PageHeader
        eyebrow={
          <>
            <LayoutDashboard size={16} /> Dashboard
          </>
        }
        title={`Welcome back, ${firstName}`}
        description={
          !summary || summary.lessonsDone === 0
            ? 'Your journey starts with lesson one. Everything you complete is saved to your account.'
            : `You have completed ${summary.lessonsDone} of ${lessons.length} lessons. Keep the streak going.`
        }
      >
        <div className={styles.actions}>
          {summary?.nextLesson ? (
            <Link to={`/lessons/${summary.nextLesson.slug}`} className="btn btn-primary btn-lg">
              {summary.lessonsDone === 0 ? 'Start' : 'Continue with'} “{summary.nextLesson.title}”
              <ArrowRight size={18} />
            </Link>
          ) : (
            summary && (
              <Link to="/teach" className="btn btn-primary btn-lg">
                All lessons done. Open the teaching cards
                <ArrowRight size={18} />
              </Link>
            )
          )}
          {user?.isTeacher && (
            <Link to="/teacher" className="btn btn-lg">
              <Users size={18} />
              Teacher dashboard
            </Link>
          )}
        </div>
      </PageHeader>

      <section className="container">
        {loading && <Spinner label="Loading your progress…" />}
        {error && (
          <Alert tone="error" title="Your progress could not be loaded">
            <p>{error.message}</p>
            <button type="button" onClick={reload}>
              <RotateCcw size={14} /> Try again
            </button>
          </Alert>
        )}
        {data && <ProgressOverview progress={data} />}
      </section>
    </>
  )
}
