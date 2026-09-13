import { ArrowUpRight, Mail } from 'lucide-react'
import { Link } from 'react-router'
import { site } from '../../config/site'
import { lessons } from '../../data/lessons'
import { useProgress } from '../../lib/progress'
import { GitHubIcon, Logo } from '../ui/BrandIcons'
import styles from './Footer.module.css'

const columns = [
  {
    title: 'Learn',
    links: [
      { to: '/roadmap', label: 'Roadmap' },
      { to: '/lessons', label: 'Lessons' },
      { to: '/exercises', label: 'Exercises' },
      { to: '/cheatsheet', label: 'Cheat sheet' },
    ],
  },
  {
    title: 'Practice',
    links: [
      { to: '/practice/match', label: 'Match pairs' },
      { to: '/practice/memory', label: 'Memory cards' },
      { to: '/practice/quiz', label: 'Tests' },
      { to: '/practice/gaps', label: 'Fill the gap' },
    ],
  },
  {
    title: 'Teach',
    links: [
      { to: '/teach', label: 'Teaching cards' },
      { to: '/teach?present=1', label: 'Presentation mode' },
      { to: '/contact', label: 'Contact' },
    ],
  },
]

export function Footer() {
  const progress = useProgress()
  const done = progress.lessons.length

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <Logo size={30} />
              <span>{site.name}</span>
            </Link>
            <p>
              A two-month bridge from Angular to React and Next.js. Learn it well enough to teach it.
            </p>
            <a href={site.githubUrl} target="_blank" rel="noreferrer" className={`btn ${styles.github}`}>
              <GitHubIcon size={18} />
              View on GitHub
              <ArrowUpRight size={16} className={styles.githubArrow} />
            </a>
          </div>

          <nav className={styles.columns} aria-label="Footer">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className={styles.columnTitle}>{column.title}</h2>
                <ul className={styles.links}>
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          <p>
            © {new Date().getFullYear()} {site.author}. Built with React 19 and Vite.
          </p>
          <p className={styles.status}>
            <span className={styles.dot} />
            {done} of {lessons.length} lessons completed
          </p>
          <div className={styles.social}>
            <a href={site.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
              <GitHubIcon size={18} />
            </a>
            <Link to="/contact" aria-label="Contact">
              <Mail size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
