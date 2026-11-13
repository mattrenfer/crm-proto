# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Project**: Handful, a small CRM (Next.js 15 + Supabase) — **Author**: Matthew Russell Renfer

Explain the "why" behind changes. Public docs live in `docs/` (`architecture.md`, `design-decisions.md`,
`how-it-works.md`); keep them current and in a neutral voice when the code they describe changes. Personal working notes
are kept outside this repo (loaded through a git-ignored `CLAUDE.local.md` when present).

---

## Commands

```bash
npm run dev     # dev server with Turbopack at http://localhost:3000
npm run build   # production build (also runs type checking)
npm run lint    # next lint (next/core-web-vitals + next/typescript); keep at zero warnings
npm run typecheck     # tsc --noEmit
npm run format        # Prettier (no semicolons, single quotes, 4 spaces, 120 cols)
npm run format:check  # verify formatting without writing
```

There is no automated test suite yet (planned: Playwright #36, Vitest #38). Verify changes manually in the browser, and
test auth or routing changes on a production build (`npm run build && npm start`).

Requires `.env.local` (template: `.env.local.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY`, `DEMO_EMAIL`, `DEMO_PASSWORD`.
`src/lib/env.ts` validates the public ones with Zod (imported by `next.config.ts`, so `dev`/`build` fail fast with a
readable message) and refuses a service role / secret key. Read public config via `env` from `@/lib/env`, never
`process.env.X!`; keep the full `process.env.NEXT_PUBLIC_*` names written out in `env.ts` or Next.js won't inline them
into browser code. Server-only values never get a `NEXT_PUBLIC_` prefix.

The Prettier reformat commit is listed in `.git-blame-ignore-revs`.

## Architecture

Next.js 15 App Router + Supabase (Postgres + Auth via `@supabase/ssr`). Path alias `@/*` → `src/*`. Fuller write-up:
`docs/architecture.md`.

### Three Supabase clients — pick by execution context
- `src/lib/supabase/client.ts` — browser client, for `'use client'` components and all auth writes (sign in/up/out).
- `src/lib/supabase/server.ts` — async server client (awaits `cookies()`), for Server Components / Server Actions / route handlers. Cannot write cookies from Server Components (errors are swallowed on purpose).
- `src/lib/supabase/middleware.ts` — returns `{ supabase, response }`; middleware **must return that `response`** (not `NextResponse.next()`) or refreshed tokens are lost.
- `src/lib/supabase.ts` holds only the shared `Client` / `Task` / `Note` TypeScript types.
- `src/lib/auth.ts` imports the server client, so it can't be imported from Client Components; client pages call `@/lib/supabase/client` directly instead.

### Two parallel data layers
- `src/lib/data.ts` — browser-client CRUD for Client Components (used by clients, client detail, and tasks pages). Create functions look up the current user and set `user_id` on insert.
- `src/lib/data-server.ts` — server-client read functions for Server Components (currently only the dashboard, `src/app/page.tsx`).
- Read functions exist in both files with duplicated implementations; keep them in sync when changing queries. `getClientById` returns `null` on PostgREST code `PGRST116` (no rows).
- Most pages are Client Components that fetch in `useEffect`; only the dashboard is an async Server Component.
- Writes are server-confirmed (await, then use the returned row), not optimistic.

### Auth & route protection
- `src/middleware.ts` runs on every non-static request: unauthenticated users → `/login`; authenticated users on `/login`, `/signup` or `/forgot-password` → `/`. `/reset-password`, `/privacy` and `/api/demo` are reachable either way. Routes under `/dev/*` skip auth in development and redirect to `/` in production.
- After sign-in/out, pages use `window.location.assign` (a full load) so middleware sees the new cookie; the production router cache otherwise serves stale redirects.
- `src/contexts/AuthContext.tsx` provides `useAuth()` (session state for the UI, e.g. `Navigation`), mounted via `src/components/Providers.tsx` in the root layout alongside the `react-hot-toast` `<Toaster />`.
- Sign-up, sign-in and password reset send a Cloudflare Turnstile token (`src/lib/useTurnstile.ts`, invisible mode) as `options.captchaToken`; Supabase verifies it. Call `turnstile.reset()` after each attempt (tokens work once).
- `src/app/api/demo/route.ts` signs in the shared demo account on the server with the service role key (exempt from CAPTCHA), then `setSession` on the cookie client, and 303-redirects. The service role key is read there and nowhere else.

### Data isolation (RLS)
- Every table (`clients`, `tasks`, `notes`) has a required (NOT NULL) `user_id`, and RLS policies (for the `authenticated` role only) enforce `auth.uid() = user_id`. Queries do not filter by user explicitly — RLS does it. Inserts must include `user_id` or they will be rejected.
- Task and note insert/update checks also require that `client_id` points to a client owned by the same user.
- `tasks` and `notes` reference `clients` with `ON DELETE CASCADE`.
- A trigger blocks credential changes to the demo account through Supabase Auth; its data is reseeded nightly (`.github/workflows/reset-demo.yml`, `supabase/seed/demo.sql`).

### Migrations (`supabase/`)
- The schema lives in `supabase/migrations/` (Supabase CLI, `npx supabase`). Never change the schema in the dashboard; add a migration. Workflow: `supabase/README.md`.
- Two projects: a throwaway test project (keep the CLI linked to it by default) and the live project. Check `supabase/.temp/project-ref` before any `db push` / `db reset`.
- Migration 1 is a baseline of the hand-built live DB (marked applied on live via `migration repair`, not run); trust the migrations over older notes.
- `supabase/tests/rls_test.sql` is a two-user RLS test: `npx supabase db query --linked -f supabase/tests/rls_test.sql` on the **test project only**. Every case should be PASS.

### Forms
- Zod schemas + inferred form types live in `src/lib/schemas.ts`, used with `react-hook-form` + `@hookform/resolvers/zod`. Task `status` / `priority` enums there must match the `Task` type in `src/lib/supabase.ts` and the DB check constraints. Text length limits there must match the DB constraints (notes 5,000, task descriptions 2,000).
- Operations report success/failure with `react-hot-toast`. Deletes confirm through `src/components/ConfirmDialog.tsx` (native `<dialog>`).

## Git workflow
- One branch and PR per change; reference the issue in the commit (`feat: ... (#n)`). Base branch is `master`.
- Tag phase milestones only: `git tag -a phase-X-complete -m "..." && git push --tags`.
- Roadmap and backlog: GitHub issues.
