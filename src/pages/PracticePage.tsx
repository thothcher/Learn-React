import { ArrowRight, Cable, Gamepad2, LayoutGrid, ListChecks, Puzzle, Trophy, Users } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '../components/ui/PageHeader'
import { gapChallenges } from '../data/gaps'
import { useProgress } from '../lib/progress'
import styles from './PracticePage.module.css'

export function PracticePage() {
  const { scores } = useProgress()

  const best = (prefix: string, pick: (values: number[]) => number) => {
    const values = Object.entries(scores)
      .filter(([key]) => key.startsWith(prefix))
      .map(([, value]) => value)
    return values.length ? pick(values) : null
  }

  const matchBest = best('match:', (v) => Math.max(...v))
  const memoryBest = best('memory:', (v) => Math.min(...v))
  const testsPassed = Object.entries(scores).filter(([key, value]) => key.startsWith('quiz:') && value >= 80).length
  const gapsBest = scores['gaps'] ?? null

  const games = [
    {
      to: '/practice/match',
      icon: Cable,
      title: 'Match pairs',
      text: 'Connect items on the left with their partners on the right. Lines are drawn as you connect, then checked all at once.',
      how: 'Click or drag from a left item to a right item.',
      score: matchBest === null ? null : `Best round: ${matchBest}%`,
    },
    {
      to: '/practice/memory',
      icon: LayoutGrid,
      title: 'Memory cards',
      text: 'Sixteen face-down cards hide eight pairs: Angular APIs and React equivalents, hooks and their jobs, and more.',
      how: 'Flip two cards at a time. Fewer moves is better.',
      score: memoryBest === null ? null : `Fewest moves: ${memoryBest}`,
    },
    {
      to: '/practice/quiz',
      icon: ListChecks,
      title: 'Tests',
      text: 'A test for every week, plus React, Next.js and full-course exams built from the lesson questions.',
      how: 'Pick an answer, read the explanation, see your score.',
      score: testsPassed === 0 ? null : `${testsPassed} tests passed`,
    },
    {
      to: '/practice/gaps',
      icon: Puzzle,
      title: 'Fill the gap',
      text: 'Real snippets with missing pieces. Choose the right hook, prop or directive for every blank.',
      how: 'Select a blank, choose a token, check the snippet.',
      score: gapsBest === null ? null : `Best: ${gapsBest}/${gapChallenges.length}`,
    },
  ]

  return (
    <>
      <title>Practice · Refract</title>
      <PageHeader
        eyebrow={
          <>
            <Gamepad2 size={16} /> Practice
          </>
        }
        title="Games that make the concepts stick"
        description="Short, replayable games built from the lesson content. Use them to review on your own, or project them in class."
      />

      <section className={`container ${styles.grid}`}>
        {games.map((game) => (
          <Link key={game.to} to={game.to} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.icon}>
                <game.icon size={26} />
              </span>
              {game.score && (
                <span className="chip chip-success">
                  <Trophy size={13} />
                  {game.score}
                </span>
              )}
            </div>
            <h2 className={styles.title}>{game.title}</h2>
            <p className={styles.text}>{game.text}</p>
            <p className={styles.how}>{game.how}</p>
            <span className={styles.play}>
              Play now
              <ArrowRight size={17} />
            </span>
          </Link>
        ))}
      </section>

      <section className="container">
        <div className={styles.classroom}>
          <span className={styles.classroomIcon}>
            <Users size={22} />
          </span>
          <div>
            <h2>Using the games in class</h2>
            <ul>
              <li>Open Match pairs on the projector and let students call out connections.</li>
              <li>Split the class into teams for Memory cards and compare move counts.</li>
              <li>Run the weekly test as a warm-up at the start of the next session.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
