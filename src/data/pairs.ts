export interface Pair {
  left: string
  right: string
}

export interface PairSet {
  id: string
  title: string
  description: string
  leftLabel: string
  rightLabel: string
  leftMono?: boolean
  rightMono?: boolean
  pairs: Pair[]
}

export const pairSets: PairSet[] = [
  {
    id: 'angular-react',
    title: 'Angular to React',
    description: 'Match each Angular API with its closest React equivalent.',
    leftLabel: 'Angular',
    rightLabel: 'React',
    leftMono: true,
    rightMono: true,
    pairs: [
      { left: 'input()', right: 'props' },
      { left: 'output()', right: 'onSave={fn}' },
      { left: 'signal(0)', right: 'useState(0)' },
      { left: 'computed()', right: 'useMemo()' },
      { left: 'ngOnDestroy', right: 'effect cleanup' },
      { left: '@for … track', right: 'map() + key' },
      { left: '<ng-content>', right: 'children' },
      { left: 'viewChild()', right: 'useRef()' },
      { left: 'inject(Service)', right: 'useContext()' },
      { left: '<router-outlet>', right: '<Outlet />' },
      { left: '[(ngModel)]', right: 'value + onChange' },
      { left: '@defer', right: '<Suspense>' },
    ],
  },
  {
    id: 'hooks',
    title: 'Hooks and their jobs',
    description: 'Connect every hook to the job it does.',
    leftLabel: 'Hook',
    rightLabel: 'What it does',
    leftMono: true,
    pairs: [
      { left: 'useState', right: 'Remembers a value between renders' },
      { left: 'useEffect', right: 'Syncs with systems outside React' },
      { left: 'useRef', right: 'Holds a value without re-rendering' },
      { left: 'useMemo', right: 'Caches a calculated value' },
      { left: 'useCallback', right: 'Keeps the same function between renders' },
      { left: 'useContext', right: 'Reads the nearest provider value' },
      { left: 'useReducer', right: 'Updates state through actions' },
      { left: 'useActionState', right: 'Tracks the result of a form action' },
      { left: 'useOptimistic', right: 'Shows a result before the server replies' },
      { left: 'useId', right: 'Generates a stable unique id' },
    ],
  },
  {
    id: 'next-files',
    title: 'Next.js file conventions',
    description: 'Which special file or folder does what in the App Router?',
    leftLabel: 'File',
    rightLabel: 'Purpose',
    leftMono: true,
    pairs: [
      { left: 'page.tsx', right: 'The UI of a route' },
      { left: 'layout.tsx', right: 'Shared UI that wraps child routes' },
      { left: 'loading.tsx', right: 'Instant loading UI for a segment' },
      { left: 'error.tsx', right: 'Error boundary for a segment' },
      { left: 'not-found.tsx', right: 'UI for missing content' },
      { left: 'route.ts', right: 'An HTTP endpoint' },
      { left: '[slug]/', right: 'A dynamic route segment' },
      { left: '(group)/', right: 'Groups routes without changing the URL' },
      { left: 'proxy.ts', right: 'Runs before a request completes' },
      { left: "'use client'", right: 'Marks a Client Component boundary' },
    ],
  },
  {
    id: 'analogies',
    title: 'Real-life analogies',
    description: 'The analogies from the teaching cards. Match each concept to its story.',
    leftLabel: 'Concept',
    rightLabel: 'Analogy',
    pairs: [
      { left: 'Component', right: 'A recipe card' },
      { left: 'Props', right: 'An order ticket from the waiter' },
      { left: 'State', right: 'A whiteboard in a meeting room' },
      { left: 'Callback prop', right: 'A doorbell' },
      { left: 'Key', right: 'Name tags at a conference' },
      { left: 'useEffect', right: 'A gym membership' },
      { left: 'useRef', right: 'A sticky note in your pocket' },
      { left: 'Context', right: "The building's Wi-Fi" },
      { left: 'Custom hook', right: 'A coffee machine' },
      { left: 'Reducer', right: 'A bank teller' },
      { left: 'Server Component', right: 'A meal cooked in the kitchen' },
      { left: 'Proxy', right: 'A security desk in the lobby' },
    ],
  },
]
