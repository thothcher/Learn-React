import { createBrowserRouter, type RouteObject } from 'react-router'
import { RequireAuth } from './components/auth/RequireAuth'
import { RootLayout } from './components/layout/RootLayout'
import { accountsEnabled } from './config/features'
import { CheckEmailPage } from './pages/auth/CheckEmailPage'
import { ConfirmEmailPage } from './pages/auth/ConfirmEmailPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { CheatSheetPage } from './pages/CheatSheetPage'
import { ContactPage } from './pages/ContactPage'
import { ExercisesPage } from './pages/ExercisesPage'
import { GapGame } from './pages/games/GapGame'
import { MatchGame } from './pages/games/MatchGame'
import { MemoryGame } from './pages/games/MemoryGame'
import { QuizGame } from './pages/games/QuizGame'
import { HomePage } from './pages/HomePage'
import { LessonPage } from './pages/LessonPage'
import { LessonsPage } from './pages/LessonsPage'
import { NotFoundPage, RouteErrorPage } from './pages/NotFoundPage'
import { PracticePage } from './pages/PracticePage'
import { RoadmapPage } from './pages/RoadmapPage'
import { TeachPage } from './pages/TeachPage'
import { TeacherPage } from './pages/teacher/TeacherPage'
import { TeacherStudentPage } from './pages/teacher/TeacherStudentPage'

// Account pages need the C# API, so builds without it (GitHub Pages) leave them out.
const accountRoutes: RouteObject[] = accountsEnabled
  ? [
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'check-email', Component: CheckEmailPage },
      { path: 'confirm-email', Component: ConfirmEmailPage },
      { path: 'forgot-password', Component: ForgotPasswordPage },
      { path: 'reset-password', Component: ResetPasswordPage },
      { path: 'dashboard', element: <RequireAuth><DashboardPage /></RequireAuth> },
      { path: 'teacher', element: <RequireAuth teacher><TeacherPage /></RequireAuth> },
      { path: 'teacher/students/:id', element: <RequireAuth teacher><TeacherStudentPage /></RequireAuth> },
    ]
  : []

// The same idea as Angular's Routes array: a tree of paths and components.
export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage,
    children: [
      { index: true, Component: HomePage },
      { path: 'roadmap', Component: RoadmapPage },
      { path: 'lessons', Component: LessonsPage },
      { path: 'lessons/:slug', Component: LessonPage },
      { path: 'exercises', Component: ExercisesPage },
      { path: 'practice', Component: PracticePage },
      { path: 'practice/match', Component: MatchGame },
      { path: 'practice/memory', Component: MemoryGame },
      { path: 'practice/quiz', Component: QuizGame },
      { path: 'practice/gaps', Component: GapGame },
      { path: 'teach', Component: TeachPage },
      { path: 'cheatsheet', Component: CheatSheetPage },
      { path: 'contact', Component: ContactPage },
      ...accountRoutes,
      { path: '*', Component: NotFoundPage },
    ],
  },
], {
  // Matches Vite's base, e.g. "/Learn-React" when hosted on GitHub Pages.
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
})
