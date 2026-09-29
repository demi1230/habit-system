# Dadal desktop and UX plan

Keep the existing Mongolian interface and mobile experience.

1. Session and authentication: verify stored credentials before mounting private pages; keep the screen neutral while checking; offer retry when offline; keep invalid-login errors on the form.
2. Feedback: accessible inline errors, useful recovery text, preserve form values, roll back failed habit completion and undo requests.
3. Desktop foundation: persistent navigation at laptop widths, bounded reading/form widths, a two-column habit overview, keyboard-accessible actions. Retain mobile bottom navigation.
4. Introduction and help: replace rotating marketing slides and four-page onboarding with a single example and a first-habit action; make tours optional and shorten each step.
5. Verification: build and lint; check authentication, failure recovery, and layouts at mobile and laptop widths. Record limitations honestly.

Acceptance: no private UI before session validation; failed sign-in stays on the form; failed completion never looks saved; desktop navigation remains visible; first habit requires no slide deck.

Implementation status (2026-09-29)

Implemented the first pass across steps 1-4:
- Added authenticated GET /api/auth/session and a blank session-check gate with timeout/retry recovery. Deploy the backend endpoint before or with the frontend.
- Sign-in errors stay on the form. Habit loading, saving, editing, and undo show recovery messages; failed optimistic writes roll back. Quick entry keeps its value after failure and no longer double-counts existing progress.
- Desktop sidebar and two-column dashboard start at 1024px. Forms have a bounded width, and desktop edit/undo actions are visible. Mobile navigation remains available below that breakpoint.
- Welcome and post-signup onboarding are single screens. Dashboard/create tours are optional via the help button; create guidance is three short steps.

Verification:
- Frontend production build and backend build passed.
- Six auth/API regression checks passed (npm run test:ux).
- ESLint passed for changed source files. Full lint still reports four pre-existing Fast Refresh export errors in scroll-to-top.tsx and weekday-strip.tsx.
- Browser visual and end-to-end checks are pending: no connected browser was available and agent-browser was not installed. The responsive design has not yet been visually verified.

Next review: check 390px, 1024px, and 1440px layouts; reload with valid/expired credentials; test login failure, offline startup/retry, and failed completion/undo; review Mongolian copy in context. Then apply the same feedback pattern to the remaining secondary pages and dialogs.
