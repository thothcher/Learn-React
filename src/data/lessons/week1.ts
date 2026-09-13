import { code } from '../../lib/utils'
import type { Lesson } from '../types'

export const week1: Lesson[] = [
  {
    slug: 'components-are-functions',
    week: 1,
    day: 1,
    track: 'react',
    title: 'Components are just functions',
    summary: 'Drop the decorator, the class and the selector. A React component is a function that returns UI.',
    minutes: 35,
    angular: '@Component class',
    analogy: {
      title: 'A recipe card',
      body: 'A component is a recipe card. It describes how to make a dish from ingredients (props). React is the cook: whenever the ingredients change, it reads the card again and makes a fresh plate. The card never changes the ingredients, and the same ingredients always give the same dish.',
    },
    body: [
      'In Angular, a component is a class decorated with `@Component`, plus metadata: a selector, a template, styles and imports. In React, a component is a plain JavaScript function whose name starts with a capital letter and that returns JSX.',
      'There is no selector and no module to register it in. You export the function, import it where you need it and use it as a tag: `<ProfileCard />`. The file is an ordinary ES module.',
      'React calls your function every time the component renders. Everything inside the body is recalculated on each call, which is why components should be **pure**: same props in, same UI out, with no side effects during rendering.',
    ],
    compare: {
      angular: code`
        import { Component } from '@angular/core';

        @Component({
          selector: 'app-greeting',
          template: \`<h1>Hello, {{ name }}!</h1>\`,
        })
        export class GreetingComponent {
          name = 'Ana';
        }
      `,
      react: code`
        export function Greeting() {
          const name = 'Ana';

          return <h1>Hello, {name}!</h1>;
        }
      `,
      angularLabel: 'greeting.component.ts',
      reactLabel: 'Greeting.tsx',
    },
    keyPoints: [
      'A component is a function that returns JSX, and its name starts with a capital letter.',
      'No decorators, selectors or NgModules: you import it and render it like a tag.',
      'React re-runs the function on every render, so keep it pure.',
      'Local variables replace class fields for values used only while rendering.',
    ],
    pitfall:
      'Lowercase names are treated as HTML tags. `<greeting />` renders an unknown DOM element instead of your component.',
    card: {
      term: 'Component',
      definition: 'A function that takes props and returns a description of the UI written in JSX.',
      analogy: 'A recipe card: the same ingredients always make the same dish, and React is the cook who re-reads it whenever ingredients change.',
      remember: 'Capital letter, returns JSX, stays pure.',
    },
    exercise: {
      title: 'Build a ProfileCard',
      difficulty: 'easy',
      task: 'Create a `ProfileCard` component that shows an avatar initial, a name and a job title. Render it twice inside `App`.',
      requirements: [
        'The component name starts with a capital letter',
        'It returns a single root element',
        'App renders it twice',
      ],
      hints: [
        'A component is just `function ProfileCard() { return (...) }`.',
        'Wrap several elements in a `<div>` or a fragment `<>...</>`.',
        'Hard-code the values for now; props come in lesson 3.',
      ],
      solution: code`
        function ProfileCard() {
          return (
            <article className="profile">
              <span className="avatar">A</span>
              <h2>Ana Beridze</h2>
              <p>Frontend Engineer</p>
            </article>
          );
        }

        export default function App() {
          return (
            <main>
              <ProfileCard />
              <ProfileCard />
            </main>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w1-l1-q1',
        question: 'What is a React component at its core?',
        options: [
          'A class decorated with @Component',
          'A function that returns JSX',
          'An HTML template file',
          'A module that declares selectors',
        ],
        answer: 1,
        explanation: 'Modern React components are plain functions. No decorator or metadata is needed.',
      },
      {
        id: 'w1-l1-q2',
        question: 'Why does this not render your component?',
        code: 'return <profileCard />;',
        options: [
          'Components must be default exports',
          'Lowercase tags are treated as built-in HTML elements',
          'JSX requires a separate closing tag',
          'It needs a selector',
        ],
        answer: 1,
        explanation: 'JSX treats lowercase names as DOM elements. Component names must start with a capital letter.',
      },
    ],
  },
  {
    slug: 'jsx',
    week: 1,
    day: 2,
    track: 'react',
    title: 'JSX: markup inside JavaScript',
    summary: 'Angular puts JavaScript-like syntax into HTML. JSX puts HTML-like syntax into JavaScript.',
    minutes: 40,
    angular: 'Template syntax',
    analogy: {
      title: 'A mail-merge letter',
      body: 'JSX works like a mail-merge letter. The letter itself looks like normal text (HTML), and the curly-brace slots are filled with real data every time you print it. Anything that produces a value can go into a slot: a name, a sum, a formatted date.',
    },
    body: [
      'Angular templates are HTML with extra syntax the compiler understands: `{{ }}` for interpolation, `[prop]` for bindings and `(event)` for events. JSX turns this around: it is JavaScript that allows HTML-like tags. Whenever you open `{ }`, you are back in plain JavaScript.',
      'Because JSX is JavaScript, there is no separate template language to learn. Pipes become function calls, `[ngClass]` becomes a string expression, and loops use `.map()`.',
      'A few attribute names differ because they follow DOM property names: `class` becomes `className`, `for` becomes `htmlFor`, events are camelCase and inline styles take an object: `style={{ color: \'red\' }}`. Every tag must be closed, including `<img />` and `<input />`.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-product',
          imports: [UpperCasePipe, DecimalPipe],
          template: \`
            <div class="product" [class.sale]="onSale">
              <img [src]="imageUrl" [alt]="title" />
              <h3>{{ title | uppercase }}</h3>
              <p>Total: {{ price * 1.18 | number: '1.2-2' }}</p>
            </div>
          \`,
        })
        export class ProductComponent {
          title = 'Keyboard';
          price = 49;
          onSale = true;
          imageUrl = '/keyboard.png';
        }
      `,
      react: code`
        export function Product() {
          const title = 'Keyboard';
          const price = 49;
          const onSale = true;

          return (
            <div className={onSale ? 'product sale' : 'product'}>
              <img src="/keyboard.png" alt={title} />
              <h3>{title.toUpperCase()}</h3>
              <p>Total: {(price * 1.18).toFixed(2)}</p>
            </div>
          );
        }
      `,
    },
    keyPoints: [
      'Curly braces switch from markup back to JavaScript. Any expression works inside them.',
      'Pipes become plain function or method calls.',
      'Use `className`, `htmlFor`, camelCase events and a style object.',
      'JSX compiles to function calls, so each return needs one root element or a fragment.',
    ],
    pitfall:
      'Statements like `if` and `for` cannot go inside `{ }`, only expressions. Use a ternary or `&&`, or compute the value above the `return`.',
    card: {
      term: 'JSX',
      definition: 'An HTML-like syntax that compiles to JavaScript function calls describing the UI.',
      analogy: 'A mail-merge letter: it reads like a normal letter, and the { } slots are filled with real values every time it is printed.',
      remember: 'Curly braces mean a JavaScript expression.',
    },
    exercise: {
      title: 'Price tag',
      difficulty: 'easy',
      task: 'Render a price tag that shows the product name in uppercase and the price with 18% tax to two decimals. Add a `sale` class and an "On sale" label when a discount is active.',
      requirements: [
        'Use `className` with a ternary',
        'Format the number with `toFixed(2)`',
        'No `if` statements inside the JSX',
      ],
      hints: [
        'Compute `const total = price * 1.18` above the return.',
        'Write `className={isSale ? \'tag sale\' : \'tag\'}`.',
        'Show the label with `{isSale && <em>On sale</em>}`.',
      ],
      solution: code`
        export function PriceTag() {
          const name = 'Wireless mouse';
          const price = 30;
          const isSale = true;
          const total = price * 1.18;

          return (
            <div className={isSale ? 'tag sale' : 'tag'}>
              <strong>{name.toUpperCase()}</strong>
              <span>{total.toFixed(2)} USD</span>
              {isSale && <em>On sale</em>}
            </div>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w1-l2-q1',
        question: 'Which attribute sets a CSS class in JSX?',
        options: ['class', '[class]', 'className', 'ngClass'],
        answer: 2,
        explanation: '`class` is a reserved word in JavaScript, so JSX uses the DOM property name `className`.',
      },
      {
        id: 'w1-l2-q2',
        question: "What replaces Angular's `{{ price | currency }}` in JSX?",
        options: [
          'A pipe registered on the component',
          'A plain expression such as {formatPrice(price)}',
          'A useCurrency decorator',
          'Double curly braces {{ price }}',
        ],
        answer: 1,
        explanation: 'JSX has no pipes. A function or method call inside single braces does the same job.',
      },
    ],
  },
  {
    slug: 'props',
    week: 1,
    day: 3,
    track: 'react',
    title: 'Props: inputs without decorators',
    summary: 'Everything a parent passes arrives as one read-only object, the first argument of your function.',
    minutes: 40,
    angular: 'input() / @Input()',
    analogy: {
      title: 'An order ticket',
      body: 'Props are the order ticket a waiter hands to the kitchen. The kitchen (the child) reads it and cooks, but never rewrites the ticket. If the guest changes their mind, the waiter (the parent) brings a new ticket.',
    },
    body: [
      'In Angular, a child declares what it accepts with `input()` or `@Input()`, and the parent binds with `[title]="value"`. In React, all values from the parent arrive in one object called `props`, the first argument of the function. Most code destructures it directly in the signature.',
      'Props are read-only. A component must never change its own props. If a value needs to change, the parent owns it and passes a new value down. This is the same one-way data flow you know from Angular inputs.',
      'With TypeScript, props are described by an interface. Optional props use `?`, and default values come from JavaScript default parameters, so there is no `required: true` metadata.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-badge',
          template: \`<span [class]="tone()">{{ label() }}</span>\`,
        })
        export class BadgeComponent {
          label = input.required<string>();
          tone = input<'info' | 'danger'>('info');
        }

        // parent: <app-badge label="New" tone="danger" />
      `,
      react: code`
        interface BadgeProps {
          label: string;
          tone?: 'info' | 'danger';
        }

        export function Badge({ label, tone = 'info' }: BadgeProps) {
          return <span className={tone}>{label}</span>;
        }

        // parent: <Badge label="New" tone="danger" />
      `,
    },
    keyPoints: [
      'Props are a single object passed as the first argument.',
      'Destructure them in the signature and use default parameters for defaults.',
      'Props are read-only. The parent owns the data.',
      'Pass anything that is not a string with braces: `count={3}`, `user={user}`.',
    ],
    pitfall: '`count="3"` passes the string "3". Use `count={3}` for numbers, booleans, objects and functions.',
    card: {
      term: 'Props',
      definition: 'The read-only object of values a parent passes to a child component.',
      analogy: 'An order ticket from the waiter: the kitchen reads it and cooks, but never rewrites it.',
      remember: 'Data flows down. Children read props and never change them.',
    },
    exercise: {
      title: 'Reusable Button',
      difficulty: 'easy',
      task: "Create a `Button` that accepts `label`, an optional `variant` ('primary' or 'ghost', default 'primary') and an optional `disabled` flag. Render three different buttons from `App`.",
      requirements: ['A typed props interface', 'A default value for `variant`', 'A boolean passed with braces'],
      hints: [
        'Start with `interface ButtonProps { label: string; variant?: ... }`.',
        'Defaults go in the destructuring: `{ variant = \'primary\' }`.',
        'Build the class with a template literal.',
      ],
      solution: code`
        interface ButtonProps {
          label: string;
          variant?: 'primary' | 'ghost';
          disabled?: boolean;
        }

        function Button({ label, variant = 'primary', disabled = false }: ButtonProps) {
          return (
            <button className={\`btn btn-\${variant}\`} disabled={disabled}>
              {label}
            </button>
          );
        }

        export default function App() {
          return (
            <div>
              <Button label="Save" />
              <Button label="Cancel" variant="ghost" />
              <Button label="Delete" disabled={true} />
            </div>
          );
        }
      `,
    },
    quiz: [
      {
        id: 'w1-l3-q1',
        question: 'How does a child component receive data from its parent?',
        options: [
          'Through an injected service',
          'Through the props object passed as the first argument',
          'Through @Input() decorators',
          "By reading the parent's variables directly",
        ],
        answer: 1,
        explanation: 'Props arrive as one object argument. React has no input decorators.',
      },
      {
        id: 'w1-l3-q2',
        question: 'What does `value` contain here?',
        code: '<Rating value="4" />',
        options: ['The number 4', 'The string "4"', 'undefined', 'A signal of 4'],
        answer: 1,
        explanation: 'Quotes always pass strings. Use `value={4}` to pass a number.',
      },
    ],
  },
  {
    slug: 'events-and-callbacks',
    week: 1,
    day: 4,
    track: 'react',
    title: 'Events and callback props',
    summary: 'No EventEmitter needed. Parents pass functions down, and children call them.',
    minutes: 40,
    angular: 'output() / @Output()',
    analogy: {
      title: 'A doorbell',
      body: 'A callback prop is a doorbell. The child is the button by the door, and the parent is inside the house. The child does not open the door itself; it rings the bell (calls the function), and the parent decides what happens next.',
    },
    body: [
      'DOM events in JSX are camelCase props that take a function: `onClick={handleClick}`. Pass the function itself and do not call it. `onClick={save()}` runs `save` during rendering, which is almost never what you want.',
      'Angular children talk to parents with `output()` and the parent listens with `(liked)="onLiked($event)"`. React has no separate output mechanism: the parent passes a function as a prop, usually named `onSomething`, and the child calls it.',
      'Callbacks are regular functions, so you pass whatever arguments you like; there is no `$event` convention. Use an arrow function to pass extra data: `onClick={() => onSelect(item.id)}`.',
    ],
    compare: {
      angular: code`
        @Component({
          selector: 'app-like-button',
          template: \`<button (click)="liked.emit(postId())">Like</button>\`,
        })
        export class LikeButtonComponent {
          postId = input.required<number>();
          liked = output<number>();
        }

        // parent: <app-like-button [postId]="post.id" (liked)="onLiked($event)" />
      `,
      react: code`
        interface LikeButtonProps {
          postId: number;
          onLike: (postId: number) => void;
        }

        export function LikeButton({ postId, onLike }: LikeButtonProps) {
          return <button onClick={() => onLike(postId)}>Like</button>;
        }

        // parent: <LikeButton postId={post.id} onLike={handleLike} />
      `,
    },
    keyPoints: [
      'Events are camelCase props such as `onClick`, `onChange` and `onSubmit`.',
      'Pass a function reference instead of calling it.',
      'Outputs are just callback props named `onSomething`.',
      'Use an arrow function to pass extra arguments.',
    ],
    pitfall:
      '`onClick={handleDelete(id)}` calls the function on every render. Wrap it: `onClick={() => handleDelete(id)}`.',
    card: {
      term: 'Callback prop',
      definition: 'A function passed from parent to child so the child can report that something happened.',
      analogy: 'A doorbell: the child rings it, and the parent inside decides whether to open the door.',
      remember: 'Data goes down as props. Events go up through callbacks.',
    },
    exercise: {
      title: 'Star rating',
      difficulty: 'medium',
      task: 'Build a `StarRating` component that renders five buttons. Clicking one calls an `onRate(value)` prop. The parent only logs the value for now.',
      requirements: [
        'Accept `onRate: (value: number) => void`',
        'Create the buttons with `.map()` over `[1, 2, 3, 4, 5]`',
        'Pass the value through an arrow function',
      ],
      hints: [
        'Lists need a `key` on each element; the value itself works here.',
        'Inside the map: `onClick={() => onRate(value)}`.',
        "In App: `<StarRating onRate={(v) => console.log(v)} />`.",
      ],
      solution: code`
        interface StarRatingProps {
          onRate: (value: number) => void;
        }

        function StarRating({ onRate }: StarRatingProps) {
          return (
            <div className="stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} onClick={() => onRate(value)}>
                  {value}
                </button>
              ))}
            </div>
          );
        }

        export default function App() {
          return <StarRating onRate={(value) => console.log('Rated', value)} />;
        }
      `,
    },
    quiz: [
      {
        id: 'w1-l4-q1',
        question: 'What is wrong with this button?',
        code: '<button onClick={save()}>Save</button>',
        options: [
          'Nothing, it works',
          'save runs during render instead of on click',
          'Event names must be lowercase',
          'save needs a $event argument',
        ],
        answer: 1,
        explanation: 'The parentheses call the function immediately. Pass `save` or `() => save()` instead.',
      },
      {
        id: 'w1-l4-q2',
        question: "What is the React equivalent of Angular's `output()`?",
        options: ['A useOutput hook', 'A callback function passed as a prop', 'An EventEmitter', 'A context provider'],
        answer: 1,
        explanation: 'Parents pass functions down, and children call them to report events.',
      },
    ],
  },
]
