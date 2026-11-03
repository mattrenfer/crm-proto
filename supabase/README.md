# Database migrations

The database schema (tables, indexes, triggers, Row Level Security policies) is defined by the files in
`migrations/`, applied in timestamp order. Don't change the schema in the Supabase dashboard; write a migration.

| File | What it does |
|---|---|
| `migrations/20261031180837_initial_schema.sql` | Baseline: the live database as it was on 2026-10-31, known gaps included |
| `migrations/20261031180902_tighten_rls_and_constraints.sql` | `user_id` NOT NULL, `user_id` indexes, policies for logged-in users only, tasks/notes must belong to your own client |
| `tests/rls_test.sql` | Two-user RLS test. **Test project only** |

Two Supabase projects: **`crm-proto-test`** (throwaway, for trying migrations) and **`CRM Proto`** (live).
Commands use `npx supabase` (installed as a dev dependency) and go to whichever project is linked
(`supabase/.temp/project-ref`). Link the test project by default.

## Making a schema change

```bash
npx supabase migration new describe_the_change     # creates migrations/<timestamp>_describe_the_change.sql
```

1. Write the SQL. If it adds a rule (like NOT NULL), first check that live data already follows it.
2. **Test project:**
   ```bash
   npx supabase link --project-ref <test ref>
   npx supabase db push --linked --dry-run            # lists what would run
   npx supabase db push --linked
   npx supabase db query --linked -f supabase/tests/rls_test.sql   # every case should be PASS
   ```
3. Commit the migration with the code that needs it and open a PR.
4. **Live**, after merge:
   ```bash
   npx supabase link --project-ref <live ref>
   npx supabase db push --linked --dry-run            # must list ONLY the new migration
   npx supabase db push --linked                      # all or nothing: a failure changes nothing
   ```
   Then check in the app, and link the test project again.

If the CLI fails with a `cli_login_postgres` / "login role" error, set the database password for that terminal:
`$env:SUPABASE_DB_PASSWORD = "..."` (PowerShell). It can be reset in Project Settings → Database; the app doesn't use it.

## Undoing a change

Applied migrations are history: **don't edit or delete one that has run on live.** To undo, write a new migration
that reverses it, test it, and push it like any other.

On the test project only, you can rebuild from scratch: `npx supabase db reset --linked --yes` wipes it and replays
every migration.

## Starting a new, empty project

`npx supabase db push --linked` builds the whole schema from `migrations/`.
(The live project was set up by hand before migrations existed, so its baseline was marked applied instead of run:
`npx supabase migration repair --status applied 20261031180837 --linked`.)
