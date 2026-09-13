import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../../lib/auth-context'
import { Spinner } from '../ui/Spinner'

/**
 * A route guard, like Angular's canActivate: signed-out visitors go to the login page
 * and return afterwards. The API checks access again, so this only shapes the UI.
 */
export function RequireAuth({ teacher = false, children }: { teacher?: boolean; children: ReactNode }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <Spinner label="Checking your session…" />

  if (status !== 'signedIn' || !user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (teacher && !user.isTeacher) return <Navigate to="/dashboard" replace />

  return children
}
