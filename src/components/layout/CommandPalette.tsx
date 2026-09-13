import {
  ArrowLeftRight,
  BookOpen,
  Cable,
  Gamepad2,
  LayoutGrid,
  ListChecks,
  Mail,
  Map as MapIcon,
  NotebookPen,
  Presentation,
  Puzzle,
  Search,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { lessons } from '../../data/lessons'
import styles from './CommandPalette.module.css'

interface PaletteItem {
  id: string
  group: 'Pages' | 'Lessons'
  label: string
  hint: string
  to: string
  icon: LucideIcon
  keywords: string
}

const pageItems: PaletteItem[] = [
  { id: 'roadmap', label: 'Roadmap', hint: 'The 8-week plan', to: '/roadmap', icon: MapIcon },
  { id: 'lessons', label: 'All lessons', hint: '32 lessons, React and Next.js', to: '/lessons', icon: BookOpen },
  { id: 'exercises', label: 'Exercises', hint: 'Hands-on tasks with solutions', to: '/exercises', icon: NotebookPen },
  { id: 'practice', label: 'Practice hub', hint: 'All games in one place', to: '/practice', icon: Gamepad2 },
  { id: 'match', label: 'Match pairs', hint: 'Connect concepts left to right', to: '/practice/match', icon: Cable },
  { id: 'memory', label: 'Memory cards', hint: 'Flip and find the pairs', to: '/practice/memory', icon: LayoutGrid },
  { id: 'quiz', label: 'Tests', hint: 'Weekly tests and final exams', to: '/practice/quiz', icon: ListChecks },
  { id: 'gaps', label: 'Fill the gap', hint: 'Complete real code', to: '/practice/gaps', icon: Puzzle },
  { id: 'teach', label: 'Teaching cards', hint: 'Cards and presentation mode', to: '/teach', icon: Presentation },
  { id: 'cheatsheet', label: 'Cheat sheet', hint: 'Angular to React translator', to: '/cheatsheet', icon: ArrowLeftRight },
  { id: 'contact', label: 'Contact', hint: 'Get in touch', to: '/contact', icon: Mail },
].map((item) => ({ ...item, group: 'Pages' as const, keywords: item.hint }))

const lessonItems: PaletteItem[] = lessons.map((lesson) => ({
  id: lesson.slug,
  group: 'Lessons',
  label: lesson.title,
  hint: `Week ${lesson.week} · ${lesson.angular}`,
  to: `/lessons/${lesson.slug}`,
  icon: BookOpen,
  keywords: `${lesson.summary} ${lesson.angular} ${lesson.card.term} ${lesson.track}`,
}))

const allItems = [...pageItems, ...lessonItems]

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      aria-label="Search"
    >
      {open && <PaletteBody onClose={onClose} />}
    </dialog>
  )
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const results = (
    words.length === 0 ? [...pageItems.slice(0, 6), ...lessonItems.slice(0, 4)] : allItems
  ).filter((item) => {
    const haystack = `${item.label} ${item.keywords}`.toLowerCase()
    return words.every((word) => haystack.includes(word))
  })

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  function go(item: PaletteItem) {
    onClose()
    navigate(item.to)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault()
      go(results[activeIndex])
    }
  }

  return (
    <>
      <div className={styles.inputRow}>
        <Search size={18} className={styles.searchIcon} />
        <input
          autoFocus
          className={styles.input}
          placeholder="Search lessons, games and pages…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={onKeyDown}
          aria-label="Search"
        />
        <kbd>Esc</kbd>
      </div>

      <div className={styles.list} ref={listRef}>
        {results.length === 0 && <p className={styles.empty}>Nothing matches "{query}".</p>}
        {results.map((item, index) => {
          const showGroup = index === 0 || results[index - 1].group !== item.group
          const Icon = item.icon
          return (
            <div key={`${item.group}-${item.id}`}>
              {showGroup && <p className={styles.group}>{item.group}</p>}
              <button
                type="button"
                className={styles.item}
                data-active={index === activeIndex}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => go(item)}
              >
                <span className={styles.itemIcon}>
                  <Icon size={17} />
                </span>
                <span className={styles.itemText}>
                  <span className={styles.itemLabel}>{item.label}</span>
                  <span className={styles.itemHint}>{item.hint}</span>
                </span>
              </button>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <span>
          <kbd>↑</kbd> <kbd>↓</kbd> to move
        </span>
        <span>
          <kbd>Enter</kbd> to open
        </span>
      </div>
    </>
  )
}
