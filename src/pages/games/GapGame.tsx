import { ArrowRight, BookOpen, Puzzle, RotateCcw, Trophy } from 'lucide-react'
import { Fragment, useState } from 'react'
import { Link } from 'react-router'
import { RichText } from '../../components/ui/RichText'
import { gapChallenges, splitGapCode } from '../../data/gaps'
import { highlight } from '../../lib/highlight'
import { progress, useProgress } from '../../lib/progress'
import { cx } from '../../lib/utils'
import { GameHeader } from './GameHeader'
import styles from './GapGame.module.css'
import shared from './games.module.css'

function Tokens({ text }: { text: string }) {
  return (
    <>
      {highlight(text).map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && '\n'}
          {line.map((token, tokenIndex) =>
            token.type === 'plain' ? (
              <Fragment key={tokenIndex}>{token.value}</Fragment>
            ) : (
              <span key={tokenIndex} className={`tok-${token.type}`}>
                {token.value}
              </span>
            ),
          )}
        </Fragment>
      ))}
    </>
  )
}

export function GapGame() {
  const [index, setIndex] = useState(0)
  const [choices, setChoices] = useState<Record<number, string>>({})
  const [active, setActive] = useState(0)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const [isRecord, setIsRecord] = useState(false)
  const { scores } = useProgress()

  const challenge = gapChallenges[index]
  const parts = splitGapCode(challenge.code)
  const allFilled = challenge.blanks.every((_, i) => choices[i] !== undefined)
  const allCorrect = challenge.blanks.every((blank, i) => choices[i] === blank.answer)
  const score = results.filter(Boolean).length
  const best = scores['gaps']

  function choose(option: string) {
    const next = { ...choices, [active]: option }
    setChoices(next)
    const nextEmpty = challenge.blanks.findIndex((_, i) => next[i] === undefined)
    if (nextEmpty !== -1) setActive(nextEmpty)
  }

  function check() {
    setChecked(true)
    setResults((current) => [...current, allCorrect])
  }

  function goNext() {
    if (index < gapChallenges.length - 1) {
      setIndex(index + 1)
      setChoices({})
      setActive(0)
      setChecked(false)
    } else {
      setIsRecord(progress.recordScore('gaps', score))
      setDone(true)
    }
  }

  function restart() {
    setIndex(0)
    setChoices({})
    setActive(0)
    setChecked(false)
    setResults([])
    setDone(false)
    setIsRecord(false)
  }

  return (
    <>
      <title>Fill the gap · Refract</title>
      <GameHeader icon={Puzzle} title="Fill the gap" description="Complete each snippet by choosing the missing hook, prop or directive.">
        <div className={shared.stats}>
          <span className={shared.stat}>
            Challenge <strong>{Math.min(index + 1, gapChallenges.length)}/{gapChallenges.length}</strong>
          </span>
          <span className={shared.stat}>
            Score <strong>{score}</strong>
          </span>
          {best !== undefined && (
            <span className={shared.stat}>
              Best <strong>{best}</strong>
            </span>
          )}
        </div>
      </GameHeader>

      <section className={cx('container', styles.wrap)}>
        {done ? (
          <div className={shared.result}>
            <span className={shared.resultIcon}>
              <Trophy size={24} />
            </span>
            <div className={shared.resultText}>
              <p className={shared.resultTitle}>
                {score} of {gapChallenges.length} snippets correct
                {isRecord && <span className={cx('chip chip-success', styles.record)}>New best</span>}
              </p>
              <p className={shared.resultSub}>Every snippet comes from a lesson. Revisit the ones you missed.</p>
            </div>
            <button type="button" className="btn btn-primary" onClick={restart}>
              <RotateCcw size={17} />
              Play again
            </button>
          </div>
        ) : (
          <div className={styles.card} key={challenge.id}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.title}>{challenge.title}</h2>
                <p className={styles.prompt}>{challenge.prompt}</p>
              </div>
              <span className={cx('chip', challenge.track === 'next' ? 'chip-next' : 'chip-react')}>
                {challenge.track === 'next' ? 'Next.js' : 'React'}
              </span>
            </div>

            <pre className={styles.code}>
              <code>
                {parts.map((part, partIndex) => {
                  if (partIndex % 2 === 0) return <Tokens key={partIndex} text={part} />
                  const blankIndex = Number(part)
                  const blank = challenge.blanks[blankIndex]
                  const value = choices[blankIndex]
                  const width = Math.max(...blank.options.map((option) => option.length))
                  return (
                    <button
                      key={partIndex}
                      type="button"
                      className={styles.blank}
                      style={{ minWidth: `calc(${width}ch + 16px)` }}
                      data-active={!checked && active === blankIndex}
                      data-filled={value !== undefined}
                      data-state={checked ? (value === blank.answer ? 'correct' : 'wrong') : undefined}
                      onClick={() => !checked && setActive(blankIndex)}
                      aria-label={`Blank ${blankIndex + 1}${value ? `: ${value}` : ''}`}
                    >
                      {value ?? '?'}
                    </button>
                  )
                })}
              </code>
            </pre>

            {!checked ? (
              <div className={styles.picker}>
                <p className={styles.pickerLabel}>
                  Blank {active + 1} of {challenge.blanks.length}
                </p>
                <div className={styles.options}>
                  {challenge.blanks[active].options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={styles.option}
                      data-chosen={choices[active] === option}
                      onClick={() => choose(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className={styles.actions}>
                  <button type="button" className="btn btn-primary" disabled={!allFilled} onClick={check}>
                    Check snippet
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.feedback} data-correct={allCorrect}>
                <p>
                  <strong>{allCorrect ? 'Correct.' : 'Not quite.'}</strong> {challenge.explanation}
                </p>
                {!allCorrect && (
                  <ul className={styles.fixes}>
                    {challenge.blanks.map((blank, i) =>
                      choices[i] === blank.answer ? null : (
                        <li key={i}>
                          <RichText text={`Blank ${i + 1} should be \`${blank.answer}\``} />
                        </li>
                      ),
                    )}
                  </ul>
                )}
                <div className={styles.actions}>
                  <Link to={`/lessons/${challenge.lessonSlug}`} className={styles.lessonLink}>
                    <BookOpen size={15} />
                    Open the lesson
                  </Link>
                  <button type="button" className="btn btn-primary" onClick={goNext}>
                    {index < gapChallenges.length - 1 ? 'Next snippet' : 'See results'}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  )
}
