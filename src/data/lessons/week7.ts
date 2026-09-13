import { code } from '../../lib/utils'
import type { Lesson } from '../types'

export const week7: Lesson[] = [
  {
    slug: 'server-data-fetching',
    week: 7,
    day: 1,
    track: 'next',
    title: 'Fetching and caching on the server',
    summary: 'Await data directly in components. No effects, no client HTTP layer, no resolvers.',
    minutes: 55,
    angular: 'Resolvers + TransferState',
    analogy: {
      title: 'A librarian and the archive',
      body: 'A Server Component fetches like a librarian who walks to the archive for you: you never see the archive, only the book placed on the desk. Caching is the librarian keeping popular books on the desk, and revalidation is checking the archive for a newer edition on a schedule.',
    },
    body: [
      "In a Server Component, you fetch data with `async` and `await` right inside the component: no effect, no loading flag and no client HTTP library. You can call `fetch`, query a database with an ORM or read files. Angular's closest equivalent is a route resolver plus `TransferState` to avoid refetching in the browser; in Next.js this is simply the default.",
      'Next.js does not cache `fetch` results by default. Whether a page is prerendered or rendered per request depends on what it uses and on your cache settings. You can cache a request for a period with `{ next: { revalidate: 3600 } }`, or cache whole functions and components with the `\'use cache\'` directive when Cache Components are enabled.',
      'Fetch in parallel when requests are independent: start them together and `await Promise.all(...)`. Wrap slow parts of the page in `<Suspense>` so the rest streams to the browser first.',
    ],
    compare: {
      angular: code`
        export const courseResolver: ResolveFn<Course> = (route) =>
          inject(HttpClient).get<Course>(\`/api/courses/\${route.paramMap.get('id')}\`);

        // { path: 'courses/:id', component: CourseComponent, resolve: { course: courseResolver } }

        @Component({
          selector: 'app-course',
          template: \`<h1>{{ course().title }}</h1>\`,
        })
        export class CourseComponent {
          course = input.required<Course>(); // provided by the resolver
        }
      `,
      react: code`
        // app/courses/[id]/page.tsx
        async function getCourse(id: string): Promise<Course> {
          const res = await fetch(\`https://api.example.com/courses/\${id}\`, {
            next: { revalidate: 3600 }, // cache for one hour
          });
          if (!res.ok) throw new Error('Course not found');
          return res.json();
        }

        export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
          const { id } = await params;
          const [course, reviews] = await Promise.all([getCourse(id), getReviews(id)]);

          return (
            <>
              <h1>{course.title}</h1>
              <p>{reviews.length} reviews</p>
            </>
          );
        }
      `,
    },
    keyPoints: [
      'Server Components fetch with `await`, with no effects or client HTTP libraries.',
      'Database queries and secrets stay on the server.',
      "`fetch` is not cached by default. Opt in with `revalidate` or `'use cache'`.",
      'Use `Promise.all` for independent requests and Suspense for slow sections.',
    ],
    pitfall:
      'Awaiting independent requests one after another creates a waterfall, where the second waits for the first. Start them together with `Promise.all`.',
    card: {
      term: 'Server-side data fetching',
      definition: 'Loading data inside an async Server Component, so the HTML reaches the browser with the data already in it.',
      analogy: 'A librarian who fetches books from the archive: you only see the book on the desk, and popular ones stay there (the cache).',
      remember: 'Await in the component. Cache on purpose.',
    },
    exercise: {
      title: 'Parallel dashboard',
      difficulty: 'medium',
      task: 'Build a dashboard page that loads user stats, recent orders and notifications from three simulated async functions. Load the first two in parallel, and stream the slow notifications in their own Suspense boundary.',
      requirements: [
        'Stats and orders loaded with `Promise.all`',
        'Notifications in their own async component inside Suspense',
        "No 'use client' anywhere",
      ],
      hints: [
        'An async component can await its own data.',
        '`<Suspense fallback={<p>Loading…</p>}><Notifications /></Suspense>`',
        'Give notifications a three-second delay to see streaming in action.',
      ],
      solution: code`
        // app/dashboard/page.tsx
        import { Suspense } from 'react';

        const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        async function getStats() {
          await wait(500);
          return { students: 42, lessons: 32 };
        }

        async function getOrders() {
          await wait(700);
          return ['Course bundle', 'Workshop ticket'];
        }

        async function Notifications() {
          await wait(3000);
          const items = ['New review', 'Payment received'];
          return (
            <ul>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        export default async function DashboardPage() {
          const [stats, orders] = await Promise.all([getStats(), getOrders()]);

          return (
            <main>
              <p>{stats.students} students, {stats.lessons} lessons</p>
              <p>{orders.length} recent orders</p>
              <Suspense fallback={<p>Loading notifications…</p>}>
                <Notifications />
              </Suspense>
            </main>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w7-l1-q1',
        question: 'How do you load data in a Server Component?',
        options: ['useEffect with fetch', 'Await it directly inside the async component', 'Inject HttpClient', 'Only through API routes'],
        answer: 1,
        explanation: 'Server Components can be async, so you simply await the data.',
      },
      {
        id: 'w7-l1-q2',
        question: 'What is the problem with this code?',
        code: code`
          const user = await getUser(id);
          const posts = await getPosts(id);
        `,
        options: [
          'Nothing',
          'It creates a waterfall: the independent requests could run in parallel',
          'await is not allowed in components',
          'getPosts runs twice',
        ],
        answer: 1,
        explanation: 'The second request waits for the first. Use `Promise.all([getUser(id), getPosts(id)])`.',
      },
    ],
  },
  {
    slug: 'server-actions',
    week: 7,
    day: 2,
    track: 'next',
    title: 'Server Actions: mutations without an API layer',
    summary: 'Call server code straight from a form. Validate, write, revalidate.',
    minutes: 55,
    angular: 'HttpClient.post + backend endpoint',
    analogy: {
      title: "A mail slot to the manager's office",
      body: "A Server Action is a mail slot in the wall that leads straight to the manager's office. You drop in your form, and it is handled in the back room. There is no need to build a separate reception desk (an API endpoint) for every kind of request.",
    },
    body: [
      "A **Server Action** is an async function marked with `'use server'`. It runs on the server but can be called from the client, most often by passing it to `<form action={...}>`. Next.js creates the endpoint for you, so you do not write an API route and a fetch call for every mutation.",
      'The action receives `FormData`, validates it (for example with Zod), writes to the database and then updates the UI. Call `revalidatePath(\'/guestbook\')` to refresh the cached data of a page, or `redirect()` to navigate. Forms that use Server Actions even work before JavaScript has loaded.',
      'Combine actions with `useActionState` for error messages and pending states, exactly as in week 5. Treat every Server Action as a public endpoint: check authentication and validate input every time.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-guestbook-form',
          imports: [ReactiveFormsModule],
          template: \`
            <form [formGroup]="form" (ngSubmit)="submit()">
              <input formControlName="message" />
              <button>Sign</button>
            </form>
          \`,
        })
        export class GuestbookFormComponent {
          private http = inject(HttpClient);
          form = new FormGroup({ message: new FormControl('') });

          submit() {
            this.http.post('/api/messages', this.form.value).subscribe();
          }
        }
        // ...plus a backend endpoint for POST /api/messages
      `,
      react: code`
        // app/guestbook/actions.ts
        'use server';

        import { revalidatePath } from 'next/cache';
        import { db } from '@/lib/db';

        export async function signGuestbook(formData: FormData) {
          const message = String(formData.get('message') ?? '').trim();
          if (!message) return;

          await db.message.create({ data: { message } });
          revalidatePath('/guestbook');
        }

        // app/guestbook/page.tsx
        import { signGuestbook } from './actions';

        export default function GuestbookPage() {
          return (
            <form action={signGuestbook}>
              <input name="message" />
              <button>Sign</button>
            </form>
          );
        }
      `,
    },
    keyPoints: [
      "`'use server'` marks functions that run on the server and can be called from forms.",
      'No manual API route or fetch call is needed for mutations.',
      'Use `revalidatePath` or `revalidateTag` to refresh data, and `redirect` to navigate.',
      'Validate input and check permissions inside every action.',
    ],
    pitfall:
      'Server Actions are HTTP endpoints under the hood. Hiding a button does not protect them, so check the session inside the action.',
    card: {
      term: 'Server Action',
      definition: "An async function marked 'use server' that runs on the server and can be called directly from forms and Client Components.",
      analogy: "A mail slot to the manager's office: drop in the form, and it is handled in the back room.",
      remember: 'Validate, mutate, revalidate.',
    },
    exercise: {
      title: 'Guestbook with validation',
      difficulty: 'hard',
      task: 'List guestbook messages in a Server Component and add new ones with a Server Action. Use `useActionState` in a small Client Component to show validation errors and a pending state.',
      requirements: [
        'The action accepts 2 to 140 characters',
        'It returns an error message instead of throwing',
        'The page is revalidated after a successful insert',
      ],
      hints: [
        'With useActionState the action signature is `(previousState, formData)`.',
        'Keep messages in a module-level array to simulate a database.',
        'Use `isPending` to disable the button.',
      ],
      solution: code`
        // app/guestbook/actions.ts
        'use server';

        import { revalidatePath } from 'next/cache';
        import { messages } from './store';

        export async function addMessage(_previous: string | null, formData: FormData) {
          const text = String(formData.get('text') ?? '').trim();
          if (text.length < 2 || text.length > 140) {
            return 'Messages must be between 2 and 140 characters.';
          }

          messages.push({ id: Date.now(), text });
          revalidatePath('/guestbook');
          return null;
        }

        // app/guestbook/message-form.tsx
        'use client';

        import { useActionState } from 'react';
        import { addMessage } from './actions';

        export function MessageForm() {
          const [error, formAction, isPending] = useActionState(addMessage, null);

          return (
            <form action={formAction}>
              <input name="text" />
              <button disabled={isPending}>{isPending ? 'Saving…' : 'Sign'}</button>
              {error && <p role="alert">{error}</p>}
            </form>
          );
        }

        // app/guestbook/page.tsx
        import { MessageForm } from './message-form';
        import { messages } from './store';

        export default function GuestbookPage() {
          return (
            <main>
              <MessageForm />
              <ul>
                {messages.map((message) => (
                  <li key={message.id}>{message.text}</li>
                ))}
              </ul>
            </main>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w7-l2-q1',
        question: 'Which directive marks a Server Action?',
        options: ["'use client'", "'use server'", "'use action'", '@Server()'],
        answer: 1,
        explanation: "`'use server'` at the top of a file or function marks it as callable server code.",
      },
      {
        id: 'w7-l2-q2',
        question: 'After a Server Action inserts a message, how do you refresh the page data?',
        options: [
          'window.location.reload()',
          "revalidatePath('/guestbook')",
          'Re-import the page component',
          'Nothing is needed, pages never cache',
        ],
        answer: 1,
        explanation: 'revalidatePath marks the cached data for that route as stale so it renders fresh data.',
      },
    ],
  },
  {
    slug: 'route-handlers',
    week: 7,
    day: 3,
    track: 'next',
    title: 'Route Handlers: APIs inside your app',
    summary: 'Export GET and POST from route.ts. A small backend, living next to your UI.',
    minutes: 40,
    angular: 'Separate backend (NestJS, Express)',
    analogy: {
      title: 'A drive-through window',
      body: 'Pages are the dining room, where guests sit down for the full experience. A Route Handler is the drive-through window: no tables and no decoration, just a direct exchange of an order for a package, a request for a response.',
    },
    body: [
      'Route Handlers let you build HTTP endpoints inside a Next.js app. Create a `route.ts` file and export functions named after HTTP methods: `GET`, `POST`, `PUT`, `DELETE`. They use the standard Web `Request` and `Response` APIs.',
      'An Angular app usually talks to a separate backend written with NestJS, Express or another framework. With Route Handlers, simple endpoints can live next to your UI: webhooks, a public JSON feed, or an endpoint for a mobile app.',
      'You do not need a Route Handler to load data for your own pages. Server Components can query the data source directly, and Server Actions handle mutations. Use Route Handlers when something **outside** your React UI needs to call your server.',
    ],
    compare: {
      angularLabel: 'courses.controller.ts (NestJS)',
      reactLabel: 'app/api/courses/route.ts',
      angular: code`
        // A controller in a separate NestJS backend
        @Controller('api/courses')
        export class CoursesController {
          constructor(private readonly courses: CoursesService) {}

          @Get()
          findAll(@Query('level') level?: string) {
            return this.courses.findAll(level);
          }

          @Post()
          create(@Body() dto: CreateCourseDto) {
            return this.courses.create(dto);
          }
        }
      `,
      react: code`
        import { NextResponse, type NextRequest } from 'next/server';
        import { db } from '@/lib/db';

        export async function GET(request: NextRequest) {
          const level = request.nextUrl.searchParams.get('level') ?? undefined;
          const courses = await db.course.findMany({ where: { level } });
          return NextResponse.json(courses);
        }

        export async function POST(request: Request) {
          const body = await request.json();
          const course = await db.course.create({ data: body });
          return NextResponse.json(course, { status: 201 });
        }
      `,
    },
    keyPoints: [
      '`route.ts` exports functions named after HTTP methods.',
      'Handlers use the standard Web Request and Response objects.',
      'Dynamic segments work the same way: `app/api/courses/[id]/route.ts`.',
      'Use them for external consumers; your pages should query data directly.',
    ],
    pitfall:
      'Calling your own Route Handler with fetch from a Server Component adds a pointless network hop. Call the underlying data function directly.',
    card: {
      term: 'Route Handler',
      definition: 'A route.ts file that exports GET, POST and other functions to create HTTP endpoints inside a Next.js app.',
      analogy: 'A drive-through window: no dining room, just a direct exchange of a request for a response.',
      remember: 'route.ts for outside callers, Server Components for your own pages.',
    },
    exercise: {
      title: 'Quotes API',
      difficulty: 'medium',
      task: 'Create `GET /api/quotes`, which returns all quotes as JSON and supports `?author=` filtering, and `GET /api/quotes/[id]`, which returns one quote or a 404.',
      requirements: ['Two `route.ts` files', 'Filtering by query parameter', 'A 404 status for unknown ids'],
      hints: [
        'Read query parameters with `request.nextUrl.searchParams`.',
        "The handler's second argument contains `params`, which is a promise.",
        "`NextResponse.json({ error: 'Not found' }, { status: 404 })`",
      ],
      solution: code`
        // app/api/quotes/data.ts
        export const quotes = [
          { id: '1', author: 'Ana', text: 'Components are just functions.' },
          { id: '2', author: 'Luka', text: 'Keep state as low as you can.' },
        ];

        // app/api/quotes/route.ts
        import { NextResponse, type NextRequest } from 'next/server';
        import { quotes } from './data';

        export function GET(request: NextRequest) {
          const author = request.nextUrl.searchParams.get('author');
          const result = author ? quotes.filter((q) => q.author === author) : quotes;
          return NextResponse.json(result);
        }

        // app/api/quotes/[id]/route.ts
        import { NextResponse } from 'next/server';
        import { quotes } from '../data';

        export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
          const { id } = await params;
          const quote = quotes.find((q) => q.id === id);

          if (!quote) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
          }
          return NextResponse.json(quote);
        }
      `,
    },
    quiz: [
      {
        id: 'w7-l3-q1',
        question: 'Which file creates an endpoint at `/api/health`?',
        options: ['app/api/health/page.tsx', 'app/api/health/route.ts', 'app/api/health.tsx', 'app/health.api.ts'],
        answer: 1,
        explanation: 'A `route.ts` file inside the folder turns that path into an HTTP endpoint.',
      },
      {
        id: 'w7-l3-q2',
        question: 'A Server Component needs the course list. What is the recommended approach?',
        options: [
          "fetch('/api/courses') from the Server Component",
          'Query the data source directly in the Server Component',
          'Load it in useEffect',
          'Call a Server Action on mount',
        ],
        answer: 1,
        explanation: 'Server Components already run on the server, so they can read the data without an HTTP hop.',
      },
    ],
  },
  {
    slug: 'rendering-strategies',
    week: 7,
    day: 4,
    track: 'next',
    title: 'Static, dynamic and streaming',
    summary: 'Prerender what you can, render per request what you must, and stream the slow parts.',
    minutes: 50,
    angular: 'RenderMode: Prerender / Server / Client',
    analogy: {
      title: 'A newspaper and a personal letter',
      body: 'Static rendering prints the morning newspaper once and hands the same copy to everyone. Dynamic rendering writes a personal letter for each reader. Revalidation reprints the newspaper every hour, and streaming mails the letter page by page as each page is finished.',
    },
    body: [
      "Next.js decides per route how to render. **Static** routes are rendered at build time, or in the background during revalidation, and served from a cache, like Angular's `RenderMode.Prerender`. **Dynamic** routes render on every request, like `RenderMode.Server`, which is needed when the output depends on cookies, headers or search params.",
      'Request-specific APIs such as `cookies()`, `headers()` or `searchParams` make a route dynamic. Caching settings keep content static but fresh: `revalidate` refreshes it on a schedule, and `revalidatePath` or `revalidateTag` refresh it on demand after a change.',
      '**Streaming** sends HTML in chunks. The shell and fast content arrive first, and slow parts inside `<Suspense>` or covered by `loading.tsx` fill in when ready. Angular\'s incremental hydration with `@defer` tackles a related problem.',
    ],
    compare: {
      angularLabel: 'app.routes.server.ts',
      angular: code`
        export const serverRoutes: ServerRoute[] = [
          { path: '', renderMode: RenderMode.Prerender },
          {
            path: 'courses/:slug',
            renderMode: RenderMode.Prerender,
            getPrerenderParams: async () => [{ slug: 'react' }, { slug: 'next' }],
          },
          { path: 'dashboard', renderMode: RenderMode.Server },
          { path: '**', renderMode: RenderMode.Client },
        ];
      `,
      react: code`
        // app/courses/[slug]/page.tsx: prerendered at build time
        export function generateStaticParams() {
          return [{ slug: 'react' }, { slug: 'next' }];
        }

        // app/dashboard/page.tsx: dynamic, reads cookies per request
        import { cookies } from 'next/headers';

        export default async function Dashboard() {
          const session = (await cookies()).get('session');
          return <h1>{session ? 'Welcome back' : 'Please sign in'}</h1>;
        }

        // app/news/page.tsx: static, refreshed at most every 10 minutes
        export const revalidate = 600;
      `,
    },
    keyPoints: [
      'Static routes render ahead of time and are served from a cache.',
      'Using cookies, headers or searchParams makes a route dynamic.',
      '`revalidate` and on-demand revalidation keep static content fresh.',
      'Streaming sends the page in chunks as Suspense boundaries resolve.',
    ],
    pitfall:
      'Reading `cookies()` in the root layout makes every page dynamic. Keep request-specific logic as deep in the tree as possible.',
    card: {
      term: 'Static vs dynamic rendering',
      definition: 'Static routes are rendered ahead of time and reused; dynamic routes are rendered for each request.',
      analogy: 'A newspaper and a personal letter: the paper is printed once for everyone, the letter is written for each reader.',
      remember: 'Static by default, dynamic when the request matters.',
    },
    exercise: {
      title: 'Pick the strategy',
      difficulty: 'easy',
      task: 'Build three pages with the right strategy for each: a static pricing page, a blog index refreshed every hour, and an account page that greets the user from a cookie. Check the route summary printed by `next build`.',
      requirements: ['The pricing page uses no dynamic APIs', 'The blog uses `revalidate = 3600`', 'The account page reads `cookies()`'],
      hints: [
        '`next build` prints a legend marking static and dynamic routes.',
        'Add `export const revalidate = 3600` to the blog page file.',
        "`(await cookies()).get('name')?.value`",
      ],
      solution: code`
        // app/pricing/page.tsx: static
        export default function PricingPage() {
          return <h1>Plans start at 19 USD per month</h1>;
        }

        // app/blog/page.tsx: regenerated at most once per hour
        export const revalidate = 3600;

        export default async function BlogPage() {
          const res = await fetch('https://api.example.com/posts');
          const posts: { id: number; title: string }[] = await res.json();

          return (
            <ul>
              {posts.map((post) => (
                <li key={post.id}>{post.title}</li>
              ))}
            </ul>
          );
        }

        // app/account/page.tsx: dynamic
        import { cookies } from 'next/headers';

        export default async function AccountPage() {
          const name = (await cookies()).get('name')?.value ?? 'guest';
          return <h1>Hello, {name}</h1>;
        }
      `,
    },
    quiz: [
      {
        id: 'w7-l4-q1',
        question: 'Which API makes a route dynamic?',
        options: ['generateStaticParams', 'cookies()', 'next/image', 'export const revalidate = 60'],
        answer: 1,
        explanation: 'Cookies are specific to each request, so the route must render per request.',
      },
      {
        id: 'w7-l4-q2',
        question: 'What is the Angular counterpart of static rendering in Next.js?',
        options: ['RenderMode.Client', 'RenderMode.Prerender', 'zone.js', 'provideHttpClient()'],
        answer: 1,
        explanation: 'Both generate HTML ahead of time and serve it without rendering per request.',
      },
    ],
  },
]
