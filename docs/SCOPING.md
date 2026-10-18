# Afon Training: scoping

Working name: **Afon Training** (may change). Formerly discussed as "Thornfields Light".
This project is entirely separate from Recept Training.

This document keeps the full, aspirational scope. We are building in small steps; see **Current phase** first.

## Current phase

Built (October 2026):

- Home, Courses, Course detail, Training for your team, About, Contact, Privacy.
- **Book places** form per course: places, booking contact, invoice details,
  attendee names now or later, payment due 6 weeks before the course.
  Submissions via Netlify Forms, emailed to bookings@afontraining.co.uk.
- Contact form, email and telephone on the Contact page.
- Trainer section on About (placeholder until Tess's profile arrives).
- Live at `afontraining.co.uk` (branch `main`); password-protected sandbox
  on the `dev` branch.

Next: online booking with place counts, then online payment.

### Planned site map

```
Afon Training
├── Home
├── Courses
│   └── Course detail / booking enquiry
├── Training for your team
├── About
└── Contact
```

### Booking enquiry email (superseded by the Book places form)

Subject: `Course booking enquiry: [Course name] — [Course date]`

```
Hello,

I would like to enquire about booking a place on:

Course: [Course name]
Date: [Course date]

Name:
Organisation:
Telephone number:
Number of places required:

Thank you.
```

## Page copy

### Landing page

**Hero**
Practical training for confident teams
Clear, relevant courses for people working in GP practices, hospitals, care homes and the leisure sector.
[View courses] [Contact us]

**Intro**
Training that fits real working life
Afon Training provides focused, practical learning delivered in a clear and approachable way. Browse upcoming courses and contact us to reserve your place.

**Course prompt**
Upcoming courses
View course dates, times and prices on our courses page.
[View courses]

**Contact prompt**
Need training for your team?
If you would like to discuss an upcoming course or training for your organisation, please get in touch.
[Contact us]

**Footer**
Afon Training
Practical training for professional teams.
[Courses] · [Contact us] · [Privacy]

### Courses page

**Page heading**
Upcoming courses
Browse forthcoming training courses below. To book a place, select Contact us to book and we will confirm availability and next steps.

**Course card template**
[Course name]
Date: [Day, DD Month YYYY]
Time: [Start time–finish time]
Cost: £[amount] per person
[Contact us to book]

**Empty state**
New course dates coming soon
We are preparing our upcoming programme. Please contact us if you would like to register your interest or discuss training for your team.
[Contact us]

Button wording, used consistently on both pages: **Contact us to book**

---

## Full scope (aspirational)

### Purpose

Build a new, independent course-booking and course-management platform from scratch, initially for Tess to continue delivering and managing her own courses. Thornfields has not responded to approaches, so the new service must not depend on access to, data from, or cooperation from the existing Thornfields platform.

### Initial focus: Tess

- Confirm Tess's essential requirements for managing course content, dates, bookings, payments, attendees and communications.
- Map Tess's current working process during the planned back-end walkthrough, using this to identify required functions rather than to replicate Thornfields' system or use its data.
- Identify the courses Tess wishes to continue offering, including format, duration, pricing, capacity, venue, materials and booking rules.
- Rebuild course descriptions, booking information, customer emails and supporting content independently.
- Rebrand existing course materials for the new platform:
  - Confirm which materials Tess owns or is permitted to reuse.
  - Remove Thornfields names, logos, contact details, links and branding.
  - Create replacement branding, templates and consistent course-document formats.
  - Review material for any third-party copyright, image, licence or attribution requirements.
- Agree what Tess needs to update herself without technical help: course pages, dates, prices, availability, attendee lists and routine communications.
- Establish a simple, reliable process for bookings, cancellations, refunds, waiting lists and attendee enquiries.

### Core first-version requirements

- New name, identity, domain, email address and basic website.
- Public course listings and individual course pages.
- Online booking, secure payment and automated booking confirmations.
- Course capacity, booking cut-off dates, cancellation terms and optional waiting lists.
- Admin area for Tess to create, amend and duplicate course listings.
- Attendee records, downloadable registers and basic income/booking reporting.
- Automated confirmation and reminder emails using the new brand.
- Clear privacy notice, terms, cancellation/refund policy and contact information.
- Mobile-friendly booking journey.

### Technology and ownership

- Build independently from scratch; do not rely on Thornfields accounts, databases, website access, payment systems or customer data.
- Choose a low-maintenance system that Tess can operate and that can be supported easily.
- Set up ownership and access from the outset for domain, hosting, website, payment account, email account and customer data.
- Put in place backups, secure admin access and appropriate UK data-protection arrangements.
- Decide whether any past customers can be contacted only through lawful, independently held contact details and appropriate consent/legitimate-interest assessment.

### Future option: other trainers

- Keep the first version centred on Tess and avoid positioning it as a wider trainer platform at launch.
- Build the structure so other associates could be added later without a full rebuild.
- Only proceed with wider trainer access if Tess is comfortable and there is genuine demand.
- If expanded, decide whether Chris will provide central administration for other trainers, including onboarding, course setup, bookings, payments, customer enquiries and reporting.
- Define any future trainer terms, fees/commission, quality standards, payment allocation and responsibility for cancellations/refunds.

### Immediate next steps

- Complete the Monday walkthrough to understand Tess's current workflow and identify the minimum functions required.
- Produce an inventory of all course materials requiring review and rebranding.
- Confirm ownership, reuse permissions and replacement branding requirements.
- Agree the minimum viable version for Tess.
- Build, test and refine it with Tess before considering other trainers.
