import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { Alert } from '../../components/ui/Alert'
import { FormField, PasswordInput } from '../../components/ui/FormField'
import { ApiError, asApiError, authApi } from '../../lib/api'
import { useAuth } from '../../lib/auth-context'
import { AuthLayout } from './AuthLayout'
import styles from './auth.module.css'

type Field = 'displayName' | 'email' | 'password'

export function RegisterPage() {
  const { status } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState<Record<Field, string>>({ displayName: '', email: '', password: '' })
  const [clientErrors, setClientErrors] = useState<Partial<Record<Field, string>>>({})
  const [error, setError] = useState<ApiError | null>(null)
  const [pending, setPending] = useState(false)

  if (status === 'signedIn') return <Navigate to="/dashboard" replace />

  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  // Quick checks in the browser; the API validates everything again.
  function validate() {
    const errors: Partial<Record<Field, string>> = {}
    if (!values.displayName.trim()) errors.displayName = 'Tell us what to call you.'
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.'
    if (values.password.length < 8) errors.password = 'Use at least 8 characters.'
    setClientErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    setPending(true)
    setError(null)
    const email = values.email.trim()
    try {
      await authApi.register({ displayName: values.displayName.trim(), email, password: values.password })
      navigate(`/check-email?email=${encodeURIComponent(email)}`)
    } catch (caught) {
      setError(asApiError(caught))
      setPending(false)
    }
  }

  const fieldError = (field: Field) => clientErrors[field] ?? error?.fieldErrors[field]?.[0]

  return (
    <AuthLayout
      title="Create your account"
      description="Save progress across devices and get a personal dashboard."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <title>Create an account · Refract</title>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && !error.hasFieldErrors && <Alert tone="error">{error.message}</Alert>}

        <FormField label="Name" error={fieldError('displayName')}>
          <input
            autoComplete="name"
            value={values.displayName}
            onChange={(event) => update('displayName', event.target.value)}
            aria-invalid={Boolean(fieldError('displayName'))}
            placeholder="Ana Beridze"
            maxLength={80}
          />
        </FormField>

        <FormField label="Email" error={fieldError('email')}>
          <input
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
            aria-invalid={Boolean(fieldError('email'))}
            placeholder="ana@example.com"
          />
        </FormField>

        <FormField label="Password" error={fieldError('password')} hint="At least 8 characters. A short sentence works well.">
          <PasswordInput
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => update('password', event.target.value)}
            aria-invalid={Boolean(fieldError('password'))}
          />
        </FormField>

        <button type="submit" className={`btn btn-primary btn-lg ${styles.submit}`} disabled={pending}>
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
