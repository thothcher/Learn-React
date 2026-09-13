import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { accountsEnabled } from '../../config/features'
import { ApiError, authApi, onUnauthorized, progressApi, type User } from '../../lib/api'
import { AuthContext, toProgressState, type AuthContextValue, type AuthStatus } from '../../lib/auth-context'
import {
  clearBrowserProgress,
  connectAccountProgress,
  disconnectAccountProgress,
  readBrowserProgress,
  replaceAccountProgress,
} from '../../lib/progress'

/** Retries requests that can fail for a moment: no connection, or a server error. */
async function withRetry<T>(request: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await request()
    } catch (error) {
      const temporary = error instanceof ApiError && (error.status === 0 || error.status >= 500)
      if (!temporary || attempt >= attempts) throw error
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt))
    }
  }
}

/** Loads the account's progress; progress collected before signing in moves into the account once. */
async function startAccountProgress() {
  const browser = readBrowserProgress()
  const hasBrowserProgress =
    browser.lessons.length > 0 || browser.projects.length > 0 || Object.keys(browser.scores).length > 0

  // The server merges imports, so retrying one is safe.
  const server = await withRetry(() =>
    hasBrowserProgress ? progressApi.importBrowserProgress(browser) : progressApi.get(),
  )
  if (hasBrowserProgress) clearBrowserProgress()

  connectAccountProgress(toProgressState(server), {
    setLesson: progressApi.setLesson,
    setProject: progressApi.setProject,
    recordScore: progressApi.recordScore,
    reset: progressApi.reset,
    onError: () => {
      progressApi
        .get()
        .then((fresh) => replaceAccountProgress(toProgressState(fresh)))
        .catch(() => {})
    },
  })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(accountsEnabled ? 'loading' : 'disabled')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!accountsEnabled) return
    let ignore = false

    async function restoreSession() {
      try {
        const me = await authApi.me()
        await startAccountProgress()
        if (!ignore) {
          setUser(me)
          setStatus('signedIn')
        }
      } catch {
        // No session, or its progress could not be loaded. Continuing as a visitor keeps the
        // screen honest: showing "signed in" while saves go nowhere would quietly lose progress.
        if (!ignore) setStatus('signedOut')
      }
    }

    restoreSession()

    // A request answered 401 mid-session: the cookie expired or was revoked elsewhere.
    onUnauthorized(() => {
      disconnectAccountProgress()
      setUser(null)
      setStatus('signedOut')
    })

    return () => {
      ignore = true
      onUnauthorized(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      async login(email, password, rememberMe) {
        const me = await authApi.login({ email, password, rememberMe })
        try {
          await startAccountProgress()
        } catch {
          // End the new session so the user can simply try again, instead of appearing
          // signed in while nothing is being saved.
          await authApi.logout().catch(() => {})
          throw new ApiError(0, 'Your progress could not be loaded, so you were not signed in. Please try again in a moment.', {
            title: 'Something went wrong',
          })
        }
        setUser(me)
        setStatus('signedIn')
      },
      async logout() {
        try {
          await authApi.logout()
        } catch (error) {
          // A 401 means the session had already ended. Any other failure leaves a valid cookie,
          // so the user must not be shown as signed out.
          if (!(error instanceof ApiError && error.status === 401)) throw error
        }
        disconnectAccountProgress()
        setUser(null)
        setStatus('signedOut')
      },
    }),
    [status, user],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
