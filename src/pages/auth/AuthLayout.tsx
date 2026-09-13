import { Cloud, GraduationCap, LayoutDashboard } from 'lucide-react'
import type { ReactNode } from 'react'
import { Logo } from '../../components/ui/BrandIcons'
import styles from './auth.module.css'

interface AuthLayoutProps {
  title: string
  description?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

const benefits = [
  { icon: Cloud, title: 'Progress on every device', text: 'Lessons, projects and best scores follow your account.' },
  { icon: LayoutDashboard, title: 'Your own dashboard', text: 'See your streak, weekly progress and what to learn next.' },
  { icon: GraduationCap, title: 'Guided by your teacher', text: 'Your teacher can follow along and help where you are stuck.' },
]

export function AuthLayout({ title, description, footer, children }: AuthLayoutProps) {
  return (
    <section className={`container ${styles.layout}`}>
      <div className={styles.panel}>
        <div className={styles.head}>
          <Logo size={40} />
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {children}
        {footer && <p className={styles.footer}>{footer}</p>}
      </div>

      <aside className={styles.aside}>
        <h2 className={styles.asideTitle}>Learning React is better when it is saved.</h2>
        <ul className={styles.benefits}>
          {benefits.map((benefit) => (
            <li key={benefit.title}>
              <span className={styles.benefitIcon}>
                <benefit.icon size={20} />
              </span>
              <span>
                <strong>{benefit.title}</strong>
                <span>{benefit.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  )
}
