import { Cable, Eye, RotateCcw, Trophy } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { Segmented } from '../../components/ui/Segmented'
import { pairSets, type PairSet } from '../../data/pairs'
import { progress } from '../../lib/progress'
import { cx, percent, shuffle } from '../../lib/utils'
import { GameHeader } from './GameHeader'
import styles from './MatchGame.module.css'
import shared from './games.module.css'

const ROUND_SIZE = 6

interface Item {
  id: string
  text: string
}

interface Point {
  x: number
  y: number
}

function createDeal(set: PairSet) {
  const picked = shuffle(set.pairs)
    .slice(0, ROUND_SIZE)
    .map((pair, index) => ({ id: String(index), ...pair }))
  return {
    left: picked.map(({ id, left }): Item => ({ id, text: left })),
    right: shuffle(picked).map(({ id, right }): Item => ({ id, text: right })),
  }
}

export function MatchGame() {
  const [setId, setSetId] = useState(pairSets[0].id)
  const set = pairSets.find((item) => item.id === setId)!
  const [deal, setDeal] = useState(() => createDeal(set))
  const [connections, setConnections] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [isRecord, setIsRecord] = useState(false)
  const [drag, setDrag] = useState<{ leftId: string; point: Point } | null>(null)
  const [anchors, setAnchors] = useState<{ left: Record<string, Point>; right: Record<string, Point> }>({
    left: {},
    right: {},
  })

  const boardRef = useRef<HTMLDivElement>(null)
  const leftRefs = useRef(new Map<string, HTMLElement>())
  const rightRefs = useRef(new Map<string, HTMLElement>())

  // Measure the connector dots after layout, and again whenever the board resizes.
  useLayoutEffect(() => {
    const board = boardRef.current
    if (!board) return

    function measure() {
      const box = board!.getBoundingClientRect()
      const read = (map: Map<string, HTMLElement>) => {
        const result: Record<string, Point> = {}
        map.forEach((element, id) => {
          const rect = element.getBoundingClientRect()
          result[id] = { x: rect.left + rect.width / 2 - box.left, y: rect.top + rect.height / 2 - box.top }
        })
        return result
      }
      setAnchors({ left: read(leftRefs.current), right: read(rightRefs.current) })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(board)
    return () => observer.disconnect()
  }, [deal])

  const connectedCount = Object.keys(connections).length
  const correctCount = deal.left.filter((item) => connections[item.id] === item.id).length
  const shownConnections = revealed
    ? Object.fromEntries(deal.left.map((item) => [item.id, item.id]))
    : connections

  function startRound(nextSet: PairSet) {
    setDeal(createDeal(nextSet))
    setConnections({})
    setSelected(null)
    setChecked(false)
    setRevealed(false)
    setIsRecord(false)
  }

  function connect(leftId: string, rightId: string) {
    setConnections((current) => {
      const next = Object.fromEntries(Object.entries(current).filter(([, r]) => r !== rightId))
      next[leftId] = rightId
      return next
    })
    setSelected(null)
  }

  function boardPoint(event: PointerEvent): Point {
    const box = boardRef.current!.getBoundingClientRect()
    return { x: event.clientX - box.left, y: event.clientY - box.top }
  }

  function onLeftPointerDown(event: PointerEvent<HTMLButtonElement>, id: string) {
    if (checked) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelected(id)
    setDrag({ leftId: id, point: boardPoint(event) })
  }

  function onLeftPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (drag) setDrag({ ...drag, point: boardPoint(event) })
  }

  function onLeftPointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (!drag) return
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-right-id]')
    if (target?.dataset.rightId) connect(drag.leftId, target.dataset.rightId)
    setDrag(null)
  }

  function onRightClick(id: string) {
    if (checked) return
    if (selected) {
      connect(selected, id)
      return
    }
    // Clicking a connected right item removes its line.
    setConnections((current) => Object.fromEntries(Object.entries(current).filter(([, r]) => r !== id)))
  }

  function check() {
    setChecked(true)
    setIsRecord(progress.recordScore(`match:${set.id}`, percent(correctCount, ROUND_SIZE)))
  }

  function curve(from: Point, to: Point) {
    const dx = Math.max((to.x - from.x) / 2, 24)
    return `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`
  }

  const rightLinked = new Set(Object.values(shownConnections))

  return (
    <>
      <title>Match pairs · Refract</title>
      <GameHeader icon={Cable} title="Match pairs" description={set.description}>
        <Segmented
          value={setId}
          onChange={(id) => {
            setSetId(id)
            startRound(pairSets.find((item) => item.id === id)!)
          }}
          ariaLabel="Pair set"
          options={pairSets.map((item) => ({ value: item.id, label: item.title }))}
        />
        <div className={shared.stats}>
          <span className={shared.stat}>
            Connected <strong>{connectedCount}/{ROUND_SIZE}</strong>
          </span>
        </div>
      </GameHeader>

      <section className="container">
        <div className={styles.labels}>
          <span>{set.leftLabel}</span>
          <span>{set.rightLabel}</span>
        </div>

        <div className={styles.board} ref={boardRef}>
          <svg className={styles.lines} aria-hidden="true">
            {Object.entries(shownConnections).map(([leftId, rightId]) => {
              const from = anchors.left[leftId]
              const to = anchors.right[rightId]
              if (!from || !to) return null
              const state = !checked && !revealed ? 'pending' : leftId === rightId ? 'correct' : 'wrong'
              return (
                <g key={leftId} data-state={state} className={styles.connection}>
                  <path d={curve(from, to)} />
                  <circle cx={from.x} cy={from.y} r={5} />
                  <circle cx={to.x} cy={to.y} r={5} />
                </g>
              )
            })}
            {drag && anchors.left[drag.leftId] && (
              <path className={styles.dragLine} d={curve(anchors.left[drag.leftId], drag.point)} />
            )}
          </svg>

          <ul className={styles.column}>
            {deal.left.map((item) => {
              const linked = shownConnections[item.id] !== undefined
              const state = checked || revealed ? (connections[item.id] === item.id || revealed ? 'correct' : 'wrong') : undefined
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cx(styles.item, set.leftMono && styles.mono)}
                    data-selected={selected === item.id}
                    data-linked={linked}
                    data-state={state}
                    onPointerDown={(event) => onLeftPointerDown(event, item.id)}
                    onPointerMove={onLeftPointerMove}
                    onPointerUp={onLeftPointerUp}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        if (!checked) setSelected(item.id)
                      }
                    }}
                  >
                    <span className={styles.text}>{item.text}</span>
                    <span
                      className={cx(styles.dot, styles.dotRight)}
                      ref={(element) => {
                        if (element) leftRefs.current.set(item.id, element)
                        else leftRefs.current.delete(item.id)
                      }}
                    />
                  </button>
                </li>
              )
            })}
          </ul>

          <div className={styles.gutter} />

          <ul className={styles.column}>
            {deal.right.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={cx(styles.item, styles.rightItem, set.rightMono && styles.mono)}
                  data-right-id={item.id}
                  data-linked={rightLinked.has(item.id)}
                  data-target={selected !== null}
                  onClick={() => onRightClick(item.id)}
                >
                  <span
                    className={cx(styles.dot, styles.dotLeft)}
                    ref={(element) => {
                      if (element) rightRefs.current.set(item.id, element)
                      else rightRefs.current.delete(item.id)
                    }}
                  />
                  <span className={styles.text}>{item.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {!checked ? (
          <div className={styles.actions}>
            <p className={styles.help}>
              {selected ? 'Now choose a partner on the right.' : 'Click an item on the left, or drag from it to the right.'}
            </p>
            <button type="button" className="btn btn-ghost" onClick={() => setConnections({})} disabled={connectedCount === 0}>
              Clear
            </button>
            <button type="button" className="btn btn-primary" onClick={check} disabled={connectedCount < ROUND_SIZE}>
              Check answers
            </button>
          </div>
        ) : (
          <div className={shared.result}>
            <span className={shared.resultIcon}>
              <Trophy size={24} />
            </span>
            <div className={shared.resultText}>
              <p className={shared.resultTitle}>
                {correctCount} of {ROUND_SIZE} correct
                {isRecord && <span className={cx('chip chip-success', styles.record)}>New best</span>}
              </p>
              <p className={shared.resultSub}>
                {correctCount === ROUND_SIZE
                  ? 'A perfect round. Try another set.'
                  : 'Red lines are wrong. Reveal the answers, then play a fresh round.'}
              </p>
            </div>
            <div className={shared.resultActions}>
              {correctCount < ROUND_SIZE && (
                <button type="button" className="btn" onClick={() => setRevealed((value) => !value)}>
                  <Eye size={17} />
                  {revealed ? 'Show my answers' : 'Reveal answers'}
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={() => startRound(set)}>
                <RotateCcw size={17} />
                New round
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
