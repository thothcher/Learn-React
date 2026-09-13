import { code } from '../../lib/utils'
import type { Lesson } from '../types'

export const week5: Lesson[] = [
  {
    slug: 'data-fetching',
    week: 5,
    day: 1,
    track: 'react',
    title: 'Fetching data without HttpClient',
    summary: 'fetch, loading and error states, and why most teams add TanStack Query.',
    minutes: 55,
    angular: 'HttpClient + async pipe',
    analogy: {
      title: 'Food delivery with a tracking app',
      body: 'Fetching data is ordering delivery. The app shows "preparing" (loading), then either your food (data) or "order failed" (error). TanStack Query is the delivery app that also remembers your last order, so reopening it shows the order instantly while it checks for updates in the background.',
    },
    body: [
      'Angular gives you `HttpClient`, which returns Observables, plus interceptors and the `async` pipe. React has no built-in HTTP client. You use the browser\'s `fetch` (or a thin wrapper) and handle loading, error and data yourself.',
      'A basic approach uses `useEffect` with an `ignore` flag to avoid race conditions when inputs change quickly. It works, but you soon need caching, retries, deduplication and refetching. That is why most React apps use **TanStack Query**, whose `useQuery` returns `data`, `isPending` and `error` with caching built in.',
      'In frameworks like Next.js, much of the fetching moves to the server with Server Components, which you will meet in week 6. Client-side patterns stay essential for interactive and real-time features.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-user-list',
          imports: [AsyncPipe],
          template: \`
            @if (users$ | async; as users) {
              @for (user of users; track user.id) {
                <p>{{ user.name }}</p>
              }
            } @else {
              <p>Loading…</p>
            }
          \`,
        })
        export class UserListComponent {
          private http = inject(HttpClient);
          users$ = this.http.get<User[]>('/api/users');
        }
      `,
      react: code`
        import { useQuery } from '@tanstack/react-query';

        async function fetchUsers(): Promise<User[]> {
          const res = await fetch('/api/users');
          if (!res.ok) throw new Error('Failed to load users');
          return res.json();
        }

        export function UserList() {
          const { data, isPending, error } = useQuery({
            queryKey: ['users'],
            queryFn: fetchUsers,
          });

          if (isPending) return <p>Loading…</p>;
          if (error) return <p>{error.message}</p>;

          return data.map((user) => <p key={user.id}>{user.name}</p>);
        }
      `,
    },
    keyPoints: [
      'React has no HttpClient. Use `fetch` or a small wrapper.',
      '`fetch` does not reject on HTTP errors, so check `res.ok`.',
      'Handle the loading, error and success states explicitly.',
      'TanStack Query adds caching, retries and refetching.',
    ],
    pitfall:
      'Fetching in an effect without cleanup can show stale results when responses arrive out of order. Ignore outdated responses, or use TanStack Query.',
    card: {
      term: 'Data fetching',
      definition: 'Loading remote data and handling its loading, error and success states in the UI.',
      analogy: 'Food delivery with a tracking app: preparing, delivered or failed, and a good app remembers your last order.',
      remember: 'Loading, error, data. Always all three.',
    },
    exercise: {
      title: 'GitHub profile viewer',
      difficulty: 'medium',
      task: 'Build `GitHubProfile`, which receives a `username` prop and fetches `https://api.github.com/users/{username}`. Show a loading state, an error state, and the avatar with the name.',
      requirements: ['Separate states for loading, error and data', '`res.ok` is checked', 'Outdated responses are ignored'],
      hints: [
        'Fetch in an effect that depends on `username`.',
        'Use `let ignore = false` and set it to `true` in the cleanup.',
        'Later, rewrite it with TanStack Query and compare.',
      ],
      solution: code`
        import { useEffect, useState } from 'react';

        interface GitHubUser {
          login: string;
          name: string | null;
          avatar_url: string;
        }

        export function GitHubProfile({ username }: { username: string }) {
          const [user, setUser] = useState<GitHubUser | null>(null);
          const [error, setError] = useState<string | null>(null);
          const [loading, setLoading] = useState(true);

          useEffect(() => {
            let ignore = false;
            setLoading(true);
            setError(null);

            fetch(\`https://api.github.com/users/\${username}\`)
              .then((res) => {
                if (!res.ok) throw new Error('User not found');
                return res.json();
              })
              .then((data: GitHubUser) => {
                if (!ignore) setUser(data);
              })
              .catch((err: Error) => {
                if (!ignore) setError(err.message);
              })
              .finally(() => {
                if (!ignore) setLoading(false);
              });

            return () => {
              ignore = true;
            };
          }, [username]);

          if (loading) return <p>Loading…</p>;
          if (error) return <p>{error}</p>;
          if (!user) return null;

          return (
            <figure>
              <img src={user.avatar_url} alt="" width={80} />
              <figcaption>{user.name ?? user.login}</figcaption>
            </figure>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w5-l1-q1',
        question: 'Does `fetch` reject its promise on a 404 response?',
        options: ['Yes, just like HttpClient', 'No, you must check res.ok', 'Only in development', 'Only for POST requests'],
        answer: 1,
        explanation: 'fetch only rejects on network failures. HTTP error statuses resolve normally.',
      },
      {
        id: 'w5-l1-q2',
        question: 'What does TanStack Query add over a plain fetch inside useEffect?',
        options: ['JSX support', 'Caching, deduplication, retries and refetching', 'Server-side rendering', 'Routing'],
        answer: 1,
        explanation: 'TanStack Query manages server state: caching, background refetching, retries and more.',
      },
    ],
  },
  {
    slug: 'react-router',
    week: 5,
    day: 2,
    track: 'react',
    title: 'Routing with React Router',
    summary: 'Routes, outlets, links and params, mapped one-to-one from the Angular Router.',
    minutes: 45,
    angular: 'Angular Router',
    analogy: {
      title: 'A shopping mall directory',
      body: 'The router is the mall directory. The URL is the store name you look up, and the directory tells you which shop (component) to show. Layout routes are the corridors: the same floor and signs, with different shops opening off them through the Outlet.',
    },
    body: [
      'Angular ships a router with the framework. React does not, so you add one. For single-page apps the usual choice is **React Router**; in Next.js, routing is built in and based on folders. The concepts map closely to what you already know.',
      "Routes are an array of objects with a `path` and a `Component` (or `element`), like Angular's `Routes`. Nested routes render inside the parent's `<Outlet />`, the equivalent of `<router-outlet>`. `<Link to=\"/about\">` replaces `routerLink`, and `useNavigate()` replaces `router.navigate()`.",
      'Route parameters come from `useParams()` instead of `ActivatedRoute`. React Router also supports loaders and actions that run before a route renders, which play the role of resolvers.',
    ],
    compare: {
      angular: code`
        export const routes: Routes = [
          {
            path: '',
            component: ShellComponent,
            children: [
              { path: '', component: HomeComponent },
              { path: 'products/:id', component: ProductComponent },
              { path: '**', component: NotFoundComponent },
            ],
          },
        ];

        @Component({
          selector: 'app-product',
          imports: [RouterLink],
          template: \`<h1>Product {{ id }}</h1> <a routerLink="/">Back</a>\`,
        })
        export class ProductComponent {
          id = inject(ActivatedRoute).snapshot.paramMap.get('id');
        }
      `,
      react: code`
        import { createBrowserRouter, Link, Outlet, RouterProvider, useParams } from 'react-router';

        function Shell() {
          return (
            <>
              <nav><Link to="/">Home</Link></nav>
              <Outlet />
            </>
          );
        }

        function Product() {
          const { id } = useParams();
          return <h1>Product {id}</h1>;
        }

        const router = createBrowserRouter([
          {
            path: '/',
            Component: Shell,
            children: [
              { index: true, Component: Home },
              { path: 'products/:id', Component: Product },
              { path: '*', Component: NotFound },
            ],
          },
        ]);

        export default function App() {
          return <RouterProvider router={router} />;
        }
      `,
    },
    keyPoints: [
      'React Router is a library; Next.js has routing built in.',
      '`<Outlet />` is `<router-outlet>`, and `<Link to>` is `routerLink`.',
      '`useParams()` and `useNavigate()` replace ActivatedRoute and Router.',
      'Loaders and actions work like resolvers and form handlers.',
    ],
    pitfall: 'A plain `<a href>` reloads the whole page and loses state. Use `<Link>` for internal navigation.',
    card: {
      term: 'Router',
      definition: 'A library that maps URLs to components and swaps them without reloading the page.',
      analogy: 'A mall directory: look up a store name (the URL) to find the shop, while the corridors (layouts) stay the same.',
      remember: 'Link to navigate, Outlet to render children.',
    },
    exercise: {
      title: 'Mini docs site',
      difficulty: 'medium',
      task: 'Create a router with a layout, a home page, a `/docs/:topic` page that shows the topic from the URL, and a catch-all not-found page. Add a button that navigates home programmatically.',
      requirements: ['Nested routes rendered through `<Outlet />`', '`useParams` reads the topic', '`useNavigate` powers the button'],
      hints: [
        'Use `{ index: true, Component: Home }` for the home page.',
        "`const { topic } = useParams()`",
        "`const navigate = useNavigate(); navigate('/')`",
      ],
      solution: code`
        import { createBrowserRouter, Link, Outlet, RouterProvider, useNavigate, useParams } from 'react-router';

        function Layout() {
          return (
            <div>
              <nav>
                <Link to="/">Home</Link>
                <Link to="/docs/hooks">Hooks</Link>
                <Link to="/docs/routing">Routing</Link>
              </nav>
              <Outlet />
            </div>
          );
        }

        function Home() {
          return <h1>Welcome to the docs</h1>;
        }

        function Topic() {
          const { topic } = useParams();
          const navigate = useNavigate();

          return (
            <article>
              <h1>{topic}</h1>
              <button onClick={() => navigate('/')}>Back home</button>
            </article>
          );
        }

        const router = createBrowserRouter([
          {
            path: '/',
            Component: Layout,
            children: [
              { index: true, Component: Home },
              { path: 'docs/:topic', Component: Topic },
              { path: '*', element: <h1>Page not found</h1> },
            ],
          },
        ]);

        export default function App() {
          return <RouterProvider router={router} />;
        }
      `,
    },
    quiz: [
      {
        id: 'w5-l2-q1',
        question: 'What renders the matched child route in React Router?',
        options: ['<router-outlet>', '<Outlet />', '<Children />', '<RouteView />'],
        answer: 1,
        explanation: 'A parent route renders `<Outlet />` where its matched child should appear.',
      },
      {
        id: 'w5-l2-q2',
        question: 'Which hook reads `:id` from the route `/products/:id`?',
        options: ['useLocation', 'useParams', 'useSearchParams', 'useRoute'],
        answer: 1,
        explanation: 'useParams returns an object with the dynamic segments of the current URL.',
      },
    ],
  },
  {
    slug: 'actions-and-forms',
    week: 5,
    day: 3,
    track: 'react',
    title: 'React 19 Actions for async forms',
    summary: 'Pending states, errors and optimistic updates, without writing the boilerplate yourself.',
    minutes: 55,
    angular: 'Submit handlers + loading signals',
    analogy: {
      title: 'A restaurant pager',
      body: 'At a busy counter you get a pager. While it is quiet, you know your order is being prepared (pending). When it buzzes, you collect the result: your food, or news of a problem. useActionState is that pager for your form. useOptimistic is setting the table before the food arrives, because you are confident it is coming.',
    },
    body: [
      'React 19 introduced **Actions**: functions, often async, that handle a transition such as a form submission. Pass one to `<form action={...}>`, and React calls it with the `FormData`, tracks the pending state and resets the form when it succeeds.',
      '`useActionState(action, initialState)` returns `[state, formAction, isPending]`. Your action receives the previous state and the form data and returns the next state, such as an error message. This replaces hand-written loading and error state for most forms.',
      '`useOptimistic` shows the expected result immediately, for example a new comment, and reverts automatically when the action finishes. `useFormStatus` lets a nested submit button read whether its form is pending. In Next.js, the same pattern calls Server Actions.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-newsletter',
          imports: [FormsModule],
          template: \`
            <form (ngSubmit)="submit()">
              <input name="email" [(ngModel)]="email" />
              <button [disabled]="pending()">
                {{ pending() ? 'Joining…' : 'Join' }}
              </button>
              @if (error()) { <p>{{ error() }}</p> }
            </form>
          \`,
        })
        export class NewsletterComponent {
          email = '';
          pending = signal(false);
          error = signal<string | null>(null);

          async submit() {
            this.pending.set(true);
            this.error.set(await subscribe(this.email));
            this.pending.set(false);
          }
        }
      `,
      react: code`
        import { useActionState } from 'react';

        async function join(_previous: string | null, formData: FormData) {
          const email = String(formData.get('email'));
          return await subscribe(email); // an error message or null
        }

        export function Newsletter() {
          const [error, formAction, isPending] = useActionState(join, null);

          return (
            <form action={formAction}>
              <input name="email" />
              <button disabled={isPending}>{isPending ? 'Joining…' : 'Join'}</button>
              {error && <p>{error}</p>}
            </form>
          );
        }
      `,
    },
    keyPoints: [
      '`<form action={fn}>` calls your function with FormData.',
      '`useActionState` returns the state, a wrapped action and `isPending`.',
      '`useOptimistic` shows an expected result instantly.',
      '`useFormStatus` gives nested buttons the pending state.',
    ],
    pitfall:
      '`useFormStatus` only works in a component rendered inside the `<form>`. Called in the component that renders the form, it always reports "not pending".',
    card: {
      term: 'Action',
      definition: 'A function, often async, passed to a form or transition. React tracks its pending state and result.',
      analogy: 'A restaurant pager: quiet while your order is prepared, and it buzzes when the result is ready.',
      remember: 'action={fn} plus useActionState means forms without boilerplate.',
    },
    exercise: {
      title: 'Comment box with optimistic UI',
      difficulty: 'hard',
      task: 'Build a comment list with a form. New comments appear instantly with a "Sending…" label using `useOptimistic`, while a fake `saveComment` waits one second.',
      requirements: ['The form uses `action`, not onSubmit', '`useOptimistic` adds the pending comment', 'Pending comments are visibly marked'],
      hints: [
        '`useOptimistic(comments, (current, text) => [...current, { ...pending }])`',
        'Call `addOptimistic(text)` before awaiting the save.',
        'After saving, update the real state with `setComments`.',
      ],
      solution: code`
        import { useOptimistic, useState } from 'react';

        interface Comment {
          id: number;
          text: string;
          sending?: boolean;
        }

        async function saveComment(text: string): Promise<Comment> {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return { id: Date.now(), text };
        }

        export function Comments() {
          const [comments, setComments] = useState<Comment[]>([]);
          const [optimistic, addOptimistic] = useOptimistic(
            comments,
            (current, text: string) => [...current, { id: -Date.now(), text, sending: true }],
          );

          async function submit(formData: FormData) {
            const text = String(formData.get('text'));
            addOptimistic(text);
            const saved = await saveComment(text);
            setComments((current) => [...current, saved]);
          }

          return (
            <>
              <ul>
                {optimistic.map((comment) => (
                  <li key={comment.id}>
                    {comment.text} {comment.sending && <small>Sending…</small>}
                  </li>
                ))}
              </ul>
              <form action={submit}>
                <input name="text" required />
                <button>Post</button>
              </form>
            </>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w5-l3-q1',
        question: 'What does `useActionState` return?',
        options: ['[value, setValue]', '[state, formAction, isPending]', '{ data, error, loading }', '[dispatch, state]'],
        answer: 1,
        explanation: 'You get the latest state, an action to pass to the form, and a pending flag.',
      },
      {
        id: 'w5-l3-q2',
        question: 'Which hook shows a result immediately, before the async work finishes?',
        options: ['useTransition', 'useOptimistic', 'useDeferredValue', 'useFormStatus'],
        answer: 1,
        explanation: 'useOptimistic renders an expected state while the action is in progress.',
      },
    ],
  },
  {
    slug: 'suspense-and-error-boundaries',
    week: 5,
    day: 4,
    track: 'react',
    title: 'Suspense and error boundaries',
    summary: 'Declarative loading and failure states: the React take on @defer and graceful error handling.',
    minutes: 45,
    angular: '@defer / ErrorHandler',
    analogy: {
      title: 'An intermission sign and a safety net',
      body: 'Suspense is the intermission sign the audience sees while the crew prepares the next scene. An error boundary is the safety net under a trapeze: if one act falls, that act stops and the rest of the show goes on.',
    },
    body: [
      "`<Suspense fallback={...}>` shows a fallback while something inside is not ready: a lazily loaded component, data read with `use(promise)`, or a Suspense-enabled library. It is close to Angular's `@defer` with `@loading`, but it is driven by code and data loading rather than triggers such as `on viewport`.",
      "`lazy(() => import('./Chart'))` splits a component into its own bundle, like `loadComponent` in Angular routes. Wrap it in Suspense to show a fallback while the chunk downloads.",
      "**Error boundaries** catch rendering errors in their subtree and show a fallback instead of crashing the whole app. React still needs a class component to create one, so most teams use the small `react-error-boundary` package. Angular's global `ErrorHandler` logs errors but cannot swap one broken widget for a fallback.",
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-dashboard',
          imports: [HeavyChartComponent],
          template: \`
            @defer (on viewport) {
              <app-heavy-chart />
            } @loading (minimum 300ms) {
              <p>Loading chart…</p>
            } @placeholder {
              <div class="chart-placeholder"></div>
            } @error {
              <p>Chart failed to load</p>
            }
          \`,
        })
        export class DashboardComponent {}
      `,
      react: code`
        import { lazy, Suspense } from 'react';
        import { ErrorBoundary } from 'react-error-boundary';

        const HeavyChart = lazy(() => import('./HeavyChart'));

        export function Dashboard() {
          return (
            <ErrorBoundary fallback={<p>Chart failed to load</p>}>
              <Suspense fallback={<p>Loading chart…</p>}>
                <HeavyChart />
              </Suspense>
            </ErrorBoundary>
          );
        }
      `,
    },
    keyPoints: [
      '`<Suspense fallback>` shows a placeholder while children load code or data.',
      '`lazy()` with a dynamic `import()` splits code, like `loadComponent`.',
      'Error boundaries catch render errors and show a fallback for that subtree.',
      'Wrap independent sections so one failure does not break the page.',
    ],
    pitfall:
      'Error boundaries do not catch errors in event handlers or in async code outside rendering. Handle those with try/catch and state.',
    card: {
      term: 'Suspense',
      definition: 'A component that shows a fallback while something inside it is still loading code or data.',
      analogy: 'An intermission sign: the audience sees a friendly notice while the crew prepares the next scene.',
      remember: 'Suspense for waiting, error boundaries for failing.',
    },
    exercise: {
      title: 'Resilient dashboard',
      difficulty: 'medium',
      task: 'Build a dashboard with two widgets. One is lazy-loaded behind Suspense; the other throws during render after a "Break" button is clicked. The rest of the page must keep working.',
      requirements: ['`lazy` and `Suspense` for one widget', 'An error boundary around each widget', 'The error fallback offers a retry button'],
      hints: [
        'Install the package: `npm install react-error-boundary`.',
        'Use `fallbackRender` to get access to `resetErrorBoundary`.',
        'Store `broken` in state and throw when it is true.',
      ],
      solution: code`
        import { lazy, Suspense, useState } from 'react';
        import { ErrorBoundary } from 'react-error-boundary';

        const Stats = lazy(() => import('./Stats'));

        function Weather() {
          const [broken, setBroken] = useState(false);
          if (broken) throw new Error('Weather service crashed');

          return (
            <section>
              <p>Sunny, 24°C</p>
              <button onClick={() => setBroken(true)}>Break</button>
            </section>
          );
        }

        export function Dashboard() {
          return (
            <main>
              <ErrorBoundary
                fallbackRender={({ resetErrorBoundary }) => (
                  <p>
                    Weather is unavailable. <button onClick={resetErrorBoundary}>Retry</button>
                  </p>
                )}
              >
                <Weather />
              </ErrorBoundary>

              <ErrorBoundary fallback={<p>Stats failed to load</p>}>
                <Suspense fallback={<p>Loading stats…</p>}>
                  <Stats />
                </Suspense>
              </ErrorBoundary>
            </main>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w5-l4-q1',
        question: 'Which Angular feature is closest to <Suspense> combined with lazy()?',
        options: ['@if', '@defer with @loading', 'ngOnInit', 'HttpInterceptor'],
        answer: 1,
        explanation: 'Both show a loading state while a separately bundled piece of UI is fetched.',
      },
      {
        id: 'w5-l4-q2',
        question: 'Which error will an error boundary NOT catch?',
        options: [
          'An error thrown while rendering a child',
          "An error in a lazy component's render",
          'An error thrown inside an onClick handler',
          "An error in a deeply nested component's render",
        ],
        answer: 2,
        explanation: 'Event handlers run outside rendering, so boundaries do not see their errors.',
      },
    ],
  },
]
