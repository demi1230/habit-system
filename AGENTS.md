# Repository guidance

## Project context

This repository contains Dadal, a behavior-based habit formation thesis project:

- `backend/`: NestJS 11, TypeScript, Prisma 7, PostgreSQL, JWT authentication, scheduled reminders and Web Push.
- `frontend/`: React 19, TypeScript, Vite 8, Tailwind CSS 4, Radix UI, React Query and React Router. The interface is primarily Mongolian and supports mobile and desktop.
- `thesis-report/`: Mongolian LaTeX report, with `main.tex` as the entry point.

The applications have separate npm manifests and lockfiles. Run commands from the relevant application directory; there is no root npm workspace.

## Project goal

Build and evaluate a practical, behavior-based habit formation system that helps users establish sustainable routines and increasingly perform them on their own. Translate habit theory into usable software through contextual cues, achievable actions, motivation and rewards, adaptive reminders, reflection, and learning recommendations.

The project has two connected outcomes: a reliable Mongolian-language application and a defensible thesis explaining its requirements, architecture, behavioral mechanisms and evaluation. Assess progress using completion consistency, context stability, self-initiated behavior and SRBAI automaticity alongside usability and software reliability. Completion counts and streaks alone do not establish that a habit has formed; claims of effectiveness require evaluation evidence.

## Project direction

These priorities are derived from the thesis and existing architecture and UX guidance. They guide implementation choices; they are not a commitment to an unapproved feature roadmap.

1. Make the core journey dependable: validate the session, create a realistic habit with a meaningful cue, record or undo progress, and understand the result. Resolve data integrity, authentication and failure recovery issues before expanding affected flows.
2. Strengthen the behavioral feedback loop: connect schedules and cues to completion signals, reflection, SRBAI assessments and understandable recommendations. Adapt support to available evidence and preserve the user's control over their habit and reminders.
3. Support growing independence: use reminders and rewards to help establish routines, with adaptation and reminder tapering where supported by the rules. Prefer features that help users act consistently and independently over features that merely increase app activity.
4. Keep the experience approachable: preserve Mongolian language, mobile usability, accessible desktop navigation, optional guidance and clear recovery from errors. Make creating and maintaining a habit require few understandable steps.
5. Keep implementation and research aligned: maintain reproducible behavior, explainable rules, accurate documentation and an honest evaluation. Distinguish historical phase scope from current capabilities and proposed work from implemented work.

## Working principles

- **Start with the user outcome.** Establish which part of habit formation or usability a change improves, then implement the smallest complete change that delivers it. Avoid unrelated features or architecture rewrites.
- **Ground behavior in evidence.** Keep behavioral rules explicit, explainable and testable. Preserve the meaning of each measurement, handle insufficient data honestly, and do not invent research findings or treat heuristic scores as proven outcomes.
- **Protect user agency.** Make reminders, recommendations, tours and rewards understandable and controllable. Use supportive feedback that helps users resume after missed days; avoid guilt-based or coercive interactions.
- **Make saved state trustworthy.** Enforce ownership and validation at the backend, preserve consistent API contracts, and handle retries, duplicate actions and failed optimistic updates where relevant. The UI must accurately communicate whether an action succeeded.
- **Build on existing boundaries.** Reuse domain rules, repository ports, API clients, design primitives and date helpers. Introduce dependencies or abstractions when a concrete requirement justifies them.
- **Verify the whole affected flow.** Check relevant rules, persistence, API responses and UI states as appropriate to the change. Include error and recovery paths, and distinguish mocked checks from live integration evidence.
- **Keep code and thesis truthful.** Update affected documentation when behavior changes. Cite evidence for research claims and disclose limitations, unavailable checks and uncertainty.
- **Collaborate with focus.** Preserve unrelated work, communicate meaningful findings, and ask when an unresolved product or research decision materially changes scope. Use existing conventions to resolve routine implementation details.

## Where to start

- Read `backend/docs/BACKEND.md` for architecture and `backend/docs/phase*.md` for feature background.
- Read `frontend/UX-PLAN.md` before changing authentication, onboarding, navigation or error recovery.
- Treat current source, configuration and package scripts as authoritative when documentation disagrees. The application READMEs are largely starter templates.
- Inspect the working tree before editing and preserve unrelated changes. Keep changes focused on the requested behavior and follow nearby formatting.

## Development and verification

Install dependencies with `npm ci` inside `backend/` and `frontend/` when needed; preserve their lockfiles.

| Directory | Purpose | Command |
| --- | --- | --- |
| `backend/` | Development server | `npm run start:dev` |
| `backend/` | Build | `npm run build` |
| `backend/` | Unit tests | `npm test -- --runInBand` |
| `backend/` | Selected unit tests | `npm test -- --runInBand <test-file-or-pattern>` |
| `backend/` | End-to-end tests | `npm run test:e2e -- --runInBand` |
| `backend/` | Lint without fixing | `npx eslint "{src,apps,libs,test}/**/*.ts"` |
| `frontend/` | Development server | `npm run dev` |
| `frontend/` | TypeScript and production build | `npm run build` |
| `frontend/` | Lint | `npm run lint` |
| `frontend/` | Auth/API regression checks | `npm run test:ux` |

