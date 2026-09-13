export interface User {
  id: string
  displayName: string
  email: string
  isTeacher: boolean
  createdAt: string
}

export interface LessonEntry {
  slug: string
  completedAt: string
}

export interface ProjectEntry {
  week: number
  completedAt: string
}

export interface ScoreEntry {
  key: string
  score: number
  updatedAt: string
}

export interface ServerProgress {
  lessons: LessonEntry[]
  projects: ProjectEntry[]
  scores: ScoreEntry[]
}

export interface StudentSummary {
  id: string
  displayName: string
  email: string
  emailConfirmed: boolean
  createdAt: string
  lastActiveAt: string | null
  lessonsCompleted: number
  projectsCompleted: number
  testsPassed: number
}

export interface StudentDetail {
  student: StudentSummary
  progress: ServerProgress
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string | undefined
  readonly title: string | undefined
  readonly fieldErrors: Record<string, string[]>

  constructor(
    status: number,
    message: string,
    details: { code?: string; title?: string; fieldErrors?: Record<string, string[]> } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = details.code
    this.title = details.title
    this.fieldErrors = details.fieldErrors ?? {}
  }

  get hasFieldErrors() {
    return Object.keys(this.fieldErrors).length > 0
  }
}

/** Normalizes anything thrown during a request into an ApiError. */
export function asApiError(error: unknown) {
  return error instanceof ApiError ? error : new ApiError(0, 'Something went wrong. Please try again.')
}

interface ProblemDetails {
  title?: string
  detail?: string
  code?: string
  errors?: Record<string, string[]>
}

function fallbackMessage(status: number) {
  if (status === 429) return 'Too many attempts. Wait a minute and try again.'
  if (status === 401) return 'Please log in to continue.'
  if (status === 403) return 'You do not have access to this page.'
  if (status === 404) return 'This could not be found.'
  return 'Something went wrong on the server. Please try again.'
}

let unauthorizedHandler: (() => void) | null = null

/** Lets the auth provider react when a session ends while the app is open. */
export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

/** A small fetch wrapper: JSON in, JSON out, and errors as ApiError (like an HttpClient interceptor). */
async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }

  const text = await response.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : undefined
  } catch {
    data = undefined
  }

  if (!response.ok) {
    // A 401 from /auth/* is an expected answer (wrong password, no session yet). Anywhere else it
    // means the session ended, for example after a password reset on another device.
    if (response.status === 401 && !path.startsWith('/auth/')) unauthorizedHandler?.()
    const problem = (data ?? {}) as ProblemDetails
    const message = problem.detail ?? (problem.code ? problem.title : undefined) ?? fallbackMessage(response.status)
    throw new ApiError(response.status, message, {
      code: problem.code,
      title: problem.code ? problem.title : undefined,
      fieldErrors: problem.errors,
    })
  }

  return data as T
}

export const authApi = {
  me: () => request<User>('GET', '/auth/me'),
  register: (input: { displayName: string; email: string; password: string }) =>
    request<void>('POST', '/auth/register', input),
  login: (input: { email: string; password: string; rememberMe: boolean }) => request<User>('POST', '/auth/login', input),
  logout: () => request<void>('POST', '/auth/logout'),
  confirmEmail: (userId: string, code: string) => request<void>('POST', '/auth/confirm-email', { userId, code }),
  resendConfirmation: (email: string) => request<void>('POST', '/auth/resend-confirmation', { email }),
  forgotPassword: (email: string) => request<void>('POST', '/auth/forgot-password', { email }),
  resetPassword: (input: { email: string; code: string; password: string }) =>
    request<void>('POST', '/auth/reset-password', input),
}

export const progressApi = {
  get: () => request<ServerProgress>('GET', '/progress'),
  setLesson: (slug: string, done: boolean) =>
    request<void>(done ? 'PUT' : 'DELETE', `/progress/lessons/${encodeURIComponent(slug)}`),
  setProject: (week: number, done: boolean) => request<void>(done ? 'PUT' : 'DELETE', `/progress/projects/${week}`),
  recordScore: (key: string, score: number) =>
    request<{ best: number; isRecord: boolean }>('POST', '/progress/scores', { key, score }),
  importBrowserProgress: (state: { lessons: string[]; projects: number[]; scores: Record<string, number> }) =>
    request<ServerProgress>('POST', '/progress/import', state),
  reset: () => request<void>('DELETE', '/progress'),
}

export const teacherApi = {
  students: () => request<StudentSummary[]>('GET', '/teacher/students'),
  student: (id: string) => request<StudentDetail>('GET', `/teacher/students/${encodeURIComponent(id)}`),
}
