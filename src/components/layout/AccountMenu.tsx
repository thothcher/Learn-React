import { LayoutDashboard, LogIn, LogOut, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { asApiError } from '../../lib/api'
import { useAuth } from '../../lib/auth-context'
import { Avatar } from '../ui/Avatar'
import styles from './AccountMenu.module.css'

export function AccountMenu() {
  const { status, user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Close on outside click or Escape, like a mat-menu.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (status === 'disabled') return null
  if (status === 'loading') return <span className={styles.placeholder} aria-hidden="true" />

  if (status === 'signedOut' || !user) {
    return (
      <Link to="/login" className={`btn btn-primary btn-sm ${styles.login}`}>
        <LogIn size={16} />
        <span className={styles.loginText}>Log in</span>
      </Link>
    )
  }

  async function handleLogout() {
    setLogoutError(null)
    try {
      await logout()
      setOpen(false)
      navigate('/')
    } catch (error) {
      // The session is still valid, so the menu stays open and says so.
      setLogoutError(asApiError(error).message)
    }
  }

  return (
    <div className={styles.account} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => {
          setOpen((value) => !value)
          setLogoutError(null)
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <Avatar name={user.displayName} size={34} />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.menuHead}>
            <Avatar name={user.displayName} size={40} />
            <div className={styles.menuIdentity}>
              <p className={styles.menuName}>{user.displayName}</p>
              <p className={styles.menuEmail}>{user.email}</p>
            </div>
          </div>
          <Link to="/dashboard" role="menuitem" className={styles.item} onClick={() => setOpen(false)}>
            <LayoutDashboard size={17} />
            Dashboard
          </Link>
          {user.isTeacher && (
            <Link to="/teacher" role="menuitem" className={styles.item} onClick={() => setOpen(false)}>
              <Users size={17} />
              Teacher dashboard
            </Link>
          )}
          <button type="button" role="menuitem" className={styles.item} onClick={handleLogout}>
            <LogOut size={17} />
            Log out
          </button>
          {logoutError && (
            <p className={styles.menuError} role="alert">
              {logoutError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
