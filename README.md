# Afon Training

Website for Afon Training (working name). Separate from Recept Training.

Next.js and Tailwind, hosted on Netlify (free plan), with Supabase when bookings need a database. Kept separate from the Recept apps so it can be handed over.

- `app/page.tsx`: homepage (design awaiting approval)
- `app/gate/`, `proxy.ts`: password gate for the dev sandbox (the live site is open)
- `app/courses/[slug]/book/`, `components/BookingForm.tsx`: booking form
- `components/ContactForm.tsx`: contact form
- `public/__forms.html`: Netlify Forms field list. Keep it in step with both forms.
- `docs/SCOPING.md`: scope, current phase and page copy
- `docs/THEME_DESIGN.md`: Heather & Marigold theme brief

## Running locally

```
pnpm install
pnpm dev
```

The password gate is off in `pnpm dev` unless `SITE_PASSWORD` is set.

## Hosting (Netlify)

- Owned by the `Tessa-Afon` GitHub and Netlify accounts. Build settings
  live in `netlify.toml`.
- **`main` is the live site** (afontraining.co.uk): open to everyone, indexed
  by search engines.
- **`dev` is the sandbox** (Netlify branch deploy, `dev--<site>.netlify.app`):
  password-protected and hidden from search engines. Build and check changes
  there, then merge `dev` into `main` to publish.
- Environment variable `SITE_PASSWORD`: the sandbox password. A sandbox or
  preview build returns 503 if it is missing.
- Forms: Netlify Forms (free plan: 100 submissions a month). Submissions
  appear under Forms in Netlify and are emailed to bookings@.
- Domain: `afontraining.co.uk`. Previously served on `controlnow.co.uk`
  from Vercel; that domain is being freed for Peter's dashboard.
- Email: Zoho Mail (free plan). Enquiries and bookings go to
  `bookings@afontraining.co.uk`.
