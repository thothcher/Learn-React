import { CircleCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Alert } from '../../components/ui/Alert'
import { FormField, PasswordInput } from '../../components/ui/FormField'
import { ApiError, asApiError, authApi } from '../../lib/api'
import { AuthLayout } from './AuthLayout'
import styles from './auth.module.css'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const code = params.get('code') ?? ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [clientErrors, setClientErrors] = useState<{ password?: string; confirmation?: string }>({})
  const [error, setError] = useState<ApiError | null>(null)
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  if (!email || !code) {
    return (
      <AuthLayout title="This link is incomplete" description="Open the full link from your email, or request a new one.">
        <title>Reset password · Refract</title>
        <Link to="/forgot-password" className={`btn btn-primary btn-lg ${styles.submit}`}>
          Request a new link
        </Link>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout title="Password updated" description="You can now log in with your new password.">
        <title>Password updated · Refract</title>
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors: typeof clientErrors = {}
    if (password.length < 8) errors.password = 'Use at least 8 characters.'
    else if (password !== confirmation) errors.confirmation = 'The passwords do not match.'
    setClientErrors(errors)
    if (Object.keys(errors).length > 0) return

    setPending(true)
    setError(null)
    try {
      await authApi.resetPassword({ email, code, password })
      setDone(true)
    } catch (caught) {
      setError(asApiError(caught))
      setPending(false)
    }
  }

  return (
    <AuthLayout
      title="Choose a new password"
      description={
        <>
          For <strong>{email}</strong>. Other devices will be signed out.
        </>
      }
    >
      <title>Reset password · Refract</title>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && !error.hasFieldErrors && (
          <Alert tone="error" title={error.title}>
            <p>{error.message}</p>
            {error.code === 'InvalidLink' && <Link to="/forgot-password">Request a new link</Link>}
          </Alert>
        )}

        <FormField label="New password" error={clientErrors.password ?? error?.fieldErrors.password?.[0]} hint="At least 8 characters.">
          <PasswordInput
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(clientErrors.password ?? error?.fieldErrors.password)}
          />
        </FormField>

        <FormField label="Repeat the new password" error={clientErrors.confirmation}>
          <PasswordInput
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            aria-invalid={Boolean(clientErrors.confirmation)}
          />
        </FormField>

        <button type="submit" className={`btn btn-primary btn-lg ${styles.submit}`} disabled={pending}>
          {pending ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </AuthLayout>
  )
}
