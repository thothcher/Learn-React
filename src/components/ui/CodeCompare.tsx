import { useState } from 'react'
import type { Track } from '../../data/types'
import { AngularIcon, NextIcon, ReactIcon } from './BrandIcons'
import { CodeBlock } from './CodeBlock'
import styles from './CodeCompare.module.css'
import { Segmented } from './Segmented'

interface CodeCompareProps {
  angular: string
  react: string
  angularLabel?: string
  reactLabel?: string
  track?: Track
}

type Side = 'angular' | 'react'

export function CodeCompare({ angular, react, angularLabel, reactLabel, track = 'react' }: CodeCompareProps) {
  const [active, setActive] = useState<Side>('react')
  const reactName = track === 'next' ? 'Next.js' : 'React'

  return (
    <div className={styles.compare}>
      <div className={styles.tabs}>
        <Segmented<Side>
          value={active}
          onChange={setActive}
          options={[
            { value: 'angular', label: 'Angular' },
            { value: 'react', label: reactName },
          ]}
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.pane} data-active={active === 'angular'}>
          <CodeBlock
            code={angular}
            label={
              <>
                <AngularIcon size={14} className={styles.angular} />
                {angularLabel ?? 'Angular'}
              </>
            }
          />
        </div>
        <div className={styles.pane} data-active={active === 'react'}>
          <CodeBlock
            code={react}
            label={
              <>
                {track === 'next' ? (
                  <NextIcon size={14} className={styles.next} />
                ) : (
                  <ReactIcon size={15} className={styles.react} />
                )}
                {reactLabel ?? reactName}
              </>
            }
          />
        </div>
      </div>
    </div>
  )
}
