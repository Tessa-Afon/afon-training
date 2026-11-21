-- Phase 1: bookings, place counts and staff sign-in.
--
-- Courses and their dates stay in the site's code (lib/courses.ts); this
-- database holds what changes day to day: bookings, capacity changes,
-- closed courses and who may sign in to the admin area.
--
-- Every table has row-level security switched on and no policies, so the
-- public (anon) and signed-in (authenticated) keys can read nothing. Only
-- the site's server, using the service-role key, reads and writes here.
-- Supabase Auth is used just to sign staff in.
--
-- Run once in the Supabase SQL editor (or `supabase db push`).

create extension if not exists pgcrypto;

-- Per-date settings that Chris can change from the admin card. A course
-- date with no row uses the capacity set in the site's code.
create table public.course_settings (
  slug text primary key,
  capacity_override integer check (capacity_override between 0 and 500),
  bookings_closed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  -- Short reference quoted to customers, e.g. AFT-7K3M9Q.
  reference text not null unique
    default 'AFT-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6)),
  course_slug text not null,
  course_title text not null,
  course_date date not null,
  trainer text not null,
  places integer not null check (places between 1 and 100),
  price_per_person numeric(8, 2) not null check (price_per_person >= 0),
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'cancelled')),
  invoice_status text not null default 'to_invoice'
    check (invoice_status in ('to_invoice', 'invoiced', 'paid', 'not_required')),
  source text not null default 'website' check (source in ('website', 'admin')),
  contact_name text not null,
  organisation text not null,
  email text not null,
  phone text not null default '',
  invoice_address text not null default '',
  invoice_email text not null default '',
  po_number text not null default '',
  attendees text not null default '',
  notes text not null default '',
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz
);

create index bookings_course_slug_idx on public.bookings (course_slug);
create index bookings_course_date_idx on public.bookings (course_date);

-- Who may sign in. Add a row after inviting someone in Supabase Auth.
--   owner:   Peter. Everything.
--   admin:   Chris. Everything except staff and settings.
--   trainer: Tess and later trainers. Only courses whose trainer matches
--            trainer_name.
create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('owner', 'admin', 'trainer')),
  trainer_name text,
  created_at timestamptz not null default now()
);

-- A record of who changed what, shown on each course card.
create table public.activity_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_name text not null,
  course_slug text,
  booking_id uuid references public.bookings (id) on delete set null,
  action text not null,
  detail text not null default ''
);

create index activity_log_course_slug_idx on public.activity_log (course_slug, at desc);

alter table public.course_settings enable row level security;
alter table public.bookings enable row level security;
alter table public.staff enable row level security;
alter table public.activity_log enable row level security;

-- Places taken per course date (cancelled bookings don't count).
create view public.course_places
with (security_invoker = true) as
select course_slug, sum(places)::integer as places_booked, count(*)::integer as bookings
from public.bookings
where status <> 'cancelled'
group by course_slug;

-- Creates a booking only if enough places are left, one booking at a time
-- per course date, so two people can't both take the last places.
--   p:                the booking fields (see the insert below)
--   default_capacity: the course's capacity from the site's code
--   enforce_closed:   true for website bookings; Chris can still add
--                     bookings by hand to a closed course
-- Returns {ok, reference, id, places_left} or {ok: false, reason, places_left}.
create function public.create_booking(p jsonb, default_capacity integer, enforce_closed boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text := p ->> 'course_slug';
  v_places integer := (p ->> 'places')::integer;
  v_capacity integer;
  v_closed boolean;
  v_taken integer;
  v_row public.bookings;
begin
  perform pg_advisory_xact_lock(hashtext('course:' || v_slug));

  select coalesce(capacity_override, default_capacity), bookings_closed
    into v_capacity, v_closed
    from public.course_settings where slug = v_slug;
  v_capacity := coalesce(v_capacity, default_capacity);
  v_closed := coalesce(v_closed, false);

  select coalesce(sum(places), 0) into v_taken
    from public.bookings where course_slug = v_slug and status <> 'cancelled';

  if enforce_closed and v_closed then
    return jsonb_build_object('ok', false, 'reason', 'closed', 'places_left', greatest(v_capacity - v_taken, 0));
  end if;
  if v_taken + v_places > v_capacity then
    return jsonb_build_object('ok', false, 'reason', 'not_enough_places', 'places_left', greatest(v_capacity - v_taken, 0));
  end if;

  insert into public.bookings (
    course_slug, course_title, course_date, trainer, places, price_per_person,
    source, contact_name, organisation, email, phone, invoice_address,
    invoice_email, po_number, attendees, notes
  ) values (
    v_slug, p ->> 'course_title', (p ->> 'course_date')::date, p ->> 'trainer', v_places,
    (p ->> 'price_per_person')::numeric, coalesce(p ->> 'source', 'website'),
    p ->> 'contact_name', p ->> 'organisation', p ->> 'email', coalesce(p ->> 'phone', ''),
    coalesce(p ->> 'invoice_address', ''), coalesce(p ->> 'invoice_email', ''),
    coalesce(p ->> 'po_number', ''), coalesce(p ->> 'attendees', ''), coalesce(p ->> 'notes', '')
  ) returning * into v_row;

  return jsonb_build_object(
    'ok', true, 'id', v_row.id, 'reference', v_row.reference,
    'places_left', v_capacity - v_taken - v_places
  );
end;
$$;

-- Changing a booking's places or reopening a cancelled one goes through
-- the same check. Returns {ok, places_left} or {ok: false, reason, places_left}.
create function public.change_booking_places(
  booking uuid, new_places integer, new_status text, default_capacity integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_b public.bookings;
  v_capacity integer;
  v_taken integer;
begin
  select * into v_b from public.bookings where id = booking;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found', 'places_left', 0);
  end if;

  perform pg_advisory_xact_lock(hashtext('course:' || v_b.course_slug));

  select coalesce(capacity_override, default_capacity) into v_capacity
    from public.course_settings where slug = v_b.course_slug;
  v_capacity := coalesce(v_capacity, default_capacity);

  select coalesce(sum(places), 0) into v_taken
    from public.bookings
    where course_slug = v_b.course_slug and status <> 'cancelled' and id <> booking;

  if new_status <> 'cancelled' and v_taken + new_places > v_capacity then
    return jsonb_build_object('ok', false, 'reason', 'not_enough_places', 'places_left', greatest(v_capacity - v_taken, 0));
  end if;

  update public.bookings set
    places = new_places,
    status = new_status,
    confirmed_at = case when new_status = 'confirmed' then coalesce(confirmed_at, now()) else confirmed_at end,
    cancelled_at = case when new_status = 'cancelled' then now() else null end
  where id = booking;

  return jsonb_build_object(
    'ok', true,
    'places_left', v_capacity - v_taken - case when new_status = 'cancelled' then 0 else new_places end
  );
end;
$$;

revoke all on function public.create_booking(jsonb, integer, boolean) from public, anon, authenticated;
revoke all on function public.change_booking_places(uuid, integer, text, integer) from public, anon, authenticated;
revoke all on public.course_places from anon, authenticated;
