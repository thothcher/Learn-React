import { code } from '../../lib/utils'
import type { Lesson } from '../types'

export const week8: Lesson[] = [
  {
    slug: 'metadata-and-optimization',
    week: 8,
    day: 1,
    track: 'next',
    title: 'Metadata, images and fonts',
    summary: 'SEO and performance built in: the metadata API, next/image and next/font.',
    minutes: 40,
    angular: 'Title / Meta + NgOptimizedImage',
    analogy: {
      title: 'A shop sign and a professional packer',
      body: 'Metadata is the sign above a shop: it tells passers-by (search engines and link previews) what is inside before they walk in. next/image and next/font are a professional packer who picks the right box size for every delivery and makes sure nothing shifts in transit.',
    },
    body: [
      'In Angular you set titles and meta tags with the `Title` and `Meta` services, or the `title` property on routes. In Next.js you export a `metadata` object from a page or layout, or an async `generateMetadata` function when it depends on data. Metadata is merged from layouts down to pages and rendered into `<head>` on the server, where crawlers and link previews can see it.',
      '`next/image` is the counterpart of `NgOptimizedImage`. It serves resized images in modern formats, lazy-loads images below the fold and reserves space to prevent layout shift. Give it `width` and `height`, or use `fill` inside a sized parent.',
      '`next/font` downloads Google or local fonts at build time and serves them from your own domain, with no layout shift and no requests to third-party font servers. An `opengraph-image` file in a route folder generates the social preview image.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-course-page',
          imports: [NgOptimizedImage],
          template: \`<img ngSrc="/covers/react.png" width="1200" height="630" priority />\`,
        })
        export class CoursePageComponent {
          constructor() {
            inject(Title).setTitle('React Basics · My Course');
            inject(Meta).updateTag({ name: 'description', content: 'Learn React from Angular.' });
          }
        }
      `,
      react: code`
        // app/courses/react/page.tsx
        import type { Metadata } from 'next';
        import Image from 'next/image';

        export const metadata: Metadata = {
          title: 'React Basics',
          description: 'Learn React from Angular.',
          openGraph: { images: ['/covers/react.png'] },
        };

        export default function CoursePage() {
          return <Image src="/covers/react.png" alt="React Basics cover" width={1200} height={630} />;
        }

        // app/layout.tsx
        import { Geist } from 'next/font/google';

        const geist = Geist({ subsets: ['latin'] }); // <html className={geist.className}>

        export const metadata: Metadata = {
          title: { template: '%s · My Course', default: 'My Course' },
        };
      `,
    },
    keyPoints: [
      'Export `metadata` or `generateMetadata` from pages and layouts.',
      "A layout title can define a template such as `'%s · Site'`.",
      '`next/image` resizes, lazy-loads and prevents layout shift.',
      '`next/font` self-hosts fonts with no layout shift.',
    ],
    pitfall:
      "`metadata` and `generateMetadata` only work in Server Components. Exporting them from a file marked `'use client'` fails the build.",
    card: {
      term: 'Metadata API',
      definition: 'Exports from pages and layouts that describe the title, description and social previews rendered into <head>.',
      analogy: 'The sign above a shop: it tells passers-by what is inside before they walk in.',
      remember: 'Export metadata instead of writing <head> by hand.',
    },
    exercise: {
      title: 'SEO for dynamic pages',
      difficulty: 'medium',
      task: 'For `/courses/[slug]`, generate the title, description and Open Graph image from course data with `generateMetadata`. Add a title template to the root layout.',
      requirements: ['A title template in the root layout', '`generateMetadata` awaits params', 'The course cover uses next/image'],
      hints: [
        '`export async function generateMetadata({ params }: Props): Promise<Metadata>`',
        "Wrap `getCourse` in React's `cache()` so the page and the metadata share one call.",
        'Use `fill` with a sized parent when you do not know the image size.',
      ],
      solution: code`
        // app/courses/[slug]/page.tsx
        import type { Metadata } from 'next';
        import Image from 'next/image';
        import { getCourse } from '@/lib/courses';

        type Props = { params: Promise<{ slug: string }> };

        export async function generateMetadata({ params }: Props): Promise<Metadata> {
          const { slug } = await params;
          const course = await getCourse(slug);

          return {
            title: course.title,
            description: course.summary,
            openGraph: { images: [course.cover] },
          };
        }

        export default async function CoursePage({ params }: Props) {
          const { slug } = await params;
          const course = await getCourse(slug);

          return (
            <article>
              <Image src={course.cover} alt="" width={1200} height={630} />
              <h1>{course.title}</h1>
            </article>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w8-l1-q1',
        question: 'How do you set a page title in the App Router?',
        options: [
          'Assign document.title in useEffect',
          'Export a metadata object or generateMetadata',
          'Inject the Title service',
          'Edit public/index.html',
        ],
        answer: 1,
        explanation: 'The metadata API renders titles and meta tags on the server.',
      },
      {
        id: 'w8-l1-q2',
        question: 'What is the Next.js counterpart of NgOptimizedImage?',
        options: ['next/font', 'next/image', 'next/script', 'next/link'],
        answer: 1,
        explanation: 'next/image handles resizing, lazy loading and layout-shift prevention.',
      },
    ],
  },
  {
    slug: 'proxy-and-auth',
    week: 8,
    day: 2,
    track: 'next',
    title: 'Proxy and authentication patterns',
    summary: 'Guards become a proxy for early redirects, plus real checks where the data lives.',
    minutes: 50,
    angular: 'Route guards + interceptors',
    analogy: {
      title: 'A security desk in the lobby',
      body: "The proxy is the security desk in the lobby. It glances at every visitor's badge before they reach the elevators and sends anyone without one back to reception. Real security still locks each office door (checks inside pages and actions), because someone might find a side entrance.",
    },
    body: [
      'Angular protects routes with guards such as `canActivate` and adds headers with HTTP interceptors. In Next.js, a **proxy** (`proxy.ts` at the project root, called `middleware.ts` before Next.js 16) runs before a request is completed. It can redirect, rewrite, or set headers and cookies based on the incoming request.',
      'A typical use is an optimistic check: if there is no session cookie and the path starts with `/admin`, redirect to `/login`. Keep the proxy fast and simple, because it runs on many requests. Avoid slow database calls there.',
      'The proxy is not your only line of defense. Verify the session again wherever data is read or changed: in Server Components, Server Actions and Route Handlers. Libraries such as Auth.js, Clerk or Better Auth handle sessions, OAuth providers and helpers for these checks.',
    ],
    compare: {
      angular: code`
        export const authGuard: CanActivateFn = () => {
          const auth = inject(AuthService);
          const router = inject(Router);
          return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
        };

        // { path: 'admin', component: AdminComponent, canActivate: [authGuard] }
      `,
      react: code`
        // proxy.ts (middleware.ts before Next.js 16)
        import { NextResponse, type NextRequest } from 'next/server';

        export function proxy(request: NextRequest) {
          if (!request.cookies.has('session')) {
            return NextResponse.redirect(new URL('/login', request.url));
          }
          return NextResponse.next();
        }

        export const config = {
          matcher: ['/admin/:path*'],
        };

        // app/admin/page.tsx: verify again where the data is read
        export default async function AdminPage() {
          const user = await getCurrentUser();
          if (!user?.isAdmin) redirect('/login');
          return <h1>Admin</h1>;
        }
      `,
    },
    keyPoints: [
      '`proxy.ts` (formerly middleware) runs before a request completes.',
      'It can redirect, rewrite and set headers or cookies.',
      'Use `config.matcher` to limit the paths it runs on.',
      'Always re-check authorization in pages, Server Actions and Route Handlers.',
    ],
    pitfall:
      'Relying only on the proxy for security is risky. Anything that reads or changes protected data must verify the user itself.',
    card: {
      term: 'Proxy (middleware)',
      definition: 'Code in proxy.ts that runs before a request completes and can redirect, rewrite or change headers.',
      analogy: 'A security desk in the lobby: it checks badges at the entrance, and the offices still lock their own doors.',
      remember: 'Check early in the proxy, verify again at the data.',
    },
    exercise: {
      title: 'Protected admin area',
      difficulty: 'hard',
      task: 'Create a demo login Server Action that sets a `session` cookie, a proxy that sends visitors without it away from `/admin`, and an admin page that checks the cookie again. Add a logout action.',
      requirements: ['Login and logout are Server Actions', 'The proxy matcher is limited to /admin', 'The admin page checks the cookie itself'],
      hints: [
        "`(await cookies()).set('session', 'demo', { httpOnly: true })`",
        "Call `redirect('/admin')` after setting the cookie.",
        "Delete it with `(await cookies()).delete('session')`.",
      ],
      solution: code`
        // app/login/actions.ts
        'use server';

        import { cookies } from 'next/headers';
        import { redirect } from 'next/navigation';

        export async function login(formData: FormData) {
          if (formData.get('password') !== process.env.ADMIN_PASSWORD) return;
          (await cookies()).set('session', 'demo', { httpOnly: true, sameSite: 'lax' });
          redirect('/admin');
        }

        export async function logout() {
          (await cookies()).delete('session');
          redirect('/login');
        }

        // proxy.ts
        import { NextResponse, type NextRequest } from 'next/server';

        export function proxy(request: NextRequest) {
          if (!request.cookies.has('session')) {
            return NextResponse.redirect(new URL('/login', request.url));
          }
          return NextResponse.next();
        }

        export const config = { matcher: ['/admin/:path*'] };

        // app/admin/page.tsx
        import { cookies } from 'next/headers';
        import { redirect } from 'next/navigation';
        import { logout } from '../login/actions';

        export default async function AdminPage() {
          if (!(await cookies()).has('session')) redirect('/login');

          return (
            <form action={logout}>
              <h1>Admin dashboard</h1>
              <button>Log out</button>
            </form>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w8-l2-q1',
        question: 'What was `proxy.ts` called before Next.js 16?',
        options: ['guard.ts', 'middleware.ts', 'interceptor.ts', 'server.ts'],
        answer: 1,
        explanation: 'Next.js 16 renamed middleware to proxy to describe its role more clearly.',
      },
      {
        id: 'w8-l2-q2',
        question: 'The proxy redirects guests away from /admin. Can the admin Server Actions skip auth checks?',
        options: [
          'Yes, the proxy blocks everything',
          'No, every action must verify the user itself',
          'Only in production',
          'Only if the matcher includes /api',
        ],
        answer: 1,
        explanation: 'Actions are reachable endpoints, so they must check authorization on their own.',
      },
    ],
  },
  {
    slug: 'testing',
    week: 8,
    day: 3,
    track: 'next',
    title: 'Testing React and Next.js apps',
    summary: 'From TestBed to Testing Library: test what users see and do.',
    minutes: 50,
    angular: 'TestBed',
    analogy: {
      title: 'A driving examiner',
      body: 'Testing Library tests a component the way a driving examiner tests a driver. The examiner does not open the hood to inspect the engine (internal state). They watch what happens on the road: can you see the sign, press the right pedal and reach the destination?',
    },
    body: [
      'Angular testing is built around `TestBed`, traditionally with Jasmine and Karma, while recent Angular versions move to Vitest. In React projects, the standard pair is **Vitest** (or Jest) as the runner and **React Testing Library** for rendering components and interacting with them.',
      'Testing Library encourages testing behavior instead of implementation. You `render` a component, find elements the way a user would (by role, label or text), interact with `userEvent`, and assert what appears on screen. There is no fixture, no `detectChanges()` and no component instance to poke at.',
      'In Next.js, test Client Components and plain functions with Vitest, and test Server Actions as ordinary async functions. Async Server Components and full flows are best covered by end-to-end tests with **Playwright**, which drives a real browser against your running app.',
    ],
    compare: {
      angular: code`
        describe('CounterComponent', () => {
          it('increments when clicked', async () => {
            await TestBed.configureTestingModule({ imports: [CounterComponent] }).compileComponents();
            const fixture = TestBed.createComponent(CounterComponent);
            fixture.detectChanges();

            fixture.nativeElement.querySelector('button').click();
            fixture.detectChanges();

            expect(fixture.nativeElement.textContent).toContain('Clicked 1 times');
          });
        });
      `,
      react: code`
        import { render, screen } from '@testing-library/react';
        import userEvent from '@testing-library/user-event';
        import { expect, it } from 'vitest';
        import { Counter } from './Counter';

        it('increments when clicked', async () => {
          render(<Counter />);

          await userEvent.click(screen.getByRole('button', { name: '+1' }));

          expect(screen.getByText('Clicked 1 times')).toBeInTheDocument();
        });
      `,
    },
    keyPoints: [
      'Vitest runs the tests; React Testing Library renders and queries components.',
      'Query by role, label or text, the way users find things.',
      'Simulate interactions with `userEvent` and assert on the screen.',
      'Use Playwright for end-to-end tests of full Next.js pages.',
    ],
    pitfall:
      'Querying by CSS class makes tests brittle. Prefer `getByRole` and `getByLabelText`, and use test ids only as a last resort.',
    card: {
      term: 'React Testing Library',
      definition: 'A library that renders components in tests and lets you query and interact with them the way users do.',
      analogy: 'A driving examiner: judges what happens on the road, not the engine under the hood.',
      remember: 'Test what users see and do.',
    },
    exercise: {
      title: 'Test the signup form',
      difficulty: 'medium',
      task: 'Write tests for a Signup form: the button is disabled with an invalid email, becomes enabled after a valid one is typed, and submitting calls a mocked `onSubmit` prop.',
      requirements: ['Queries use roles or labels', 'Interactions use userEvent', 'A mock function created with `vi.fn()`'],
      hints: [
        'Give the input a `<label>` so it can be found with `getByLabelText`.',
        "`await userEvent.type(screen.getByLabelText('Email'), 'ana@example.com')`",
        "`expect(onSubmit).toHaveBeenCalledWith({ email: 'ana@example.com' })`",
      ],
      solution: code`
        import { render, screen } from '@testing-library/react';
        import userEvent from '@testing-library/user-event';
        import { describe, expect, it, vi } from 'vitest';
        import { Signup } from './Signup';

        describe('Signup', () => {
          it('keeps the button disabled until the email is valid', async () => {
            render(<Signup onSubmit={vi.fn()} />);
            const button = screen.getByRole('button', { name: 'Sign up' });

            expect(button).toBeDisabled();
            await userEvent.type(screen.getByLabelText('Email'), 'ana@example.com');
            expect(button).toBeEnabled();
          });

          it('submits the email', async () => {
            const onSubmit = vi.fn();
            render(<Signup onSubmit={onSubmit} />);

            await userEvent.type(screen.getByLabelText('Email'), 'ana@example.com');
            await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

            expect(onSubmit).toHaveBeenCalledWith({ email: 'ana@example.com' });
          });
        });
      `,
    },
    quiz: [
      {
        id: 'w8-l3-q1',
        question: 'Which query does React Testing Library recommend first?',
        options: ['getByTestId', 'getByRole', "querySelector('.btn')", 'getByClassName'],
        answer: 1,
        explanation: 'Role queries match how users and assistive technology find elements.',
      },
      {
        id: 'w8-l3-q2',
        question: 'What replaces `fixture.detectChanges()` in React Testing Library?',
        options: [
          'Calling render again',
          'Nothing: React applies updates after interactions automatically',
          'act.detectChanges()',
          'screen.refresh()',
        ],
        answer: 1,
        explanation: 'Testing Library wraps interactions in act(), so the DOM is already updated when you assert.',
      },
    ],
  },
  {
    slug: 'env-and-deployment',
    week: 8,
    day: 4,
    track: 'next',
    title: 'Environment variables and deployment',
    summary: 'Secrets stay on the server, public values get a prefix, and a build tells you what you ship.',
    minutes: 40,
    angular: 'environment.ts + ng build',
    analogy: {
      title: 'Opening the restaurant',
      body: 'Development is a test kitchen where you taste as you go. Deploying is opening the restaurant: recipes are locked in (the build), the secret sauce recipe stays in the safe (server-only variables), and only the menu is printed for guests (NEXT_PUBLIC_ variables).',
    },
    body: [
      'Angular swaps `environment.ts` files at build time. Next.js reads `.env` files and real environment variables. Variables are **server-only by default**: `process.env.DATABASE_URL` works in Server Components, Server Actions and Route Handlers, but is never sent to the browser. Only variables prefixed with `NEXT_PUBLIC_` are inlined into client code.',
      '`next build` creates an optimized production build and prints a summary of every route and how it renders. `next start` runs that build on a Node.js server. Deploy to Vercel (made by the Next.js team), to platforms such as Netlify or Cloudflare, or to your own server or container. A fully static site can use `output: \'export\'`.',
      'Before shipping, set environment variables in your hosting dashboard, run a production build locally and check the route summary for pages that became dynamic by accident. A Git-connected deployment gives every pull request its own preview URL, which is ideal for showing students work in progress.',
    ],
    compare: {
      angular: code`
        // src/environments/environment.ts
        export const environment = {
          production: false,
          apiUrl: 'http://localhost:3000',
        };

        // src/environments/environment.prod.ts
        export const environment = {
          production: true,
          apiUrl: 'https://api.example.com',
        };

        // ng build --configuration production
      `,
      react: code`
        // .env.local (never committed)
        // DATABASE_URL="postgres://..."
        // NEXT_PUBLIC_SITE_URL="https://course.example.com"

        // app/page.tsx: a Server Component can read both
        export default async function HomePage() {
          const courses = await getCourses(process.env.DATABASE_URL!);
          return <p>{courses.length} courses on {process.env.NEXT_PUBLIC_SITE_URL}</p>;
        }

        // app/share-button.tsx: only NEXT_PUBLIC_ values exist here
        'use client';

        export function ShareButton() {
          const url = process.env.NEXT_PUBLIC_SITE_URL!;
          return <button onClick={() => navigator.clipboard.writeText(url)}>Copy link</button>;
        }
      `,
    },
    keyPoints: [
      'Variables from `.env` files are server-only by default.',
      'Only `NEXT_PUBLIC_` variables reach the browser.',
      '`next build` lists every route and whether it is static or dynamic.',
      'Deploy to Vercel, another platform, a container or a static export.',
    ],
    pitfall:
      'Prefixing a secret with `NEXT_PUBLIC_` publishes it to every visitor. Keep API keys and database URLs unprefixed and use them only on the server.',
    card: {
      term: 'Environment variables',
      definition: 'Configuration read from the environment: server-only by default, public only with the NEXT_PUBLIC_ prefix.',
      analogy: 'A restaurant: the secret sauce recipe stays in the safe, and only the menu is printed for guests.',
      remember: 'Secrets stay unprefixed. NEXT_PUBLIC_ means public.',
    },
    exercise: {
      title: 'Ship the course site',
      difficulty: 'medium',
      task: 'Deploy your course site. Configure one server-only variable and one public variable, confirm that the secret never appears in the browser, and share the preview URL of a pull request.',
      requirements: ['`.env.local` is ignored by Git', 'The public variable is used in a Client Component', 'The production build passes locally before deploying'],
      hints: [
        "Search the browser's Sources panel for the secret value; it must not appear.",
        'Run `npm run build` and `npm start` locally first.',
        'Connect the GitHub repository to your host to get preview deployments.',
      ],
      solution: code`
        // .env.local
        // ADMIN_PASSWORD="choose-a-long-password"
        // NEXT_PUBLIC_COURSE_NAME="Refract"

        // app/login/actions.ts
        'use server';

        export async function checkPassword(formData: FormData) {
          return formData.get('password') === process.env.ADMIN_PASSWORD;
        }

        // app/components/course-badge.tsx
        'use client';

        export function CourseBadge() {
          return <span>{process.env.NEXT_PUBLIC_COURSE_NAME}</span>;
        }

        // Terminal
        // npm run build   → check the route summary
        // npm start       → test the production build locally
        // git push        → the platform builds and deploys
      `,
    },
    quiz: [
      {
        id: 'w8-l4-q1',
        question: 'Which variable can a Client Component read?',
        options: ['DATABASE_URL', 'API_SECRET', 'NEXT_PUBLIC_SITE_URL', 'All of them'],
        answer: 2,
        explanation: 'Only NEXT_PUBLIC_ variables are inlined into client code.',
      },
      {
        id: 'w8-l4-q2',
        question: 'What is the Next.js counterpart of environment.prod.ts?',
        options: [
          'next.config.ts only',
          'Environment variables from .env files and the hosting platform',
          'A Route Handler',
          'The public folder',
        ],
        answer: 1,
        explanation: 'Next.js reads configuration from the environment instead of swapping TypeScript files.',
      },
    ],
  },
]
