-- Migration 1: initial schema
--
-- A record of the live database AS IT WAS on 2026-10-31, before any fixes.
-- Built from a read-only inspection of the live project (columns, constraints, policies,
-- indexes, triggers), not from the old database/schema.sql, which was out of date.
--
-- The live project already has all of this, so this migration is marked as applied there
-- (supabase migration repair) instead of being run. On a new, empty project it runs normally.
--
-- Known gaps, deliberately left as they were and fixed in the next migration:
--   - user_id allows NULL on all three tables
--   - no user_id index on tasks or notes
--   - task/note policies don't check that the client belongs to the same user
--   - policies apply to every role (public), not just logged-in users

-- ============================================================
-- Tables
-- ============================================================

create table public.clients (
    id uuid primary key default gen_random_uuid(),
    name varchar(255) not null,
    email varchar(255) not null,
    phone varchar(50),
    company varchar(255),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    user_id uuid references auth.users (id) on delete cascade,
    constraint clients_user_email_unique unique (user_id, email)
);

create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    client_id uuid not null references public.clients (id) on delete cascade,
    title varchar(255) not null,
    description text,
    status varchar(20) default 'pending' check (status in ('pending', 'in_progress', 'completed')),
    priority varchar(20) default 'medium' check (priority in ('low', 'medium', 'high')),
    due_date date,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    user_id uuid references auth.users (id) on delete cascade
);

create table public.notes (
    id uuid primary key default gen_random_uuid(),
    client_id uuid not null references public.clients (id) on delete cascade,
    content text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    user_id uuid references auth.users (id) on delete cascade
);

-- ============================================================
-- Indexes
-- ============================================================

create index idx_clients_email on public.clients (email);
create index idx_tasks_client_id on public.tasks (client_id);
create index idx_tasks_status on public.tasks (status);
create index idx_tasks_priority on public.tasks (priority);
create index idx_tasks_due_date on public.tasks (due_date);
create index idx_notes_client_id on public.notes (client_id);

-- ============================================================
-- updated_at trigger
-- The column default sets updated_at when a row is created;
-- this trigger resets it on every update.
-- ============================================================

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger update_clients_updated_at before update on public.clients
for each row execute function public.update_updated_at_column();

create trigger update_tasks_updated_at before update on public.tasks
for each row execute function public.update_updated_at_column();

create trigger update_notes_updated_at before update on public.notes
for each row execute function public.update_updated_at_column();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.clients enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;

-- clients
create policy "Users can view their own clients" on public.clients
for select using (auth.uid() = user_id);

create policy "Users can insert their own clients" on public.clients
for insert with check (auth.uid() = user_id);

create policy "Users can update their own clients" on public.clients
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own clients" on public.clients
for delete using (auth.uid() = user_id);

-- tasks
create policy "Users can view their own tasks" on public.tasks
for select using (auth.uid() = user_id);

create policy "Users can insert their own tasks" on public.tasks
for insert with check (auth.uid() = user_id);

create policy "Users can update their own tasks" on public.tasks
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own tasks" on public.tasks
for delete using (auth.uid() = user_id);

-- notes
create policy "Users can view their own notes" on public.notes
for select using (auth.uid() = user_id);

create policy "Users can insert their own notes" on public.notes
for insert with check (auth.uid() = user_id);

create policy "Users can update their own notes" on public.notes
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own notes" on public.notes
for delete using (auth.uid() = user_id);
