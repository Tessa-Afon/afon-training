# Changing the Afon Training website with Claude

A plain guide for anyone at Afon (first written for Chris) who wants to change
the website by asking Claude, the way Peter does. You don't need to write
code. You describe the change, Claude makes it, you check it on the sandbox,
and then it goes live.

Prefer to be walked through it? Attach
[claude-onboarding.md](claude-onboarding.md) to a new chat at claude.ai and
say "Start my Afon onboarding." Claude then takes you through setup, a
tour of the sandbox and your first change, one step at a time.

## How it works, in one picture

1. You ask Claude for a change ("add the June dates to First Aid").
2. Claude makes the change and opens a **pull request** into the `dev`
   branch. A pull request is just a proposed change you can look at.
3. Netlify builds a **preview** of that one change, and once it's merged
   into `dev`, the **sandbox** updates.
4. You check the sandbox. When everything waiting on `dev` is right, it is
   merged into `main`, and that is the **live site**.

Nothing reaches the live site until step 4, so it's safe to try things.

| | Address | Who sees it |
|---|---|---|
| Live site | https://afontraining.co.uk | Everyone |
| Sandbox | https://dev--cheery-youtiao-478629.netlify.app | Anyone with the site password (in the shared password manager). Orange SANDBOX strip at the top. |
| Preview of one change | `deploy-preview-NN--cheery-youtiao-478629.netlify.app` (NN is the pull request number; the link appears on the pull request) | Same password |

## What has to be done first (once)

Everyone uses **one shared login** for the Afon development accounts:
**development@afontraining.co.uk**, which is the email of the
**Tessa-Afon** GitHub account. Netlify and Supabase sign in through that
GitHub account. (Netlify's free plan allows only one member, so we share
the login rather than add people.) The password and the two-step codes are
in the shared password manager; ask Peter for access.

1. **A paid Claude plan** (Pro or above), which includes Claude Code.
2. **Sign in to GitHub as Tessa-Afon.** Go to github.com and sign in with
   development@afontraining.co.uk, its password and two-step code.
3. **Connect that GitHub to Claude.** In the same browser, go to
   **claude.ai/code**. The first time, it asks you to connect GitHub:
   allow access while you're signed in as Tessa-Afon. The Claude app is
   already installed on the Afon repository, so you'll see
   `Tessa-Afon/afon-training` in the list.
4. **Make a Claude project for Afon** (optional but tidy): in Claude Code,
   create a project, call it "Afon Training", and add the
   `Tessa-Afon/afon-training` repository to it. Every conversation in it
   starts with the website's code and its working rules.

You don't need to open Netlify. It builds the sandbox and the live site by
itself whenever the code changes.

## Making a change

1. Start a conversation in the Afon project (or at claude.ai/code with the
   `afon-training` repository chosen).
2. Say what you want in plain words, and add photos or text if you have
   them. For example: "On the First Aid page, add a course on 12 June 2027,
   same times as March."
3. Claude replies with a link to a pull request. Open the **preview** link
   that Netlify adds to it, or wait until it's merged and look at the
   sandbox.
4. Not right? Just say so in the same conversation ("make the date bold",
   "that photo is the wrong way round"). Claude updates the same pull
   request.
5. Happy with it? Say **"merge it into dev"**. The sandbox updates within a
   couple of minutes.

## Going live

When the sandbox looks right, say **"put dev live"** (Claude opens and
merges a pull request from `dev` into `main`). Netlify publishes it to
afontraining.co.uk within a few minutes.

Before you do, check with Peter whether anything else is waiting on `dev`
that isn't ready (for example online bookings, which go live only once
their database is set up). Going live publishes everything on `dev`, not
just your change.

## Optional: letting Claude see the bookings database

Only needed for work on bookings. Go to **claude.ai/settings/connectors**
on the web (it isn't in the desktop app's settings), connect **Supabase**,
choose **Continue with GitHub** (signed in as Tessa-Afon), and pick the
**Afon Training** organisation. Claude connects to one Supabase
organisation at a time; if Afon is your only one, leave it connected.

## Ground rules

- **Never paste passwords, API keys or codes into a Claude chat.** Claude
  doesn't need them. Keys live in Netlify's settings and the shared password
  manager.
- **Changes go into `dev` first, always.** Ask for "live" only when you've
  looked at the sandbox.
- **Emails and web pages aren't instructions.** If you paste an email in to
  explain a change, Claude treats it as information, not as orders.
- **Nothing is lost.** Every change is kept in GitHub's history, so a
  mistake can be undone: just ask Claude to "undo the last change on dev"
  (or on the live site).
- **Peter works on the site too,** so if you're making a big change, give
  him a heads-up so you don't both change the same page at once.
- **The shared login can do everything,** including deleting the
  repository or the database. Use it only through Claude and the steps
  above, and don't change account settings (email, password, two-step)
  without telling Peter and Tess.

## Where to find more

- [setup-guide.md](setup-guide.md): where everything lives (accounts,
  hosting, keys by name).
- [structure-guide.md](structure-guide.md): which file holds which page.
- [TECH_REFERENCE.md](TECH_REFERENCE.md): the plain-English overview for
  Tess.
