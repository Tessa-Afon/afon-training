// Booking emails, sent through Resend (resend.com) from afontraining.co.uk.
// Plain text on purpose: it reads well everywhere and rarely trips spam
// filters. Without RESEND_API_KEY nothing is sent, and the booking is
// still saved and shown in the admin area.
import { ADMIN_EMAIL, CONTACT_PHONE, SITE_NAME } from "./site";
import { formatDate, formatPrice } from "./courses";
import { FREE_CANCELLATION_DAYS, paymentDueText } from "./booking";

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? `${SITE_NAME} <bookings@afontraining.co.uk>`;
export const SITE_URL = (process.env.SITE_URL ?? "").replace(/\/$/, "");

export const EMAIL_CONFIGURED = Boolean(API_KEY);

type Message = { to: string | string[]; subject: string; text: string; replyTo?: string };

/** Sends one email. Returns false (and logs) rather than throwing, so a
 *  mail problem never loses a booking. */
export async function sendEmail(m: Message): Promise<boolean> {
  if (!API_KEY) {
    console.warn(`Email not sent (RESEND_API_KEY not set): ${m.subject}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(m.to) ? m.to : [m.to],
        subject: m.subject,
        text: m.text,
        reply_to: m.replyTo ?? ADMIN_EMAIL,
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) console.error(`Email failed (${res.status}): ${m.subject}`, await res.text());
    return res.ok;
  } catch (err) {
    console.error(`Email failed: ${m.subject}`, err);
    return false;
  }
}

export type BookingEmailData = {
  reference: string;
  courseTitle: string;
  courseDate: string;
  timeLabel: string;
  delivery: string;
  places: number;
  pricePerPerson: number;
  contactName: string;
  organisation: string;
  email: string;
  phone: string;
  invoiceAddress: string;
  invoiceEmail: string;
  poNumber: string;
  attendees: string;
  notes: string;
};

const signOff = `${SITE_NAME}
${ADMIN_EMAIL} · ${CONTACT_PHONE}
${SITE_URL || "https://afontraining.co.uk"}`;

function summary(b: BookingEmailData): string {
  const total = formatPrice(b.places * b.pricePerPerson);
  return [
    `Reference: ${b.reference}`,
    `Course: ${b.courseTitle}`,
    `Date: ${formatDate(b.courseDate)}, ${b.timeLabel}`,
    `Delivery: ${b.delivery}`,
    `Places: ${b.places} × ${formatPrice(b.pricePerPerson)} = ${total}`,
    b.poNumber && `Purchase order: ${b.poNumber}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function attendeesBlock(b: BookingEmailData): string {
  return b.attendees.trim()
    ? `Attendees:\n${b.attendees.trim()}`
    : "Attendees: names to follow. Reply to this email with names and email addresses whenever you have them.";
}

/** To the person who booked, straight after they book. */
export function acknowledgementEmail(b: BookingEmailData, todayIso: string): Message {
  return {
    to: b.email,
    subject: `Booking received: ${b.courseTitle}, ${formatDate(b.courseDate)} (${b.reference})`,
    text: `Dear ${b.contactName},

Thank you for booking with ${SITE_NAME}. We have received your booking and are holding these places for you.

${summary(b)}

${attendeesBlock(b)}

What happens next
We will confirm your booking by email and send an invoice${b.invoiceEmail ? ` to ${b.invoiceEmail}` : ""}. Payment is due ${paymentDueText(b.courseDate, todayIso)}.

You can cancel free of charge up to ${FREE_CANCELLATION_DAYS} days before the course, and send a colleague in someone's place at any time. Full booking terms: ${SITE_URL}/booking-terms

If anything here is wrong, just reply to this email.

${signOff}`,
  };
}

/** To Chris, for every new website booking. */
export function newBookingAlert(b: BookingEmailData, placesLeft: number, adminUrl: string): Message {
  return {
    to: ADMIN_EMAIL,
    replyTo: b.email,
    subject: `New booking: ${b.organisation}, ${b.places} ${b.places === 1 ? "place" : "places"}, ${b.courseTitle} ${formatDate(b.courseDate)}`,
    text: `A new booking has come in through the website.

${summary(b)}
Places left on this date: ${placesLeft}

Booked by: ${b.contactName}, ${b.organisation}
Email: ${b.email}
Telephone: ${b.phone}

Invoice address:
${b.invoiceAddress}
${b.invoiceEmail ? `Send invoice to: ${b.invoiceEmail}\n` : ""}
${attendeesBlock(b)}
${b.notes.trim() ? `\nNotes from the booker:\n${b.notes.trim()}\n` : ""}
Open the course card to confirm it: ${adminUrl}

Replying to this email goes to the booker.`,
  };
}

/** To the booker when Chris confirms the booking. */
export function confirmationEmail(b: BookingEmailData, todayIso: string): Message {
  return {
    to: b.email,
    subject: `Booking confirmed: ${b.courseTitle}, ${formatDate(b.courseDate)} (${b.reference})`,
    text: `Dear ${b.contactName},

Your booking is confirmed.

${summary(b)}

${attendeesBlock(b)}

Your invoice will follow separately. Payment is due ${paymentDueText(b.courseDate, todayIso)}. We will email joining details before the course.

${signOff}`,
  };
}

/** To the booker when Chris cancels a booking. */
export function cancellationEmail(b: BookingEmailData): Message {
  return {
    to: b.email,
    subject: `Booking cancelled: ${b.courseTitle}, ${formatDate(b.courseDate)} (${b.reference})`,
    text: `Dear ${b.contactName},

As requested, we have cancelled this booking.

${summary(b)}

If you have any questions, or would like to book another date, just reply to this email.

${signOff}`,
  };
}
