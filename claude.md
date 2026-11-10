# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Project**: Simple CRM (learning project) — **Author**: Matthew Russell Renfer

This is a learning project: the author wants to understand each pattern, not just receive code. Explain the "why" behind changes, and record ticket learnings in `LEARNING_NOTES.md` / `.claude/ticket-*.md` as prior tickets did.

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

There is no test suite yet (planned for Phase 3 — see Testing Strategy below). Verify changes manually in the browser.

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (template: `.env.local.example`). `src/lib/env.ts` validates them with Zod (imported by `next.config.ts`, so `dev`/`build` fail fast with a readable message) and refuses a service role / secret key. Read config via `env` from `@/lib/env`, never `process.env.X!`; keep the full `process.env.NEXT_PUBLIC_*` names written out in `env.ts` or Next.js won't inline them into browser code.

The Prettier reformat commit is listed in `.git-blame-ignore-revs`.

## Architecture

Next.js 15 App Router + Supabase (Postgres + Auth via `@supabase/ssr`). Path alias `@/*` → `src/*`.

### Three Supabase clients — pick by execution context
- `src/lib/supabase/client.ts` — browser client, for `'use client'` components and all auth writes (sign in/up/out).
- `src/lib/supabase/server.ts` — async server client (awaits `cookies()`), for Server Components / Server Actions / route handlers. Cannot write cookies from Server Components (errors are swallowed on purpose).
- `src/lib/supabase/middleware.ts` — returns `{ supabase, response }`; middleware **must return that `response`** (not `NextResponse.next()`) or refreshed tokens are lost.
- `src/lib/supabase.ts` holds only the shared `Client` / `Task` / `Note` TypeScript types (the legacy non-SSR client was removed in Ticket 3.6).
- `src/lib/auth.ts` imports the server client, so it can't be imported from Client Components; client pages call `@/lib/supabase/client` directly instead.

### Two parallel data layers
- `src/lib/data.ts` — browser-client CRUD for Client Components (used by clients, client detail, and tasks pages). Create functions look up the current user and set `user_id` on insert.
- `src/lib/data-server.ts` — server-client read functions for Server Components (currently only the dashboard, `src/app/page.tsx`).
- Read functions exist in both files with duplicated implementations; keep them in sync when changing queries. `getClientById` returns `null` on PostgREST code `PGRST116` (no rows).
- Most pages are Client Components that fetch in `useEffect`; only the dashboard is an async Server Component.

### Auth & route protection
- `src/middleware.ts` runs on every non-static request: unauthenticated users → `/login`; authenticated users on `/login` or `/signup` → `/`. Routes under `/dev/*` (e.g. `/dev/auth-test`) skip auth in development and redirect to `/` in production.
- `src/contexts/AuthContext.tsx` provides `useAuth()` (session state for the UI, e.g. `Navigation`), mounted via `src/components/Providers.tsx` in the root layout alongside the `react-hot-toast` `<Toaster />`.

### Data isolation (RLS)
- Every table (`clients`, `tasks`, `notes`) has a required (NOT NULL) `user_id`, and RLS policies (for the `authenticated` role only) enforce `auth.uid() = user_id`. Queries do not filter by user explicitly — RLS does it. Inserts must include `user_id` or they will be rejected.
- Task and note insert/update checks also require that `client_id` points to a client owned by the same user.
- `tasks` and `notes` reference `clients` with `ON DELETE CASCADE`.

### Migrations (`supabase/`)
- The schema lives in `supabase/migrations/` (Supabase CLI, `npx supabase`). Never change the schema in the dashboard; add a migration. Workflow: `supabase/README.md`.
- Two projects: `crm-proto-test` (throwaway; keep the CLI linked to it by default) and `CRM Proto` (live). Check `supabase/.temp/project-ref` before any `db push` / `db reset`.
- Migration 1 is a baseline of the hand-built live DB (marked applied on live via `migration repair`, not run). `.claude/ticket-2.6-completion.md` does not match what was actually deployed; trust the migrations.
- `supabase/tests/rls_test.sql` is a two-user RLS test: `npx supabase db query --linked -f supabase/tests/rls_test.sql` on the **test project only**. Every case should be PASS.

