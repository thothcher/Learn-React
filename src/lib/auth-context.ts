import { createContext, use } from 'react'
import type { ServerProgress, User } from './api'
import type { ProgressState } from './progress'

/** "disabled" means this build has no backend, for example on GitHub Pages. */
export type AuthStatus = 'disabled' | 'loading' | 'signedOut' | 'signedIn'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  login(email: string, password: string, rememberMe: boolean): Promise<void>
  logout(): Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/** Reads the current account. Works like inject(AuthService) in Angular. */
export function useAuth() {
  const context = use(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.')
  return context
}

export function toProgressState(server: ServerProgress): ProgressState {
  return {
    lessons: server.lessons.map((lesson) => lesson.slug),
    projects: server.projects.map((project) => project.week),
    scores: Object.fromEntries(server.scores.map((score) => [score.key, score.score])),
  }
}
