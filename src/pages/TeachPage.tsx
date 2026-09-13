import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Play,
  Presentation,
  Shuffle,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { TeachingCard } from '../components/lesson/TeachingCard'
import { Logo } from '../components/ui/BrandIcons'
import { PageHeader } from '../components/ui/PageHeader'
import { Segmented } from '../components/ui/Segmented'
import { lessons } from '../data/lessons'
import type { Lesson, Track } from '../data/types'
import { weeks } from '../data/weeks'
import { cx, percent, shuffle } from '../lib/utils'
import styles from './TeachPage.module.css'

type TrackFilter = 'all' | Track

export function TeachPage() {
  const [track, setTrack] = useState<TrackFilter>('all')
  const [week, setWeek] = useState<number | 'all'>('all')
  const [order, setOrder] = useState<string[] | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const filtered = lessons.filter(
    (lesson) => (track === 'all' || lesson.track === track) && (week === 'all' || lesson.week === week),
  )
  const deck = order
    ? order.map((slug) => filtered.find((lesson) => lesson.slug === slug)).filter((lesson): lesson is Lesson => Boolean(lesson))
    : filtered

  // Presentation state lives in the URL, so a lesson can link straight to its card.
  const presentParam = searchParams.get('present')
  let presentDeck = deck
  let startIndex = 0
  if (presentParam && presentParam !== '1') {
    const inDeck = deck.findIndex((lesson) => lesson.slug === presentParam)
    if (inDeck === -1) {
      presentDeck = lessons
      startIndex = Math.max(0, lessons.findIndex((lesson) => lesson.slug === presentParam))
    } else {
      startIndex = inDeck
    }
  }

  function openPresenter(slug?: string) {
    setSearchParams({ present: slug ?? '1' }, { state: { openedHere: true }, preventScrollReset: true })
  }

  function closePresenter() {
    const openedHere = (location.state as { openedHere?: boolean } | null)?.openedHere
    if (openedHere) navigate(-1)
    else setSearchParams({}, { replace: true, preventScrollReset: true })
  }

  const weekOptions = weeks.filter((item) => track === 'all' || item.track === track)

  return (
    <>
      <title>Teaching cards · Refract</title>
      <PageHeader
        eyebrow={
          <>
            <Presentation size={16} /> Teach
          </>
        }
        title="Teaching cards for your classroom"
        description="One card per lesson: a definition, a real-life analogy and a line to remember. Present them full-screen and reveal the answer once the class has guessed."
      />

      <div className={`container ${styles.toolbar}`}>
        <div className={styles.filters}>
          <Segmented<TrackFilter>
            value={track}
            onChange={(value) => {
              setTrack(value)
              setWeek('all')
            }}
            ariaLabel="Track"
            options={[
              { value: 'all', label: 'All cards' },
              { value: 'react', label: 'React' },
              { value: 'next', label: 'Next.js' },
            ]}
          />
          <div className={styles.weeks} role="group" aria-label="Week">
            <button type="button" aria-pressed={week === 'all'} onClick={() => setWeek('all')}>
              All weeks
            </button>
            {weekOptions.map((item) => (
              <button
                key={item.number}
                type="button"
                aria-pressed={week === item.number}
                onClick={() => setWeek(item.number)}
                title={item.title}
              >
                W{item.number}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={cx('btn', order && 'btn-soft')}
            onClick={() => setOrder(order ? null : shuffle(lessons.map((lesson) => lesson.slug)))}
            aria-pressed={Boolean(order)}
          >
            <Shuffle size={17} />
            {order ? 'Shuffled' : 'Shuffle'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => openPresenter()} disabled={deck.length === 0}>
            <Play size={17} />
            Present {deck.length} cards
          </button>
        </div>
      </div>

      <section className={`container ${styles.grid}`}>
        {deck.map((lesson) => (
          <TeachingCard
            key={lesson.slug}
            card={lesson.card}
            week={lesson.week}
            track={lesson.track}
            footer={
              <>
                <Link to={`/lessons/${lesson.slug}`} className={styles.lessonLink}>
                  <BookOpen size={15} />
                  Lesson
                </Link>
                <button type="button" className="btn btn-sm" onClick={() => openPresenter(lesson.slug)}>
                  <Presentation size={15} />
                  Present
                </button>
              </>
            }
          />
        ))}
      </section>

      {presentParam && presentDeck.length > 0 && (
        <Presenter key={presentParam} deck={presentDeck} startIndex={startIndex} onClose={closePresenter} />
      )}
    </>
  )
}

interface PresenterProps {
  deck: Lesson[]
  startIndex: number
  onClose: () => void
}

function Presenter({ deck, startIndex, onClose }: PresenterProps) {
  const [index, setIndex] = useState(startIndex)
  const [revealed, setRevealed] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const lesson = deck[index]

  function go(delta: number) {
    setIndex((current) => Math.min(Math.max(current + delta, 0), deck.length - 1))
    setRevealed(false)
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen()
    else rootRef.current?.requestFullscreen?.()
  }

  useEffect(() => {
    rootRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onFullscreenChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') go(1)
      else if (event.key === 'ArrowLeft' || event.key === 'PageUp') go(-1)
      else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        setRevealed((value) => !value)
      } else if (event.key === 'Escape' && !document.fullscreenElement) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return (
    <div className={styles.presenter} ref={rootRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Presentation mode">
      <div className={styles.topBar}>
        <div className={styles.topInfo}>
          <Logo size={26} />
          <span className={styles.topLesson}>
            Week {lesson.week} · {lesson.title}
          </span>
        </div>
        <div className={styles.topActions}>
          <span className={styles.counter}>
            {index + 1} / {deck.length}
          </span>
          <button type="button" className="btn btn-ghost btn-icon" onClick={() => setRevealed((value) => !value)} aria-label={revealed ? 'Hide answer' : 'Reveal answer'}>
            {revealed ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
          <button type="button" className="btn btn-ghost btn-icon" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}>
            {fullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
          </button>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close presentation">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className={styles.stage}>
        <div className={styles.stageCard} key={lesson.slug} onClick={() => setRevealed(true)}>
          <TeachingCard card={lesson.card} week={lesson.week} track={lesson.track} variant="present" revealed={revealed} />
        </div>
      </div>

      <div className={styles.bottomBar}>
        <button type="button" className="btn" onClick={() => go(-1)} disabled={index === 0}>
          <ChevronLeft size={18} />
          Previous
        </button>
        <div className={styles.track}>
          <div className={styles.trackBar}>
            <span style={{ width: `${percent(index + 1, deck.length)}%` }} />
          </div>
          <p className={styles.hints}>
            <kbd>Space</kbd> reveal · <kbd>←</kbd> <kbd>→</kbd> move · <kbd>Esc</kbd> close
          </p>
        </div>
        {!revealed ? (
          <button type="button" className="btn btn-primary" onClick={() => setRevealed(true)}>
            <Eye size={18} />
            Reveal
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => go(1)} disabled={index === deck.length - 1}>
            Next
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
