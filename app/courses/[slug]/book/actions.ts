"use server";

import { findCourse, formatTimeRange } from "@/lib/courses";
import { availabilityFor, isBookable, loadCounts, ukToday } from "@/lib/availability";
import { DATABASE_CONFIGURED, db } from "@/lib/supabase/admin";
import { SITE_URL, acknowledgementEmail, newBookingAlert, sendEmail, type BookingEmailData } from "@/lib/email";

export type BookingResult =
  | { status: "booked"; reference: string; emailed: boolean }
  /** No database on this deploy: the form sends to Netlify Forms instead. */
  | { status: "fallback" }
  | { status: "unavailable"; message: string; placesLeft: number | null }
  | { status: "invalid"; message: string }
  | { status: "error" };

const field = (f: FormData, name: string, max = 500) => String(f.get(name) ?? "").trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createBooking(slug: string, form: FormData): Promise<BookingResult> {
  if (!DATABASE_CONFIGURED) return { status: "fallback" };

  // Honeypot: real people never fill this in. Pretend it worked.
  if (field(form, "bot-field")) return { status: "booked", reference: "AFT-000000", emailed: true };

  const course = findCourse(slug);
  if (!course) return { status: "invalid", message: "That course could not be found." };

  const today = ukToday();
  const availability = availabilityFor(course, await loadCounts(), today);
  if (!isBookable(availability)) {
    return {
      status: "unavailable",
      message:
        availability.state === "full"
          ? "Sorry, this course is now full."
          : "Sorry, bookings for this course have closed.",
      placesLeft: 0,
    };
  }

  const places = Number(field(form, "places"));
  const b: BookingEmailData = {
    reference: "",
    courseTitle: course.title,
    courseDate: course.date,
    timeLabel: formatTimeRange(course),
    delivery: course.delivery,
    places,
    pricePerPerson: course.pricePerPerson,
    contactName: field(form, "contact-name", 120),
    organisation: field(form, "organisation", 200),
    email: field(form, "email", 200),
    phone: field(form, "phone", 40),
    invoiceAddress: field(form, "invoice-address", 600),
    invoiceEmail: field(form, "invoice-email", 200),
    poNumber: field(form, "po-number", 80),
    attendees: field(form, "attendees", 4000),
    notes: field(form, "notes", 2000),
  };

  if (!Number.isInteger(places) || places < 1) return { status: "invalid", message: "Please choose how many places you need." };
  if (!b.contactName || !b.organisation || !b.phone || !b.invoiceAddress) {
    return { status: "invalid", message: "Please fill in every required field." };
  }
  if (!EMAIL_RE.test(b.email) || (b.invoiceEmail && !EMAIL_RE.test(b.invoiceEmail))) {
    return { status: "invalid", message: "Please check the email address." };
  }
  if (field(form, "payment-terms") !== "Accepted") {
    return { status: "invalid", message: "Please accept the booking terms." };
  }

  const { data, error } = await db().rpc("create_booking", {
    p: {
      course_slug: course.slug,
      course_title: course.title,
      course_date: course.date,
      trainer: course.trainer,
      places,
      price_per_person: course.pricePerPerson,
      source: "website",
      contact_name: b.contactName,
      organisation: b.organisation,
      email: b.email,
      phone: b.phone,
      invoice_address: b.invoiceAddress,
      invoice_email: b.invoiceEmail,
      po_number: b.poNumber,
      attendees: b.attendees,
      notes: b.notes,
    },
    default_capacity: course.maxAttendees,
    enforce_closed: true,
  });

  if (error || !data) {
    console.error("create_booking failed", error);
    return { status: "error" };
  }

  if (!data.ok) {
    const left = data.places_left as number;
    return {
      status: "unavailable",
      placesLeft: left,
      message:
        data.reason === "closed"
          ? "Sorry, bookings for this course have closed."
          : left === 0
            ? "Sorry, this course is now full."
            : `Sorry, only ${left} ${left === 1 ? "place is" : "places are"} left on this date. Please change the number of places.`,
    };
  }

  b.reference = data.reference;
  const [emailed] = await Promise.all([
    sendEmail(acknowledgementEmail(b, today)),
    sendEmail(newBookingAlert(b, data.places_left, `${SITE_URL}/admin/courses/${course.slug}`)),
  ]);
  await db().from("activity_log").insert({
    actor_name: `${b.contactName} (website)`,
    course_slug: course.slug,
    booking_id: data.id,
    action: "Booked online",
    detail: `${places} ${places === 1 ? "place" : "places"} for ${b.organisation}`,
  });

  return { status: "booked", reference: data.reference, emailed };
}
