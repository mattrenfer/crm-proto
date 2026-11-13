# Design Decisions

The main choices behind Handful, and what each one costs. How the pieces fit together is in
[architecture.md](architecture.md).

## Security

| Decision | Why | Trade-off |
|---|---|---|
| **Row Level Security enforces data access**, not the app | The anon key is public by design, and anyone can call the Supabase API directly. Rules in the database hold either way | Policies need tests: `supabase/tests/rls_test.sql` |
| **Validation in two layers** (Zod and database constraints, same limits) | Zod gives a friendly message; constraints stop anything that skips the form | Limits have to be kept in step in two places |
| **CAPTCHA verified by Supabase**, not by app code | A check in app code could be skipped by calling the API directly | Covers sign-in and reset as well as sign-up; needs a privacy page for invisible mode |
| **The demo signs in on the server** with the service role key | The demo works for every visitor, including ones Cloudflare is unsure about, and the password never reaches the browser | The service role key exists in the server environment; it's read in one route only |
| **The unused GraphQL API is turned off** | The app only uses REST, so one way in instead of two | Can be restored with `create extension pg_graphql;` |
| **Signing up with an existing email looks like success** | Saying "already registered" would reveal who has an account | Less helpful for someone who forgot they signed up |
| **Leaked-password checks aren't on** | Supabase offers them on paid plans only | Covered in part by an 8-character minimum, CAPTCHA and rate limits |

## Data and state

| Decision | Why | Trade-off |
|---|---|---|
| **A light data access layer** (`data.ts`, `data-server.ts`) | One place for queries, errors and types, without enterprise layers | Read functions are duplicated between the browser and server files |
| **Server-confirmed updates** rather than optimistic ones | New rows get their ID from the database, and deletes cascade, so rolling back on screen would be confusing | The screen waits for the server, with a visible "Saving..." state |
| **Schema changes only through migrations**, starting from a baseline of the original database | The history is reviewable and repeatable, and every change is tried on a test project first | A second Supabase project to maintain |
| **One shared demo account**, reset nightly and protected by a database trigger | One click to try the app; traffic is low | Visitors can see each other's demo changes until the reset |

## Interface

| Decision | Why | Trade-off |
|---|---|---|
| **A newspaper-style dashboard** where the most urgent task is the lead story | It answers "who needs me today?" before anything else | Less conventional than a table of records |
| **Plain, gentle wording** ("Still on your list") and a teal accent rather than red | It should feel human, not like an alarm | — |
| **Native `<dialog>`** for confirmations | Focus handling, Esc and an inert page come built in, with no dependency | Syncing React state with the dialog takes care |
| **Full page load after sign-in and sign-out** | Avoids a stale prefetched response in production | A reload instead of a client-side navigation |
| **Config checked at startup** (`env.ts`) | A missing setting fails the build with a clear message instead of shipping a broken app | Public variable names must be written out in full |

## Deliberately later

- Self-serve account deletion (for now, by email; see the [privacy page](../src/app/privacy/page.tsx))
- Automated end-to-end and unit tests in CI
- An API layer between the browser and the database
- Search, reminders and data export
