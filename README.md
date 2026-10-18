# Afon Training

Website for Afon Training (working name). Separate from Recept Training.

Next.js and Tailwind, hosted on Netlify (free plan), with Supabase when bookings need a database. Kept separate from the Recept apps so it can be handed over.

- `app/page.tsx`: homepage (design awaiting approval)
- `app/gate/`, `proxy.ts`: preview password gate
- `docs/SCOPING.md`: scope, current phase and page copy
- `docs/THEME_DESIGN.md`: Heather & Marigold theme brief

## Running locally

```
pnpm install
pnpm dev
```

The password gate is off in `pnpm dev` unless `SITE_PASSWORD` is set.

## Hosting (Netlify)

- Owned by the `Tessa-Afon` GitHub and Netlify accounts; Netlify deploys
  every push to `main`. Build settings live in `netlify.toml`.
- Environment variable `SITE_PASSWORD`: the preview password. The site returns 503 in production if it is missing.
- Domain: `afontraining.co.uk`. Previously served on `controlnow.co.uk`
  from Vercel; that domain is being freed for Peter's dashboard.
- Email: Zoho Mail (free plan). Enquiries and bookings go to
  `bookings@afontraining.co.uk`.
