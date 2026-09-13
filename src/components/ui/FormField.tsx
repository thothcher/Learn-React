import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './FormField.module.css'

interface FormFieldProps {
  label: string
  error?: string
  hint?: ReactNode
  children: ReactNode
}

export function FormField({ label, error, hint, children }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.control}>
        <span className={styles.labelRow}>
          <span className={styles.label}>{label}</span>
        </span>
        {children}
      </label>
      {hint && <div className={styles.hint}>{hint}</div>}
      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false)

  return (
    <span className={styles.password}>
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </span>
  )
}
