# Dadal — Behavior-Based Habit Formation System

Dadal is a Mongolian-language web application and thesis project that helps users build sustainable routines. It connects habit schedules and contextual cues with progress tracking, automaticity assessments, adaptive reminders, and learning recommendations.

The goal is to help users increasingly perform habits on their own, while providing an explainable software implementation of habit formation theory. The repository includes both the application and the academic report describing its design and evaluation.

## Why this project exists

Recording a completed task is useful, but completion counts and streaks alone do not establish that a habit has formed. Dadal brings together contextual cues, manageable actions, motivation, feedback, and the Self-Report Behavioral Automaticity Index (SRBAI) to support and examine habit formation.

Its behavioral signals include completion consistency, self-initiated behavior, context stability, and reported automaticity. These signals inform rules and recommendations; they are not proof of long-term effectiveness. Claims about effectiveness require evaluation evidence.

## Features

- Account registration, login, JWT authentication, and session validation.
- Habit creation and editing, templates, schedules, contextual cues, and measurable progress.
- A daily dashboard, completion logging and undo, habit details, and analytics.
- SRBAI assessments and rule-based habit-strength and adaptation logic.
- Reminder evaluation, scheduling, actions, and Web Push delivery when configured.
- Learning articles and persistent recommendations informed by habit signals.
- Profile, settings, feedback, and optional guided tours.
- A Mongolian interface with mobile and desktop navigation.

Web Push requires browser support, notification permission, and matching VAPID configuration. The frontend also includes a mock mode for working without the backend.

## Project structure and technology

| Directory | Purpose | Main technologies |
| --- | --- | --- |
| `backend/` | API, behavioral rules, persistence, reminders | NestJS 11, TypeScript, Prisma 7, PostgreSQL, JWT, SWC, Jest |
| `frontend/` | Browser application | React 19, TypeScript, Vite 8, Tailwind CSS 4, Radix UI, React Query, React Router |
| `thesis-report/` | Mongolian thesis source and figures | XeLaTeX |

The backend follows a layered architecture: controllers and DTOs handle HTTP input, application services coordinate use cases, pure domain rules implement behavioral decisions, and repository adapters provide Prisma persistence. The frontend separates pages, feature logic, shared components, and API clients.

Backend application-timezone decisions currently use `Asia/Ulaanbaatar`. Browser-local dates and application-timezone dates must be handled explicitly.

## Run locally

Use a Node.js release compatible with the locked Vite 8 and Prisma 7 dependencies, such as Node.js 22.12 or later in the Node.js 22 line, plus npm and a PostgreSQL database. The frontend and backend have separate package manifests and lockfiles; there is no root npm workspace.

### 1. Configure and start the backend

From the repository root:

```sh
cd backend
npm ci
```

Create `backend/.env` with your local configuration. Replace these placeholder values:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/dadal
JWT_SECRET=replace-with-a-long-random-secret
PORT=3000
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
REMINDER_SCHEDULER_ENABLED=false
```

Create the database first. Then, from `backend/`, generate the Prisma client and apply the committed migrations to that local development database:

```sh
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Check that `DATABASE_URL` points to the intended local database before applying migrations. Prisma CLI configuration reads this variable directly.

The default API base is `http://localhost:3000/api`, and Swagger documentation is available at `http://localhost:3000/docs`.

### 2. Start the frontend

In a second terminal, from the repository root:

```sh
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. With `VITE_API_URL` unset, Vite proxies `/api` requests to the backend on port 3000.

For a different API host, create `frontend/.env.local` and set the full API base **including `/api`**:

```dotenv
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCK=false
```

The existing `frontend/.env.example` omits `/api` in its example URL; include the prefix if using that file as a starting point. Restart Vite after changing environment variables.

### Mock mode

To explore the frontend without running the API or database, set this in `frontend/.env.local`:

```dotenv
VITE_USE_MOCK=true
```

Mock mode uses an in-memory router and sample data. It does not verify backend integration or durable persistence.

### Optional reminders and Web Push

Enable scheduled reminder evaluation with `REMINDER_SCHEDULER_ENABLED=true` in the backend environment when you are ready to test delivery. Configure `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` on the backend, and set `VITE_VAPID_PUBLIC_KEY` to the matching public key on the frontend. Notification delivery also depends on browser permission and a secure context, such as HTTPS or localhost.

Keep populated environment files and secrets out of version control. Variables prefixed with `VITE_` are exposed to the browser; never put private keys or database credentials in them.

## Build and test

Run these commands from the indicated directory:

| Directory | Check | Command |
| --- | --- | --- |
| `backend/` | Production build | `npm run build` |
| `backend/` | Unit tests | `npm test -- --runInBand` |
| `backend/` | End-to-end tests | `npm run test:e2e -- --runInBand` |
| `backend/` | Lint without modifying files | `npx eslint "{src,apps,libs,test}/**/*.ts"` |
| `frontend/` | TypeScript and production build | `npm run build` |
| `frontend/` | Lint | `npm run lint` |
| `frontend/` | Auth/API regression checks | `npm run test:ux` |

Backend `npm run lint` applies automatic fixes. Its SWC build is not a complete TypeScript type check. The frontend regression checks and mocked backend tests are not substitutes for testing the live user flow.

For UI changes, check session validation, failed requests and recovery, completion and undo, and layouts at mobile and desktop widths. [The UX plan](frontend/UX-PLAN.md) records prior work and pending verification; its historical results should not be treated as current test results.

## Project direction and working principles

Development prioritizes a dependable core habit journey, an understandable behavioral feedback loop, and support that helps users become more independent. Keep the Mongolian experience approachable and align implementation with the thesis.

- Keep behavioral decisions explainable, testable, and grounded in evidence.
- Preserve user control over reminders, recommendations, and guidance.
- Make saved state trustworthy, including during failed requests and retries.
- Reuse existing architecture and UI conventions, and keep changes focused.
- Document actual behavior and verification honestly; distinguish proposed work from implemented features.

See [AGENTS.md](AGENTS.md) for detailed repository working guidance.

## Thesis and further documentation

The thesis entry point is [thesis-report/main.tex](thesis-report/main.tex), which includes the research, architecture, design, implementation, evaluation, and appendix sources. It uses XeLaTeX with local styles and fonts including Times New Roman, Arial, and Consolas.

With a compatible LaTeX toolchain installed, compile from `thesis-report/`:

```sh
latexmk -xelatex main.tex
```

Further reading:

- [Backend architecture and development guide](backend/docs/BACKEND.md)
- [Behavioral domain foundation](backend/docs/phase3-behavioral-foundation.md)
- [Reminder, SRBAI, and adaptation background](backend/docs/phase4-reminder-srbai-adaptation.md)
- [Learning recommendations](backend/docs/phase5-learning-recommendations.md)
- [Frontend UX plan](frontend/UX-PLAN.md)

Phase documents describe the project's development history. Current code and configuration take precedence where those documents differ.
