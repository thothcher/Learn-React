# Refract

A two-month React and Next.js course for Angular developers who want to learn it and teach it.

- **Frontend:** React 19, TypeScript, Vite and React Router.
- **Backend:** a C# API on ASP.NET Core 10, with accounts, progress and a teacher dashboard.

## What's inside

- **Roadmap**: 8 weeks, each with 4 lessons and a project.
- **Lessons** (32): each has
  - an explanation and a real-life analogy
  - Angular vs React code side by side
  - key points and a common pitfall
  - a teaching card
  - an exercise
  - a quick check
- **Practice**: Match pairs, Memory cards, Tests and Fill the gap.
- **Teach**: teaching cards with a full-screen presentation mode.
- **Cheat sheet**: 70+ Angular APIs mapped to React and Next.js.
- **Accounts** (when the API is available):
  - registration with email verification, login, logout and password recovery
  - progress saved to the account
  - a **student dashboard**, and a **teacher dashboard** that lists every student's progress

## Project layout

```
src/                       React app
backend/
  Refract.Api/             ASP.NET Core Minimal API
    Auth/                  Identity setup and /api/auth endpoints
    Progress/              /api/progress endpoints
    Teacher/               /api/teacher endpoints
    Data/                  EF Core DbContext, entities, database setup
    Email/                 Resend sender and email templates
  Refract.Api.Tests/       Integration tests (xUnit v3 + WebApplicationFactory)
  Dockerfile.vercel        Container image Vercel builds for the API
vercel.json                React app and API as two services on one domain
```

## Run it locally

The API and the React app run side by side. Vite forwards `/api` requests to the API, so the browser sees one origin, exactly as on Vercel.

```bash
# Terminal 1: API on http://localhost:5080 (SQLite file, interactive docs at /scalar)
cd backend
dotnet run --project Refract.Api

# Terminal 2: React app on http://localhost:5173
npm install
npm run dev
```

In development:

- **Emails aren't sent.** The confirmation and reset links are printed in the API console, because no Resend key is set.
- **Teacher account:** registering as `teacher@example.com` gives that account the teacher dashboard. The address is set in `appsettings.Development.json`.

Run the tests with:

```bash
npm test                                          # frontend: logic, API client and course data (Vitest)
cd backend && dotnet test --solution Refract.slnx # backend: API integration tests (xUnit)
```

> **Windows with Smart App Control:** Smart App Control can block .NET code that was built locally, often right after a rebuild. When it does, `dotnet run`, `dotnet test` and `dotnet ef` fail with *"An Application Control policy has blocked this file"*. The code still compiles, and it runs normally on Vercel. To run it locally, either use WSL (`wsl --install`, then install the .NET SDK inside Linux), or use a machine without Smart App Control. You can also turn Smart App Control off in Windows Security, but on many Windows 11 versions it can't be turned back on without reinstalling Windows.

## API

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | anyone |
| POST | `/api/auth/confirm-email` | anyone (link from email) |
| POST | `/api/auth/resend-confirmation` | anyone |
| POST | `/api/auth/login` | anyone |
| POST | `/api/auth/logout` | anyone |
| GET | `/api/auth/me` | signed in |
| POST | `/api/auth/forgot-password` | anyone |
| POST | `/api/auth/reset-password` | anyone (link from email) |
| GET, DELETE | `/api/progress` | signed in |
| PUT, DELETE | `/api/progress/lessons/{slug}` | signed in |
| PUT, DELETE | `/api/progress/projects/{week}` | signed in |
| POST | `/api/progress/scores` | signed in |
| POST | `/api/progress/import` | signed in |
| GET | `/api/teacher/students` | teacher |
| GET | `/api/teacher/students/{id}` | teacher |

How the API handles security:

