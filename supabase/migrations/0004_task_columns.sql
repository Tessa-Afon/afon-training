-- Task board columns as Tess asked (25 Nov 2026): Inbox, Today, Farm,
-- House, Admin (and Done). Cards in the old This Week, Waiting and Later
-- columns move to Inbox for sorting. Safe to run twice.

alter table public.tasks drop constraint if exists tasks_status_check;

update public.tasks set status = 'Inbox', updated_at = now()
where status in ('This Week', 'Waiting', 'Later');

alter table public.tasks add constraint tasks_status_check
  check (status in ('Inbox', 'Today', 'Farm', 'House', 'Admin', 'Done'));
