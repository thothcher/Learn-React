import type { Week } from './types'

export const weeks: Week[] = [
  {
    number: 1,
    track: 'react',
    title: 'Components and JSX',
    goal: 'Swap the Angular class-and-template model for plain functions that return UI.',
    project: {
      title: 'Profile page, rebuilt',
      brief:
        'Pick a small Angular page you know well, such as a profile or product page, and rebuild it using only function components, JSX, props and callbacks.',
      checklist: [
        'Split the page into at least four components',
        'Pass data down with typed props',
        'Report one user action to the parent with a callback prop',
        'Keep all data as constants in App — no state yet',
      ],
      stretch: [
        'Put the Angular and React versions side by side and list every difference',
        'Turn that list into a 10-minute demo for students',
      ],
    },
  },
  {
    number: 2,
    track: 'react',
    title: 'State and rendering',
    goal: 'Understand how state drives re-renders, and what replaces change detection.',
    project: {
      title: 'Task board',
      brief:
        'Build a small task board: add tasks from a form, render them as a list, filter by status and toggle each task between done and open.',
      checklist: [
        'Controlled input for the task title',
        'Tasks stored in state as an array of objects',
        'Stable keys from task ids, not indexes',
        'Filter buttons derive the visible list during render',
      ],
      stretch: ['Add inline editing of a task title', 'Show an empty state per filter'],
    },
  },
  {
    number: 3,
    track: 'react',
    title: 'Effects and composition',
    goal: 'Sync with the outside world, reach DOM nodes and compose components like building blocks.',
    project: {
      title: 'Modal and search kit',
      brief:
        'Build a reusable Modal that takes children, closes on Escape, and a search box that focuses on open and debounces its input.',
      checklist: [
        'Modal content passed through children',
        'Escape listener added and removed in an effect',
        'Input focused with a ref when the modal opens',
        'Search query lifted to the parent that renders the results',
      ],
      stretch: ['Trap focus inside the modal', 'Render the modal with createPortal'],
    },
  },
  {
    number: 4,
    track: 'react',
    title: 'Sharing logic and state',
    goal: 'Replace services and dependency injection with context, custom hooks and reducers.',
    project: {
      title: 'Shopping cart',
      brief:
        'Create a product list with a cart. Cart logic lives in a reducer, is shared through context, and exposed through a useCart hook.',
      checklist: [
        'cartReducer handles add, remove and change quantity',
        'CartProvider wraps the app',
        'useCart throws a helpful error outside the provider',
        'Totals derived with useMemo only if profiling shows a need',
      ],
      stretch: ['Persist the cart in localStorage', 'Write the same cart with Zustand and compare'],
    },
  },
  {
    number: 5,
    track: 'react',
    title: 'React in the real world',
    goal: 'Fetch data, route between pages and use the modern React 19 APIs for forms and async UI.',
    project: {
      title: 'Movie explorer',
      brief:
        'A multi-page app: a list page with search, a details page per movie, loading and error states, and a review form that uses Actions.',
      checklist: [
        'Routes for list, details and not-found',
        'Data fetched with TanStack Query or a custom hook',
        'Suspense or loading states for every async view',
        'Review form built with useActionState',
      ],
      stretch: ['Optimistic review list with useOptimistic', 'Add an error boundary per route'],
    },
  },
  {
    number: 6,
    track: 'next',
    title: 'Next.js foundations',
    goal: 'Learn the App Router: folders as routes, layouts, and the server/client split.',
    project: {
      title: 'Course site skeleton',
      brief:
        'Start the site you will use to teach: a Next.js app with a home page, a lessons section with dynamic routes, a shared layout and loading and error UI.',
      checklist: [
        'app/lessons/[slug]/page.tsx renders one lesson',
        'Root layout with header and footer',
        'At least one Client Component for interactivity',
        'loading.tsx and not-found.tsx in place',
      ],
      stretch: ['Add a route group for marketing pages', 'Generate static params for lessons'],
    },
  },
  {
    number: 7,
    track: 'next',
    title: 'Data on the server',
    goal: 'Fetch, cache and mutate data with Server Components, Server Actions and Route Handlers.',
    project: {
      title: 'Guestbook with a database',
      brief:
        'Students leave messages in a guestbook. Messages load in a Server Component, are created with a Server Action and exposed as JSON through a Route Handler.',
      checklist: [
        'Messages fetched directly in a Server Component',
        'Server Action validates input and revalidates the page',
        'GET /api/messages returns JSON',
        'Pending state shown while the form submits',
      ],
      stretch: ['Stream a slow section with Suspense', 'Add pagination with searchParams'],
    },
  },
  {
    number: 8,
    track: 'next',
    title: 'Ship it and teach it',
    goal: 'Polish, secure, test and deploy — then package everything into a course.',
    project: {
      title: 'Capstone and teaching kit',
      brief:
        'Finish and deploy the course site, then prepare your first student module: slides from the teaching cards, two exercises and one game session.',
      checklist: [
        'Metadata and Open Graph images for every page',
        'Protected /admin route',
        'Tests for one component and one Server Action',
        'Deployed with environment variables configured',
      ],
      stretch: ['Record a short walkthrough video', 'Collect feedback from a pilot group'],
    },
  },
]
