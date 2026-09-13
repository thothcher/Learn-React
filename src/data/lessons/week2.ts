import { code } from '../../lib/utils'
import type { Lesson } from '../types'

export const week2: Lesson[] = [
  {
    slug: 'use-state',
    week: 2,
    day: 1,
    track: 'react',
    title: 'useState: memory for components',
    summary: 'Local variables reset on every render. State survives between renders and triggers updates.',
    minutes: 45,
    angular: 'signal()',
    analogy: {
      title: 'A whiteboard in a meeting room',
      body: 'Local variables are notes on a napkin: they are thrown away after every meeting (render). State is the whiteboard that stays in the room. You must write on it with the marker (the setter), because that is what makes everyone look up and start a new meeting with the updated board.',
    },
    body: [
      'Regular variables in a component reset on every render, because React calls the function again. To remember a value between renders, use `useState`. It returns a pair: the current value and a setter function.',
      'The closest Angular idea is a writable `signal()`. `count.set(5)` maps to `setCount(5)`, and `count.update(c => c + 1)` maps to `setCount(c => c + 1)`. The difference is what happens next: the setter schedules a re-render, and the whole component function runs again with the new value.',
      'State is a **snapshot**. Inside one render the value never changes, so right after `setCount(count + 1)` the variable `count` still holds the old value. Treat objects and arrays as immutable and replace them with copies instead of mutating them.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-counter',
          template: \`
            <p>Clicked {{ count() }} times</p>
            <button (click)="increment()">+1</button>
          \`,
        })
        export class CounterComponent {
          count = signal(0);

          increment() {
            this.count.update((c) => c + 1);
          }
        }
      `,
      react: code`
        import { useState } from 'react';

        export function Counter() {
          const [count, setCount] = useState(0);

          function increment() {
            setCount((c) => c + 1);
          }

          return (
            <>
              <p>Clicked {count} times</p>
              <button onClick={increment}>+1</button>
            </>
          );
        }
      `,
    },
    keyPoints: [
      '`useState(initial)` returns `[value, setValue]`.',
      'Calling the setter re-renders the component with the new value.',
      'Use the updater form `setCount(c => c + 1)` when the next value depends on the previous one.',
      'Never mutate state objects or arrays. Replace them with copies.',
    ],
    pitfall:
      '`todos.push(item)` followed by `setTodos(todos)` shows nothing new: it is the same array, so React skips the update. Use `setTodos([...todos, item])`.',
    card: {
      term: 'State',
      definition: 'Data a component remembers between renders. Changing it with the setter triggers a re-render.',
      analogy: 'A whiteboard in a meeting room: napkin notes are thrown away after each meeting, but the whiteboard stays, and writing on it makes everyone look up.',
      remember: 'Read the value, write with the setter, never mutate.',
    },
    exercise: {
      title: 'Like counter with reset',
      difficulty: 'easy',
      task: 'Build a `LikeCounter` with a count in state, a Like button that adds one, and a Reset button that sets it back to zero. Disable Reset when the count is already zero.',
      requirements: ['State created with `useState`', 'An updater function for incrementing', 'Reset is disabled at zero'],
      hints: [
        '`const [likes, setLikes] = useState(0)`',
        '`setLikes((l) => l + 1)`',
        '`disabled={likes === 0}`',
      ],
      solution: code`
        import { useState } from 'react';

        export function LikeCounter() {
          const [likes, setLikes] = useState(0);

          return (
            <div>
              <p>{likes} likes</p>
              <button onClick={() => setLikes((l) => l + 1)}>Like</button>
              <button onClick={() => setLikes(0)} disabled={likes === 0}>
                Reset
              </button>
            </div>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w2-l1-q1',
        question: 'What does `useState` return?',
        options: [
          'The current value only',
          'A signal object with set() and update()',
          'An array with the current value and a setter',
          'A ref object',
        ],
        answer: 2,
        explanation: 'Destructure it: `const [value, setValue] = useState(initial)`.',
      },
      {
        id: 'w2-l1-q2',
        question: 'What does the console print on the first click?',
        code: code`
          const [count, setCount] = useState(0);

          function handleClick() {
            setCount(count + 1);
            console.log(count);
          }
        `,
        options: ['0', '1', 'undefined', 'It throws an error'],
        answer: 0,
        explanation: 'State is a snapshot. `count` keeps its value for the whole render; the new value appears on the next render.',
      },
    ],
  },
  {
    slug: 'conditions-and-lists',
    week: 2,
    day: 2,
    track: 'react',
    title: 'Conditional rendering and lists',
    summary: 'No @if or @for. Ternaries, && and .map() do the same work in plain JavaScript.',
    minutes: 40,
    angular: '@if / @for',
    analogy: {
      title: 'Name tags at a conference',
      body: 'Keys are name tags. If the organizer only knew guests by seat number (the array index), everyone would get mixed up when someone changed seats. With name tags (stable ids), React knows exactly who moved, who arrived and who left.',
    },
    body: [
      'Angular has control-flow blocks: `@if`, `@else`, `@for` and `@switch`. React has none of these. For conditions you use a ternary `cond ? <A /> : <B />`, the `&&` operator for "render or nothing", or an early `return` before the main JSX.',
      'For lists, use `array.map()` to turn data into elements. Each element needs a `key` prop with a stable, unique value, just like `track item.id` in `@for`. Keys let React match items between renders when the list is reordered or filtered.',
      'You can also build JSX into variables before the `return`. It keeps complex views readable, and it is still just JavaScript.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-todo-list',
          template: \`
            @if (todos().length === 0) {
              <p>Nothing to do</p>
            } @else {
              <ul>
                @for (todo of todos(); track todo.id) {
                  <li [class.done]="todo.done">{{ todo.title }}</li>
                }
              </ul>
            }
          \`,
        })
        export class TodoListComponent {
          todos = input.required<Todo[]>();
        }
      `,
      react: code`
        interface TodoListProps {
          todos: Todo[];
        }

        export function TodoList({ todos }: TodoListProps) {
          if (todos.length === 0) {
            return <p>Nothing to do</p>;
          }

          return (
            <ul>
              {todos.map((todo) => (
                <li key={todo.id} className={todo.done ? 'done' : undefined}>
                  {todo.title}
                </li>
              ))}
            </ul>
          );
        }
      `,
    },
    keyPoints: [
      'Conditions use plain JavaScript: a ternary, `&&` or an early return.',
      'Lists use `.map()`, and every item needs a `key`.',
      'Keys should be stable ids, the equivalent of `track todo.id`.',
      '`@empty` becomes a simple length check.',
    ],
    pitfall: '`{count && <Badge />}` renders a `0` when count is 0. Write `{count > 0 && <Badge />}`.',
    card: {
      term: 'Key',
      definition: 'A stable, unique identifier on each list item that helps React match elements between renders.',
      analogy: 'Name tags at a conference: seat numbers change when people move, but name tags always say who is who.',
      remember: 'Use ids for keys, not indexes.',
    },
    exercise: {
      title: 'Contact list',
      difficulty: 'medium',
      task: 'Render a list of contacts with a name and an online flag. Show a dot for online contacts, an empty state when the list is empty, and the number of online contacts above the list.',
      requirements: [
        '`.map()` with `key={contact.id}`',
        'An empty state with an early return',
        'The online count derived with `.filter()`',
      ],
      hints: [
        'Return early: `if (contacts.length === 0) return <p>...</p>`.',
        '`contacts.filter((c) => c.online).length`',
        'Render the dot with `{contact.online && <span className="dot" />}`.',
      ],
      solution: code`
        interface Contact {
          id: number;
          name: string;
          online: boolean;
        }

        export function ContactList({ contacts }: { contacts: Contact[] }) {
          if (contacts.length === 0) {
            return <p>No contacts yet.</p>;
          }

          const onlineCount = contacts.filter((c) => c.online).length;

          return (
            <section>
              <p>{onlineCount} online</p>
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    {contact.online && <span className="dot" />}
                    {contact.name}
                  </li>
                ))}
              </ul>
            </section>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w2-l2-q1',
        question: 'What is the React equivalent of `@for (item of items; track item.id)`?',
        options: [
          '<For each={items}>',
          'items.map(item => <Row key={item.id} />)',
          'items.forEach(item => <Row />)',
          'A *ngFor attribute',
        ],
        answer: 1,
        explanation: '`.map()` returns an array of elements, and `key` plays the role of `track`.',
      },
      {
        id: 'w2-l2-q2',
        question: 'What appears on screen when `messages.length` is 0?',
        code: '{messages.length && <Badge count={messages.length} />}',
        options: ['Nothing', '0', 'false', 'An empty Badge'],
        answer: 1,
        explanation: '`0 && x` evaluates to 0, and React renders numbers. Compare explicitly: `messages.length > 0 && ...`.',
      },
    ],
  },
  {
    slug: 'how-react-renders',
    week: 2,
    day: 3,
    track: 'react',
    title: 'How React renders',
    summary: 'Forget zone.js. A state change re-runs the component, and React patches only what changed.',
    minutes: 45,
    angular: 'Change detection',
    analogy: {
      title: 'A stage crew between scenes',
      body: 'Each render writes the script for the next scene: a fresh JSX snapshot. The stage crew (React DOM) compares it with what is on stage now and moves only the props that differ, instead of rebuilding the whole set.',
    },
    body: [
      'Angular with zone.js runs change detection after events and async tasks and checks bindings across the tree. With signals, Angular tracks exactly which bindings read which signal. React uses a different model: a component re-renders when **its state changes**, when **its parent re-renders**, or when a **context** it reads changes.',
      'Rendering means calling your component function to get new JSX. React compares the new tree with the previous one (reconciliation) and commits only real DOM changes. Re-rendering is cheap by design; touching the DOM is what React keeps to a minimum.',
      'Every update has three steps: **trigger** (a setter is called), **render** (React calls your components) and **commit** (React updates the DOM). Updates made in the same event are batched, so three setter calls in one click cause a single render.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-cart-summary',
          template: \`
            <p>Items: {{ items().length }}</p>
            <p>Total: {{ total() }}</p>
          \`,
        })
        export class CartSummaryComponent {
          items = input.required<Item[]>();

          // Recomputed only when items() changes
          total = computed(() =>
            this.items().reduce((sum, item) => sum + item.price, 0)
          );
        }
      `,
      react: code`
        interface CartSummaryProps {
          items: Item[];
        }

        export function CartSummary({ items }: CartSummaryProps) {
          // Recomputed on every render, which is usually fine
          const total = items.reduce((sum, item) => sum + item.price, 0);

          return (
            <>
              <p>Items: {items.length}</p>
              <p>Total: {total}</p>
            </>
          );
        }
      `,
    },
    keyPoints: [
      'A component re-renders when its state, its parent or a context it reads changes.',
      'Rendering calls your function; React commits only the DOM differences.',
      'Derived values such as totals are computed during render, not stored in state.',
      'Several state updates in one event are batched into one render.',
    ],
    pitfall:
      'Do not copy props into state just to display them, as in `useState(props.items)`. That state will not follow later prop changes. Compute from props directly.',
    card: {
      term: 'Re-render',
      definition: 'React calling a component function again for fresh JSX, then updating only what changed in the DOM.',
      analogy: 'A stage crew between scenes: the script is new, but the crew only moves the props that differ.',
      remember: 'Trigger, render, commit.',
    },
    exercise: {
      title: 'Render detective',
      difficulty: 'medium',
      task: 'Build a parent with a counter and two children: one receives the count, the other receives nothing. Log a message in each child and click the button. Explain in a comment why both children log, and show whether the count is even without adding state.',
      requirements: ['A `console.log` in each child body', 'A derived `isEven` value instead of state', 'A comment explaining the result'],
      hints: [
        'Children re-render when their parent re-renders, with or without props.',
        '`const isEven = count % 2 === 0`',
        'Week 4 introduces `memo`, which can skip the second child.',
      ],
      solution: code`
        import { useState } from 'react';

        function CountDisplay({ count }: { count: number }) {
          console.log('CountDisplay rendered');
          const isEven = count % 2 === 0;
          return <p>{count} is {isEven ? 'even' : 'odd'}</p>;
        }

        function StaticFooter() {
          console.log('StaticFooter rendered');
          return <footer>Static content</footer>;
        }

        export default function App() {
          const [count, setCount] = useState(0);

          // Both children log on every click: when a parent renders,
          // React renders all of its children by default.
          return (
            <>
              <button onClick={() => setCount((c) => c + 1)}>Add</button>
              <CountDisplay count={count} />
              <StaticFooter />
            </>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w2-l3-q1',
        question: 'Which of these does NOT make a component re-render?',
        options: [
          'Its own state changes',
          'Its parent re-renders',
          'A context it reads changes',
          'A local variable is reassigned',
        ],
        answer: 3,
        explanation: 'Only state, parent renders and context trigger renders. Reassigning a local variable does nothing.',
      },
      {
        id: 'w2-l3-q2',
        question: 'How many renders does one click cause?',
        code: code`
          function handleClick() {
            setName('Luka');
            setAge(30);
            setActive(true);
          }
        `,
        options: ['Three', 'One', 'Zero', 'Two'],
        answer: 1,
        explanation: 'React batches state updates made in the same event into one render.',
      },
    ],
  },
  {
    slug: 'forms',
    week: 2,
    day: 4,
    track: 'react',
    title: 'Forms and controlled inputs',
    summary: '[(ngModel)] is value plus onChange, written by hand. That is the whole trick.',
    minutes: 50,
    angular: 'ngModel / Reactive Forms',
    analogy: {
      title: 'A thermostat display',
      body: 'A controlled input is a thermostat display. It always shows the temperature stored in the thermostat (state). Turning the dial sends a change request (onChange), the stored value updates, and the display follows. The display never keeps a value of its own.',
    },
    body: [
      'Angular offers template-driven forms with `[(ngModel)]` and Reactive Forms with `FormGroup` and `FormControl`. React has no built-in form system. The standard pattern is a **controlled input**: its `value` comes from state, and every keystroke updates that state through `onChange`.',
      '`[(ngModel)]="name"` is shorthand for `[ngModel]="name"` plus `(ngModelChange)="name = $event"`. A controlled input writes out the same two halves: `value={name}` and `onChange={e => setName(e.target.value)}`.',
      'Handle submission with `onSubmit` on the form and call `e.preventDefault()` to stop the page reload. For large forms, React Hook Form with a Zod schema plays the role of Reactive Forms and validators. React 19 also accepts a function in `<form action={...}>`, covered in week 5.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-signup',
          imports: [ReactiveFormsModule],
          template: \`
            <form [formGroup]="form" (ngSubmit)="submit()">
              <input formControlName="email" type="email" />
              @if (form.controls.email.invalid) {
                <small>Enter a valid email</small>
              }
              <button [disabled]="form.invalid">Sign up</button>
            </form>
          \`,
        })
        export class SignupComponent {
          form = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email]),
          });

          submit() {
            console.log(this.form.value);
          }
        }
      `,
      react: code`
        import { useState, type FormEvent } from 'react';

        export function Signup() {
          const [email, setEmail] = useState('');
          const isValid = email.includes('@');

          function handleSubmit(e: FormEvent) {
            e.preventDefault();
            console.log({ email });
          }

          return (
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {!isValid && <small>Enter a valid email</small>}
              <button disabled={!isValid}>Sign up</button>
            </form>
          );
        }
      `,
    },
    keyPoints: [
      'A controlled input takes `value` from state and updates it in `onChange`.',
      '`[(ngModel)]` equals `value` plus `onChange`, written explicitly.',
      'Handle `onSubmit` and call `e.preventDefault()`.',
      'Validation is plain logic derived during render, or a library such as React Hook Form.',
    ],
    pitfall:
      'Setting `value` without `onChange` makes the input read-only, because React keeps resetting it to the state value. Add `onChange`, or use `defaultValue` for an uncontrolled input.',
    card: {
      term: 'Controlled input',
      definition: 'An input whose value is driven by React state and updated through onChange.',
      analogy: 'A thermostat display: it always shows the stored temperature, and turning the dial asks the thermostat to change it.',
      remember: 'value + onChange = [(ngModel)].',
    },
    exercise: {
      title: 'Registration form',
      difficulty: 'medium',
      task: 'Build a form with name, email and a terms checkbox. Show a hint under the email field while it is invalid, and keep the submit button disabled until every field is valid.',
      requirements: ['One state object for all fields', 'The checkbox uses `checked`, not `value`', 'Submit prevents the page reload'],
      hints: [
        "`useState({ name: '', email: '', terms: false })`",
        'Update one field with `setForm({ ...form, [name]: value })`.',
        'For checkboxes read `e.target.checked`.',
      ],
      solution: code`
        import { useState, type ChangeEvent, type FormEvent } from 'react';

        export function Registration() {
          const [form, setForm] = useState({ name: '', email: '', terms: false });

          function handleChange(e: ChangeEvent<HTMLInputElement>) {
            const { name, type, value, checked } = e.target;
            setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
          }

          function handleSubmit(e: FormEvent) {
            e.preventDefault();
            alert(\`Welcome, \${form.name}!\`);
          }

          const emailValid = form.email.includes('@');
          const isValid = form.name.length > 1 && emailValid && form.terms;

          return (
            <form onSubmit={handleSubmit}>
              <input name="name" value={form.name} onChange={handleChange} />
              <input name="email" value={form.email} onChange={handleChange} />
              {form.email && !emailValid && <small>Email needs an @</small>}
              <label>
                <input name="terms" type="checkbox" checked={form.terms} onChange={handleChange} />
                I accept the terms
              </label>
              <button disabled={!isValid}>Create account</button>
            </form>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w2-l4-q1',
        question: 'What is the React equivalent of `[(ngModel)]="name"`?',
        options: [
          'bind={name}',
          'value={name} together with onChange={e => setName(e.target.value)}',
          'model={name}',
          'useModel(name)',
        ],
        answer: 1,
        explanation: 'Two-way binding is written as two one-way halves: value down, onChange up.',
      },
      {
        id: 'w2-l4-q2',
        question: 'Why can the user not type into this input?',
        code: '<input value={title} />',
        options: [
          'title must be a signal',
          'It has no onChange, so React keeps it at the state value',
          'Inputs need a name attribute',
          'Inputs inside forms must use defaultValue',
        ],
        answer: 1,
        explanation: 'A controlled input without onChange is read-only. Add a handler or use `defaultValue`.',
      },
    ],
  },
]