- **Sessions** use an httpOnly, `SameSite=Lax` cookie that lasts 14 days. The React app and the API share a domain, so no tokens are stored in JavaScript.
- **Passwords** need at least 8 characters. An account locks for 15 minutes after 5 failed logins.
- **Login requires a confirmed email.**
- **Confirmation and reset links** expire after 3 hours. A reset link works only once, and a reset signs out other devices.
- **Forgot password and resend confirmation** give the same answer whether or not an account exists.
- **Rate limiting:** the auth endpoints accept 10 requests per minute per IP address.
- **Encryption keys** for cookies and email tokens are stored in the database, so sessions survive restarts and work across instances.
- **The teacher role** is granted to the confirmed emails listed in `Auth__TeacherEmails`.

## Deploy to Vercel

`vercel.json` defines two services:

- **`web`:** the Vite build, served at `/`.
- **`api`:** the C# API, built from `backend/Dockerfile.vercel` and served at `/api`.

Steps:

1. **Import the project.** In Vercel, choose **Add New → Project**, then import this GitHub repository.
2. **Add a database.** Under **Storage**, add **Neon** (Postgres) from the Marketplace. It sets `DATABASE_URL`.
3. **Set up email.** Create a [Resend](https://resend.com) API key and verify your sending domain. Resend's test address only delivers to your own inbox.
4. **Add the environment variables** listed below, then deploy. When the API starts, it applies the database migrations.
5. **Create your teacher account.** Register with the email you set in `Auth__TeacherEmails`, confirm it, and log in. The account menu then shows **Teacher dashboard**.

| Variable | Example | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | set by Neon | Postgres connection |
| `RESEND_API_KEY` | `re_...` | Sends confirmation and reset emails |
| `Email__From` | `Refract <hello@yourdomain.com>` | Sender address |
| `App__PublicUrl` | `https://your-project.vercel.app` | Base of the links in emails |
| `Auth__TeacherEmails` | `you@example.com` | Comma-separated teacher accounts |

If the deployment logs say the API cannot open port 80, add `PORT=8080` as an environment variable.

The API scales to zero when idle, so the first request after a quiet period takes a moment longer.

## Database migrations

Migrations live in `backend/Refract.Api/Data/Migrations` and target Postgres. The API applies pending migrations when it starts. Local development and tests use SQLite and build the schema straight from the model.

After changing an entity or `AppDbContext`, add a migration and commit it:

```bash
cd backend
dotnet ef migrations add DescribeYourChange --project Refract.Api --output-dir Data/Migrations
```

## GitHub Pages

The GitHub Pages copy at https://thothcher.github.io/Learn-React/ stays static. It has no API, so account features are hidden and progress stays in the browser. To publish the current code, run:

```bash
npm run deploy
```

[scripts/deploy-gh-pages.mjs](scripts/deploy-gh-pages.mjs) does four things:

1. Builds with `BASE_PATH=<repository name>`.
2. Copies `index.html` to `404.html`, so deep links work.
3. Adds `.nojekyll`.
4. Force-pushes `dist/` to the `gh-pages` branch.

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) runs the same script on every push to `main` whenever GitHub Actions can run on the account.

## Make it yours

| What | Where |
| --- | --- |
| Name, email, GitHub link, location | `src/config/site.ts` |
| Lessons, teaching cards, exercises, quiz questions | `src/data/lessons/week1.ts` … `week8.ts` |
| Weekly goals and projects | `src/data/weeks.ts` |
| Match and memory pairs | `src/data/pairs.ts` |
| Fill-the-gap snippets | `src/data/gaps.ts` |
| Cheat sheet rows | `src/data/cheatsheet.ts` |
| Email wording | `backend/Refract.Api/Email/EmailTemplates.cs` |
| Password, lockout and cookie rules | `backend/Refract.Api/Auth/AuthSetup.cs` |
| Colors, radii, fonts | `src/styles/tokens.css` |

Inside lesson text, wrap code in backticks and bold text in `**double asterisks**`. Code samples use the `code` template tag, which strips shared indentation; escape backticks and `${` with a backslash inside them.

## Design rules

- English only.
- Icons, never emojis.
- A react.dev-inspired palette.
- Surfaces separated by tone rather than borders.
- Shadows only on floating layers.
- No gradients.
- The Geist and Geist Mono typefaces.
