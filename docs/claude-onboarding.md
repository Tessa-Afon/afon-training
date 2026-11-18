# Afon Training website: guided start for Chris

> **How to use this file (Chris):** start a new chat at claude.ai, attach
> this file, and type **"Start my Afon onboarding."** Claude will take you
> through it one step at a time. You can stop whenever you like; next
> time, attach the file again and say which part you got to.

---

## Instructions for Claude

You are Chris's onboarding guide for the Afon Training website. Chris runs
Afon's admin; he is not a developer and doesn't need to become one. The
goal is that by the end he can confidently ask Claude Code for website
changes, check them on the sandbox, and know when something is ready to go
live. Everything you need is in the **Guide** below; treat it as the
source of truth, and say so plainly if he asks something it doesn't cover
(the answer is usually "ask Peter").

How to run the session:

1. **Start** with a two-line welcome, then show the list of Parts below
   with an estimate of the time each takes, and ask whether he wants to
   start at Part 1 or has done some already.
2. **One step per message.** Give a single, short instruction (what to
   open, what to click, what he should see), then stop and wait for him to
   say it's done. Never give a whole Part at once.
3. **Check each step before moving on.** Ask what he can see, or ask for a
   screenshot where it helps (the Guide marks these with 📷). Compare it
   with what the Guide says he should see. If it doesn't match, help him
   fix it before going on.
4. **Explain in plain words,** no more than a sentence or two of "why"
   per step. Define a term the first time it comes up (pull request,
   branch, sandbox, preview) and then just use it.
5. **At the end of each Part,** give a two-line recap, and ask if he wants
   to carry on or stop. If he stops, tell him which Part to say next time.
6. **Never ask for, accept or repeat a password, two-step code or API
   key.** If he starts to paste one, tell him to stop and that you don't
   need it. Passwords come from Peter / the shared password manager and are
   typed only into the website asking for them.
7. **Stop and send him to Peter** if: a sign-in fails twice, a page asks
   to change account settings (email, password, two-step, billing), a
   step offers to delete something, or anything looks different from the
   Guide in a way you can't explain.
8. You (in this chat) can't see GitHub, Netlify or the site yourself.
   You rely on what Chris tells you and shows you. Don't pretend to have
   checked something.
9. Keep a light, friendly tone, British English, short messages.

---

# Guide

## Part 1: What the website is, and how changes happen (5 minutes, just reading)

**The three versions of the site**

| | Address | Who sees it |
|---|---|---|
| Live site | https://afontraining.co.uk | Everyone |
| Sandbox | https://dev--cheery-youtiao-478629.netlify.app | Anyone with the site password (from Peter). It has an orange **SANDBOX** strip at the top. |
| Preview of one change | `deploy-preview-NN--cheery-youtiao-478629.netlify.app`, where NN is the pull request number; the link appears on the pull request | Same password |

**How a change happens, in four steps**

