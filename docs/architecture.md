# Architecture

How Handful is put together, as the code is today. For a request traced end to end, see
[how-it-works.md](how-it-works.md). For the reasoning behind the main choices, see
[design-decisions.md](design-decisions.md).

```
Browser (Client Components)  ──supabase-js──▶  Supabase REST API ──▶ Postgres (RLS)
Server (dashboard, /api/demo) ──supabase-js──▶        ▲
Middleware (every request)  ── refreshes the session ─┘        Supabase Auth ◀── Cloudflare Turnstile token
```

The browser talks to Supabase directly with the public anon key. There's no API server in between, so the database
enforces who can read and write what. Code that needs a secret runs on the server.

## Three Supabase clients

"Client" here means a connection to Supabase, not a CRM client. There's one per place code runs, because each handles
the sign-in cookies differently (`@supabase/ssr`).

| File | Runs in | Used for |
|---|---|---|
| `src/lib/supabase/client.ts` | the browser | Client Components and every auth write (sign in, sign up, sign out) |
| `src/lib/supabase/server.ts` | the server | Server Components, route handlers. Can't write cookies from a Server Component (errors are swallowed on purpose) |
| `src/lib/supabase/middleware.ts` | middleware | Refreshes the session on every request. Middleware must return the `response` it gives back, or refreshed cookies are lost |

Sessions live in cookies rather than localStorage, so the server and middleware can see who is signed in. Access tokens
are short-lived JWTs; the middleware refreshes them with the refresh token.

## Routes and sign-in

- `src/middleware.ts` runs on every non-static request. Signed-out visitors go to `/login`; signed-in users on `/login`,
  `/signup` or `/forgot-password` go to `/`.
- Always reachable: `/reset-password` (the reset link signs the user in), `/privacy`, and `/api/demo`.
- `/dev/*` pages work without sign-in in development and redirect to `/` in production.
- `src/contexts/AuthContext.tsx` provides `useAuth()` for session state in the interface (for example, the navigation).
- After sign-in and sign-out, the app does a full page load (`window.location.assign`), so the next request passes
  through middleware with the new cookie instead of reusing a prefetched response.

## Data access

| File | Used by | Notes |
|---|---|---|
| `src/lib/data.ts` | Client Components (clients, client detail, tasks) | Create functions look up the current user and set `user_id` |
| `src/lib/data-server.ts` | Server Components (the dashboard) | Read functions only |

Read functions exist in both files and are kept in sync. `getClientById` returns `null` when no row matches.

Most pages are Client Components that fetch in `useEffect`; the dashboard is an async Server Component. Writes are
**server-confirmed**: the page waits for the insert or update, then puts the row the database returns into its list
(with its real `id`), and shows "Saving..." while it waits. Urgency logic is in small pure functions in
`src/lib/tasks.ts` and `src/lib/dates.ts`.

## Forms and validation

Zod schemas and their form types live in `src/lib/schemas.ts` and are used with React Hook Form. Each form is reused for
adding and editing; the parent passes the submit handler. Results are reported with `react-hot-toast`, and deletes ask
first through a reusable native `<dialog>` (`src/components/ConfirmDialog.tsx`).

Zod gives quick feedback. The database is what enforces the rules.

## Database

The schema lives in `supabase/migrations/` and is applied with the Supabase CLI (workflow in
[`supabase/README.md`](../supabase/README.md)). Changes are made only through migrations, tried first on a separate test
project.

- **Row Level Security** on `clients`, `tasks` and `notes`: policies for the `authenticated` role enforce
  `auth.uid() = user_id`. `user_id` is required and indexed. Queries don't filter by user; RLS does.
- **Ownership across tables:** a task or note can only point at a client owned by the same user.
- `tasks` and `notes` reference `clients` with `on delete cascade`.
- **Constraints:** task status and priority are checked values (matching the Zod enums and the `Task` type); notes are
  limited to 5,000 characters and task descriptions to 2,000, matching the form limits.
- The `updated_at` trigger function has a fixed, empty `search_path`.
- The GraphQL API (`pg_graphql`) is turned off; the app uses only the REST API.
- `supabase/tests/rls_test.sql` acts as two users and checks every policy. Run it on a test project only.

## Configuration

`src/lib/env.ts` validates the public settings with Zod. `next.config.ts` imports it, so `npm run dev` and
`npm run build` stop with a readable message if something is missing, still a template placeholder, or a secret key in
the wrong place. Read public config through `env`, and keep the full `process.env.NEXT_PUBLIC_*` names written out
there, or Next.js won't put them in browser code.

Server-only values (`SUPABASE_SERVICE_ROLE_KEY`, `DEMO_EMAIL`, `DEMO_PASSWORD`) have no `NEXT_PUBLIC_` prefix and are
read only in `src/app/api/demo/route.ts`. See `.env.local.example`.

## Bot protection and the demo

- **Cloudflare Turnstile**, in invisible mode, protects sign-up, sign-in and password reset
  (`src/lib/useTurnstile.ts`). The form sends the token with the request, and Supabase verifies it with Cloudflare, so
  calling the API directly doesn't skip the check. If Turnstile can't load, the form says so in plain words.
- **The demo** is one shared account. The "Try the demo" button posts to `/api/demo`, which signs in on the server with
  the service role key (Supabase exempts it from CAPTCHA), saves the session in the visitor's cookies, and redirects to
  the dashboard with a 303. The session is an ordinary one, limited by RLS.
- A database trigger stops the demo account's credentials being changed through the app, and
  `.github/workflows/reset-demo.yml` reloads its sample data (`supabase/seed/demo.sql`) every night.

## Hosting and operations

- **Vercel** builds every push; pull requests get preview deployments.
- **Resend** sends confirmation and reset emails from a `mail.` subdomain.
- **Keep-alive:** `.github/workflows/keep-alive.yml` queries the database twice a week, because free Supabase projects
  pause when idle.
- **Vercel Analytics** counts page visits without cookies. The [privacy page](../src/app/privacy/page.tsx) lists every
  service involved.
