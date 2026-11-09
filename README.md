# Afon Training

Website for Afon Training (working name). Separate from Recept Training.

Next.js and Tailwind, hosted on Netlify (free plan), with Supabase when bookings need a database. Kept separate from the Recept apps so it can be handed over.

- `app/page.tsx`: homepage (design awaiting approval)
- `app/gate/`, `proxy.ts`: password gate for the dev sandbox (the live site is open)
- `app/courses/[slug]/book/`, `components/BookingForm.tsx`: booking form.
  Saves to Supabase, which checks places are free (`create_booking`).
- `lib/availability.ts`: places left, the "Only 3 places left" / "Course
  full" banners, and the 2-day booking cut-off
- `app/admin/`: admin area (Chris, Peter, trainers): sign-in with two-step
  codes, a card per course date, bookings, register download
- `lib/email.ts`: booking emails, sent through Resend
- `supabase/migrations/`: database tables. Setup steps: `docs/ADMIN_SETUP.md`
- `components/ContactForm.tsx`: contact form
- `public/__forms.html`: Netlify Forms field list. Keep it in step with both forms.
- `app/api/form/route.ts`: the same forms on Vercel, emailed through Resend
- `docs/SCOPING.md`: scope, current phase and page copy
- `docs/THEME_DESIGN.md`: Heather & Marigold theme brief

## Running locally

```
pnpm install
pnpm dev
```

The password gate is off in `pnpm dev` unless `SITE_PASSWORD` is set.

## Hosting (Netlify, moving to Vercel)

The code runs on both. `next.config.ts` turns Vercel's `VERCEL_ENV` and
branch into Netlify's deploy contexts (`production` for main,
`branch-deploy` for dev, `deploy-preview` for other branches), so the
password gate, robots rules and sandbox banner behave the same. On Vercel
the forms post to `/api/form`, which emails them to `ADMIN_EMAIL` through
Resend, instead of Netlify Forms. Everything below describes Netlify until
the domain moves.

- Owned by the `Tessa-Afon` GitHub and Netlify accounts. Build settings
  live in `netlify.toml`.
- **`main` is the live site** (afontraining.co.uk): open to everyone, indexed
  by search engines.
- **`dev` is the sandbox** (Netlify branch deploy, `dev--<site>.netlify.app`):
  password-protected and hidden from search engines. Build and check changes
  there, then merge `dev` into `main` to publish.
- Environment variable `SITE_PASSWORD`: the sandbox password. A sandbox or
  preview build returns 503 if it is missing.
- Forms: the contact form uses Netlify Forms (free plan: 100 submissions a
  month). Bookings go to Supabase once it is set up for a deploy
  (`docs/ADMIN_SETUP.md`); without it they fall back to Netlify Forms.
- Environment variables for bookings and the admin area:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`.
- Domain: `afontraining.co.uk`. Previously served on `controlnow.co.uk`
  from Vercel; that domain is being freed for Peter's dashboard.
- Email: Zoho Mail (free plan). Enquiries and bookings go to
  `bookings@afontraining.co.uk`.
