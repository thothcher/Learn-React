import { useEffect, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { CommandPalette } from './CommandPalette'
import { Footer } from './Footer'
import { Header } from './Header'
import styles from './RootLayout.module.css'

export function RootLayout() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ScrollRestoration />
    </div>
  )
}
