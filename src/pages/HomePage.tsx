import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Cable,
  CalendarDays,
  Gamepad2,
  GraduationCap,
  LayoutGrid,
  ListChecks,
  NotebookPen,
  Presentation,
  Puzzle,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { TeachingCard } from '../components/lesson/TeachingCard'
import { NextIcon, ReactIcon } from '../components/ui/BrandIcons'
import { CodeBlock } from '../components/ui/CodeBlock'
import { Segmented } from '../components/ui/Segmented'
import { cheatSheet } from '../data/cheatsheet'
import { getLesson, lessons } from '../data/lessons'
import { weeks } from '../data/weeks'
import { useProgress } from '../lib/progress'
import { code, cx, percent } from '../lib/utils'
import styles from './HomePage.module.css'

const heroExamples = [
  {
    id: 'state',
    label: 'State',
    files: ['counter.component.ts', 'Counter.tsx'],
    angular: code`
      @Component({
        selector: 'app-counter',
        template: \`
          <button (click)="count.set(count() + 1)">
            Clicked {{ count() }} times
          </button>
        \`,
      })
      export class Counter {
        count = signal(0);
      }
    `,
    react: code`
      export function Counter() {
        const [count, setCount] = useState(0);

        return (
          <button onClick={() => setCount(count + 1)}>
            Clicked {count} times
          </button>
        );
      }
    `,
  },
  {
    id: 'inputs',
    label: 'Inputs',
    files: ['greeting.component.ts', 'Greeting.tsx'],
    angular: code`
      @Component({
        selector: 'app-greeting',
        template: \`<h2>Hello, {{ name() }}!</h2>\`,
      })
      export class Greeting {
        name = input.required<string>();
      }

      // <app-greeting name="Ana" />
    `,
    react: code`
      export function Greeting({ name }: { name: string }) {
        return <h2>Hello, {name}!</h2>;
      }

      // <Greeting name="Ana" />
    `,
  },
  {
    id: 'lists',
    label: 'Lists',
    files: ['todos.component.ts', 'Todos.tsx'],
    angular: code`
      @Component({
        selector: 'app-todos',
        template: \`
          <ul>
            @for (todo of todos(); track todo.id) {
              <li>{{ todo.title }}</li>
            }
          </ul>
        \`,
      })
      export class Todos {
        todos = input.required<Todo[]>();
      }
    `,
    react: code`
      export function Todos({ todos }: { todos: Todo[] }) {
        return (
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>{todo.title}</li>
            ))}
          </ul>
        );
      }
    `,
  },
]

const steps = [
  { icon: BookOpen, title: 'The idea', text: 'A short explanation written for someone who already thinks in Angular.' },
  { icon: ArrowLeftRight, title: 'Side by side', text: 'The same feature in Angular and React, so the differences jump out.' },
  { icon: NotebookPen, title: 'Practice', text: 'An exercise with progressive hints, a full solution and a quick check.' },
  { icon: Presentation, title: 'Teach it', text: 'A teaching card with a real-life analogy, ready for your classroom.' },
]

const mentalModel = [
  ['input()', 'props'],
  ['signal()', 'useState()'],
  ['computed()', 'useMemo()'],
  ['ngOnDestroy', 'effect cleanup'],
  ['<ng-content>', 'children'],
  ['inject()', 'useContext()'],
]

const games = [
  { to: '/practice/match', icon: Cable, title: 'Match pairs', text: 'Draw lines from Angular concepts to their React partners.' },
  { to: '/practice/memory', icon: LayoutGrid, title: 'Memory cards', text: 'Flip cards and find the pairs in as few moves as possible.' },
  { to: '/practice/quiz', icon: ListChecks, title: 'Tests', text: 'Weekly tests and final exams with explanations.' },
  { to: '/practice/gaps', icon: Puzzle, title: 'Fill the gap', text: 'Complete real code by choosing the missing pieces.' },
]

type Framework = 'angular' | 'react'

