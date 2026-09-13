import { code } from '../../lib/utils'
import type { Lesson } from '../types'

export const week4: Lesson[] = [
  {
    slug: 'context',
    week: 4,
    day: 1,
    track: 'react',
    title: 'Context: dependency injection, React style',
    summary: 'Provide a value high in the tree and read it anywhere below, with no prop drilling.',
    minutes: 45,
    angular: 'providers + inject()',
    analogy: {
      title: "The building's Wi-Fi",
      body: 'Context is the Wi-Fi in an office building. Instead of running a cable (props) to every desk on every floor, you install one router (the provider), and any device inside the building can connect (useContext). Step outside the building and there is no signal.',
    },
    body: [
      "Angular's dependency injection lets any component `inject()` a service provided higher in the injector tree. React's closest equivalent is **context**: create a context, wrap part of the tree in a provider with a value, and read it below with `useContext` (or `use` in React 19).",
      'In React 19 you can render the context itself as the provider: `<ThemeContext value={theme}>`. Components read the **nearest** provider above them, so a nested provider overrides an outer one, much like component-level `providers` in Angular.',
      'Context suits values that many components need: the current user, theme, locale or a cart. It is not a state manager on its own; it only delivers a value. Every component that reads the context re-renders when that value changes, so keep context values focused.',
    ],
    compare: {
      angular: code`
        @Injectable({ providedIn: 'root' })
        export class ThemeService {
          theme = signal<'light' | 'dark'>('light');

          toggle() {
            this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
          }
        }

        @Component({
          selector: 'app-theme-button',
          template: \`<button (click)="themes.toggle()">{{ themes.theme() }}</button>\`,
        })
        export class ThemeButtonComponent {
          themes = inject(ThemeService);
        }
      `,
      react: code`
        import { createContext, useContext, useState, type ReactNode } from 'react';

        type Theme = 'light' | 'dark';
        const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

        export function ThemeProvider({ children }: { children: ReactNode }) {
          const [theme, setTheme] = useState<Theme>('light');
          const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

          return <ThemeContext value={{ theme, toggle }}>{children}</ThemeContext>;
        }

        export function ThemeButton() {
          const themes = useContext(ThemeContext)!;
          return <button onClick={themes.toggle}>{themes.theme}</button>;
        }
      `,
    },
    keyPoints: [
      '`createContext`, a provider and `useContext` replace `providers` and `inject()`.',
      'Components read the nearest provider above them.',
      'In React 19, `<MyContext value={...}>` works directly as the provider.',
      'Keep context values focused: every consumer re-renders when the value changes.',
    ],
    pitfall:
      'Outside a provider, `useContext` returns the default value, often `null`. Wrap the call in a custom hook that throws a clear error when the provider is missing.',
    card: {
      term: 'Context',
      definition: 'A way to pass a value deep into the tree without props. Components read the nearest provider above them.',
      analogy: "The building's Wi-Fi: install one router, and every device inside can connect without a cable to each desk.",
      remember: 'Provide high, read anywhere below.',
    },
    exercise: {
      title: 'Language switcher',
      difficulty: 'medium',
      task: "Create a `LanguageContext` that holds 'en' or 'ka' and a setter. Build a switcher in the header and a greeting deep in the page that reads the language without receiving props.",
      requirements: ['A provider wraps the app', 'The greeting reads context directly', 'No props pass through intermediate components'],
      hints: [
        'Type the context value as `{ language; setLanguage } | null`.',
        'The provider component owns the `useState`.',
        "Render `'Gamarjoba!'` for Georgian and `'Hello!'` for English.",
      ],
      solution: code`
        import { createContext, useContext, useState, type ReactNode } from 'react';

        type Language = 'en' | 'ka';

        const LanguageContext = createContext<{
          language: Language;
          setLanguage: (language: Language) => void;
        } | null>(null);

        function LanguageProvider({ children }: { children: ReactNode }) {
          const [language, setLanguage] = useState<Language>('en');
          return <LanguageContext value={{ language, setLanguage }}>{children}</LanguageContext>;
        }

        function Switcher() {
          const { language, setLanguage } = useContext(LanguageContext)!;
          return (
            <button onClick={() => setLanguage(language === 'en' ? 'ka' : 'en')}>
              {language.toUpperCase()}
            </button>
          );
        }

        function Greeting() {
          const { language } = useContext(LanguageContext)!;
          return <h1>{language === 'en' ? 'Hello!' : 'Gamarjoba!'}</h1>;
        }

        export default function App() {
          return (
            <LanguageProvider>
              <header><Switcher /></header>
              <main><section><Greeting /></section></main>
            </LanguageProvider>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w4-l1-q1',
        question: "Which pair best matches Angular's providers and inject()?",
        options: ['useState and setState', 'A context provider and useContext', 'useRef and ref', 'props and children'],
        answer: 1,
        explanation: 'A provider makes a value available, and useContext reads the nearest one above.',
      },
      {
        id: 'w4-l1-q2',
        question: 'A component reads a context but is rendered outside any provider. What does it get?',
        options: [
          'A compile-time error',
          'The default value passed to createContext',
          "The closest sibling provider's value",
          'Always undefined',
        ],
        answer: 1,
        explanation: 'Without a provider, React falls back to the default value given to createContext.',
      },
    ],
  },
  {
    slug: 'custom-hooks',
    week: 4,
    day: 2,
    track: 'react',
    title: 'Custom hooks: reusable logic',
    summary: 'Package stateful logic in a use-function. Unlike a root service, every caller gets its own state.',
    minutes: 45,
    angular: '@Injectable services',
    analogy: {
      title: 'A coffee machine',
      body: 'A custom hook is a coffee machine. Instead of every cook grinding, heating and filtering by hand, the steps are packaged into one appliance. Every cook who uses the same model still gets their own cup: sharing the design does not mean sharing the coffee.',
    },
    body: [
      'Angular services bundle reusable logic, and with `providedIn: \'root\'` every component shares one instance. React reuses logic with **custom hooks**: functions whose names start with `use` and that call other hooks.',
      'The key difference is that each component calling a custom hook gets its **own** state. `useToggle()` in two components creates two independent toggles. To share one state, combine the hook with context or an external store.',
      'Hooks follow two rules: call them only at the top level of a component or another hook, never inside conditions or loops, and only from React functions. React relies on the call order to match state to each hook.',
    ],
    compare: {
      angular: code`
        @Injectable()
        export class OnlineStatus {
          online = signal(navigator.onLine);

          constructor() {
            const update = () => this.online.set(navigator.onLine);
            window.addEventListener('online', update);
            window.addEventListener('offline', update);
            inject(DestroyRef).onDestroy(() => {
              window.removeEventListener('online', update);
              window.removeEventListener('offline', update);
            });
          }
        }

        @Component({
          selector: 'app-status',
          providers: [OnlineStatus],
          template: \`{{ status.online() ? 'Online' : 'Offline' }}\`,
        })
        export class StatusComponent {
          status = inject(OnlineStatus);
        }
      `,
      react: code`
        import { useEffect, useState } from 'react';

        export function useOnlineStatus() {
          const [online, setOnline] = useState(navigator.onLine);

          useEffect(() => {
            const update = () => setOnline(navigator.onLine);
            window.addEventListener('online', update);
            window.addEventListener('offline', update);
            return () => {
              window.removeEventListener('online', update);
              window.removeEventListener('offline', update);
            };
          }, []);

          return online;
        }

        export function Status() {
          const online = useOnlineStatus();
          return <span>{online ? 'Online' : 'Offline'}</span>;
        }
      `,
    },
    keyPoints: [
      'A custom hook is a function starting with `use` that calls other hooks.',
      'Each component that calls the hook gets independent state.',
      'Call hooks at the top level only, never in conditions or loops.',
      'Share one state across components by combining hooks with context or a store.',
    ],
    pitfall:
      'A hook called after an `if` or an early return changes the call order between renders and breaks state. Call all hooks first, then branch.',
    card: {
      term: 'Custom hook',
      definition: 'A reusable function named use-something that packages stateful logic built from other hooks.',
      analogy: 'A coffee machine: all the steps packaged into one appliance, and every cook who uses one gets their own cup.',
      remember: 'Hooks share logic, not state.',
    },
    exercise: {
      title: 'useLocalStorage',
      difficulty: 'hard',
      task: 'Write `useLocalStorage(key, initialValue)`. It works like useState, but saves the value to localStorage and reads it back on the first render. Use it for a notes textarea.',
      requirements: [
        'The same `[value, setValue]` API as useState',
        'Lazy initial state reads storage only once',
        'The value is saved in an effect when it changes',
      ],
      hints: [
        '`useState(() => { const saved = localStorage.getItem(key); ... })`',
        'Parse with JSON.parse and fall back to `initialValue`.',
        'Save with `localStorage.setItem(key, JSON.stringify(value))` in an effect.',
      ],
      solution: code`
        import { useEffect, useState } from 'react';

        export function useLocalStorage<T>(key: string, initialValue: T) {
          const [value, setValue] = useState<T>(() => {
            const saved = localStorage.getItem(key);
            return saved !== null ? (JSON.parse(saved) as T) : initialValue;
          });

          useEffect(() => {
            localStorage.setItem(key, JSON.stringify(value));
          }, [key, value]);

          return [value, setValue] as const;
        }

        export function Notes() {
          const [note, setNote] = useLocalStorage('note', '');
          return <textarea value={note} onChange={(e) => setNote(e.target.value)} />;
        }
      `,
    },
    quiz: [
      {
        id: 'w4-l2-q1',
        question: 'Two components call `useCounter()`. Do they share the same count?',
        options: ['Yes, hooks are singletons', 'No, each call has its own state', 'Only if they are siblings', 'Only in Strict Mode'],
        answer: 1,
        explanation: 'A custom hook reuses logic. Every call creates its own state.',
      },
      {
        id: 'w4-l2-q2',
        question: 'What is wrong with this component?',
        code: code`
          function Profile({ user }: { user?: User }) {
            if (!user) return null;
            const [tab, setTab] = useState('posts');
            // ...
          }
        `,
        options: [
          'Nothing is wrong',
          'The hook is called after a conditional early return',
          'useState needs a type argument',
          'Components cannot return null',
        ],
        answer: 1,
        explanation: 'When there is no user, useState is skipped, which changes the hook order. Call hooks before any early return.',
      },
    ],
  },
  {
    slug: 'use-reducer',
    week: 4,
    day: 3,
    track: 'react',
    title: 'useReducer: state with rules',
    summary: 'Actions in, new state out. The NgRx idea, scoped to a single component.',
    minutes: 45,
    angular: 'NgRx reducers',
    analogy: {
      title: 'A bank teller',
      body: 'With useReducer you never walk into the vault and move the money yourself. You fill in a slip (an action such as "deposit 50") and hand it to the teller (the reducer), who follows strict rules and gives you the new balance. Every change goes through the same window, so it is easy to follow.',
    },
    body: [
      'When state has several fields that change together, or the next state follows complex rules, `useReducer` keeps that logic in one place. You write a pure **reducer** `(state, action) => newState` and call `dispatch(action)` from event handlers.',
      'If you know NgRx, this will feel familiar: actions describe what happened, a reducer calculates the next state, and components only dispatch. The difference is scope. `useReducer` is local to a component, with no store, effects or selectors to set up.',
      'For app-wide state, put the state and `dispatch` in context, or use a library. Redux Toolkit is the closest match to NgRx; Zustand is a much smaller store that many teams prefer. Start local and grow only when you need to.',
    ],
    compare: {
      angular: code`
        export const add = createAction('[Cart] Add', props<{ item: Item }>());
        export const remove = createAction('[Cart] Remove', props<{ id: number }>());

        export const cartReducer = createReducer(
          initialState,
          on(add, (state, { item }) => ({ ...state, items: [...state.items, item] })),
          on(remove, (state, { id }) => ({
            ...state,
            items: state.items.filter((i) => i.id !== id),
          })),
        );

        // in a component: this.store.dispatch(add({ item }));
      `,
      react: code`
        type Action =
          | { type: 'add'; item: Item }
          | { type: 'remove'; id: number };

        function cartReducer(state: CartState, action: Action): CartState {
          switch (action.type) {
            case 'add':
              return { ...state, items: [...state.items, action.item] };
            case 'remove':
              return { ...state, items: state.items.filter((i) => i.id !== action.id) };
          }
        }

        export function Cart() {
          const [state, dispatch] = useReducer(cartReducer, { items: [] });

          return (
            <CartView
              items={state.items}
              onRemove={(id) => dispatch({ type: 'remove', id })}
            />
          );
        }
      `,
    },
    keyPoints: [
      '`useReducer(reducer, initialState)` returns `[state, dispatch]`.',
      'The reducer is a pure function: `(state, action) => newState`.',
      'Model actions as a TypeScript union for type-safe dispatching.',
      'For global state, combine with context or use Redux Toolkit or Zustand.',
    ],
    pitfall:
      'Mutating state in the reducer, as in `state.items.push(item)`, returns the same object and React skips the render. Always return a new object.',
    card: {
      term: 'Reducer',
      definition: 'A pure function that takes the current state and an action and returns the next state.',
      analogy: 'A bank teller: you hand in a slip saying what you want, and the teller applies the rules and returns the new balance.',
      remember: 'Components dispatch. Reducers decide.',
    },
    exercise: {
      title: 'Quiz state machine',
      difficulty: 'hard',
      task: 'Model a true-or-false quiz with `useReducer` and the actions `answer`, `next` and `restart`. State holds the current index, the score and whether the quiz is finished.',
      requirements: ['A typed action union', 'The reducer never mutates state', 'The component only dispatches actions'],
      hints: [
        "`type QuizAction = { type: 'answer'; correct: boolean } | ...`",
        "`next` sets `finished: true` after the last question.",
        '`restart` can simply return the initial state.',
      ],
      solution: code`
        import { useReducer } from 'react';

        interface QuizState {
          index: number;
          score: number;
          finished: boolean;
        }

        type QuizAction =
          | { type: 'answer'; correct: boolean }
          | { type: 'next'; total: number }
          | { type: 'restart' };

        const initialState: QuizState = { index: 0, score: 0, finished: false };

        function quizReducer(state: QuizState, action: QuizAction): QuizState {
          switch (action.type) {
            case 'answer':
              return action.correct ? { ...state, score: state.score + 1 } : state;
            case 'next':
              return state.index + 1 < action.total
                ? { ...state, index: state.index + 1 }
                : { ...state, finished: true };
            case 'restart':
              return initialState;
          }
        }

        export function Quiz({ questions }: { questions: { text: string; answer: boolean }[] }) {
          const [state, dispatch] = useReducer(quizReducer, initialState);

          if (state.finished) {
            return (
              <div>
                <p>Score: {state.score} / {questions.length}</p>
                <button onClick={() => dispatch({ type: 'restart' })}>Restart</button>
              </div>
            );
          }

          const question = questions[state.index];

          function choose(value: boolean) {
            dispatch({ type: 'answer', correct: value === question.answer });
            dispatch({ type: 'next', total: questions.length });
          }

          return (
            <div>
              <p>{question.text}</p>
              <button onClick={() => choose(true)}>True</button>
              <button onClick={() => choose(false)}>False</button>
            </div>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w4-l3-q1',
        question: 'What does a reducer receive and return?',
        options: ['(action) => void', '(state, action) => next state', '(dispatch) => state', '(props) => JSX'],
        answer: 1,
        explanation: 'A reducer is a pure function from the current state and an action to the next state.',
      },
      {
        id: 'w4-l3-q2',
        question: 'Which library is the closest React counterpart to NgRx?',
        options: ['React Router', 'Redux Toolkit', 'TanStack Query', 'Vite'],
        answer: 1,
        explanation: 'Redux Toolkit uses the same actions-and-reducers model. Zustand is a lighter alternative.',
      },
    ],
  },
  {
    slug: 'memoization',
    week: 4,
    day: 4,
    track: 'react',
    title: 'Performance: memo, useMemo, useCallback',
    summary: 'The manual versions of computed() and OnPush, and why the React Compiler often writes them for you.',
    minutes: 50,
    angular: 'computed() / OnPush',
    analogy: {
      title: "A tailor's notebook",
      body: 'useMemo is a tailor who writes down your measurements. If your size has not changed, the tailor reuses the notes instead of measuring you again. memo works like a receptionist who turns away a delivery identical to the one that just arrived.',
    },
    body: [
      'React re-renders children when a parent renders and recalculates everything in the component body. That is usually fast enough. When profiling shows a real problem, three tools help: `useMemo` caches a calculated value, `useCallback` caches a function, and `memo` skips re-rendering a component whose props did not change.',
      "Angular's `computed()` is memoized automatically and tracks its own dependencies. `useMemo` is the manual version: you list the dependencies, and React recalculates only when one changes. `memo` is similar in spirit to `OnPush`: the component updates only when its props change by reference.",
      'The **React Compiler** adds this memoization automatically at build time, so new projects often need no `useMemo` or `useCallback` at all. Learn the manual tools anyway: you will read them in existing code, and they explain what the compiler does.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-product-list',
          changeDetection: ChangeDetectionStrategy.OnPush,
          template: \`
            @for (product of visible(); track product.id) {
              <app-product-row [product]="product" />
            }
          \`,
        })
        export class ProductListComponent {
          products = input.required<Product[]>();
          query = input('');

          visible = computed(() =>
            this.products().filter((p) => p.name.includes(this.query()))
          );
        }
      `,
      react: code`
        import { memo, useMemo } from 'react';

        const ProductRow = memo(function ProductRow({ product }: { product: Product }) {
          return <li>{product.name}</li>;
        });

        export function ProductList({ products, query }: { products: Product[]; query: string }) {
          const visible = useMemo(
            () => products.filter((p) => p.name.includes(query)),
            [products, query],
          );

          return (
            <ul>
              {visible.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </ul>
          );
        }
      `,
    },
    keyPoints: [
      '`useMemo(fn, deps)` caches a value. It is a manual `computed()`.',
      '`useCallback(fn, deps)` keeps the same function so memoized children get a stable prop.',
      '`memo(Component)` skips renders when props are shallowly equal, similar to OnPush.',
      'Measure first. The React Compiler can add memoization for you.',
    ],
    pitfall:
      '`memo` does nothing if you pass a new object or arrow function on every render, such as `options={{ animate: true }}`. Stabilize those props or let the compiler handle it.',
    card: {
      term: 'Memoization',
      definition: 'Caching the result of a calculation or a render and reusing it until the inputs change.',
      analogy: "A tailor's notebook: if your measurements have not changed, the tailor reuses the notes instead of measuring again.",
      remember: 'Measure first, memoize second.',
    },
    exercise: {
      title: 'Fast filter',
      difficulty: 'medium',
      task: 'Render 5,000 generated items with a search input and a separate counter button. Clicking the counter should skip the filtering, and rows should not re-render.',
      requirements: [
        'Filtering wrapped in `useMemo` that depends on the query',
        'The row component wrapped in `memo`',
        'Verified with the React DevTools Profiler or console.log',
      ],
      hints: [
        'Generate items once, outside the component.',
        '`const visible = useMemo(() => items.filter(...), [query])`',
        'Pass primitive props to rows so shallow comparison works.',
      ],
      solution: code`
        import { memo, useMemo, useState } from 'react';

        const items = Array.from({ length: 5000 }, (_, i) => ({ id: i, name: \`Item \${i}\` }));

        const Row = memo(function Row({ name }: { name: string }) {
          return <li>{name}</li>;
        });

        export function FastFilter() {
          const [query, setQuery] = useState('');
          const [clicks, setClicks] = useState(0);

          const visible = useMemo(
            () => items.filter((item) => item.name.includes(query)),
            [query],
          );

          return (
            <div>
              <input value={query} onChange={(e) => setQuery(e.target.value)} />
              <button onClick={() => setClicks((c) => c + 1)}>Clicked {clicks}</button>
              <ul>
                {visible.map((item) => (
                  <Row key={item.id} name={item.name} />
                ))}
              </ul>
            </div>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w4-l4-q1',
        question: "Which React API is closest to Angular's computed()?",
        options: ['useEffect', 'useMemo', 'useRef', 'useId'],
        answer: 1,
        explanation: 'useMemo caches a derived value and recalculates it only when dependencies change.',
      },
      {
        id: 'w4-l4-q2',
        question: 'Why does the memoized Chart still re-render every time Dashboard renders?',
        code: code`
          const Chart = memo(ChartView);

          function Dashboard() {
            return <Chart options={{ animate: true }} />;
          }
        `,
        options: [
          'memo only works on class components',
          'A new options object is created on every render',
          'Chart needs a key',
          'Dashboard has no state',
        ],
        answer: 1,
        explanation: 'memo compares props by reference, and an inline object is a new reference every time.',
      },
    ],
  },
]
