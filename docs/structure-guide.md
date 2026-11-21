# Afon Training: structure guide

How the code is laid out. Hosting, accounts and keys are in the
[setup guide](setup-guide.md).

## The stack

- Next.js 16 (App Router) and Tailwind, hosted on Netlify. Next.js 16 has
  breaking changes: read `node_modules/next/dist/docs/` before writing code.
- Supabase for bookings and staff sign-in; Resend for emails.
- `pnpm install`, `pnpm dev` (the password gate is off locally unless
  `SITE_PASSWORD` is set), `pnpm build`, `pnpm lint`.

## Folders

| Folder | What's in it |
|---|---|
| `app/` | Pages: home, `courses/[slug]` (and `book/`), `first-aid`, `bespoke-training`, `about`, `contact`, `join-the-team`, `booking-terms`, `privacy`, `gate` (sandbox password) |
| `app/admin/` | Admin area for Chris, Peter and trainers: bookings by course date, register download, and the course planner (`/admin/planner`, 6 or 12 months; `lib/planner.ts`) |
| `components/` | Header, footer, course cards, booking and contact forms, sandbox banner |
| `lib/courses.ts`, `lib/firstAid.ts`, `lib/site.ts` | Course list, dates, prices, trainers and site wording |
| `lib/availability.ts` | Places left, "Only 3 places left" / "Course full", the 2-day cut-off |
| `lib/email.ts` | Booking emails |
| `lib/site-gate.ts`, `proxy.ts` | Live or sandbox, and the password gate |
| `lib/supabase/`, `lib/booking.ts`, `lib/staff.ts`, `lib/admin-data.ts` | Database access |
| `supabase/migrations/` | Database tables |
| `public/__forms.html` | Netlify Forms field list: keep it in step with both forms |
| `docs/` | These guides, admin setup, scoping, theme brief, Tess's reference |

## Where things go

- **New dates, prices, course wording:** `lib/courses.ts`.
- **A course full:** its status in `lib/courses.ts` (until the database
  counts places on the live site).
- **Look and feel:** the Heather & Marigold theme in
  `docs/THEME_DESIGN.md` and `app/globals.css`.
- **Database change:** a new numbered file in `supabase/migrations/`, and a
  step in `docs/ADMIN_SETUP.md` to run it.

## How a change goes live

1. Claude makes the change on a branch and opens a pull request into `dev`.
2. Once merged, it's on the sandbox for Tess and Peter to check.
3. Merging `dev` into `main` publishes it to afontraining.co.uk.

## Rules for this site

- Kept separate from the Recept apps, in Tess's accounts, so it can be
  handed over.
- No passwords in the repository or these guides.
