# Afon Training: setup guide

An instant reminder of where everything is. No passwords or keys here:
only their names and where they live (passwords and two-step codes are in
the shared password manager). Step-by-step setup for bookings and
invoicing is in [ADMIN_SETUP.md](ADMIN_SETUP.md); the plain-English version
for Tess is [TECH_REFERENCE.md](TECH_REFERENCE.md).

**Last checked:** 17 Nov 2026 (accounts)

## At a glance

| | |
|---|---|
| Live site | <https://afontraining.co.uk> (branch `main`) |
| Sandbox | <https://dev--cheery-youtiao-478629.netlify.app> (branch `dev`, site password, hidden from search engines) |
| Repository | `Tessa-Afon/afon-training`, **public** (Netlify's free plan won't build a private repo from Claude's or Peter's commits; made private by mistake on 25 Nov and deploys stopped) (Tess's GitHub account; Peter-StatementNow is a collaborator; the Claude app is installed) |
| Hosting | Netlify, site `cheery-youtiao-478629`, Tess's account (free plan). Build settings in `netlify.toml` |
| Database | Supabase, two projects under development@afontraining.co.uk: the **sandbox** project (used by `dev`) and the **live** project (used by `main`; online booking has used it since 21 Nov 2026). Each has its own data and staff sign-ins, and each database change in `supabase/migrations/` is run on both |
| Email | Zoho Mail (free plan): Tess's mailbox, `bookings@` alias, `admin@` for Chris |
| Booking emails | Resend, sending as `bookings@afontraining.co.uk` |
| Domain and DNS | afontraining.co.uk, in Peter's Squarespace Domains for now; moving to a registrar under Tess's own address (keep Zoho's MX records) |

## Branches and going live

- `dev` is the sandbox. Claude's pull requests go into `dev`, and Netlify
  rebuilds the sandbox on every merge.
- `main` is the live site. Merging `dev` into `main` publishes everything
  waiting on `dev`, so do it deliberately. Online booking went live on
  21 Nov 2026 (live Supabase project, Production keys in Netlify).
- Netlify also builds a preview for each pull request
  (`deploy-preview-NN--cheery-youtiao-478629.netlify.app`).

## Accounts

All Afon development accounts sit under
**development@afontraining.co.uk** (a Zoho user Peter created; Tess, as
Zoho super admin, can reset it). GitHub's primary email has been
development@ since 17 Nov 2026, and Netlify and Supabase sign in through
that GitHub account, so one login covers all three. Netlify's free plan
allows one team member, so people share that login rather than having
their own.

| Service | Signed in as | What it's for |
|---|---|---|
| GitHub | Tessa-Afon (primary email development@) | Code |
| Netlify | Tessa-Afon (through GitHub) | Hosting, forms, environment variables |
| Supabase | Tessa-Afon (through GitHub) | Bookings database and staff sign-in |
| Resend | development@ (API key set up) | Booking emails |
| Zoho Mail | Tess (super admin); development@; admin@ | Mailboxes |

Who else has access: GitHub collaborators are Tessa-Afon (owner) and
Peter-StatementNow (write; the Claude app works through this). Chris
works through the shared Tessa-Afon login (development@), not his own
GitHub account, because Netlify's free plan allows one member; his
Claude account connects to GitHub and Supabase as Tessa-Afon. See
[working-with-claude.md](working-with-claude.md). Chris also uses the
site's own admin area and the admin@ mailbox.

### Claude and the Afon database (Supabase)

- Peter (peter@receptconsulting.com) is a member of the **Afon Training**
  Supabase organisation (since 17 Nov 2026).
- Claude's Supabase connector can only be linked to **one** Supabase
  organisation at a time. Peter keeps his linked to **StatementNow**
  (ControlNow's database). For Afon database work, reconnect it to Afon
  Training at claude.ai/settings/connectors (it isn't in the desktop app's
  settings), then switch it back to StatementNow afterwards.
- Chris connects Supabase in his own Claude account at
  claude.ai/settings/connectors by signing in with GitHub as Tessa-Afon and
  choosing Afon Training; as it's his only Supabase organisation he can
  leave it connected.
| FreeAgent (phase 2) | developer app at dev.freeagent.com; Afon's FreeAgent company | Invoices and payment chasing |
| Domain registrar | Squarespace (Peter) for now; Tess's own registrar later | DNS |

## Environment variables

Netlify → Site configuration → Environment variables. Sandbox values are
scoped to **Branch deploys**; live values to **Production**.

| Name | What it is |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project address and publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret key (reads every booking: secret) |
| `RESEND_API_KEY` | Booking emails |
| `EMAIL_FROM` | Optional: a different sender |
| `SITE_URL` | Optional: worked out from Netlify's own address if unset |
| `TASKS_PASSWORD`, `TASKS_OWNER_EMAIL` | Tess's task board at `/tasks`: its password (all contexts), and optionally whose board it is (default tessa@afontraining.co.uk) |
| `FREEAGENT_CLIENT_ID`, `FREEAGENT_CLIENT_SECRET`, `FREEAGENT_ENV`, `CRON_SECRET` | Phase 2 invoicing ([ADMIN_SETUP.md](ADMIN_SETUP.md), section 6, once that work is merged) |

Netlify's `CONTEXT` tells the site whether it's live (`production`) or the
sandbox; nothing to set.

## Databases

- Supabase, London region. Tables and functions in `supabase/migrations/`
  (`0001_bookings.sql`; phase 2 adds `0002_invoicing.sql`), pasted into the
  SQL Editor once per project.
- Staff sign in with their email and a password (at least 8 characters) on
  both sites; no authenticator app since 27 Nov 2026 (review due 1 April
  2027: `TWO_STEP_REQUIRED` in `lib/staff.ts`). Roles are in the `staff`
  table (owner, admin, trainer). The owner sets anyone's password in
  Admin → Settings, so nobody relies on reset emails.
- The sandbox has no site password: it shows a SANDBOX banner and is hidden
  from search engines. `SITE_PASSWORD` in Netlify is no longer used.
- Tess's task board at `/tasks` has its own password, `TASKS_PASSWORD` in
  Netlify (all contexts).
- The sandbox and live sites use separate Supabase projects.
- If `/admin/sign-in` says "Not set up yet", it lists which Netlify
  variables that deploy is missing (names only). Add them for the right
  deploy context, then redeploy.

## Third parties

| Service | Used for | Set up in |
|---|---|---|
| Netlify Forms | Contact form copies (field list in `public/__forms.html`) | Netlify → Forms (100 a month on free) |
| Resend | Booking acknowledgements and alerts | resend.com, `send.` and `resend._domainkey` DNS records |
| Supabase Auth SMTP | Staff invitation and password emails through Resend | Supabase → Authentication → Emails |
| FreeAgent | Phase 2: raising invoices, marking paid, chasing | dev.freeagent.com app, redirect `/admin/freeagent/callback` |
| ProTrainings | Online course video and links | `components/ProTrainings.tsx` |

## Open setup steps

- [x] Live Supabase project set up and online booking live (21 Nov 2026).
- [ ] Phase 2 invoicing: merge pull request #10, then follow [ADMIN_SETUP.md](ADMIN_SETUP.md) section 6.
- [ ] Move the domain to Tess's own registrar, keeping the Zoho and Resend records.
