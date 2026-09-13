import { MailCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Alert } from '../../components/ui/Alert'
import { FormField } from '../../components/ui/FormField'
import { ApiError, asApiError, authApi } from '../../lib/api'
import { AuthLayout } from './AuthLayout'
import styles from './auth.module.css'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      await authApi.forgotPassword(email.trim())
      setSentTo(email.trim())
    } catch (caught) {
      setError(asApiError(caught))
    } finally {
      setPending(false)
    }
  }

  const footer = (
    <>
      Remembered it? <Link to="/login">Back to log in</Link>
    </>
  )

  if (sentTo) {
    return (
      <AuthLayout title="Check your inbox" footer={footer}>
        <title>Reset link sent · Refract</title>
        <div className={styles.status}>
          <span className={styles.statusIcon}>
            <MailCheck size={28} />
          </span>
          <p className={styles.muted}>
            If an account exists for <strong>{sentTo}</strong>, a password reset link is on its way. It expires in 3 hours.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter the email you registered with and we will send you a link to choose a new password."
      footer={footer}
    >
      <title>Forgot password · Refract</title>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && !error.hasFieldErrors && <Alert tone="error">{error.message}</Alert>}
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
        <button type="submit" className={`btn btn-primary btn-lg ${styles.submit}`} disabled={pending}>
          {pending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthLayout>
  )
}
