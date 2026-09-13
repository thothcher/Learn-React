export interface CheatRow {
  angular: string
  react: string
  note?: string
}

export interface CheatSection {
  id: string
  title: string
  rows: CheatRow[]
}

export const cheatSheet: CheatSection[] = [
  {
    id: 'templates',
    title: 'Components and templates',
    rows: [
      { angular: '`@Component({ selector, template })`', react: '`function Card() { return <div /> }`' },
      { angular: '`imports: [...]` in a component', react: 'Plain ES `import` statements' },
      { angular: '`{{ value }}`', react: '`{value}`' },
      { angular: '`[src]="url"`', react: '`src={url}`' },
      { angular: '`(click)="save()"`', react: '`onClick={save}`', note: 'Pass the function, do not call it.' },
      { angular: '`@if (user) { … } @else { … }`', react: '`{user ? <A /> : <B />}`' },
      { angular: '`@for (item of items; track item.id)`', react: '`items.map((item) => <Row key={item.id} />)`' },
      { angular: '`@switch`', react: 'A `switch` in a function, or an object lookup' },
      { angular: '`[class.active]="isActive"`', react: "`className={isActive ? 'active' : ''}`" },
      { angular: '`[style.width.px]="width"`', react: '`style={{ width }}`' },
      { angular: '`{{ date | date }}`', react: '`{formatDate(date)}`', note: 'Pipes become plain functions.' },
      { angular: '`<ng-container>`', react: '`<>…</>` (a Fragment)' },
      { angular: '`<ng-content>`', react: '`children`' },
      { angular: '`<ng-content select="footer">`', react: 'A prop that holds JSX: `footer={<Actions />}`' },
      { angular: '`<ng-template>` + `ngTemplateOutlet`', react: 'A prop that holds JSX or a render function' },
    ],
  },
  {
    id: 'state',
    title: 'State and reactivity',
    rows: [
      { angular: '`count = signal(0)`', react: '`const [count, setCount] = useState(0)`' },
      { angular: '`count.set(5)`', react: '`setCount(5)`' },
      { angular: '`count.update((c) => c + 1)`', react: '`setCount((c) => c + 1)`' },
      { angular: '`computed(() => …)`', react: 'Compute during render, or `useMemo`' },
      { angular: '`effect(() => …)`', react: '`useEffect(() => …, [deps])`' },
      { angular: '`linkedSignal()`', react: 'Derive during render, or reset state with a `key`' },
      { angular: '`ChangeDetectionStrategy.OnPush`', react: '`memo(Component)` or the React Compiler' },
      { angular: 'Zone.js change detection', react: 'Re-render when state, the parent or a context changes' },
      { angular: 'RxJS `BehaviorSubject` store', react: '`useReducer` with context, or Zustand' },
      { angular: 'NgRx Store', react: 'Redux Toolkit or Zustand' },
    ],
  },
  {
    id: 'lifecycle',
    title: 'Lifecycle',
    rows: [
      { angular: '`constructor` and field initializers', react: 'The function body, or `useState(() => init)`', note: 'The body runs on every render.' },
      { angular: '`ngOnInit`', react: '`useEffect(() => { … }, [])`' },
      { angular: '`ngOnChanges`', react: 'Compute from props, or `useEffect` with the prop as a dependency' },
      { angular: '`ngOnDestroy` / `DestroyRef`', react: 'The cleanup function returned from `useEffect`' },
      { angular: '`ngAfterViewInit`', react: '`useEffect` or `useLayoutEffect` with a ref' },
    ],
  },
  {
    id: 'communication',
    title: 'Communication and DI',
    rows: [
      { angular: '`input()` / `@Input()`', react: 'Props' },
      { angular: '`input.required<T>()`', react: 'A non-optional field in the props interface' },
      { angular: '`output()` / `@Output()`', react: 'A callback prop such as `onSave`' },
      { angular: '`model()`', react: 'A `value` prop plus an `onValueChange` prop' },
      { angular: "`@Injectable({ providedIn: 'root' })`", react: 'A module, a custom hook, or context' },
      { angular: '`inject(Service)`', react: '`useContext(ServiceContext)`' },
      { angular: 'Component `providers: [...]`', react: 'A context provider around a subtree' },
      { angular: '`viewChild()` / `ElementRef`', react: '`useRef()` and `ref={myRef}`' },
    ],
  },
  {
    id: 'forms',
    title: 'Forms',
    rows: [
      { angular: '`[(ngModel)]="name"`', react: '`value={name}` and `onChange={(e) => setName(e.target.value)}`' },
      { angular: '`FormGroup` / `FormControl`', react: 'A `useState` object, or React Hook Form' },
      { angular: '`Validators.required`', react: 'Plain checks, or a Zod schema' },
      { angular: '`(ngSubmit)="save()"`', react: '`onSubmit` with `e.preventDefault()`, or `<form action={fn}>`' },
      { angular: 'Manual `pending` signal', react: '`useActionState` and `useFormStatus`' },
    ],
  },
  {
    id: 'routing',
    title: 'Routing',
    rows: [
      { angular: '`Routes` array', react: '`createBrowserRouter([...])`, or folders in Next.js `app/`' },
      { angular: '`<router-outlet>`', react: "`<Outlet />`, or a layout's `children`" },
      { angular: '`routerLink="/about"`', react: '`<Link to="/about">`, or `<Link href="/about">` in Next.js' },
      { angular: "`router.navigate(['/home'])`", react: "`useNavigate()`, or `useRouter().push('/home')` in Next.js" },
      { angular: '`ActivatedRoute` params', react: '`useParams()`, or the `params` prop in Next.js' },
      { angular: '`canActivate` guard', react: 'A loader redirect, or `proxy.ts` plus server checks' },
      { angular: 'Resolvers', react: 'Route loaders, or data fetching in Server Components' },
      { angular: '`loadComponent: () => import(…)`', react: '`lazy(() => import(…))`; automatic in Next.js' },
    ],
  },
  {
    id: 'data',
    title: 'HTTP and data',
    rows: [
      { angular: '`HttpClient.get()`', react: '`fetch()` or TanStack Query `useQuery`' },
      { angular: '`async` pipe', react: '`use(promise)` with Suspense, or `useQuery`' },
      { angular: 'HTTP interceptors', react: 'A fetch wrapper, or query client defaults' },
      { angular: '`httpResource()` / `resource()`', react: '`useQuery()`, or async Server Components' },
      { angular: '`@defer`', react: '`lazy()` with `<Suspense>`' },
      { angular: 'Global `ErrorHandler`', react: 'Error boundaries, or `error.tsx` in Next.js' },
    ],
  },
  {
    id: 'next',
    title: 'Server rendering and Next.js',
    rows: [
      { angular: '`@angular/ssr`', react: 'The Next.js App Router' },
      { angular: '`RenderMode.Prerender`', react: 'Static rendering with `generateStaticParams`' },
      { angular: '`RenderMode.Server`', react: 'Dynamic rendering, triggered by cookies, headers or searchParams' },
      { angular: '`TransferState`', react: 'Server Components passing data as props' },
      { angular: '`Title` / `Meta` services', react: '`export const metadata` or `generateMetadata`' },
      { angular: '`NgOptimizedImage`', react: '`next/image`' },
      { angular: '`environment.ts`', react: '`.env` files and the `NEXT_PUBLIC_` prefix' },
      { angular: 'A separate NestJS backend', react: 'Route Handlers (`route.ts`) and Server Actions' },
    ],
  },
  {
    id: 'tooling',
    title: 'Tooling',
    rows: [
      { angular: '`ng new`', react: '`npm create vite@latest` or `npx create-next-app@latest`' },
      { angular: '`ng generate component`', react: 'Create a `.tsx` file' },
      { angular: '`ng serve`', react: '`npm run dev`' },
      { angular: '`ng build`', react: '`npm run build`' },
      { angular: '`TestBed`', react: 'Vitest with React Testing Library' },
      { angular: 'Angular DevTools', react: 'React Developer Tools' },
    ],
  },
]
