import { code } from '../lib/utils'
import type { Track } from './types'

export interface GapChallenge {
  id: string
  track: Track
  title: string
  prompt: string
  /** Blanks are written as [[0]], [[1]] … in order. */
  code: string
  blanks: { options: string[]; answer: string }[]
  explanation: string
  lessonSlug: string
}

export const gapChallenges: GapChallenge[] = [
  {
    id: 'state',
    track: 'react',
    title: 'Declare state',
    prompt: 'Create a counter that starts at zero.',
    code: code`
      import { [[0]] } from 'react';

      function Counter() {
        const [count, [[1]]] = useState(0);
        return <button onClick={() => setCount(count + 1)}>{count}</button>;
      }
    `,
    blanks: [
      { options: ['signal', 'useState', 'useRef'], answer: 'useState' },
      { options: ['count.set', 'updateCount', 'setCount'], answer: 'setCount' },
    ],
    explanation: 'useState returns the value and its setter, which you destructure from the array.',
    lessonSlug: 'use-state',
  },
  {
    id: 'list',
    track: 'react',
    title: 'Render a list',
    prompt: 'Turn the todos array into list items with stable keys.',
    code: code`
      <ul>
        {todos.[[0]]((todo) => (
          <li [[1]]={todo.id}>{todo.title}</li>
        ))}
      </ul>
    `,
    blanks: [
      { options: ['forEach', 'map', 'filter'], answer: 'map' },
      { options: ['track', 'id', 'key'], answer: 'key' },
    ],
    explanation: 'map returns a new array of elements, and key plays the role of track in @for.',
    lessonSlug: 'conditions-and-lists',
  },
  {
    id: 'events',
    track: 'react',
    title: 'Handle a click',
    prompt: 'Call onDelete with the item id when the button is clicked.',
    code: code`
      <button [[0]]={() => onDelete(item.id)}>
        Delete
      </button>
    `,
    blanks: [{ options: ['(click)', 'onClick', 'onclick'], answer: 'onClick' }],
    explanation: 'React events are camelCase props that receive a function.',
    lessonSlug: 'events-and-callbacks',
  },
  {
    id: 'class-name',
    track: 'react',
    title: 'Conditional class',
    prompt: 'Add the active class when the tab is selected.',
    code: code`
      <div [[0]]={isActive ? 'tab active' : 'tab'}>
        {label}
      </div>
    `,
    blanks: [{ options: ['class', 'ngClass', 'className'], answer: 'className' }],
    explanation: 'JSX uses the DOM property name className, and any expression can build the string.',
    lessonSlug: 'jsx',
  },
  {
    id: 'controlled',
    track: 'react',
    title: 'Controlled input',
    prompt: 'Keep the input in sync with the name state.',
    code: code`
      <input
        [[0]]={name}
        [[1]]={(e) => setName(e.target.value)}
      />
    `,
    blanks: [
      { options: ['value', 'ngModel', 'defaultValue'], answer: 'value' },
      { options: ['(input)', 'onChange', 'onModelChange'], answer: 'onChange' },
    ],
    explanation: 'value plus onChange is the React version of two-way binding.',
    lessonSlug: 'forms',
  },
  {
    id: 'effect',
    track: 'react',
    title: 'Effect with cleanup',
    prompt: 'Start a timer once on mount and stop it on unmount.',
    code: code`
      useEffect(() => {
        const id = setInterval(() => setSeconds((s) => s + 1), 1000);
        [[0]] () => clearInterval(id);
      }, [[1]]);
    `,
    blanks: [
      { options: ['return', 'await', 'yield'], answer: 'return' },
      { options: ['null', '[]', '[id]'], answer: '[]' },
    ],
    explanation: 'An empty dependency array runs once, and the returned function is the cleanup.',
    lessonSlug: 'use-effect',
  },
  {
    id: 'context',
    track: 'react',
    title: 'Read context',
    prompt: 'Create a theme context and read it in a button.',
    code: code`
      const ThemeContext = [[0]]('light');

      function SaveButton() {
        const theme = [[1]](ThemeContext);
        return <button className={theme}>Save</button>;
      }
    `,
    blanks: [
      { options: ['createContext', 'inject', 'provide'], answer: 'createContext' },
      { options: ['inject', 'useRef', 'useContext'], answer: 'useContext' },
    ],
    explanation: 'createContext defines the context, and useContext reads the nearest provider value.',
    lessonSlug: 'context',
  },
  {
    id: 'memo',
    track: 'react',
    title: 'Memoize a calculation',
    prompt: 'Only filter again when products or query change.',
    code: code`
      const visible = [[0]](
        () => products.filter((p) => p.name.includes(query)),
        [[1]],
      );
    `,
    blanks: [
      { options: ['useMemo', 'computed', 'useEffect'], answer: 'useMemo' },
      { options: ['[]', '[products, query]', '[visible]'], answer: '[products, query]' },
    ],
    explanation: 'useMemo recalculates only when a listed dependency changes.',
    lessonSlug: 'memoization',
  },
  {
    id: 'action-state',
    track: 'react',
    title: 'Form action state',
    prompt: 'Track the result and pending state of a form action.',
    code: code`
      const [error, formAction, isPending] = [[0]](saveProfile, null);

      return (
        <form [[1]]={formAction}>
          <input name="name" />
          <button disabled={isPending}>Save</button>
        </form>
      );
    `,
    blanks: [
      { options: ['useFormStatus', 'useActionState', 'useTransition'], answer: 'useActionState' },
      { options: ['action', 'onSubmit', '(ngSubmit)'], answer: 'action' },
    ],
    explanation: 'useActionState wraps the action, and the form receives it through the action prop.',
    lessonSlug: 'actions-and-forms',
  },
  {
    id: 'client-boundary',
    track: 'next',
    title: 'Client Component boundary',
    prompt: 'This button uses state. Mark the file correctly.',
    code: code`
      [[0]]

      import { useState } from 'react';

      export function LikeButton() {
        const [liked, setLiked] = useState(false);
        return <button onClick={() => setLiked(!liked)}>Like</button>;
      }
    `,
    blanks: [{ options: ["'use server';", "'use client';", '@Client()'], answer: "'use client';" }],
    explanation: "State and event handlers need the browser, so the file starts with 'use client'.",
    lessonSlug: 'server-and-client-components',
  },
  {
    id: 'params',
    track: 'next',
    title: 'Dynamic route params',
    prompt: 'Read the slug in app/courses/[slug]/page.tsx.',
    code: code`
      export default async function Page({
        params,
      }: {
        params: [[0]]<{ slug: string }>;
      }) {
        const { slug } = [[1]] params;
        return <h1>{slug}</h1>;
      }
    `,
    blanks: [
      { options: ['Observable', 'Promise', 'Signal'], answer: 'Promise' },
      { options: ['await', 'use', 'async'], answer: 'await' },
    ],
    explanation: 'params is a promise in the App Router, so an async page awaits it.',
    lessonSlug: 'app-router',
  },
  {
    id: 'server-action',
    track: 'next',
    title: 'Server Action',
    prompt: 'Save a todo on the server and refresh the page data.',
    code: code`
      [[0]]

      import { revalidatePath } from 'next/cache';

      export async function addTodo(formData: FormData) {
        await db.todo.create({ data: { title: String(formData.get('title')) } });
        [[1]]('/todos');
      }
    `,
    blanks: [
      { options: ["'use client';", "'use action';", "'use server';"], answer: "'use server';" },
      { options: ['revalidatePath', 'router.refresh', 'location.reload'], answer: 'revalidatePath' },
    ],
    explanation: "'use server' marks the action, and revalidatePath refreshes the cached route data.",
    lessonSlug: 'server-actions',
  },
]

export function splitGapCode(source: string) {
  return source.split(/\[\[(\d+)\]\]/)
}
