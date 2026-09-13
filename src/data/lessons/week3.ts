import { code } from '../../lib/utils'
import type { Lesson } from '../types'

export const week3: Lesson[] = [
  {
    slug: 'use-effect',
    week: 3,
    day: 1,
    track: 'react',
    title: 'useEffect: syncing with the outside world',
    summary: 'One hook covers ngOnInit, ngOnDestroy and effect(), as long as you remember the cleanup.',
    minutes: 55,
    angular: 'ngOnInit / ngOnDestroy / effect()',
    analogy: {
      title: 'A gym membership',
      body: 'An effect is a gym membership. You sign up when you move to a city (the component mounts), and you cancel it when you leave (cleanup). If you move to another city (a dependency changes), you cancel the old membership before starting a new one. Forget to cancel, and you keep paying for a gym you never visit.',
    },
    body: [
      'Effects let a component synchronize with something outside React: a timer, a WebSocket, `document.title`, a chart library or a browser API. In Angular you would use `ngOnInit` and `ngOnDestroy`, or `effect()` with signals. In React, `useEffect` covers all of these.',
      'The second argument is the dependency array. `[]` runs once after the first render, like `ngOnInit`. `[roomId]` runs again whenever `roomId` changes. No array at all runs after every render. The function you return is the **cleanup**: React calls it before re-running the effect and when the component unmounts, like `ngOnDestroy`.',
      'Effects are an escape hatch, not the place for regular logic. If a value can be computed from props or state, compute it during render. If something happens because the user clicked, do it in the event handler. In development, Strict Mode mounts components twice to expose missing cleanups.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-clock',
          imports: [DatePipe],
          template: \`<time>{{ now() | date: 'HH:mm:ss' }}</time>\`,
        })
        export class ClockComponent implements OnInit, OnDestroy {
          now = signal(new Date());
          private timerId?: ReturnType<typeof setInterval>;

          ngOnInit() {
            this.timerId = setInterval(() => this.now.set(new Date()), 1000);
          }

          ngOnDestroy() {
            clearInterval(this.timerId);
          }
        }
      `,
      react: code`
        import { useEffect, useState } from 'react';

        export function Clock() {
          const [now, setNow] = useState(new Date());

          useEffect(() => {
            const timerId = setInterval(() => setNow(new Date()), 1000);

            return () => clearInterval(timerId);
          }, []);

          return <time>{now.toLocaleTimeString()}</time>;
        }
      `,
    },
    keyPoints: [
      '`useEffect(setup, deps)` runs after React updates the DOM.',
      '`[]` runs once on mount; `[a, b]` re-runs when a or b changes.',
      'Return a cleanup function. It replaces `ngOnDestroy`.',
      'Do not use effects for derived data or for responding to clicks.',
    ],
    pitfall:
      'A missing dependency makes the effect read stale values. Include every prop and state value the effect uses, and let the exhaustive-deps lint rule help.',
    card: {
      term: 'useEffect',
      definition: 'A hook that synchronizes a component with an external system after render, with an optional cleanup.',
      analogy: 'A gym membership: sign up when you move to a city, cancel when you leave, and switch when you move again.',
      remember: 'Setup, dependencies, cleanup.',
    },
    exercise: {
      title: 'Window width and page title',
      difficulty: 'medium',
      task: 'Build a component that shows the current window width and keeps `document.title` in sync with a click counter. Remove the resize listener when the component unmounts.',
      requirements: [
        'One effect for the resize listener, with cleanup',
        'One effect for the title that depends on the count',
        'No effect for values you can compute',
      ],
      hints: [
        "Add `window.addEventListener('resize', onResize)` and return the matching removal.",
        '`useEffect(() => { document.title = ... }, [count])`',
        'Toggle the component on and off in App to test the cleanup.',
      ],
      solution: code`
        import { useEffect, useState } from 'react';

        export function WindowInfo() {
          const [width, setWidth] = useState(window.innerWidth);
          const [count, setCount] = useState(0);

          useEffect(() => {
            const onResize = () => setWidth(window.innerWidth);
            window.addEventListener('resize', onResize);
            return () => window.removeEventListener('resize', onResize);
          }, []);

          useEffect(() => {
            document.title = \`Clicked \${count} times\`;
          }, [count]);

          return (
            <div>
              <p>Window width: {width}px</p>
              <button onClick={() => setCount((c) => c + 1)}>Clicked {count}</button>
            </div>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w3-l1-q1',
        question: 'Which effect behaves like ngOnInit plus ngOnDestroy?',
        options: [
          'useEffect(() => { ... })',
          'useEffect(() => { ...; return cleanup; }, [])',
          'useEffect(() => { ... }, [value])',
          'useMemo(() => { ... }, [])',
        ],
        answer: 1,
        explanation: 'An empty dependency array runs the setup once after mount, and the returned function runs on unmount.',
      },
      {
        id: 'w3-l1-q2',
        question: "When does React run an effect's cleanup function?",
        options: [
          'Only when the browser tab closes',
          'Before re-running the effect and when the component unmounts',
          'Immediately after the setup function',
          'Never, unless you call it yourself',
        ],
        answer: 1,
        explanation: 'Cleanup runs before every re-run and once more when the component is removed.',
      },
    ],
  },
  {
    slug: 'use-ref',
    week: 3,
    day: 2,
    track: 'react',
    title: 'useRef: DOM access and silent values',
    summary: 'The React answer to viewChild, and a place for values that should not trigger renders.',
    minutes: 35,
    angular: 'viewChild() / ElementRef',
    analogy: {
      title: 'A sticky note in your pocket',
      body: 'A ref is a sticky note in your pocket. You can write on it and read it whenever you want, but nobody is told when it changes. State is the whiteboard everyone watches; a ref is private scribbling that never starts a new meeting.',
    },
    body: [
      '`useRef` gives you a box with a `current` property that survives between renders. Changing `ref.current` does **not** cause a re-render. That makes refs useful for two things: holding DOM elements, and keeping mutable values such as timer ids.',
      'For DOM access, Angular uses `viewChild()` with a template reference like `#searchInput`. In React, you create a ref and pass it to the element: `<input ref={searchInput} />`. After React commits, `searchInput.current` is the DOM node.',
      'In React 19, `ref` is a regular prop on function components, so a child can accept `ref` and pass it to an inner element without `forwardRef`. Read and write refs in event handlers and effects, not during rendering.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-search',
          template: \`
            <input #searchInput placeholder="Search" />
            <button (click)="focus()">Focus</button>
          \`,
        })
        export class SearchComponent {
          searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

          focus() {
            this.searchInput().nativeElement.focus();
          }
        }
      `,
      react: code`
        import { useRef } from 'react';

        export function Search() {
          const searchInput = useRef<HTMLInputElement>(null);

          function focus() {
            searchInput.current?.focus();
          }

          return (
            <>
              <input ref={searchInput} placeholder="Search" />
              <button onClick={focus}>Focus</button>
            </>
          );
        }
      `,
    },
    keyPoints: [
      '`useRef(initial)` returns `{ current }`, which persists between renders.',
      'Changing `ref.current` does not re-render.',
      "Pass a ref to an element's `ref` prop to reach the DOM node.",
      'In React 19, `ref` is a normal prop, so `forwardRef` is no longer needed.',
    ],
    pitfall:
      'Do not keep displayed values in a ref. The screen will not update when `ref.current` changes. If it is rendered, it belongs in state.',
    card: {
      term: 'Ref',
      definition: 'A mutable box ({ current }) that persists between renders without triggering them, often holding a DOM node.',
      analogy: 'A sticky note in your pocket: write on it whenever you like, and nobody is notified.',
      remember: 'Refs for DOM and timers. State for what you see.',
    },
    exercise: {
      title: 'Stopwatch',
      difficulty: 'medium',
      task: 'Build a stopwatch with Start, Stop and Reset. Keep the elapsed seconds in state and the interval id in a ref.',
      requirements: [
        'The interval id is stored in `useRef`',
        'Start does nothing when already running',
        'The interval is cleared on unmount',
      ],
      hints: [
        '`const intervalRef = useRef<number | null>(null)`',
        'Guard with `if (intervalRef.current !== null) return`.',
        'An effect with `[]` can return `stop` as its cleanup.',
      ],
      solution: code`
        import { useEffect, useRef, useState } from 'react';

        export function Stopwatch() {
          const [seconds, setSeconds] = useState(0);
          const intervalRef = useRef<number | null>(null);

          function start() {
            if (intervalRef.current !== null) return;
            intervalRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
          }

          function stop() {
            if (intervalRef.current !== null) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }

          function reset() {
            stop();
            setSeconds(0);
          }

          useEffect(() => stop, []);

          return (
            <div>
              <p>{seconds}s</p>
              <button onClick={start}>Start</button>
              <button onClick={stop}>Stop</button>
              <button onClick={reset}>Reset</button>
            </div>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w3-l2-q1',
        question: 'What happens when you assign a new value to `ref.current`?',
        options: [
          'The component re-renders',
          'The value is stored, and no render happens',
          'React throws an error',
          'The parent component re-renders',
        ],
        answer: 1,
        explanation: 'Refs are mutable boxes. React does not track them, so no render is triggered.',
      },
      {
        id: 'w3-l2-q2',
        question: "What is the React counterpart of Angular's `viewChild('box')`?",
        options: [
          'useState',
          'useRef, passed to the element as ref={boxRef}',
          'useContext',
          'document.querySelector inside the render body',
        ],
        answer: 1,
        explanation: 'Create a ref with useRef and attach it to the element through the ref prop.',
      },
    ],
  },
  {
    slug: 'children-and-composition',
    week: 3,
    day: 3,
    track: 'react',
    title: 'Children and composition',
    summary: 'Content projection without ng-content: slots are just props that hold JSX.',
    minutes: 40,
    angular: '<ng-content>',
    analogy: {
      title: 'A picture frame',
      body: 'A component that accepts children is a picture frame. The frame supplies the glass, the matting and the hook on the wall, and it does not care which picture you place inside. One frame, many pictures.',
    },
    body: [
      'Angular projects content with `<ng-content>`, and several slots with `<ng-content select="...">`. In React, whatever you place between a component\'s opening and closing tags arrives as the `children` prop. Render `{children}` where the content should appear.',
      'For more slots, pass JSX through regular props: `<Card header={<Title />} footer={<Actions />}>`. JSX elements are values, so any prop can hold UI. This replaces most uses of `ng-template` and `ngTemplateOutlet` as well.',
      'Composition is the main reuse tool in React. Instead of inheritance or long lists of configuration inputs, build small components and nest them. It also avoids passing props through many layers: pass the finished element down as children.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-card',
          template: \`
            <section class="card">
              <header><ng-content select="[card-title]" /></header>
              <ng-content />
            </section>
          \`,
        })
        export class CardComponent {}

        // <app-card>
        //   <h2 card-title>Profile</h2>
        //   <p>Content goes here</p>
        // </app-card>
      `,
      react: code`
        import type { ReactNode } from 'react';

        interface CardProps {
          title: ReactNode;
          children: ReactNode;
        }

        export function Card({ title, children }: CardProps) {
          return (
            <section className="card">
              <header>{title}</header>
              {children}
            </section>
          );
        }

        // <Card title={<h2>Profile</h2>}>
        //   <p>Content goes here</p>
        // </Card>
      `,
    },
    keyPoints: [
      'Content between the tags arrives as `children`.',
      'Named slots are props that accept JSX, typed as `ReactNode`.',
      'Passing elements as props replaces `ng-template` in most cases.',
      'Prefer composition over inheritance and configuration flags.',
    ],
    pitfall:
      'If you forget to render `{children}`, the content silently disappears. When a wrapper shows nothing inside, check that it actually uses the prop.',
    card: {
      term: 'children',
      definition: "The prop that holds whatever JSX is placed between a component's opening and closing tags.",
      analogy: 'A picture frame: it provides the glass and the hook, and you choose the picture inside.',
      remember: 'Slots are props. The default slot is children.',
    },
    exercise: {
      title: 'Layout with slots',
      difficulty: 'medium',
      task: 'Create a `PageLayout` with a `header` slot, a `sidebar` slot and the main content as children. Use it to build a simple settings page.',
      requirements: ['Slot props typed as `ReactNode`', 'Main content rendered from `children`', 'The layout is reusable by other pages'],
      hints: [
        '`interface PageLayoutProps { header: ReactNode; sidebar: ReactNode; children: ReactNode }`',
        'Pass whole elements: `sidebar={<nav>...</nav>}`.',
        'Arrange the areas with CSS grid.',
      ],
      solution: code`
        import type { ReactNode } from 'react';

        interface PageLayoutProps {
          header: ReactNode;
          sidebar: ReactNode;
          children: ReactNode;
        }

        function PageLayout({ header, sidebar, children }: PageLayoutProps) {
          return (
            <div className="layout">
              <header>{header}</header>
              <aside>{sidebar}</aside>
              <main>{children}</main>
            </div>
          );
        }

        export default function SettingsPage() {
          return (
            <PageLayout
              header={<h1>Settings</h1>}
              sidebar={
                <nav>
                  <a href="#profile">Profile</a>
                  <a href="#security">Security</a>
                </nav>
              }
            >
              <p>Choose what you want to change.</p>
            </PageLayout>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w3-l3-q1',
        question: 'How does a React component receive the content placed between its tags?',
        options: ['Through <ng-content>', 'Through the children prop', 'Through a useSlot hook', 'It cannot'],
        answer: 1,
        explanation: 'Nested JSX is passed as `children`, which you render wherever you like.',
      },
      {
        id: 'w3-l3-q2',
        question: 'What is the idiomatic way to add a named "footer" slot?',
        options: [
          'A <Slot name="footer"> element',
          'A prop typed as ReactNode, such as footer={<Actions />}',
          'A select attribute on children',
          'A second children array',
        ],
        answer: 1,
        explanation: 'JSX is a value, so named slots are simply props that hold elements.',
      },
    ],
  },
  {
    slug: 'lifting-state-up',
    week: 3,
    day: 4,
    track: 'react',
    title: 'Lifting state up',
    summary: 'Before you reach for a shared service, move the state to the closest common parent.',
    minutes: 40,
    angular: 'Shared service state',
    analogy: {
      title: 'One remote on the coffee table',
      body: 'Two siblings cannot each keep their own TV remote. You put one remote on the coffee table (the common parent) where both can reach it. Each sibling asks for the channel they want (a callback), and the TV shows one channel for everyone.',
    },
    body: [
      'When two components need the same data, move the state to their closest common parent and pass it down as props. The parent becomes the single source of truth, and children request changes through callback props.',
      'In Angular you might create a shared service with a signal for this. In React, lifting state is the first tool to try, because it keeps the data flow visible in the tree. Context and stores are for when the common parent is far away; that is week 4.',
      'A component that receives its value and change handler from outside is **controlled**. One that keeps its own state is **uncontrolled**. Well-designed components often support both, like native inputs with `value` and `defaultValue`.',
    ],
    compare: {
      angular: code`
        @Injectable({ providedIn: 'root' })
        export class FilterService {
          query = signal('');
        }

        @Component({
          selector: 'app-search-box',
          template: \`<input [value]="filter.query()" (input)="onInput($event)" />\`,
        })
        export class SearchBoxComponent {
          filter = inject(FilterService);

          onInput(event: Event) {
            this.filter.query.set((event.target as HTMLInputElement).value);
          }
        }

        @Component({
          selector: 'app-results',
          template: \`<p>Searching for: {{ filter.query() }}</p>\`,
        })
        export class ResultsComponent {
          filter = inject(FilterService);
        }
      `,
      react: code`
        import { useState } from 'react';

        interface SearchBoxProps {
          query: string;
          onQueryChange: (value: string) => void;
        }

        function SearchBox({ query, onQueryChange }: SearchBoxProps) {
          return <input value={query} onChange={(e) => onQueryChange(e.target.value)} />;
        }

        function Results({ query }: { query: string }) {
          return <p>Searching for: {query}</p>;
        }

        export function SearchPage() {
          const [query, setQuery] = useState('');

          return (
            <>
              <SearchBox query={query} onQueryChange={setQuery} />
              <Results query={query} />
            </>
          );
        }
      `,
    },
    keyPoints: [
      'Shared state lives in the closest common parent.',
      'Siblings receive the value as props and change it through callbacks.',
      'Each piece of data has exactly one source of truth.',
      'Reach for context only when lifting creates long prop chains.',
    ],
    pitfall:
      'Keeping a copy of the same data in two components makes them drift apart. Delete the duplicate and lift the state to one place.',
    card: {
      term: 'Lifting state up',
      definition: 'Moving shared state to the closest common parent, so siblings read it from props and change it through callbacks.',
      analogy: 'One remote on the coffee table: the siblings ask for channels, and the TV shows one channel for everyone.',
      remember: 'One source of truth, as high as needed and no higher.',
    },
    exercise: {
      title: 'Temperature converter',
      difficulty: 'medium',
      task: 'Build Celsius and Fahrenheit inputs. Typing into either one updates the other. Keep a single piece of state in the parent.',
      requirements: [
        'Only one state value, in the parent',
        'A reusable `TemperatureInput` component used twice',
        'The conversion is computed during render',
      ],
      hints: [
        'Store Celsius and derive Fahrenheit with `c * 9 / 5 + 32`.',
        'Give `TemperatureInput` a `value` and an `onChange` prop.',
        'Convert back with `(f - 32) * 5 / 9`.',
      ],
      solution: code`
        import { useState } from 'react';

        interface TemperatureInputProps {
          label: string;
          value: number;
          onChange: (value: number) => void;
        }

        function TemperatureInput({ label, value, onChange }: TemperatureInputProps) {
          return (
            <label>
              {label}
              <input
                type="number"
                value={Math.round(value * 10) / 10}
                onChange={(e) => onChange(Number(e.target.value))}
              />
            </label>
          );
        }

        export function Converter() {
          const [celsius, setCelsius] = useState(20);
          const fahrenheit = (celsius * 9) / 5 + 32;

          return (
            <>
              <TemperatureInput label="Celsius" value={celsius} onChange={setCelsius} />
              <TemperatureInput
                label="Fahrenheit"
                value={fahrenheit}
                onChange={(f) => setCelsius(((f - 32) * 5) / 9)}
              />
            </>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w3-l4-q1',
        question: 'Two sibling components need the same value. What should you try first?',
        options: [
          'Create a global store',
          'Lift the state to their closest common parent',
          'Duplicate the state in both siblings',
          'Keep a ref in each sibling',
        ],
        answer: 1,
        explanation: 'Lifting state keeps a single source of truth with a visible data flow.',
      },
      {
        id: 'w3-l4-q2',
        question: 'With lifted state, how does a child change the shared value?',
        options: [
          'By mutating the prop',
          'By calling a callback prop provided by the parent',
          'By dispatching a DOM event',
          'By re-rendering itself',
        ],
        answer: 1,
        explanation: 'The parent owns the state and hands down a function that updates it.',
      },
    ],
  },
]
