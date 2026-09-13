import { code } from '../../lib/utils'
import type { Lesson } from '../types'

export const week6: Lesson[] = [
  {
    slug: 'why-nextjs',
    week: 6,
    day: 1,
    track: 'next',
    title: 'Why Next.js, and how a project is organized',
    summary: 'React is the engine. Next.js is the car: routing, rendering and tooling included.',
    minutes: 35,
    angular: 'Angular CLI + @angular/ssr',
    analogy: {
      title: 'A furnished apartment',
      body: 'React alone is an empty apartment with great bones: you choose the router, the bundler, the data layer and the server yourself. Next.js is the same apartment, already furnished by people who know the architect. Angular is furnished too, which is why Next.js will feel familiar.',
    },
    body: [
      'React is a UI library. Angular is a full framework with routing, HTTP, forms and SSR included. **Next.js** is the framework layer for React: file-based routing, server rendering, server-side data fetching, API endpoints, image and font optimization and a production build. The React team recommends starting new apps with a framework like this.',
      'Create a project with `npx create-next-app@latest`. The most important folder is `app/`: every folder is a URL segment, and special files define what the segment shows, such as `page.tsx`, `layout.tsx`, `loading.tsx` and `error.tsx`. `public/` holds static assets, and `next.config.ts` configures the build.',
      'From an Angular point of view, Next.js is the CLI, the Router and `@angular/ssr` rolled into one, driven by conventions instead of configuration. There is no `app.routes.ts` and no `main.ts`; the file system is the configuration.',
    ],
    compare: {
      angularLabel: 'Angular project',
      reactLabel: 'Next.js project',
      angular: code`
        src/
          main.ts                   // bootstrapApplication
          app/
            app.config.ts           // providers, router, http
            app.routes.ts           // route configuration
            app.component.ts        // shell with <router-outlet>
            home/home.component.ts
            about/about.component.ts
          server.ts                 // @angular/ssr
        angular.json
      `,
      react: code`
        app/
          layout.tsx                // root shell: <html>, <body>
          page.tsx                  // "/"
          about/
            page.tsx                // "/about"
          blog/
            [slug]/
              page.tsx              // "/blog/:slug"
        public/                     // static files
        next.config.ts
      `,
    },
    keyPoints: [
      'React is the UI library; Next.js is a full framework built on it.',
      'The `app/` folder defines routes through folders and special files.',
      'Server rendering, API routes and optimizations are built in.',
      'Conventions replace `app.routes.ts`, `main.ts` and SSR setup.',
    ],
    pitfall:
      'Next.js has two routers: the older `pages/` directory and the modern `app/` directory. Tutorials often mix them. This course uses the App Router only.',
    card: {
      term: 'Next.js',
      definition: 'A React framework that adds file-based routing, server rendering, data fetching and build tooling.',
      analogy: 'A furnished apartment: React is the empty apartment, and Next.js moves the furniture in.',
      remember: 'React renders the UI. Next.js runs the app.',
    },
    exercise: {
      title: 'Create and explore',
      difficulty: 'easy',
      task: 'Create a Next.js app with TypeScript and the App Router. Add an `/about` page, change the home page text, and write down which Angular file each generated file replaces.',
      requirements: [
        'Project created with create-next-app',
        '`app/about/page.tsx` renders a heading',
        'A written mapping of at least five files to Angular equivalents',
      ],
      hints: [
        'Run `npx create-next-app@latest my-course`.',
        'A page is a default-exported component in `page.tsx`.',
        'Start with `npm run dev` and open `http://localhost:3000/about`.',
      ],
      solution: code`
        // app/about/page.tsx
        export default function AboutPage() {
          return (
            <main>
              <h1>About this course</h1>
              <p>React and Next.js, taught by an Angular developer.</p>
            </main>
          );
        }

        // Mapping
        // app/layout.tsx   → app.component.ts + index.html
        // app/page.tsx     → home.component.ts + the '' route
        // app/about/       → { path: 'about' } in app.routes.ts
        // next.config.ts   → angular.json
        // npm run dev      → ng serve
      `,
    },
    quiz: [
      {
        id: 'w6-l1-q1',
        question: 'What is Next.js in relation to React?',
        options: ['A replacement for React', 'A framework built on top of React', 'A state management library', 'A CSS framework'],
        answer: 1,
        explanation: 'Next.js uses React for the UI and adds routing, rendering, data fetching and tooling.',
      },
      {
        id: 'w6-l1-q2',
        question: 'Which folder defines routes in a modern Next.js project?',
        options: ['src/routes', 'pages/ only', 'app/', 'components/'],
        answer: 2,
        explanation: 'The App Router lives in `app/`, where folders map to URL segments.',
      },
    ],
  },
  {
    slug: 'app-router',
    week: 6,
    day: 2,
    track: 'next',
    title: 'File-based routing and layouts',
    summary: 'Folders are URL segments, page.tsx is the screen and layout.tsx is the frame around it.',
    minutes: 50,
    angular: 'Routes config + children',
    analogy: {
      title: 'A filing cabinet',
      body: 'The app folder is a filing cabinet. Each drawer (folder) is a part of the URL, and the document labelled page.tsx is what visitors see. A layout is the drawer divider: it stays in place no matter which document you pull out.',
    },
    body: [
      'In the App Router, folders define URL segments, and a `page.tsx` file makes a segment reachable. `app/courses/page.tsx` renders `/courses`. A folder name in square brackets is dynamic: `app/courses/[slug]/page.tsx` matches `/courses/react-basics`.',
      '`layout.tsx` wraps every page below it and receives it as `children`, like a parent route component with a `<router-outlet>`. Layouts persist between navigations and do not re-mount, so their state survives. The root layout must render `<html>` and `<body>`.',
      'Pages receive `params` and `searchParams` as **promises**, so you `await` them in an async Server Component. Folders in parentheses such as `(marketing)` group routes without changing the URL, and `generateStaticParams` pre-renders dynamic pages at build time.',
    ],
    compare: {
      angular: code`
        export const routes: Routes = [
          {
            path: 'courses',
            component: CoursesLayoutComponent, // renders <router-outlet />
            children: [
              { path: '', component: CourseListComponent },
              { path: ':slug', component: CourseDetailComponent },
            ],
          },
        ];

        export class CourseDetailComponent {
          // bound with withComponentInputBinding()
          slug = input.required<string>();
        }
      `,
      react: code`
        // app/courses/layout.tsx
        export default function CoursesLayout({ children }: { children: React.ReactNode }) {
          return (
            <section>
              <aside>Course menu</aside>
              {children}
            </section>
          );
        }

        // app/courses/[slug]/page.tsx
        export default async function CoursePage({
          params,
        }: {
          params: Promise<{ slug: string }>;
        }) {
          const { slug } = await params;
          return <h1>Course: {slug}</h1>;
        }
      `,
    },
    keyPoints: [
      'Folders are URL segments, and `page.tsx` makes a route reachable.',
      '`[slug]` folders create dynamic segments.',
      '`layout.tsx` wraps child routes and persists across navigation.',
      '`params` is a promise, so `await` it in the page.',
    ],
    pitfall:
      'A folder without `page.tsx` is not a route. You can safely colocate `app/courses/components/Card.tsx`, but visiting `/courses/components` returns a 404.',
    card: {
      term: 'App Router',
      definition: 'Next.js routing where folders map to URL segments and special files like page.tsx and layout.tsx define the UI.',
      analogy: 'A filing cabinet: drawers are URL segments, the page is the document and the layout is the divider that stays put.',
      remember: 'Folder = segment, page = screen, layout = frame.',
    },
    exercise: {
      title: 'Course catalog routes',
      difficulty: 'medium',
      task: 'Create `/courses`, which lists three courses from an array, and `/courses/[slug]`, which shows the selected course. Add a courses layout with a sidebar and return a 404 for unknown slugs.',
      requirements: ['A dynamic `[slug]` segment', 'A shared `layout.tsx` for the section', '`notFound()` for unknown slugs'],
      hints: [
        "Import `notFound` from 'next/navigation'.",
        "Link to each course with `href={'/courses/' + course.slug}`.",
        'Add `generateStaticParams` to prerender all three courses.',
      ],
      solution: code`
        // app/courses/data.ts
        export const courses = [
          { slug: 'react-basics', title: 'React Basics' },
          { slug: 'next-fundamentals', title: 'Next.js Fundamentals' },
          { slug: 'testing', title: 'Testing React Apps' },
        ];

        // app/courses/layout.tsx
        export default function CoursesLayout({ children }: { children: React.ReactNode }) {
          return (
            <div className="courses">
              <aside>All courses</aside>
              <main>{children}</main>
            </div>
          );
        }

        // app/courses/page.tsx
        import Link from 'next/link';
        import { courses } from './data';

        export default function CoursesPage() {
          return (
            <ul>
              {courses.map((course) => (
                <li key={course.slug}>
                  <Link href={\`/courses/\${course.slug}\`}>{course.title}</Link>
                </li>
              ))}
            </ul>
          );
        }

        // app/courses/[slug]/page.tsx
        import { notFound } from 'next/navigation';
        import { courses } from '../data';

        export function generateStaticParams() {
          return courses.map(({ slug }) => ({ slug }));
        }

        export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
          const { slug } = await params;
          const course = courses.find((c) => c.slug === slug);
          if (!course) notFound();

          return <h1>{course.title}</h1>;
        }
      `,
    },
    quiz: [
      {
        id: 'w6-l2-q1',
        question: 'Which file renders the URL `/blog/hello-world`?',
        options: [
          'app/blog/hello-world.tsx',
          'app/blog/[slug]/page.tsx',
          'pages/blog/[slug]/layout.tsx',
          'app/blog/page/[slug].tsx',
        ],
        answer: 1,
        explanation: 'The `[slug]` folder matches any segment, and `page.tsx` inside it renders the page.',
      },
      {
        id: 'w6-l2-q2',
        question: "What happens to a layout's state when you navigate between two pages that share it?",
        options: [
          'It resets',
          'It persists, because layouts do not re-mount',
          'It is copied into the new page',
          'Layouts cannot have state',
        ],
        answer: 1,
        explanation: 'Shared layouts stay mounted during navigation, so their state is preserved.',
      },
    ],
  },
  {
    slug: 'server-and-client-components',
    week: 6,
    day: 3,
    track: 'next',
    title: 'Server Components and Client Components',
    summary: 'Render on the server by default. Opt into the browser only where you need interaction.',
    minutes: 60,
    angular: 'SSR + hydration',
    analogy: {
      title: 'The kitchen and a tableside grill',
      body: 'Server Components are meals cooked in the restaurant kitchen: the heavy equipment, secret recipes and pantry stay out of sight, and only the finished plate reaches the table. Client Components are a tableside grill: guests can flip and adjust things themselves, but the grill has to be carried out to the table first (shipped as JavaScript).',
    },
    body: [
      'In the App Router, components are **Server Components** by default. They run only on the server, at build time or per request. They can be `async`, read databases and secrets directly, and send only their rendered result to the browser. Their code never enters the client bundle.',
      "Components that need interactivity (state, effects, event handlers or browser APIs) must be **Client Components**. Add `'use client'` at the top of the file. It marks a boundary: that file and everything it imports join the client bundle. Client Components are still pre-rendered to HTML on the server, then hydrated in the browser.",
      "With `@angular/ssr`, the whole app renders on the server and every component also ships to the browser to hydrate. In Next.js, keep pages and data loading on the server and push `'use client'` down to small interactive leaves. Server Components can render Client Components and pass them serializable props.",
    ],
    compare: {
      angular: code`
        // With @angular/ssr, this renders on the server
        // and the component code is also shipped to the browser.
        @Component({
          selector: 'app-course-page',
          imports: [LikeButtonComponent],
          template: \`
            <h1>{{ course.value()?.title }}</h1>
            <app-like-button />
          \`,
        })
        export class CoursePageComponent {
          id = input.required<string>();
          course = httpResource<Course>(() => \`/api/courses/\${this.id()}\`);
        }
      `,
      react: code`
        // app/courses/[id]/page.tsx: a Server Component (the default)
        import { db } from '@/lib/db';
        import { LikeButton } from './like-button';

        export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
          const { id } = await params;
          const course = await db.course.findUnique({ where: { id } });

          return (
            <>
              <h1>{course?.title}</h1>
              <LikeButton />
            </>
          );
        }

        // app/courses/[id]/like-button.tsx
        'use client';

        import { useState } from 'react';

        export function LikeButton() {
          const [liked, setLiked] = useState(false);
          return <button onClick={() => setLiked(!liked)}>{liked ? 'Liked' : 'Like'}</button>;
        }
      `,
    },
    keyPoints: [
      'Components in `app/` are Server Components by default.',
      'Server Components can be async and access data and secrets directly.',
      "`'use client'` marks a boundary for state, effects, events and browser APIs.",
      'Keep client boundaries small and close to the interactive leaves.',
    ],
    pitfall:
      "Adding `'use client'` to a page or layout turns everything it imports into client code. Extract the interactive part into its own small file instead.",
    card: {
      term: 'Server Component',
      definition: 'A component that renders only on the server, can fetch data directly and ships no JavaScript to the browser.',
      analogy: 'A meal prepared in the kitchen: the equipment and recipes stay out of sight, and only the finished plate reaches the table.',
      remember: "Server by default. 'use client' only where you need interaction.",
    },
    exercise: {
      title: 'Split the boundary',
      difficulty: 'medium',
      task: 'Build a product page that loads product data on the server (simulate it with an async function) and includes an interactive quantity picker with an Add to cart button as a Client Component.',
      requirements: [
        'The page is an async Server Component',
        "Only the picker file has 'use client'",
        'The server passes serializable props to the client component',
      ],
      hints: [
        'Simulate the database with a `setTimeout` wrapped in a promise.',
        'Pass `price` and `productId` to the client component, not functions.',
        'Check the browser bundle: the loader code is not in it.',
      ],
      solution: code`
        // app/products/[id]/page.tsx
        import { QuantityPicker } from './quantity-picker';

        async function getProduct(id: string) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          return { id, name: 'Mechanical keyboard', price: 89 };
        }

        export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
          const { id } = await params;
          const product = await getProduct(id);

          return (
            <main>
              <h1>{product.name}</h1>
              <QuantityPicker productId={product.id} price={product.price} />
            </main>
          );
        }

        // app/products/[id]/quantity-picker.tsx
        'use client';

        import { useState } from 'react';

        export function QuantityPicker({ productId, price }: { productId: string; price: number }) {
          const [quantity, setQuantity] = useState(1);

          return (
            <div>
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              <button onClick={() => alert(\`Added \${quantity} of \${productId}\`)}>
                Add for {(price * quantity).toFixed(2)} USD
              </button>
            </div>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w6-l3-q1',
        question: 'What is the default component type in the Next.js App Router?',
        options: ['Client Component', 'Server Component', 'Static HTML', 'Web Component'],
        answer: 1,
        explanation: "Everything in `app/` is a Server Component unless a 'use client' boundary says otherwise.",
      },
      {
        id: 'w6-l3-q2',
        question: "Which of these requires 'use client'?",
        options: [
          'Reading a database with await',
          'Rendering static markdown',
          'A button that uses useState and onClick',
          'Reading a secret environment variable',
        ],
        answer: 2,
        explanation: 'State and event handlers run in the browser, so they need a Client Component.',
      },
    ],
  },
  {
    slug: 'navigation-loading-errors',
    week: 6,
    day: 4,
    track: 'next',
    title: 'Navigation, loading and error UI',
    summary: 'Link, useRouter, and special files that handle waiting and failing per route segment.',
    minutes: 45,
    angular: 'routerLink / Router / error pages',
    analogy: {
      title: 'A good hotel',
      body: '<Link> is a concierge who prepares your room as soon as you look at the door, so it is ready when you walk in (prefetching). loading.tsx is the lobby with a friendly sign while the room is finished. error.tsx is the front desk that handles a problem with one room without closing the whole hotel.',
    },
    body: [
      'Navigate with `<Link href="/courses">` from `next/link`. Links prefetch their destination when they appear in the viewport, so navigation feels instant. For programmatic navigation in Client Components, use `useRouter()` from `next/navigation` and call `router.push(\'/dashboard\')`. On the server, call `redirect()`.',
      "A `loading.tsx` file next to a page shows loading UI immediately while that segment's data loads. Next.js wraps the page in a Suspense boundary for you, replacing the spinner logic you would write around resolvers or `@defer` in Angular.",
      '`error.tsx` catches errors in its segment. It must be a Client Component because it receives a `reset` function to retry. `not-found.tsx` renders when you call `notFound()`. Each file affects only its own part of the tree, so the header and sidebar in the layout stay usable.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-nav',
          imports: [RouterLink, RouterLinkActive],
          template: \`
            <a routerLink="/courses" routerLinkActive="active">Courses</a>
            <button (click)="goToDashboard()">Dashboard</button>
          \`,
        })
        export class NavComponent {
          private router = inject(Router);

          goToDashboard() {
            this.router.navigate(['/dashboard']);
          }
        }
      `,
      react: code`
        // app/components/nav.tsx
        'use client';

        import Link from 'next/link';
        import { usePathname, useRouter } from 'next/navigation';

        export function Nav() {
          const pathname = usePathname();
          const router = useRouter();

          return (
            <nav>
              <Link href="/courses" className={pathname === '/courses' ? 'active' : ''}>
                Courses
              </Link>
              <button onClick={() => router.push('/dashboard')}>Dashboard</button>
            </nav>
          );
        }

        // app/courses/loading.tsx
        export default function Loading() {
          return <p>Loading courses…</p>;
        }
      `,
    },
    keyPoints: [
      '`<Link href>` navigates on the client and prefetches.',
      '`useRouter().push()` and `usePathname()` work in Client Components.',
      '`loading.tsx` adds an automatic Suspense boundary for a segment.',
      '`error.tsx` and `not-found.tsx` handle failures per segment.',
    ],
    pitfall:
      "Import `useRouter` from `next/navigation`, not `next/router`. The second one belongs to the old Pages Router and throws an error in the App Router.",
    card: {
      term: 'loading.tsx',
      definition: 'A special file that shows instant loading UI for a route segment while its content loads.',
      analogy: 'A hotel lobby with a friendly sign: guests wait comfortably while their room is prepared.',
      remember: 'loading for waiting, error for failing, not-found for missing.',
    },
    exercise: {
      title: 'Loading and error states',
      difficulty: 'medium',
      task: 'For a `/reports` route, simulate a two-second data load that sometimes fails. Add `loading.tsx`, an `error.tsx` with a Try again button, and highlight the active link in the navigation.',
      requirements: [
        '`loading.tsx` shows placeholder content',
        '`error.tsx` is a Client Component that calls `reset`',
        'The navigation highlights the current path with `usePathname`',
      ],
      hints: [
        'Throw when `Math.random() < 0.3` to simulate failures.',
        "`error.tsx` starts with `'use client'`.",
        'Compare `usePathname()` with each link\'s href.',
      ],
      solution: code`
        // app/reports/page.tsx
        async function getReports() {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          if (Math.random() < 0.3) throw new Error('Report service unavailable');
          return ['Q1 revenue', 'Q2 revenue'];
        }

        export default async function ReportsPage() {
          const reports = await getReports();
          return (
            <ul>
              {reports.map((report) => (
                <li key={report}>{report}</li>
              ))}
            </ul>
          );
        }

        // app/reports/loading.tsx
        export default function Loading() {
          return <div className="skeleton">Loading reports…</div>;
        }

        // app/reports/error.tsx
        'use client';

        export default function ReportsError({ error, reset }: { error: Error; reset: () => void }) {
          return (
            <div>
              <p>{error.message}</p>
              <button onClick={() => reset()}>Try again</button>
            </div>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w6-l4-q1',
        question: 'Where do you import useRouter from in the App Router?',
        options: ['next/router', 'next/navigation', 'react-router', 'next/link'],
        answer: 1,
        explanation: '`next/navigation` provides useRouter, usePathname and useSearchParams for the App Router.',
      },
      {
        id: 'w6-l4-q2',
        question: 'Why must error.tsx be a Client Component?',
        options: [
          'It uses CSS',
          'It receives a reset function that runs in the browser to retry',
          'Server Components cannot render text',
          'It needs localStorage',
        ],
        answer: 1,
        explanation: 'Retrying is an interaction, so the error UI must run in the browser.',
      },
    ],
  },
]
