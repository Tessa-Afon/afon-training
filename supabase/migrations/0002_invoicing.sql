-- Phase 2: invoicing through FreeAgent, payment chasing and the attendee
-- names reminder. Run once in the Supabase SQL editor, after 0001.
--
-- FreeAgent holds the real invoices; these tables remember which FreeAgent
-- invoice or credit note belongs to which booking, and what FreeAgent last
-- said about it, so the admin area can show money owed without asking
-- FreeAgent on every page. Same lock-down as 0001: row-level security on,
-- no policies, only the site's server can read or write.

-- The FreeAgent connection, made once by the owner from Admin > Settings.
-- One row only. The tokens let the site act in FreeAgent, so this table
-- must stay locked like the rest.
create table public.freeagent_connection (
  id integer primary key default 1 check (id = 1),
  environment text not null check (environment in ('sandbox', 'live')),
  access_token text not null,
  refresh_token text not null,
  access_expires_at timestamptz not null,
  company_name text not null default '',
  connected_by text not null,
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  last_sync_result text not null default ''
);

-- FreeAgent customers ("contacts") the site has created, so a practice
-- that books again is invoiced under the same contact. Keyed by
-- organisation and invoice email, lower case.
create table public.freeagent_contacts (
  key text primary key,
  environment text not null check (environment in ('sandbox', 'live')),
  contact_url text not null,
  created_at timestamptz not null default now()
);

-- Every invoice and credit note raised for a booking. A booking has one
-- invoice normally; a second if places are added later; a credit note if
-- places are removed or the booking is cancelled in time.
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete restrict,
  kind text not null check (kind in ('invoice', 'credit_note')),
  environment text not null check (environment in ('sandbox', 'live')),
  freeagent_url text not null unique,
  reference text not null default '',
  -- Places covered: positive for an invoice, the places credited for a
  -- credit note (also positive). Amounts are always positive here too.
  places integer not null check (places >= 0),
  amount numeric(10, 2) not null check (amount >= 0),
  dated_on date not null,
  due_on date,
  -- FreeAgent's own status: Draft, Open, Overdue, Paid, Refunded, ...
  status text not null default 'Draft',
  paid_value numeric(10, 2) not null default 0,
  due_value numeric(10, 2) not null default 0,
  emailed_at timestamptz,
  last_reminder_at timestamptz,
  reminders_sent integer not null default 0,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

create index invoices_booking_idx on public.invoices (booking_id);

-- When the "please send attendee names" email went (3 weeks before).
alter table public.bookings add column names_reminder_sent_at timestamptz;

alter table public.freeagent_connection enable row level security;
alter table public.freeagent_contacts enable row level security;
alter table public.invoices enable row level security;

revoke all on public.freeagent_connection from anon, authenticated;
revoke all on public.freeagent_contacts from anon, authenticated;
revoke all on public.invoices from anon, authenticated;