### Forms
- Zod schemas + inferred form types live in `src/lib/schemas.ts`, used with `react-hook-form` + `@hookform/resolvers/zod`. Task `status` / `priority` enums there must match the `Task` type in `src/lib/supabase.ts` and the DB check constraints.
- Operations report success/failure with `react-hot-toast`.

---

## Project Vision & Goals

### Primary Goal
Launch a production-ready CRM application end-to-end while deeply learning Next.js 15 and Supabase.

### Learning Objectives
- Master Next.js 15 App Router, Server Components, and modern patterns
- Gain deep understanding of Supabase (database, auth, real-time, storage)
- Build practical experience with a committed tech stack
- Learn proper production deployment and maintenance

### Tech Stack (Committed)
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (https://crm.matthewrenfer.com)

---

## Current State

Per git history: Phase 1 (Supabase CRUD) and Phase 2 (auth, session context, protected routes, RLS — tickets 2.1–2.6) are complete, and Ticket 3.1 (form validation) is done. Toasts (`react-hot-toast`) are already wired in.

Phase 3 progress: 3.1, 3.7 (#30, editing), 3.3 (#16, toasts), 3.2 (#15, loading states and skeletons), 3.4 (#17, confirmation dialogs via a reusable native `<dialog>` in `src/components/ConfirmDialog.tsx`), 3.5 (#18, `error.tsx` / `global-error.tsx` / `not-found.tsx`) and 3.6 (#19, env validation, Prettier, lint at zero) are done, completing Phase 3. **As of Oct 29, 2026 this is a two-week push to ship the app as a job-search portfolio piece:** the schema fixes and migrations with RLS (#21) shipped Nov 2 (migration 2 written by the author), and the Vercel deploy (#20) shipped Nov 5 with a custom domain, custom SMTP (Resend) and a keep-alive GitHub Action; next are First Impressions (#48), lite branding (#49), and the README and video (#23); then Playwright tests in CI (#36), Vercel Analytics (#22), and the API layer (#41) as time allows. Work mode for this phase: Claude drafts, the author reviews and explains it back; nothing ships the author can't explain. Lower priority, if time allows: monitoring beyond Vercel Analytics (#22) and unit tests (#38; at least its two test-first bug fixes).

### What's Missing ❌
- Testing suite

### Code Quality
- **Status**: Good foundation
- TypeScript strict mode enabled
- Clean component structure
- Responsive design patterns
- Well-organized file structure

---

## Strategic Roadmap

This roadmap is designed to be executed in small, manageable tickets that can be tracked in GitHub Projects and tied to commits. Each phase builds on the previous one.

### 🎯 PHASE 1: Foundation - Database Connection (Weeks 1-2)
**Goal**: Get real data persistence working. Learn Supabase CRUD operations deeply.

#### Ticket 1.1: Supabase Project Setup
**Size**: XS (30 min)
- [ ] Create Supabase project
- [ ] Run schema.sql in Supabase SQL Editor
- [ ] Copy project URL and anon key
- [ ] Create `.env.local` file with credentials
- [ ] Create `.env.local.example` template
- [ ] Verify connection in Supabase client
- **Learning**: Supabase project structure, environment variables in Next.js

#### Ticket 1.2: Client CRUD - Read Operations
**Size**: S (2-3 hours)
- [ ] Implement `getClients()` function using Supabase client
- [ ] Replace mock data in clients list page
- [ ] Implement `getClientById()` function
- [ ] Replace mock data in client detail page
- [ ] Add loading state with React Suspense
- [ ] Add error handling with try/catch
- [ ] Test with sample data
- **Learning**: Supabase select queries, async/await patterns, error handling

#### Ticket 1.3: Client CRUD - Write Operations
**Size**: S (2-3 hours)
- [ ] Implement `createClient()` function
- [ ] Hook up Add Client form to Supabase
- [ ] Implement `deleteClient()` function
- [ ] Add optimistic updates for better UX
- [ ] Add success/error toast notifications
- [ ] Test cascade deletes (should delete related tasks/notes)
- **Learning**: Supabase insert/delete, optimistic updates, cascade behavior

#### Ticket 1.4: Task CRUD - Full Implementation
**Size**: M (4-5 hours)
- [ ] Implement all task CRUD functions (create, read, update, delete)
- [ ] Replace mock data in tasks page
- [ ] Replace mock data in client detail page (task tab)
- [ ] Implement status update functionality
- [ ] Add proper filtering by status using Supabase queries
- [ ] Add loading states and error handling
- **Learning**: Supabase filtering, updates, complex queries

#### Ticket 1.5: Notes CRUD - Full Implementation
**Size**: S (2-3 hours)
- [ ] Implement all note CRUD functions
- [ ] Replace mock data in client detail page (notes tab)
- [ ] Add loading states and error handling
- [ ] Test data persistence across all features
- **Learning**: Completing the CRUD pattern, data relationships

#### Ticket 1.6: Dashboard Real-Time Stats ✅ COMPLETED
**Size**: S (2 hours)
- [x] Implement `getDashboardStats()` using Supabase aggregation
- [x] Replace mock stats in dashboard
- [x] Add loading state (via Next.js async component streaming)
- [x] Verify counts match actual data

**What We Built:**
- Created `getDashboardStats()` function in `src/lib/data.ts` that fetches real data from Supabase
- Used `Promise.all()` to fetch clients and tasks in parallel for better performance
- Converted homepage to async Server Component to handle async data fetching
- Removed mock data implementation from `mockData.ts`

**Key Learnings:**
1. **Parallel Query Execution**: Using `Promise.all([getClients(), getTasks()])` fetches both datasets concurrently instead of sequentially, reducing total wait time
2. **Async Server Components**: Next.js 15 allows page components to be async, enabling direct data fetching without useEffect or separate data layers
3. **Automatic Loading States**: Async Server Components get automatic loading states through React streaming - no need for explicit loading.tsx for basic cases
4. **Data Aggregation Strategy**: Chose client-side filtering (fetch all, filter in JS) over SQL COUNT queries for simplicity. Trade-off: simpler code but less efficient at scale
5. **Type Safety**: Return types are automatically inferred from existing getClients/getTasks functions, maintaining end-to-end type safety

**Architecture Decision:**
We fetch all clients and tasks then filter in JavaScript rather than using SQL COUNT queries. This is less efficient but simpler for learning and fine for small datasets. Future optimization: use Supabase `.select('*', { count: 'exact', head: true })` for better performance at scale.

**Related**: Issue #7, commits on 2025-11-22

---

### 🔐 PHASE 2: Authentication & Security (Weeks 3-4)
**Goal**: Secure the application. Learn Supabase Auth deeply.

#### Ticket 2.1: Supabase Auth Setup ✅ COMPLETED
**Size**: S (2-3 hours)
- [x] Enable Email/Password auth in Supabase dashboard
- [x] Configure auth settings (email confirmations disabled for dev)
- [x] Create three Supabase client utilities (browser, server, middleware)
- [x] Create auth helper functions (signUp, signIn, signOut, getSession, getUser)
- [x] Test auth flow manually with test page

**What We Built:**
- Created `src/lib/supabase/client.ts` - Browser client for Client Components
- Created `src/lib/supabase/server.ts` - Server client for Server Components
- Created `src/lib/supabase/middleware.ts` - Middleware client for route protection
- Created `src/lib/auth.ts` - Helper functions wrapping the clients
- Created `src/app/test-auth/page.tsx` - Test page to verify auth (can be deleted)

**Key Learnings:**
1. **JWT Authentication**: Supabase uses JWT tokens (not session database) - tokens contain user info + signature, verified without DB queries
2. **Cookie-Based Storage**: Tokens stored in cookies (not localStorage) so both browser and server can access them
3. **Access + Refresh Tokens**: Access token expires in 1h (security), refresh token expires in 30d (UX), automatic refresh happens transparently
4. **Three Execution Contexts**: Browser (interactive UI), Server (data fetching), Middleware (route protection) each need different Supabase client configurations
5. **Server vs Client Boundary**: Client Components can't import server-only code (next/headers), must use browser client directly
6. **Token Refresh in Middleware**: Must return the response object (not NextResponse.next()) or refreshed tokens get lost

**Related**: Learning notes in LEARNING_NOTES.md, completed 2024-11-24

#### Ticket 2.2: Auth UI - Login Page
**Size**: M (3-4 hours)
- [ ] Create `/login` page with email/password form
- [ ] Implement form validation
- [ ] Add login error handling (wrong password, etc.)
- [ ] Add loading state during login
- [ ] Redirect to dashboard on success
- [ ] Style with Tailwind to match app design
- **Learning**: Form handling, auth error states, redirects

#### Ticket 2.3: Auth UI - Signup Page
**Size**: M (3-4 hours)
- [ ] Create `/signup` page
- [ ] Implement form with validation (email format, password strength)
- [ ] Add signup error handling (user exists, etc.)
- [ ] Add email confirmation flow
- [ ] Redirect to login or dashboard
- **Learning**: User registration flows, email confirmation

#### Ticket 2.4: Session Management & Context
**Size**: M (4 hours)
- [ ] Create AuthContext with React Context API
- [ ] Implement session persistence
- [ ] Add useAuth hook for components
- [ ] Handle session refresh
- [ ] Add logout functionality to navigation
- **Learning**: React Context, session management, hooks

#### Ticket 2.5: Protected Routes & Middleware
**Size**: M (4 hours)
- [ ] Create Next.js middleware for auth checks
- [ ] Protect all routes except /login and /signup
- [ ] Redirect unauthenticated users to login
- [ ] Add loading state during auth check
- [ ] Test authentication flow completely
- **Learning**: Next.js middleware, route protection

#### Ticket 2.6: Row Level Security (RLS)
**Size**: L (5-6 hours)
- [ ] Update RLS policies to restrict data by user
- [ ] Add `user_id` column to clients, tasks, notes tables
- [ ] Create migration script for existing data
- [ ] Update all CRUD operations to include user_id
- [ ] Test that users can only see their own data
- [ ] Add proper indexes on user_id columns
- **Learning**: PostgreSQL RLS, database security, migrations

---

### 🎨 PHASE 3: Polish & Production Readiness (Weeks 5-6)
**Goal**: Make it production-ready. Learn deployment and best practices.

#### Ticket 3.1: Form Validation Library
**Size**: M (3-4 hours)
- [ ] Install and configure react-hook-form + zod
- [ ] Add validation to all forms (clients, tasks, notes)
- [ ] Show inline error messages
- [ ] Prevent submission with invalid data
- [ ] Add proper TypeScript types
- **Learning**: Form libraries, schema validation

#### Ticket 3.2: Loading States & Skeletons
**Size**: M (4 hours)
- [ ] Create skeleton components for all pages
- [ ] Add loading spinners where appropriate
- [ ] Implement proper Suspense boundaries
- [ ] Test with slow network (throttling)
- **Learning**: UX patterns, React Suspense, skeleton screens

#### Ticket 3.3: Toast Notifications System
**Size**: S (2-3 hours)
- [ ] Install toast library (react-hot-toast or similar)
- [ ] Create toast wrapper component
- [ ] Add success toasts for all CRUD operations
- [ ] Add error toasts with helpful messages
- [ ] Style toasts to match app theme
- **Learning**: User feedback patterns, notification systems

#### Ticket 3.4: Confirmation Dialogs
**Size**: S (2 hours)
- [ ] Create reusable confirmation dialog component
- [ ] Add to delete operations (clients, tasks, notes)
- [ ] Add keyboard support (Esc to close, Enter to confirm)
- [ ] Make accessible with proper ARIA labels
- **Learning**: Accessible UI patterns, modals

#### Ticket 3.5: Error Boundaries & 404 Pages
**Size**: S (2-3 hours)
- [ ] Create error boundary components
- [ ] Add custom 404 page
- [ ] Add custom error page
- [ ] Add error tracking (Sentry or similar - optional)
- [ ] Test error scenarios
- **Learning**: Error handling, Next.js error pages

#### Ticket 3.6: Environment & Build Configuration
**Size**: S (2 hours)
- [ ] Validate environment variables at build time
- [ ] Add helpful error messages for missing config
- [ ] Set up proper TypeScript build checks
- [ ] Test production build locally
- [ ] Optimize bundle size
- **Learning**: Build optimization, environment management

#### Ticket 3.7: Edit Clients, Tasks & Notes (#30)
**Size**: M (4-5 hours) — added 2026-09-23; gap in the original plan, blocks shipping
- [ ] Implement `updateClient()` and `updateNote()` in `data.ts`
- [ ] Edit client form on client detail page, pre-filled with current values
- [ ] Edit task form (all fields), reusing existing `updateTask()`
- [ ] Edit note content
- [ ] Reuse existing Zod schemas for validation
- [ ] Success/error toasts for each edit
- [ ] Verify RLS blocks editing other users' rows; `updated_at` trigger fires
- **Learning**: Supabase `.update()`, pre-filling forms with React Hook Form, edit-mode UI pattern

---

### 🚀 PHASE 4: Deployment & DevOps (Week 7)
**Goal**: Launch the application. Learn deployment and monitoring.

#### Ticket 4.1: Vercel Deployment Setup (#20) ✅ COMPLETED (2026-11-05)
**Size**: M (3 hours)
- [x] Create Vercel account and link GitHub repo
- [x] Configure environment variables in Vercel
- [x] Set up automatic deployments from main branch
- [x] Configure preview deployments for PRs
- [x] Test deployment pipeline
- **Learning**: Vercel platform, CI/CD basics

#### Ticket 4.2: Database Migrations Setup (#21) ✅ COMPLETED (2026-11-02)
**Size**: M (3-4 hours)
- [x] Set up Supabase migrations folder
- [x] Create initial migration (from an inspection of the live DB; `schema.sql` was out of date and is deleted)
- [x] Document migration workflow (`supabase/README.md`)
- [x] Test migration rollback (on the `crm-proto-test` project)
- [x] Added: fix the RLS gaps (NOT NULL `user_id`, `user_id` indexes, `to authenticated`, client-ownership check) and a two-user RLS test
- **Learning**: Database migrations, version control for schemas

#### Ticket 4.3: Production Monitoring
**Size**: S (2 hours)
- [ ] Set up Vercel Analytics
- [ ] Configure error tracking
- [ ] Set up uptime monitoring
- [ ] Create basic dashboard for monitoring
- **Learning**: Production monitoring, observability

#### Ticket 4.4: Documentation & Launch Prep
**Size**: M (3 hours)
- [ ] Update README with production setup
- [ ] Create user documentation
- [ ] Write deployment runbook
- [ ] Create backup/restore procedures
- [ ] Document known issues and future features
- **Learning**: Technical writing, documentation practices

#### Ticket 4.5: End-to-End Testing (#36)
**Size**: M (3-4 hours) — added 2026-10-14; the Testing Strategy planned tests for Phase 3 but they were never ticketed
- [ ] Install and configure Playwright
- [ ] Dedicated test user and test data cleanup
- [ ] E2E: auth (login/logout, redirect when logged out)
- [ ] E2E: client add/edit/delete (incl. confirmation dialog), task and note CRUD
- [ ] E2E: RLS — a second user can't see another user's client
- [ ] `npm run test:e2e`; run in CI on pull requests (with 4.1)
- **Learning**: E2E testing, test data management, CI integration
- Out of scope for now: mocked unit tests for `data.ts` (thin Supabase wrappers)

#### Ticket 4.6: Unit Tests for Core Logic (#38)
**Size**: S (1-2 hours) — added 2026-10-14
- [ ] Vitest + `npm run test`
- [ ] Zod schemas, empty-string → `null` conversion, tasks-with-client join (extract to a pure function)
- [ ] Test-first bug fix: `/clients/abc` (invalid UUID) should show "Client Not Found", not a load error
- [ ] Test-first bug fix: clearing a task due date sends `''` (needs `null`); check UTC date display
- **Learning**: unit testing, test-first bug fixing, extracting pure functions

#### Ticket 4.7: First Impressions (#48)
**Size**: S (about 2 hours) — added 2026-11-05; do this first, then #49 (lite), then #23, then #36
- [x] Replace the Getting Started list with 3 steps for new users (#47)
- [x] Remove the developer note and the Terms of Service line (#47)
- [x] Plain page description; nav links on small screens (#47)
- [ ] Pick a real name, and rename "Simple CRM"
- [ ] Replace the default favicon
- [ ] Demo account with sample data
- **Learning**: first-run experience, empty states, demo data

#### Ticket 4.8: Branding & Visual Design (#49)
**Size**: M (4-6 hours, time-boxed to one day) — after #48, before #23, because the demo video shows the UI
- [ ] One accent color as a theme color in `globals.css`, replacing hardcoded blue and green classes
- [ ] A real font
- [ ] Wordmark and a better dashboard header
- Later, not this week: logo, restyled cards, own layout, design system
- **Learning**: design systems, visual hierarchy

---

### 🎁 PHASE 5: Enhancement & Advanced Features (Week 8+)
**Goal**: Add value-add features. Learn advanced patterns.

#### Ticket 5.1: Search & Filtering
**Size**: M (4 hours)
- [ ] Add search bar for clients (name, email, company)
- [ ] Add advanced filters for tasks (date range, priority)
- [ ] Implement debounced search
- [ ] Add search results highlighting
- **Learning**: Search UX, debouncing, complex queries

#### Ticket 5.2: Pagination & Infinite Scroll
**Size**: M (4-5 hours)
- [ ] Implement pagination for clients list
- [ ] Add infinite scroll for tasks
- [ ] Optimize queries with proper limits/offsets
- [ ] Add "load more" functionality
- **Learning**: Performance optimization, pagination patterns

#### Ticket 5.3: Data Export Feature
**Size**: M (4 hours)
- [ ] Add export to CSV functionality for clients
- [ ] Add export for tasks
- [ ] Create download button with proper formatting
- [ ] Add date range filters for exports
- **Learning**: File generation, data formatting

#### Ticket 5.4: Real-time Updates (Supabase Realtime)
**Size**: L (5-6 hours)
- [ ] Enable Supabase Realtime on tables
- [ ] Subscribe to client changes
- [ ] Subscribe to task changes
- [ ] Update UI automatically when data changes
- [ ] Handle concurrent edits gracefully
- **Learning**: Real-time subscriptions, WebSockets, conflict resolution

#### Ticket 5.5: File Attachments (Supabase Storage)
**Size**: L (6-8 hours)
- [ ] Set up Supabase Storage bucket
- [ ] Add file upload to client notes
- [ ] Add file preview/download
- [ ] Implement file size limits
- [ ] Add file type validation
- [ ] Clean up orphaned files
- **Learning**: File storage, uploads, cloud storage

#### Ticket 5.6: Email Notifications
**Size**: L (6-8 hours)
- [ ] Choose email service (Resend, SendGrid, etc.)
- [ ] Create email templates
- [ ] Send task due date reminders
- [ ] Send welcome emails to new users
- [ ] Add email preferences
- **Learning**: Email integration, background jobs

---

## Development Workflow

### Git Workflow
- Create branch for each ticket: `feature/ticket-1-1-supabase-setup`
- Commit frequently with descriptive messages
- Reference ticket in commit: `feat: implement client CRUD read operations (#1.2)`
- Open PR for each ticket
- Merge to main after review/testing

### GitHub Projects Setup
- Create project board with columns: Backlog, In Progress, Review, Done
- Add all tickets as issues
- Use labels: `phase-1`, `phase-2`, `learning`, `critical`, `enhancement`
- Track progress and time estimates
- Link commits to issues

### Testing Strategy

**When to Add Tests: After Phase 2**

For this learning project, add automated testing **after Phase 2 (Authentication)** is complete, right before or during Phase 3. Here's why:

**Why Wait:**
- Schema will change significantly when adding `user_id` columns and RLS in Phase 2
- Writing tests now means rewriting them when auth lands
- Primary goal is learning - tests slow down experimentation
- Manual testing is faster for rapid learning and iteration

**Testing Roadmap:**

**Phase 1 (Current):**
- ✅ Manual testing only
- ✅ Use console.log and browser DevTools
- ✅ Click through and verify behavior

**Phase 2 (Auth):**
- ✅ Manual testing for auth flows
- ✅ Test with multiple browser profiles (different users)
- ✅ Verify RLS policies in Supabase dashboard

**Phase 3 (Polish) - ADD TESTS HERE:**
- 🧪 Install Jest + React Testing Library
- 🧪 Unit tests for all data.ts functions (high value - protects database)
- 🧪 Integration tests for auth + CRUD with RLS
- 🧪 E2E tests for critical flows (login, add client, delete client)
- 🧪 Skip component tests (overkill for simple CRUD forms)

**Phase 4 (Deployment):**
- 🧪 Run tests in CI/CD pipeline
- 🧪 Block deployments on test failures

**Phase 5 (Enhancements):**
- 🧪 Add tests for new features as you build them
- 🧪 TDD becomes easier once patterns are established

**Key Principle:** Optimize for learning speed now, add tests when schema stabilizes and you understand the patterns. Tests written after understanding the system are better tests.

---

## First Recommended Step

### 🎯 START HERE: Ticket 1.1 - Supabase Project Setup

**Why this first?**
1. **Smallest possible win** - You can complete this in 30 minutes
2. **Foundation for everything** - Nothing else works without this
3. **Immediate learning** - You'll understand Supabase basics right away
4. **Low risk** - Just configuration, no code changes
5. **Validates the stack** - Confirms your tech choices work together

**What you'll learn:**
- How Supabase projects work
- Database schema deployment
- Environment variable management in Next.js
- Supabase client initialization

**Success criteria:**
- Supabase project created and accessible
- Schema deployed successfully
- Can connect from your local app
- Environment variables working

**After this ticket:**
You'll be ready to tackle Ticket 1.2 (Client CRUD - Read Operations), which will give you your first experience with real data persistence.

---

## Learning Resources

### Next.js 15
- Official docs: https://nextjs.org/docs
- App Router patterns
- Server vs Client Components
- Data fetching patterns

### Supabase
- Official docs: https://supabase.com/docs
- Database: https://supabase.com/docs/guides/database
- Auth: https://supabase.com/docs/guides/auth
- Realtime: https://supabase.com/docs/guides/realtime

### Best Practices
- TypeScript strict mode
- Error handling patterns
- Loading state UX
- Security best practices
- Performance optimization

---

## Success Metrics

### Phase 1 Complete
- All CRUD operations use Supabase
- Data persists across sessions
- No mock data remaining

### Phase 2 Complete
- Users can sign up and log in
- Data is isolated per user
- Protected routes working

### Phase 3 Complete
- All forms validated
- Proper error handling everywhere
- Production-ready UX

### Phase 4 Complete
- Deployed to production
- Monitoring in place
- Documentation complete

### Phase 5 Complete
- Advanced features working
- Real-time updates
- File attachments working

---

## Git Workflow & Tagging Strategy

### Git Tags for Milestones

**Purpose:** Mark major milestones with Git tags to create snapshots of project progress at key phases.

**When to Tag:**
- ✅ **Phase completions** (required) - When all tickets in a phase are complete
- ✅ **Major architectural changes** (optional) - Significant infrastructure updates
- ❌ **Individual tickets** (avoid) - Too granular, creates noise

**Tagging Workflow:**

When completing a phase:
```bash
# After final commit of the phase is pushed
git tag -a phase-X-complete -m "Phase X: [Phase Name] - Brief summary"
git push --tags
```

**Example:**
```bash
git tag -a phase-2-complete -m "Phase 2: Authentication & Security - All auth features and RLS complete"
git push --tags
```

**Phase Tags:**
- ✅ `phase-1-complete` - Foundation: Database Connection (Tagged: 2024-11-24)
- ✅ `phase-2-ticket-2.1-complete` - Auth Setup (Tagged: 2024-11-24)
- ✅ `phase-2-complete` - After Ticket 2.6 (RLS) (Tagged: 2025-12-04)
- ✅ `phase-3-complete` - After Ticket 3.6 (Tagged: 2026-10-30)
- 🔜 `phase-4-complete` - After deployment
- 🔜 `phase-5-complete` - After advanced features

**Benefits:**
- Easy navigation to any phase: `git checkout phase-1-complete`
- Compare phases: `git diff phase-1-complete phase-2-complete`
- Visual milestones on GitHub under Tags/Releases
- Time-travel through project evolution for learning/demos

---

## Notes & Decisions

### Architecture Decisions
- Using App Router (not Pages Router) for modern Next.js patterns
- Client Components for interactivity, Server Components where possible
- Direct Supabase client calls (may add API routes later for sensitive operations)
- PostgreSQL with Row Level Security for multi-tenant data

### Future Considerations
- Add API routes in Phase 2 for better security
- Consider React Server Actions for mutations
- Evaluate need for state management library (Zustand, Redux)
- Plan for analytics and user behavior tracking
- Consider adding a blog/help section

---

**Last Updated**: November 24, 2024
**Next Review**: After completing Phase 2
