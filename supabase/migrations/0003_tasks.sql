-- Task board: each staff member's own Kanban board at /admin/tasks.
-- Rebuilt from DoneNow (Base44) for Tess, 24 Nov 2026. Safe to run twice.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  -- Rolling notes, oldest first: [{ "date": "24/11/26", "text": "..." }]
  notes jsonb not null default '[]'::jsonb,
  status text not null default 'Inbox'
    check (status in ('Inbox', 'Today', 'This Week', 'Waiting', 'Later', 'Done')),
  category text not null default 'Work'
    check (category in ('Work', 'Personal', 'Reminder')),
  is_priority boolean not null default false,
  tag text,
  sub_tag text,
  due_date date,
  done_at timestamptz,
  -- The DoneNow record this was imported from, so an import never doubles up.
  base44_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_owner_status_idx on public.tasks (owner_id, status);

-- Locked to everyone except the server (service-role key), like every
-- other table; the server checks who is signed in.
alter table public.tasks enable row level security;
