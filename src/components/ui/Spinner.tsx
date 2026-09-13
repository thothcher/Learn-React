import { LoaderCircle } from 'lucide-react'
import styles from './Spinner.module.css'

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className={styles.spinner} role="status">
      <LoaderCircle size={22} className={styles.icon} />
      <span>{label}</span>
    </div>
  )
}
