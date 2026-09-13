import { ArrowLeft, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import styles from './games.module.css'

interface GameHeaderProps {
  icon: LucideIcon
  title: string
  description: string
  children?: ReactNode
}

export function GameHeader({ icon: Icon, title, description, children }: GameHeaderProps) {
  return (
    <header className={`container ${styles.header}`}>
      <Link to="/practice" className={styles.back}>
        <ArrowLeft size={16} />
        Practice
      </Link>
      <div className={styles.titleRow}>
        <span className={styles.icon}>
          <Icon size={26} />
        </span>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>
      </div>
      {children && <div className={styles.toolbar}>{children}</div>}
    </header>
  )
}
