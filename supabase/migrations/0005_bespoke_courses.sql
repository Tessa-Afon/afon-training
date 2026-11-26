-- Bespoke (private) courses run for one organisation, as Chris asked
-- (26 Nov 2026). Added from the admin Course planner by Chris or Peter and
-- shown there alongside the public courses; never shown on the website.
-- Contact and invoice details added the same day (Chris). Safe to run
-- twice, and safe to run again if the first version was already run.

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

alter table public.bespoke_courses
  add column if not exists contact_name text not null default '',
  add column if not exists email text not null default '',
  add column if not exists phone text not null default '',
  add column if not exists invoice_address text not null default '',
  add column if not exists invoice_email text not null default '',
  add column if not exists po_number text not null default '',
  add column if not exists price numeric(10, 2) check (price is null or price >= 0),
  add column if not exists attendees text not null default '';

create index if not exists bespoke_courses_date_idx on public.bespoke_courses (date);

alter table public.bespoke_courses enable row level security;
revoke all on public.bespoke_courses from anon, authenticated;
