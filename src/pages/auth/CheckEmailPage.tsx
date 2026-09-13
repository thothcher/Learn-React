import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Alert } from '../../components/ui/Alert'
import { authApi } from '../../lib/api'
import { AuthLayout } from './AuthLayout'
import styles from './auth.module.css'

export function CheckEmailPage() {
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const [resend, setResend] = useState<'idle' | 'sending' | 'sent'>('idle')

  async function sendAgain() {
    setResend('sending')
    await authApi.resendConfirmation(email).catch(() => {})
    setResend('sent')
  }

  return (
    <AuthLayout
      title="Check your inbox"
      description={
        email ? (
          <>
            We sent a confirmation link to <strong>{email}</strong>. Open it to activate your account.
          </>
        ) : (
          'We sent you a confirmation link. Open it to activate your account.'
        )
      }
      footer={
        <>
          Already confirmed? <Link to="/login">Log in</Link>
        </>
      }
    >
      <title>Check your email · Refract</title>
      <div className={styles.status}>
        <span className={styles.statusIcon}>
          <MailCheck size={28} />
        </span>
        <p className={styles.muted}>The link expires in 3 hours. If you can't find the email, check your spam folder.</p>
        {email &&
          (resend === 'sent' ? (
            <Alert tone="success">A new link is on its way.</Alert>
          ) : (
            <button type="button" className="btn" onClick={sendAgain} disabled={resend === 'sending'}>
              {resend === 'sending' ? 'Sending…' : 'Send the email again'}
            </button>
          ))}
        {import.meta.env.DEV && (
          <p className={styles.devNote}>
            Development: without a Resend API key, the link is printed in the API console instead of being emailed.
          </p>
        )}
      </div>
    </AuthLayout>
  )
}