export function HomePage() {
  const [exampleId, setExampleId] = useState(heroExamples[0].id)
  const [framework, setFramework] = useState<Framework>('react')
  const progress = useProgress()

  const example = heroExamples.find((item) => item.id === exampleId)!
  const angularLines = example.angular.split('\n').length
  const reactLines = example.react.split('\n').length
  const sampleLesson = getLesson('use-state')!
  const mappingCount = cheatSheet.reduce((sum, section) => sum + section.rows.length, 0)

  return (
    <div className={styles.page}>
      <title>Refract · React and Next.js for Angular developers</title>

      <section className={`container ${styles.hero}`}>
        <div className={styles.heroText}>
          <span className={styles.badge}>
            <GraduationCap size={16} />
            For Angular developers who teach
          </span>
          <h1 className={styles.heroTitle}>
            Learn React and Next.js by translating what you <span>already know</span>.
          </h1>
          <p className={styles.heroLead}>
            An eight-week plan with side-by-side comparisons, exercises, games and teaching cards. Master it in two
            months, then take it straight into your classroom.
          </p>
          <div className={styles.heroActions}>
            <Link to="/roadmap" className="btn btn-primary btn-lg">
              Start the roadmap
              <ArrowRight size={18} />
            </Link>
            <Link to="/practice" className="btn btn-lg">
              <Gamepad2 size={18} />
              Play a game
            </Link>
          </div>
          <ul className={styles.facts}>
            <li>
              <CalendarDays size={16} /> 8 weeks
            </li>
            <li>
              <BookOpen size={16} /> {lessons.length} lessons
            </li>
            <li>
              <Gamepad2 size={16} /> 4 game modes
            </li>
          </ul>
        </div>

        <div className={styles.translator}>
          <div className={styles.translatorBar}>
            <div className={styles.exampleTabs} role="group" aria-label="Example">
              {heroExamples.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={item.id === exampleId}
                  onClick={() => setExampleId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Segmented<Framework>
              size="sm"
              value={framework}
              onChange={setFramework}
              ariaLabel="Framework"
              options={[
                { value: 'angular', label: 'Angular' },
                { value: 'react', label: 'React' },
              ]}
            />
          </div>
          <div className={styles.translatorCode}>
            <CodeBlock
              key={`${example.id}-${framework}`}
              code={framework === 'angular' ? example.angular : example.react}
              label={framework === 'angular' ? example.files[0] : example.files[1]}
              className={styles.fadeCode}
            />
          </div>
          <p className={styles.translatorNote}>
            <ArrowLeftRight size={15} />
            {angularLines} lines in Angular, {reactLines} in React. Same behavior, different mental model.
          </p>
        </div>
      </section>

      <section className="container">
        <div className={styles.sectionHead}>
          <span className="eyebrow">How every lesson works</span>
          <h2 className={styles.sectionTitle}>Four steps, from understanding to teaching</h2>
        </div>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <div className={styles.stepTop}>
                <span className={styles.stepIcon}>
                  <step.icon size={20} />
                </span>
                <span className={styles.stepNumber}>0{index + 1}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`container ${styles.split}`}>
        <div>
          <span className="eyebrow">Your mental model, mapped</span>
          <h2 className={styles.sectionTitle}>You are not starting from zero</h2>
          <p className={styles.sectionText}>
            Components, inputs, services and routing already live in your head. React renames them and removes
            ceremony. The cheat sheet maps {mappingCount} Angular APIs to their React and Next.js counterparts.
          </p>
          <Link to="/cheatsheet" className={`btn btn-soft ${styles.sectionButton}`}>
            Open the cheat sheet
            <ArrowRight size={17} />
          </Link>
        </div>
        <ul className={styles.mapping}>
          {mentalModel.map(([angular, react]) => (
            <li key={angular}>
              <code className={styles.angularCode}>{angular}</code>
              <ArrowRight size={16} className={styles.mappingArrow} />
              <code className={styles.reactCode}>{react}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="container">
        <div className={styles.sectionHead}>
          <span className="eyebrow">Two months, two tracks</span>
          <h2 className={styles.sectionTitle}>React first, then Next.js on top</h2>
        </div>
        <div className={styles.tracks}>
          {(['react', 'next'] as const).map((track) => {
            const trackWeeks = weeks.filter((week) => week.track === track)
            const trackLessons = lessons.filter((lesson) => lesson.track === track)
            const done = trackLessons.filter((lesson) => progress.lessons.includes(lesson.slug)).length
            const value = percent(done, trackLessons.length)
            return (
              <article key={track} className={cx(styles.track, track === 'next' && styles.trackNext)}>
                <div className={styles.trackHead}>
                  <span className={styles.trackIcon}>
                    {track === 'react' ? <ReactIcon size={28} /> : <NextIcon size={26} />}
                  </span>
                  <div>
                    <p className={styles.trackKicker}>
                      Weeks {trackWeeks[0].number}–{trackWeeks[trackWeeks.length - 1].number}
                    </p>
                    <h3>{track === 'react' ? 'React' : 'Next.js'}</h3>
                  </div>
                  <span className={styles.trackPercent}>{value}%</span>
                </div>
                <div className={styles.bar}>
                  <span style={{ width: `${value}%` }} />
                </div>
                <ol className={styles.trackWeeks}>
                  {trackWeeks.map((week) => (
                    <li key={week.number}>
                      <span>W{week.number}</span>
                      {week.title}
                    </li>
                  ))}
                </ol>
              </article>
            )
          })}
        </div>
      </section>

      <section className="container">
        <div className={styles.sectionHead}>
          <span className="eyebrow">Practice</span>
          <h2 className={styles.sectionTitle}>Learning sticks when you play with it</h2>
        </div>
        <div className={styles.games}>
          {games.map((game) => (
            <Link key={game.to} to={game.to} className={styles.game}>
              <span className={styles.gameIcon}>
                <game.icon size={22} />
              </span>
              <h3>{game.title}</h3>
              <p>{game.text}</p>
              <span className={styles.gameLink}>
                Play <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className={`container ${styles.split}`}>
        <div>
          <span className="eyebrow">For your classroom</span>
          <h2 className={styles.sectionTitle}>Teaching cards with real-life analogies</h2>
          <p className={styles.sectionText}>
            Every lesson ends with a card: a one-line definition, an everyday analogy and a sentence to remember.
            Open presentation mode to show them full-screen, reveal the answer when the class has guessed, and move
            with the arrow keys.
          </p>
          <Link to="/teach" className={`btn btn-soft ${styles.sectionButton}`}>
            Browse all cards
            <ArrowRight size={17} />
          </Link>
        </div>
        <TeachingCard card={sampleLesson.card} week={sampleLesson.week} track={sampleLesson.track} />
      </section>

      <section className="container">
        <div className={styles.cta}>
          <div>
            <h2>Ready for day one?</h2>
            <p>Start with "Components are just functions". It takes about 35 minutes.</p>
          </div>
          <Link to={`/lessons/${lessons[0].slug}`} className={`btn btn-lg ${styles.ctaButton}`}>
            Start lesson 1
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