Backend `npm run lint` includes `--fix` and can change files. Use the non-fixing command for inspection. The backend builds with SWC; a successful build is not a complete TypeScript type check.

Run checks appropriate to the changed area. Add focused regression coverage for meaningful behavior changes. For UI work, verify the relevant flow and mobile/desktop layouts where browser access is available; the UX plan suggests 390px, 1024px and 1440px. Report what was actually checked and any failures or unavailable checks. Historical lint failures documented in the UX plan must be rechecked before calling them current.

## Backend conventions

- Keep controllers and DTOs responsible for HTTP input, validation and API documentation; services orchestrate use cases.
- Put pure behavior rules in `src/domain/rules/`. Keep them independent of database and framework I/O.
- Define repository interfaces and injection tokens in `src/domain/repositories/`; implement persistence in `src/infrastructure/persistence/`. Inject repository ports into services rather than introducing direct Prisma access.
- Preserve JWT guards and user ownership checks when adding or changing endpoints.
- Global validation rejects unknown fields and transforms validated input. Keep DTO validators and Swagger decorators consistent with the API contract.
- Preserve the SWC configuration in `nest-cli.json` and `.swcrc` unless the task requires changing the build system.
- Use `src/shared/time.ts` for application timezone decisions. The application currently targets `Asia/Ulaanbaatar`; avoid relying on the server's local timezone for reminders or day boundaries.
- Preserve distinctions between completion, cue source, SRBAI automaticity, habit strength and adaptation. Consult the domain rules and phase documentation before changing their calculations.

## Database and environment

- `backend/prisma/schema.prisma` is the schema source. Generate the client with `npx prisma generate` from `backend/` after schema changes; do not hand-edit `backend/src/generated/prisma/`.
- Add migrations under `backend/prisma/migrations/` for schema changes; preserve existing migration history. Review the target database before applying migrations. Do not reset databases or run the duplicate-log cleanup script as routine validation.
- Backend startup requires `DATABASE_URL`. Configure a real `JWT_SECRET` rather than relying on the development fallback. Inspect the relevant configuration code for optional reminder and push settings.
- `prisma.config.ts` reads `DATABASE_URL` for CLI operations. The runtime also recognizes optional direct connection variables; do not assume those automatically override the CLI datasource.
- Never commit credentials, populated environment files, database exports or private user data. Client variables prefixed with `VITE_` are public build inputs.

## Frontend conventions

- Keep API calls in `src/api/` using `client.ts`, shared contracts in `src/api/types.ts`, feature logic in `src/features/`, and reusable components in `src/components/`.
- Reuse existing UI primitives, design definitions in `src/shared/design/`, and styles in `src/styles/`. The `@` alias resolves to `src/`.
- Preserve Mongolian copy and both mobile bottom navigation and desktop navigation. Follow the existing localization approach in `src/lib/i18n.ts`.
- Preserve session validation before private pages mount, form-local login errors, offline retry, retained form values and rollback of failed optimistic completion/undo requests.
- Reuse date helpers and explicitly distinguish browser-local calendar dates from backend application-timezone dates. Avoid silently converting date-only values through UTC.
- Keep Fast Refresh-compatible exports; place shared non-component helpers outside component files when needed.
- When changing API behavior, update backend DTOs/responses, frontend types and consumers, and the mock router/data where applicable.

The backend defaults to port 3000, serves routes under `/api`, and exposes Swagger at `/docs`. Vite proxies `/api` to `http://localhost:3000` during development. Leave `VITE_API_URL` unset to use the proxy, or set it to a full API base including `/api`, such as `http://localhost:3000/api`. The checked-in `.env.example` currently omits this prefix. `VITE_USE_MOCK=true` enables the in-memory mock router; mock checks do not verify live backend integration.

## Thesis report

- Edit the chapter files included by `thesis-report/main.tex`; preserve Mongolian text, UTF-8 encoding, labels, citations and chapter structure.
- The report uses XeLaTeX and fonts including Times New Roman, Arial and Consolas. From `thesis-report/`, use `latexmk -xelatex main.tex` when that toolchain is available, or run XeLaTeX with enough passes to resolve references.
- This is a multi-file project with local style and image dependencies. Preserve those dependencies and report unavailable fonts or compilation tools honestly.
- Do not hand-edit generated `.aux`, `.log`, `.toc`, `.out`, `.xdv` or other build artifacts. Avoid including regenerated artifacts in unrelated changes.
- Keep technical descriptions consistent with implemented behavior; distinguish proposed features and evaluation claims from verified implementation.

## Completing work

Summarize the resulting behavior, relevant files, checks performed and material limitations. Update guidance when changing setup, architecture or API contracts. Ask for clarification when product intent or thesis claims cannot be established from the repository; resolve routine implementation choices using existing conventions.
