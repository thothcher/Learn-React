import { useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { Alert } from '../../components/ui/Alert'
import { FormField, PasswordInput } from '../../components/ui/FormField'
import { ApiError, asApiError, authApi } from '../../lib/api'
import { useAuth } from '../../lib/auth-context'
import { safeNextPath } from '../../lib/navigation'
import { AuthLayout } from './AuthLayout'
import styles from './auth.module.css'

export function LoginPage() {
  const { status, login } = useAuth()
  const [params] = useSearchParams()
  const next = safeNextPath(params.get('next'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [resend, setResend] = useState<'idle' | 'sending' | 'sent'>('idle')

  // Once signed in (now or from an earlier session), continue to where the user was going.
  if (status === 'signedIn') return <Navigate to={next} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    setResend('idle')
    try {
      await login(email.trim(), password, rememberMe)
    } catch (caught) {
      setError(asApiError(caught))
      setPending(false)
    }
  }

  async function resendConfirmation() {
    setResend('sending')
    await authApi.resendConfirmation(email.trim()).catch(() => {})
    setResend('sent')
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to save your progress and open your dashboard."
      footer={
        <>
          New to Refract? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <title>Log in · Refract</title>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && !error.hasFieldErrors && (
          <Alert tone="error" title={error.title}>
            <p>{error.message}</p>
            {error.code === 'EmailNotConfirmed' &&
              (resend === 'sent' ? (
                <p>A new confirmation link is on its way.</p>
              ) : (
                <button type="button" onClick={resendConfirmation} disabled={resend === 'sending'}>
                  Send a new confirmation link
                </button>
              ))}
            {error.code === 'LockedOut' && <Link to="/forgot-password">Reset your password</Link>}
          </Alert>
        )}

        <FormField label="Email" error={error?.fieldErrors.email?.[0]}>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error?.fieldErrors.email)}
            placeholder="ana@example.com"
          />
        </FormField>

        <FormField
          label="Password"
          error={error?.fieldErrors.password?.[0]}
          hint={<Link to="/forgot-password">Forgot your password?</Link>}
        >
          <PasswordInput
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(error?.fieldErrors.password)}
          />
        </FormField>

        <label className={styles.checkbox}>
          <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
          Keep me signed in for 14 days
        </label>

        <button type="submit" className={`btn btn-primary btn-lg ${styles.submit}`} disabled={pending}>
          {pending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  )
}
