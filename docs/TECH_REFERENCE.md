# Afon Training: how it all fits together

Reference for Tess and Peter. No passwords are kept here.

THE SHORT VERSION

- Your website lives at afontraining.co.uk.
- Your email is Zoho Mail. Booking and contact messages from the website arrive at bookings@afontraining.co.uk, which delivers to your Zoho mailbox. (Netlify's form-notification emails currently go to your main Zoho address while Netlify unblocks bookings@.)
- The website's code is stored in GitHub, under your account (Tessa-Afon).
- Netlify takes the code from GitHub and runs the website. It also collects the form submissions.
- Everything is on free plans at the moment.
- Day to day, the only thing you need is your email. Peter makes the website changes.


THE PIECES

1. The domain: afontraining.co.uk
   The web address. Its settings (DNS) point visitors to Netlify and email to Zoho. Don't change these settings unless Peter asks you to; a wrong entry can stop the website or the email working.

2. Email: Zoho Mail (free plan)
   - Your mailbox, which you use through the Zoho Mail app or at mail.zoho.eu (or zoho.com).
   - bookings@afontraining.co.uk is an extra address (alias) on your mailbox. Website bookings and contact messages are sent to it.
   - You can reply as bookings@ or as your own address.
   - Free-plan limits: Zoho's app or the web only (Outlook and the iPhone Mail app aren't supported), and 5 GB of storage.

3. The code: GitHub (account: Tessa-Afon)
   - GitHub holds the website's files and a full history of every change. Nothing is ever lost, and any change can be undone.
   - Peter's account (Peter-StatementNow) is a collaborator, so he can make changes. The Claude app is also installed, which is how Peter's AI assistant makes changes for him.
   - You shouldn't need to log in, except to approve the occasional request. Because the account is yours, the website is yours too.
   - GitHub requires two-step verification. Keep the recovery codes it gives you somewhere safe.

4. The website: Netlify (free plan, signed in through your GitHub account)
   - Netlify publishes the website automatically whenever the code in GitHub changes.
   - There are two versions:
     - LIVE: afontraining.co.uk. Open to everyone.
     - SANDBOX: a separate test address (it starts dev--). Password-protected and hidden from search engines. New changes appear here first, so we can check them before they go live.
   - FORMS: every contact message and booking request is also saved in Netlify, under the Forms section. That's useful if an email ever goes astray.
   - Free-plan limit: 100 form submissions a month.


HOW A WEBSITE CHANGE HAPPENS

1. You tell Peter what you'd like changed: new dates, a course description, prices, and so on.
2. Peter's assistant makes the change on the sandbox.
3. You and Peter check the sandbox.
4. When you're happy, the change is published to the live site, usually within a few minutes.


BOOKINGS

- A booking request arrives by email at bookings@ and is also saved in Netlify (Forms).
- It is a request, not a confirmed booking. You confirm the places and send the invoice.
- Payment terms on the form: payment is due 6 weeks before the course. For courses less than 6 weeks away, payment is due on receipt of invoice.
- Organisations can book places without attendee names and send the names later.
- The website doesn't count places. When a course is full, tell Peter and it will be marked "Fully booked".


IF SOMETHING GOES WRONG

- The website doesn't load: tell Peter. The previous version can be restored in minutes.
- Booking emails stop arriving: check Netlify → Forms (including the Spam list), then tell Peter.
- Email problems: check the Zoho app first, then tell Peter.


ACCOUNTS (passwords sent separately)

- Zoho Mail: your mailbox, plus the Zoho admin console for addresses and aliases.
- GitHub: Tessa-Afon.
- Netlify: signed in with GitHub.
- The domain registrar: where afontraining.co.uk is registered (Peter to confirm).
- The sandbox password.

Please keep these in a password manager if you can, and don't share them by email.
