import { CircleCheck, Clock, Mail, MapPin, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { GitHubIcon } from '../components/ui/BrandIcons'
import { PageHeader } from '../components/ui/PageHeader'
import { site } from '../config/site'
import { cx } from '../lib/utils'
import styles from './ContactPage.module.css'

const topics = ['Question about the course', 'Idea for a lesson', 'Workshop or team training', 'Something else']

interface FormValues {
  name: string
  email: string
  topic: string
  message: string
}

type Field = keyof FormValues

function validate(values: FormValues): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {}
  if (values.name.trim().length < 2) errors.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Please enter a valid email address.'
  if (values.message.trim().length < 20) errors.message = 'Please write at least 20 characters.'
  return errors
}

const initialValues: FormValues = { name: '', email: '', topic: topics[0], message: '' }

export function ContactPage() {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [sent, setSent] = useState(false)

  const errors = validate(values)
  const showError = (field: Field) => touched[field] && errors[field]

  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (Object.keys(errors).length > 0) return

    // This site is static, so the message opens in the visitor's email app.
    // Swap this for a form service or an API route when you deploy.
    const subject = encodeURIComponent(`${values.topic} · ${values.name}`)
    const body = encodeURIComponent(`${values.message}\n\n${values.name}\n${values.email}`)
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`
    setSent(true)
  }

  function reset() {
    setValues(initialValues)
    setTouched({})
    setSent(false)
  }

  return (
    <>
      <title>Contact · Refract</title>
      <PageHeader
        eyebrow={
          <>
            <Mail size={16} /> Contact
          </>
        }
        title="Let's talk React, Angular or teaching"
        description="A question about the course, an idea for a lesson, or a workshop for your team: send a message and I will get back to you."
      />

      <section className={`container ${styles.layout}`}>
        <div className={styles.formCard}>
          {sent ? (
            <div className={styles.success} role="status">
              <span className={styles.successIcon}>
                <CircleCheck size={30} />
              </span>
              <h2>Your message is ready</h2>
              <p>
                Your email app should have opened with everything filled in. If it did not, write to{' '}
                <a href={`mailto:${site.email}`}>{site.email}</a>.
              </p>
              <button type="button" className="btn" onClick={reset}>
                Write another message
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.row}>
                <FormField label="Name" error={showError('name')}>
                  <input
                    name="name"
                    autoComplete="name"
                    value={values.name}
                    onChange={(event) => update('name', event.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    aria-invalid={Boolean(showError('name'))}
                    placeholder="Ana Beridze"
                  />
                </FormField>
                <FormField label="Email" error={showError('email')}>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(event) => update('email', event.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    aria-invalid={Boolean(showError('email'))}
                    placeholder="ana@example.com"
                  />
                </FormField>
              </div>

              <fieldset className={styles.topics}>
                <legend>Topic</legend>
                <div>
                  {topics.map((topic) => (
                    <label key={topic} className={cx(styles.topic, values.topic === topic && styles.topicActive)}>
                      <input
                        type="radio"
                        name="topic"
                        value={topic}
                        checked={values.topic === topic}
                        onChange={() => update('topic', topic)}
                      />
                      {topic}
                    </label>
                  ))}
                </div>
              </fieldset>

              <FormField label="Message" error={showError('message')} hint={`${values.message.trim().length} characters`}>
                <textarea
                  name="message"
                  rows={6}
                  value={values.message}
                  onChange={(event) => update('message', event.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                  aria-invalid={Boolean(showError('message'))}
                  placeholder="What would you like to talk about?"
                />
              </FormField>

              <button type="submit" className={`btn btn-primary btn-lg ${styles.submit}`}>
                <Send size={18} />
                Send message
              </button>
            </form>
          )}
        </div>

        <aside className={styles.aside}>
          <a href={`mailto:${site.email}`} className={styles.info}>
            <span className={styles.infoIcon}>
              <Mail size={20} />
            </span>
            <span>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{site.email}</span>
            </span>
          </a>
          <a href={site.githubUrl} target="_blank" rel="noreferrer" className={styles.info}>
            <span className={styles.infoIcon}>
              <GitHubIcon size={20} />
            </span>
            <span>
              <span className={styles.infoLabel}>GitHub</span>
              <span className={styles.infoValue}>{site.githubUrl.replace('https://', '')}</span>
            </span>
          </a>
          <div className={styles.info}>
            <span className={styles.infoIcon}>
              <MapPin size={20} />
            </span>
            <span>
              <span className={styles.infoLabel}>Based in</span>
              <span className={styles.infoValue}>{site.location}</span>
            </span>
          </div>
          <div className={styles.info}>
            <span className={styles.infoIcon}>
              <Clock size={20} />
            </span>
            <span>
              <span className={styles.infoLabel}>Response time</span>
              <span className={styles.infoValue}>Usually within two working days</span>
            </span>
          </div>
        </aside>
      </section>
    </>
  )
}

interface FormFieldProps {
  label: string
  error?: string | false
  hint?: string
  children: React.ReactNode
}

function FormField({ label, error, hint, children }: FormFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </span>
      {children}
      {error && <span className={styles.error}>{error}</span>}
    </label>
  )
}
