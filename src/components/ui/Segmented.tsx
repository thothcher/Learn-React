import type { ReactNode } from 'react'
import { cx } from '../../lib/utils'
import styles from './Segmented.module.css'

interface SegmentedProps<T extends string> {
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  ariaLabel?: string
}

export function Segmented<T extends string>({ value, options, onChange, size = 'md', ariaLabel }: SegmentedProps<T>) {
  return (
    <div className={cx(styles.group, size === 'sm' && styles.sm)} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.option}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
