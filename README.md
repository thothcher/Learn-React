# Refract

A two-month React and Next.js course for Angular developers who want to learn it and teach it.

Built with React 19, TypeScript, Vite and React Router.

## What's inside

- **Roadmap**: 8 weeks, each with 4 lessons and a project. Progress is saved in the browser.
- **Lessons** (32): an explanation, a real-life analogy, Angular vs React code side by side, key points, a common pitfall, a teaching card, an exercise with hints and a solution, and a quick check.
- **Exercises**: every exercise in one filterable list.
- **Practice**
  - **Match pairs**: connect items with drawn lines, by clicking or dragging.
  - **Memory cards**
  - **Tests**: one per week, plus React, Next.js and final exams.
  - **Fill the gap**: complete code snippets.
- **Teach**: all teaching cards, plus a full-screen presentation mode (Space to reveal, arrow keys to move, Esc to close).
- **Cheat sheet**: 70+ Angular APIs mapped to React and Next.js.
- **Contact** page, a search palette (Ctrl K), and light and dark themes.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check and build to dist/
npm run preview   # serve the production build
npm run lint
```

## Deploy

Live at **https://thothcher.github.io/Learn-React/**.

GitHub Pages serves the `gh-pages` branch. To publish the current code, run:

```bash
npm run deploy
```

[scripts/deploy-gh-pages.mjs](scripts/deploy-gh-pages.mjs) does four things:

1. Builds with `BASE_PATH=<repository name>`, so asset URLs and React Router's `basename` start with `/Learn-React/`.
2. Copies `index.html` to `404.html`. GitHub Pages has no URL rewrites, so without it a deep link such as `/Learn-React/lessons/props` would return a 404 when reloaded.
3. Adds `.nojekyll`, so Pages serves the files exactly as built.
4. Force-pushes the contents of `dist/` to the `gh-pages` branch. GitHub publishes it within a minute or two.

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) runs the same script on every push to `main`, so deployment becomes automatic whenever GitHub Actions can run on the account.

To try the production build under the same path locally:

```bash
BASE_PATH=Learn-React npm run build && BASE_PATH=Learn-React npm run preview
# then open http://localhost:4173/Learn-React/
```

To host at the root of a domain (Vercel, Netlify, or a custom domain), build without `BASE_PATH`.

## Make it yours

| What | Where |
| --- | --- |
| Name, email, GitHub link, location | `src/config/site.ts` |
| Lessons, teaching cards, exercises, quiz questions | `src/data/lessons/week1.ts` … `week8.ts` |
| Weekly goals and projects | `src/data/weeks.ts` |
| Match and memory pairs | `src/data/pairs.ts` |
| Fill-the-gap snippets | `src/data/gaps.ts` |
| Cheat sheet rows | `src/data/cheatsheet.ts` |
| Colors, radii, fonts | `src/styles/tokens.css` |

Inside lesson text, wrap code in backticks and bold text in `**double asterisks**`. Code samples use the `code` template tag, which strips shared indentation. Inside those samples, escape backticks and `${` with a backslash.

The contact form opens the visitor's email app, because the site is static. When you deploy, point `handleSubmit` in `src/pages/ContactPage.tsx` to a form service or an API route.

## Project structure

```
src/
  components/
    layout/   Header, Footer, search palette, root layout
    lesson/   TeachingCard, ExerciseBlock, QuizCard
    ui/       CodeBlock, CodeCompare, Segmented, brand icons…
  data/       all course content, typed in data/types.ts
  lib/        syntax highlighter, progress store, theme, helpers
  pages/      one file per route; games live in pages/games
  router.tsx  the route table (think Angular's Routes array)
```

## Design rules

- English only.
- Icons, never emojis: lucide-react plus custom SVG brand marks.
- A react.dev-inspired palette.
- Surfaces are separated by tone rather than borders.
- Shadows only on floating layers.
- No gradients.
- The Geist and Geist Mono typefaces.
