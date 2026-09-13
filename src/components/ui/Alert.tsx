import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './Alert.module.css'

const icons = { error: CircleAlert, success: CircleCheck, info: Info }

interface AlertProps {
  tone: keyof typeof icons
  title?: string
  children?: ReactNode
}

export function Alert({ tone, title, children }: AlertProps) {
  const Icon = icons[tone]
  return (
    <div className={`${styles.alert} ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={19} />
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children}
      </div>
    </div>
  )
}
