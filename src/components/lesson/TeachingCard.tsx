import { GraduationCap, Lightbulb, Pin } from 'lucide-react'
import type { ReactNode } from 'react'
import type { TeachingCard as TeachingCardData, Track } from '../../data/types'
import { cx } from '../../lib/utils'
import { ReactIcon, NextIcon } from '../ui/BrandIcons'
import { RichText } from '../ui/RichText'
import styles from './TeachingCard.module.css'

interface TeachingCardProps {
  card: TeachingCardData
  week: number
  track: Track
  variant?: 'default' | 'present'
  /** In presentation mode the explanation stays hidden until revealed. */
  revealed?: boolean
  footer?: ReactNode
}

export function TeachingCard({ card, week, track, variant = 'default', revealed = true, footer }: TeachingCardProps) {
  return (
    <article className={cx(styles.card, variant === 'present' && styles.present)} data-track={track}>
      <div className={styles.watermark} aria-hidden="true">
        {track === 'next' ? <NextIcon size={220} /> : <ReactIcon size={240} />}
      </div>

      <div className={styles.meta}>
        <span className={styles.kicker}>
          <GraduationCap size={16} />
          Teaching card
        </span>
        <span className={cx('chip', track === 'next' ? 'chip-next' : 'chip-react')}>
          Week {week} · {track === 'next' ? 'Next.js' : 'React'}
        </span>
      </div>

      <h3 className={styles.term}>{card.term}</h3>

      {revealed ? (
        <div className={styles.body}>
          <p className={styles.definition}>
            <RichText text={card.definition} />
          </p>

          <div className={styles.analogy}>
            <span className={styles.analogyIcon}>
              <Lightbulb size={18} />
            </span>
            <div>
              <p className={styles.analogyLabel}>In real life</p>
              <p>{card.analogy}</p>
            </div>
          </div>

          <p className={styles.remember}>
            <Pin size={16} />
            <span>{card.remember}</span>
          </p>
        </div>
      ) : (
        <p className={styles.prompt}>Ask the class: what do you think this means, and what is the Angular equivalent?</p>
      )}

      {footer && <div className={styles.footer}>{footer}</div>}
    </article>
  )
}
