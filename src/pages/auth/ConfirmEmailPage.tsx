import { CircleCheck, CircleX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Spinner } from '../../components/ui/Spinner'
import { asApiError, authApi } from '../../lib/api'
import { AuthLayout } from './AuthLayout'
import styles from './auth.module.css'

type State = 'confirming' | 'confirmed' | 'failed'

export function ConfirmEmailPage() {
  const [params] = useSearchParams()
  const userId = params.get('userId')
  const code = params.get('code')
  const [state, setState] = useState<State>(userId && code ? 'confirming' : 'failed')
  const [message, setMessage] = useState('This link is incomplete. Open the full link from your email.')

  useEffect(() => {
    if (!userId || !code) return
    let ignore = false

    authApi
      .confirmEmail(userId, code)
      .then(() => {
        if (!ignore) setState('confirmed')
      })
      .catch((caught: unknown) => {
        if (ignore) return
        setMessage(asApiError(caught).message)
        setState('failed')
      })

    return () => {
      ignore = true
    }
  }, [userId, code])

  if (state === 'confirming') {
    return (
      <AuthLayout title="Confirming your email">
        <title>Confirm email · Refract</title>
        <Spinner label="One moment…" />
      </AuthLayout>
    )
  }

  if (state === 'confirmed') {
    return (
      <AuthLayout title="Email confirmed" description="Your account is ready. Log in to start saving your progress.">
        <title>Email confirmed · Refract</title>
        <div className={styles.status}>
          <span className={styles.statusIcon} data-tone="success">
            <CircleCheck size={28} />
          </span>
          <Link to="/login" className={`btn btn-primary btn-lg ${styles.submit}`}>
            Log in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="We couldn't confirm your email" description={message}>
      <title>Confirmation failed · Refract</title>
      <div className={styles.status}>
        <span className={styles.statusIcon} data-tone="error">
          <CircleX size={28} />
        </span>
        <p className={styles.muted}>
          Log in with your email and password, and we will offer to send a fresh confirmation link.
        </p>
        <Link to="/login" className="btn btn-primary">
          Go to log in
        </Link>
      </div>
    </AuthLayout>
  )
}
