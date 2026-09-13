import { Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { site } from '../../config/site'
import { asApiError } from '../../lib/api'
import { useAuth } from '../../lib/auth-context'
import { useTheme } from '../../lib/theme'
import { cx } from '../../lib/utils'
import { GitHubIcon, Logo } from '../ui/BrandIcons'
import { AccountMenu } from './AccountMenu'
import styles from './Header.module.css'

const mainNav = [
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/lessons', label: 'Lessons' },
  { to: '/practice', label: 'Practice' },
  { to: '/teach', label: 'Teach' },
  { to: '/cheatsheet', label: 'Cheat sheet' },
  { to: '/contact', label: 'Contact' },
]

export function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { theme, toggleTheme } = useTheme()
  const { status, user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  // The menu belongs to the page it was opened on, so any navigation (a link, the back button) closes it.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null)
  const menuOpen = menuOpenOn === location.key
  const [logoutError, setLogoutError] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpenOn(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const closeMenu = () => setMenuOpenOn(null)

  return (
    <>
      <header className={styles.header} data-solid={scrolled || menuOpen}>
        <div className={`container ${styles.inner}`}>
          <Link to="/" className={styles.brand} onClick={closeMenu}>
            <Logo size={28} />
            <span>{site.name}</span>
          </Link>

          <nav className={styles.nav} aria-label="Main">
            {mainNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => cx(styles.link, isActive && styles.active)}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            <button type="button" className={styles.search} onClick={onOpenSearch} aria-label="Search lessons and pages">
              <Search size={16} />
              <span className={styles.searchLabel}>Search</span>
              <kbd>Ctrl K</kbd>
            </button>
            <a
              href={site.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-icon"
              aria-label="GitHub repository"
            >
              <GitHubIcon size={19} />
            </a>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <AccountMenu />
            <button
              type="button"
              className={`btn btn-ghost btn-icon ${styles.menuButton}`}
              onClick={() => {
                setMenuOpenOn(menuOpen ? null : location.key)
                setLogoutError(null)
              }}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside the header: its backdrop-filter would trap a fixed child. */}
      {menuOpen && (
        <nav className={styles.mobile} aria-label="Mobile">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMenu}
              className={({ isActive }) => cx(styles.mobileLink, isActive && styles.mobileActive)}
            >
              {item.label}
            </NavLink>
          ))}
          {status === 'signedOut' && (
            <>
              <NavLink to="/login" onClick={closeMenu} className={({ isActive }) => cx(styles.mobileLink, isActive && styles.mobileActive)}>
                Log in
              </NavLink>
              <NavLink to="/register" onClick={closeMenu} className={({ isActive }) => cx(styles.mobileLink, isActive && styles.mobileActive)}>
                Create an account
              </NavLink>
            </>
          )}
          {status === 'signedIn' && user && (
            <>
              <NavLink to="/dashboard" onClick={closeMenu} className={({ isActive }) => cx(styles.mobileLink, isActive && styles.mobileActive)}>
                Dashboard
              </NavLink>
              {user.isTeacher && (
                <NavLink to="/teacher" onClick={closeMenu} className={({ isActive }) => cx(styles.mobileLink, isActive && styles.mobileActive)}>
                  Teacher dashboard
                </NavLink>
              )}
              <button
                type="button"
                className={styles.mobileLink}
                onClick={async () => {
                  setLogoutError(null)
                  try {
                    await logout()
                    closeMenu()
                    navigate('/')
                  } catch (error) {
                    setLogoutError(asApiError(error).message)
                  }
                }}
              >
                Log out
              </button>
              {logoutError && (
                <p className={styles.mobileError} role="alert">
                  {logoutError}
                </p>
              )}
            </>
          )}
        </nav>
      )}
    </>
  )
}
