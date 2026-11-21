# Admin area and live bookings: setup

Phase 1 adds a database (Supabase) for bookings, an admin area at
`/admin`, automatic place banners, and booking emails (Resend). Until the
steps below are done, the site behaves as before: bookings go to Netlify
Forms and the banners use the status set in `lib/courses.ts`.

Do the sandbox first. Set up Resend (section 2) before Supabase steps 5 and 6. The live site gets its own, separate Supabase
project later, with the same steps.

## 1. Supabase project

1. At supabase.com, create a project, for example `afon-sandbox`. Region:
   London (eu-west-2). Free plan is fine for now.
2. **SQL Editor → New query**: paste the whole of
   `supabase/migrations/0001_bookings.sql` and run it once.
3. **Authentication → Sign In / Providers**: turn **off** "Allow new users
   to sign up". Staff are invited; nobody can create their own account.
4. **Authentication → URL Configuration**: set Site URL to the sandbox
   address, `https://dev--cheery-youtiao-478629.netlify.app`.
5. **Authentication → Emails → SMTP Settings** (set up Resend, section 2,
   first). Supabase's own sender only manages a few emails an hour, and the
   email templates can't be edited until this is set:
   host `smtp.resend.com`, port `465`, username `resend`, password = the
   Resend API key, sender `bookings@afontraining.co.uk`, name
   `Afon Training`.
6. **Authentication → Emails → Templates**. In **Invite user**, click
   **Source**, find `{{ .ConfirmationURL }}` in the link and replace it with:

   ```
   {{ .SiteURL }}/admin/auth/confirm?token_hash={{ .TokenHash }}&type=invite
   ```

   Save, then do the same in **Reset password** with:

   ```
   {{ .SiteURL }}/admin/auth/confirm?token_hash={{ .TokenHash }}&type=recovery
   ```

7. **Project Settings → API Keys**: note the project URL, the publishable
   (or "anon") key and the secret (or "service_role") key. The secret key
   can read every booking: keep it out of email and chat.

## 2. Resend (booking emails)

1. At resend.com, create an account and add the domain
   `afontraining.co.uk`.
2. Add the DNS records Resend shows at the domain registrar. They sit on a
   `send.` subdomain and a `resend._domainkey` record, so Zoho email is
   unaffected.
3. Once Resend shows the domain as verified, create an API key with
   "Sending access".

## 3. Netlify environment variables

In Netlify, **Site configuration → Environment variables**, add these with
the scope set to **Branch deploys** (the sandbox) only:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable (anon) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret (service_role) key. Tick "Contains secret values". |
| `RESEND_API_KEY` | Resend API key. Tick "Contains secret values". |

Then redeploy the `dev` branch.

## 4. Mailboxes

`admin@afontraining.co.uk` must exist in Zoho before this goes live: the
site sends new-booking alerts there, and customers' replies go there. If
Chris is to read it himself, make it his own Zoho user rather than an
alias on Tess's mailbox.

## 5. Staff accounts

1. Supabase **Authentication → Users → Invite user**, once each for Peter,
   Chris and Tess.
2. In the SQL Editor, give each their role (use the emails you invited):

   ```sql
   insert into staff (user_id, name, email, role, trainer_name)
   select id, 'Peter Clarke', email, 'owner', null from auth.users where email = 'peter@…';
   insert into staff (user_id, name, email, role, trainer_name)
   select id, 'Chris Clarke', email, 'admin', null from auth.users where email = 'admin@afontraining.co.uk';
   insert into staff (user_id, name, email, role, trainer_name)
   select id, 'Tessa Clarke', email, 'trainer', 'Tessa Clarke' from auth.users where email = 'tess@…';
   ```

   `trainer_name` must match the trainer name in `lib/courses.ts`: a
   trainer sees only those courses, read-only.
3. Each person opens their invitation, chooses a password, and sets up an
   authenticator app (Microsoft Authenticator, Google Authenticator, or
   similar). Every sign-in then needs a code from the app.

## Going live later

Repeat steps 1, 3 and 5 with a second Supabase project (for example
`afon-live`), with Site URL `https://afontraining.co.uk` and the Netlify
variables scoped to **Production**. Resend needs no change. Merge `dev`
into `main` only once `admin@` exists.