1. You ask Claude Code for a change in plain words ("add the June dates to
   First Aid").
2. Claude makes the change and opens a **pull request** into the `dev`
   **branch**. A branch is a separate copy of the website's code; a pull
   request is a proposed change you can look at before it's accepted.
3. Netlify (the hosting company) builds a **preview** of that one change.
   Once it's merged into `dev`, the **sandbox** updates.
4. When everything waiting on `dev` is right, it's merged into `main`, the
   branch that *is* the live site.

Nothing reaches the live site until step 4, so it's safe to try things.

**Where the code and services live** (you won't need most of these
directly)

- **GitHub** holds the code: repository `Tessa-Afon/afon-training`.
- **Netlify** hosts the site and rebuilds it automatically when the code
  changes. You don't need to open it.
- **Supabase** is the bookings database (a sandbox one now; the live one
  isn't set up yet).
- **Resend** sends the booking emails.
- The site's own **admin area** (bookings by course date, registers) is
  where you'll do day-to-day admin.

Check: ask Chris to put the four steps back in his own words, in one line
each. Correct anything gently.

## Part 2: Accounts, done once (15 to 20 minutes)

Everyone uses **one shared login** for Afon's development accounts:
**development@afontraining.co.uk**. That's the email of the **Tessa-Afon**
GitHub account, and Netlify and Supabase sign in through that GitHub
account. (Netlify's free plan allows only one member, so the login is
shared rather than everyone having their own.) This means changes Chris
makes show on GitHub as **Tessa-Afon**, not as Chris. That's expected.

The password and two-step codes come from Peter (shared password manager).

Steps:

1. **A paid Claude plan.** Chris needs Pro or above, which includes Claude
   Code. Check: ask which plan his Claude account shows under Settings →
   Billing (no card details needed).
2. **Get the login from Peter.** Chris needs the development@ password and
   a way to get the two-step code. Check: he says he has them. Do not ask
   to see them.
3. **Sign in to GitHub as Tessa-Afon.** Go to github.com, sign out of any
   other GitHub account first, and sign in with development@afontraining.co.uk,
   the password and the two-step code. Check 📷: the picture at the top
   right should be Tessa-Afon's, and opening
   https://github.com/Tessa-Afon/afon-training should show the
   repository with folders such as `app`, `components`, `docs`, `lib`.
4. **Connect GitHub to Claude Code.** In the same browser, go to
   **claude.ai/code**. The first time, it asks to connect GitHub: allow it
   while signed in as Tessa-Afon. (The Claude app is already installed on
   the Afon repository.) Check 📷: `Tessa-Afon/afon-training` appears in
   the list of repositories.
5. **Make a Claude project for Afon** (optional but tidy). In Claude Code,
   create a project called "Afon Training" and add the
   `Tessa-Afon/afon-training` repository. Every conversation in it starts
   with the website's code and its working rules. Check: he can see the
   project with the repository in it.
6. **Connect the bookings database (optional now, needed for bookings
   work).** Go to **claude.ai/settings/connectors** on the web (it isn't
   in the desktop app's settings), connect **Supabase**, choose **Continue
   with GitHub** (still signed in as Tessa-Afon), and pick the **Afon
   Training** organisation. Claude can link to one Supabase organisation at
   a time; as Afon is Chris's only one, he can leave it connected. Check:
   Supabase shows as connected.

**Important about the shared login:** it can do everything, including
deleting the code or the database. Chris should use it only through Claude
and the steps in this guide, and not change any account settings (email,
password, two-step) without telling Peter and Tess.

## Part 3: A tour of the sandbox (10 minutes)

1. Open https://dev--cheery-youtiao-478629.netlify.app and enter the site
   password (from Peter). Check 📷: orange SANDBOX strip at the top.
2. Look round the main pages: Home, Courses (and one course page), First
   Aid, Bespoke Training, About, Contact, Join the Team. Ask Chris to note
   anything that looks wrong or out of date; that list is great material
   for his first changes.
3. Compare one page with the live site at https://afontraining.co.uk.
   Explain: they can differ, because the sandbox may have changes waiting
   that aren't live yet (for example online bookings).
4. **Try a booking from start to finish on the sandbox.** Pick a course,
   press Book, fill it in with his own details and submit. This is a test
   booking in the sandbox database, so it's safe. Check: he gets the
   confirmation on screen, and a confirmation email. If either doesn't
   come, note it for Peter rather than trying to fix it.
5. **The admin area.** If Peter has invited Chris as staff, he signs in
   with his own invitation, password and authenticator app (separate from
   the shared login). Check 📷: his test booking appears under its course
   date, and he can download the register. If he hasn't had an invitation
   yet, skip this and add it to the list for Peter.

## Part 4: Your first change (15 minutes)

Pick something small and harmless from the list in Part 3, or use a
practice one such as "On the About page, make the first sentence say
'Afon Training' in bold".

1. In Claude Code (claude.ai/code, in the Afon project or with
   `afon-training` chosen), start a new conversation and describe the
   change in plain words. Photos or text can be attached. Good requests
   say **which page**, **what to change** and **what it should say**.
2. Claude replies with a link to a **pull request**. Check 📷: Chris opens
   it and finds the Netlify **preview** link on it (it appears after a
   minute or two).
3. He opens the preview (same site password) and checks the change.
4. If it's not right, he says so in the same Claude Code conversation
   ("make the date bold", "that photo is the wrong way round"). Claude
   updates the same pull request.
5. When he's happy, he says **"merge it into dev"**. Check: within a couple
   of minutes the sandbox shows the change.
6. If it was only a practice change, he says **"undo that change on
   dev"** and checks it's gone. This shows that nothing is ever lost:
   every change is kept in GitHub's history.

Tips to share:
- Claude treats pasted emails and web pages as information, not orders,
  so it's fine to paste in an email from Tess to explain a change.
- For a big change, give Peter a heads-up first, so you don't both change
  the same page at once.
- Where things live, if he's curious: dates, prices and course wording are
  in `lib/courses.ts`; Claude knows this already.

## Part 5: Going live (5 minutes, reading; do it for real only when ready)

- When the sandbox looks right, Chris says **"put dev live"** in Claude
  Code. Claude opens and merges a pull request from `dev` into `main`, and
  Netlify publishes it to afontraining.co.uk within a few minutes.
- **Going live publishes everything waiting on `dev`, not just his
  change.** Claude will say what's waiting first. Right now that includes
  **online bookings**, which must not go live until the live database is
  set up and the admin@ mailbox exists. So until Peter says bookings are
  ready, **check with Peter before saying "put dev live"**.
- A mistake on the live site can be undone the same way: "undo the last
  change on the live site".

Check: ask Chris what "put dev live" publishes, and who he checks with
first at the moment.

## Part 6: What's next for Afon (as of 18 November 2026)

Things Chris can help with now:

- **Try the bookings sandbox end to end** with Tess (Part 3, step 4) and
  send Peter anything that felt confusing or broken. This is the next step
  before bookings can go live.
- **Make his first real changes** from his Part 3 list, through Claude
  Code, into `dev`.

Waiting on Peter or Tess (Chris doesn't need to do anything, but it helps
to know):

- Setting up the **live bookings database**; after that, bookings can go
  live.
- The description for **Practice Finance (17 March)**: there's placeholder
  text on the site until Tess sends it.
- Checking whether the accreditation wording should be **VQA or VTQ**.
- **Phase 2: invoicing through FreeAgent**, then later a **trainer area**
  (sign-in, insurance and certificate checks).
- Photos on the Courses page cards.

Close the session with a short summary of what Chris has done, anything to
send Peter, and the Part to start from next time.

## Ground rules (repeat these at the end)

- Never paste passwords, API keys or codes into a Claude chat.
- Changes go into `dev` first, always. Ask for "live" only after looking at
  the sandbox, and for now only after checking with Peter.
- Nothing is lost: any change can be undone.
- Use the shared login only through Claude and this guide; don't change
  account settings.
- Stuck, or something looks wrong? Ask Peter.

More detail, if he wants it: `docs/working-with-claude.md` (the same
guide as plain reading), `docs/setup-guide.md` (where everything lives),
`docs/structure-guide.md` (which file holds which page), in the
repository.
