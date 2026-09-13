import { BookOpen, CircleCheck, Clock, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '../components/ui/PageHeader'
import { Segmented } from '../components/ui/Segmented'
import { lessons } from '../data/lessons'
import type { Track } from '../data/types'
import { weeks } from '../data/weeks'
import { useProgress } from '../lib/progress'
import { cx } from '../lib/utils'
import styles from './LessonsPage.module.css'

type TrackFilter = 'all' | Track

export function LessonsPage() {
  const [track, setTrack] = useState<TrackFilter>('all')
  const [query, setQuery] = useState('')
  const state = useProgress()

  const search = query.trim().toLowerCase()
  const visible = lessons.filter(
    (lesson) =>
      (track === 'all' || lesson.track === track) &&
      (!search || `${lesson.title} ${lesson.summary} ${lesson.angular}`.toLowerCase().includes(search)),
  )

  return (
    <>
      <title>Lessons · Refract</title>
      <PageHeader
        eyebrow={
          <>
            <BookOpen size={16} /> Lessons
          </>
        }
        title="Every lesson, one place"
        description="Each lesson pairs an explanation with an Angular comparison, a real-life analogy, an exercise and a quick check."
      />

      <div className={`container ${styles.toolbar}`}>
        <Segmented<TrackFilter>
          value={track}
          onChange={setTrack}
          ariaLabel="Track"
          options={[
            { value: 'all', label: 'All lessons' },
            { value: 'react', label: 'React' },
            { value: 'next', label: 'Next.js' },
          ]}
        />
        <label className={styles.search}>
          <Search size={17} />
          <input
            type="search"
            placeholder="Filter by title or Angular API"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="container">
        {visible.length === 0 && <p className={styles.empty}>No lessons match "{query}".</p>}

        {weeks.map((week) => {
          const weekLessons = visible.filter((lesson) => lesson.week === week.number)
          if (weekLessons.length === 0) return null
          return (
            <section key={week.number} className={styles.week}>
              <h2 className={styles.weekTitle}>
                <span>Week {week.number}</span>
                {week.title}
              </h2>
              <div className={styles.grid}>
                {weekLessons.map((lesson) => {
                  const complete = state.lessons.includes(lesson.slug)
                  return (
                    <Link key={lesson.slug} to={`/lessons/${lesson.slug}`} className={styles.card}>
                      <div className={styles.cardTop}>
                        <span>Day {lesson.day}</span>
                        <span className={styles.minutes}>
                          <Clock size={13} />
                          {lesson.minutes} min
                        </span>
                        {complete && <CircleCheck size={18} className={styles.done} aria-label="Completed" />}
                      </div>
                      <h3>{lesson.title}</h3>
                      <p>{lesson.summary}</p>
                      <div className={styles.cardBottom}>
                        <span className={cx('chip', lesson.track === 'next' ? 'chip-next' : 'chip-react')}>
                          {lesson.track === 'next' ? 'Next.js' : 'React'}
                        </span>
                        <code>{lesson.angular}</code>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}
