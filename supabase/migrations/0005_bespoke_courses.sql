-- Bespoke (private) courses run for one organisation, as Chris asked
-- (26 Nov 2026). Added from the admin Course planner by Chris or Peter and
-- shown there alongside the public courses; never shown on the website.
-- Safe to run twice.

create table if not exists public.bespoke_courses (
  id uuid primary key default gen_random_uuid(),
  organisation text not null,
  title text not null,
  date date not null,
  start_time text not null default '',
  end_time text not null default '',
  trainer text not null,
  places integer not null check (places > 0),
  location text not null default '',
  notes text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bespoke_courses_date_idx on public.bespoke_courses (date);

alter table public.bespoke_courses enable row level security;
revoke all on public.bespoke_courses from anon, authenticated;
