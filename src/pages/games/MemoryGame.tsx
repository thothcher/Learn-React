import { LayoutGrid, RotateCcw, Star, Timer, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ReactIcon } from '../../components/ui/BrandIcons'
import { Segmented } from '../../components/ui/Segmented'
import { pairSets, type PairSet } from '../../data/pairs'
import { progress, useProgress } from '../../lib/progress'
import { cx, formatTime, shuffle } from '../../lib/utils'
import { GameHeader } from './GameHeader'
import styles from './MemoryGame.module.css'
import shared from './games.module.css'

const PAIRS = 8

interface Card {
  key: string
  pairId: number
  text: string
  side: 'left' | 'right'
}

function createDeck(set: PairSet): Card[] {
  const pairs = shuffle(set.pairs).slice(0, PAIRS)
  return shuffle(
    pairs.flatMap((pair, pairId) => [
      { key: `${pairId}-l`, pairId, text: pair.left, side: 'left' as const },
      { key: `${pairId}-r`, pairId, text: pair.right, side: 'right' as const },
    ]),
  )
}

function starsFor(moves: number) {
  if (moves <= 12) return 3
  if (moves <= 16) return 2
  return 1
}

export function MemoryGame() {
  const [setId, setSetId] = useState(pairSets[0].id)
  const set = pairSets.find((item) => item.id === setId)!
  const [cards, setCards] = useState(() => createDeck(set))
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  const [isRecord, setIsRecord] = useState(false)
  const { scores } = useProgress()

  const finished = matched.length === PAIRS
  const best = scores[`memory:${set.id}`]

  // Resolve a pair of face-up cards after a short pause.
  useEffect(() => {
    if (flipped.length !== 2) return
    const [first, second] = flipped.map((index) => cards[index])
    const isMatch = first.pairId === second.pairId

    const timeout = setTimeout(
      () => {
        if (isMatch) {
          const nextMatched = [...matched, first.pairId]
          setMatched(nextMatched)
          if (nextMatched.length === PAIRS) {
            setIsRecord(progress.recordScore(`memory:${set.id}`, moves, true))
          }
        }
        setFlipped([])
      },
      isMatch ? 380 : 900,
    )
    return () => clearTimeout(timeout)
  }, [flipped, cards, matched, moves, set.id])

  useEffect(() => {
    if (!started || finished) return
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [started, finished])

  function restart(nextSet: PairSet) {
    setCards(createDeck(nextSet))
    setFlipped([])
    setMatched([])
    setMoves(0)
    setSeconds(0)
    setStarted(false)
    setIsRecord(false)
  }

  function flip(index: number) {
    const card = cards[index]
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(card.pairId)) return
    if (!started) setStarted(true)
    const next = [...flipped, index]
    setFlipped(next)
    if (next.length === 2) setMoves((m) => m + 1)
  }

  const stars = starsFor(moves)

  return (
    <>
      <title>Memory cards · Refract</title>
      <GameHeader icon={LayoutGrid} title="Memory cards" description="Find all eight pairs. Every card has exactly one partner.">
        <Segmented
          value={setId}
          onChange={(id) => {
            setSetId(id)
            restart(pairSets.find((item) => item.id === id)!)
          }}
          ariaLabel="Deck"
          options={pairSets.map((item) => ({ value: item.id, label: item.title }))}
        />
        <div className={shared.stats}>
          <span className={shared.stat}>
            Moves <strong>{moves}</strong>
          </span>
          <span className={shared.stat}>
            <Timer size={15} />
            <strong>{formatTime(seconds)}</strong>
          </span>
          <span className={shared.stat}>
            Pairs <strong>{matched.length}/{PAIRS}</strong>
          </span>
          {best !== undefined && (
            <span className={shared.stat}>
              Best <strong>{best}</strong>
            </span>
          )}
        </div>
      </GameHeader>

      <section className="container">
        {finished && (
          <div className={cx(shared.result, styles.result)}>
            <span className={shared.resultIcon}>
              <Trophy size={24} />
            </span>
            <div className={shared.resultText}>
              <p className={shared.resultTitle}>
                All pairs found
                {isRecord && <span className={cx('chip chip-success', styles.record)}>New best</span>}
              </p>
              <p className={shared.resultSub}>
                {moves} moves in {formatTime(seconds)}
              </p>
            </div>
            <div className={styles.stars} aria-label={`${stars} of 3 stars`}>
              {[1, 2, 3].map((value) => (
                <Star key={value} size={26} className={value <= stars ? styles.starOn : styles.starOff} />
              ))}
            </div>
            <button type="button" className="btn btn-primary" onClick={() => restart(set)}>
              <RotateCcw size={17} />
              Play again
            </button>
          </div>
        )}

        <div className={styles.grid}>
          {cards.map((card, index) => {
            const isMatched = matched.includes(card.pairId)
            const isUp = isMatched || flipped.includes(index)
            return (
              <button
                key={card.key}
                type="button"
                className={styles.card}
                data-up={isUp}
                data-matched={isMatched}
                onClick={() => flip(index)}
                aria-label={isUp ? card.text : `Hidden card ${index + 1}`}
              >
                <span className={styles.inner}>
                  <span className={cx(styles.face, styles.back)}>
                    <ReactIcon size={34} />
                  </span>
                  <span className={cx(styles.face, styles.front)}>
                    <span className={styles.side}>{card.side === 'left' ? set.leftLabel : set.rightLabel}</span>
                    <span
                      className={cx(
                        styles.text,
                        ((card.side === 'left' && set.leftMono) || (card.side === 'right' && set.rightMono)) &&
                          styles.mono,
                      )}
                    >
                      {card.text}
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {!finished && (
          <div className={styles.footer}>
            <button type="button" className="btn btn-ghost" onClick={() => restart(set)}>
              <RotateCcw size={16} />
              Shuffle and restart
            </button>
          </div>
        )}
      </section>
    </>
  )
}
