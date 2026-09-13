import { createBrowserRouter } from 'react-router'
import { RootLayout } from './components/layout/RootLayout'
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
      { path: '*', Component: NotFoundPage },
    ],
  },
], {
  // Matches Vite's base, e.g. "/Learn-React" when hosted on GitHub Pages.
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
})
