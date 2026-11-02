-- Migration 2: tighten RLS and constraints
--
-- Fixes the gaps recorded in the initial schema migration.
-- Checked first on the live data (2026-10-31): 0 rows with a NULL user_id,
-- 0 tasks/notes on another user's client, so none of this conflicts with existing rows.



-- ============================================================
-- 1. Every row must have an owner
-- ============================================================
-- Make user_id required on clients, tasks and notes.


alter table public.clients alter column user_id set not null;
alter table public.tasks alter column user_id set not null;
alter table public.notes alter column user_id set not null;

-- ============================================================
-- 2. Indexes for RLS
-- ============================================================
-- Every policy filters by user_id, so tasks and notes need an index on it.
-- (clients is already covered: its (user_id, email) unique index starts with user_id.)
-- Hint: same shape as the indexes in migration 1; name them idx_tasks_user_id / idx_notes_user_id
--
-- Optional: idx_clients_email is unused (the app never looks clients up by email alone). Drop it?


drop index public.idx_clients_email;
create index idx_tasks_user_id on public.tasks (user_id);
create index idx_notes_user_id on public.notes (user_id);


-- ============================================================
-- 3. Policies: logged-in users only
-- ============================================================
-- All 12 policies currently apply to every role ("public"), including logged-out visitors.
-- They should apply only to the "authenticated" role.
--       The exact policy names are in migration 1.


alter policy "Users can view their own clients" on public.clients to authenticated;
alter policy "Users can insert their own clients" on public.clients to authenticated;
alter policy "Users can update their own clients" on public.clients to authenticated;
alter policy "Users can delete their own clients" on public.clients to authenticated;
alter policy "Users can view their own tasks" on public.tasks to authenticated;
alter policy "Users can insert their own tasks" on public.tasks to authenticated;
alter policy "Users can update their own tasks" on public.tasks to authenticated;
alter policy "Users can delete their own tasks" on public.tasks to authenticated;
alter policy "Users can view their own notes" on public.notes to authenticated;
alter policy "Users can insert their own notes" on public.notes to authenticated;
alter policy "Users can update their own notes" on public.notes to authenticated;
alter policy "Users can delete their own notes" on public.notes to authenticated;

-- ============================================================
-- 4. Tasks and notes can only be attached to your own clients
-- ============================================================
-- Today the insert/update checks are only (auth.uid() = user_id): "this row is mine".
-- They don't check that client_id points to a client that is ALSO mine.
-- Change the INSERT and UPDATE policies on tasks and notes so the check also requires that.



alter policy "Users can insert their own tasks" on public.tasks
with check (
    auth.uid() = user_id 
    and exists (select 1 from public.clients where clients.id = client_id and clients.user_id = auth.uid()
));

alter policy "Users can update their own tasks" on public.tasks
with check (
    auth.uid() = user_id 
    and exists (select 1 from public.clients where clients.id = client_id and clients.user_id = auth.uid()
));

alter policy "Users can insert their own notes" on public.notes
with check (
    auth.uid() = user_id 
    and exists (select 1 from public.clients where clients.id = client_id and clients.user_id = auth.uid()
));

alter policy "Users can update their own notes" on public.notes
with check (
    auth.uid() = user_id 
    and exists (select 1 from public.clients where clients.id = client_id and clients.user_id = auth.uid()
));

