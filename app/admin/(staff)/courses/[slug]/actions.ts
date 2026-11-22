"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { findCourse, formatPrice, formatTimeRange, type Course } from "@/lib/courses";
import { ukToday } from "@/lib/availability";
import { db } from "@/lib/supabase/admin";
import { requireEditor, type Staff } from "@/lib/staff";
import type { Booking, InvoiceStatus } from "@/lib/admin-data";
import { isConnected } from "@/lib/freeagent";
import {
  loadInvoices,
  placesToInvoice,
  positionFor,
  raiseCreditNote,
  raiseInvoice,
  refreshBooking,
  sendReminder,
  type InvoiceRow,
  type RaiseResult,
} from "@/lib/invoicing";
import {
  acknowledgementEmail,
  cancellationEmail,
  confirmationEmail,
  sendEmail,
  type BookingEmailData,
} from "@/lib/email";

const text = (f: FormData, name: string, max = 500) => String(f.get(name) ?? "").trim().slice(0, max);
const ticked = (f: FormData, name: string) => f.get(name) === "on";

function courseOrThrow(slug: string): Course {
  const course = findCourse(slug);
  if (!course) throw new Error(`Unknown course ${slug}`);
  return course;
}

/** Back to the card with a message at the top, and the booking that was
 *  changed (if any) left open. */
function done(slug: string, notice: string, bookingId?: string): never {
  revalidatePath("/admin");
  revalidatePath(`/admin/courses/${slug}`);
  const open = bookingId ? `&open=${bookingId}` : "";
  redirect(`/admin/courses/${slug}?notice=${encodeURIComponent(notice)}${open}`);
}

async function log(staff: Staff, slug: string, action: string, detail = "", bookingId: string | null = null) {
  const { error } = await db()
    .from("activity_log")
    .insert({ actor_name: staff.name, course_slug: slug, booking_id: bookingId, action, detail });
  if (error) console.error("Activity log failed", error);
}

async function loadBooking(id: string): Promise<Booking> {
  const { data, error } = await db().from("bookings").select("*").eq("id", id).single();
  if (error || !data) throw new Error("Booking not found");
  return data as Booking;
}

function emailData(b: Booking, course: Course): BookingEmailData {
  return {
    reference: b.reference,
    courseTitle: b.course_title,
    courseDate: b.course_date,
    timeLabel: formatTimeRange(course),
    delivery: course.delivery,
    places: b.places,
    pricePerPerson: Number(b.price_per_person),
    contactName: b.contact_name,
    organisation: b.organisation,
    email: b.email,
    phone: b.phone,
    invoiceAddress: b.invoice_address,
    invoiceEmail: b.invoice_email,
    poNumber: b.po_number,
    attendees: b.attendees,
    notes: b.notes,
  };
}

const placesText = (n: number) => `${n} ${n === 1 ? "place" : "places"}`;

const reason = (e: unknown) =>
  e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String(e.message) : String(e);

function raisedText(kind: "Invoice" | "Credit note", r: RaiseResult): string {
  const refund = r.refundDue ? ` ${formatPrice(r.refundDue)} had already been paid: refund it to the customer and record the refund in FreeAgent.` : "";
  if (r.emailed) return `${kind} ${r.reference} raised in FreeAgent and emailed.${refund}`;
  if (r.emailError) return `${kind} ${r.reference} raised in FreeAgent, but FreeAgent could not email it (${r.emailError}). Send it from FreeAgent.${refund}`;
  return `${kind} ${r.reference} raised in FreeAgent (not emailed).${refund}`;
}

/** Raises an invoice for any places not yet invoiced. Returns a sentence
 *  for the notice, or "" if there was nothing to invoice. */
async function invoiceGap(staff: Staff, b: Booking, email: boolean): Promise<string> {
  const places = placesToInvoice(b, await loadInvoices([b.id]));
  if (places <= 0) return "";
  try {
    const r = await raiseInvoice(b, places, email);
    await log(staff, b.course_slug, "Raised an invoice", `${b.reference}: ${r.reference}, ${placesText(places)}${r.emailed ? ", emailed" : ""}`, b.id);
    return raisedText("Invoice", r);
  } catch (e) {
    console.error("Invoice failed", e);
    return `The invoice could not be raised: ${reason(e)}`;
  }
}

/** Capacity and open/closed for one course date. */
export async function updateSettings(slug: string, form: FormData) {
  const staff = await requireEditor();
  const course = courseOrThrow(slug);
  const raw = text(form, "capacity");
  const capacity = raw === "" ? null : Number(raw);
  if (capacity !== null && (!Number.isInteger(capacity) || capacity < 0 || capacity > 500)) {
    done(slug, "Capacity must be a whole number between 0 and 500.");
  }
  const closed = ticked(form, "closed");
  const { error } = await db().from("course_settings").upsert({
    slug,
    capacity_override: capacity === course.maxAttendees ? null : capacity,
    bookings_closed: closed,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  await log(
    staff,
    slug,
    "Changed card settings",
    `Capacity ${capacity ?? course.maxAttendees}; bookings ${closed ? "closed" : "open"}`,
  );
  done(slug, "Card settings saved.");
}

/** A booking taken by phone or email. Allowed on a closed course, but not
 *  beyond capacity (raise the capacity first if that's intended). */
export async function addBooking(slug: string, form: FormData) {
  const staff = await requireEditor();
  const course = courseOrThrow(slug);
  const places = Number(text(form, "places"));
  if (!Number.isInteger(places) || places < 1) done(slug, "Please enter the number of places.");

  const fields = {
    contact_name: text(form, "contact-name", 120),
    organisation: text(form, "organisation", 200),
    email: text(form, "email", 200),
    phone: text(form, "phone", 40),
    invoice_address: text(form, "invoice-address", 600),
    invoice_email: text(form, "invoice-email", 200),
    po_number: text(form, "po-number", 80),
    attendees: text(form, "attendees", 4000),
    notes: "",
  };
  if (!fields.contact_name || !fields.organisation || !fields.email) {
    done(slug, "Name, organisation and email are needed for a booking.");
  }

  const { data, error } = await db().rpc("create_booking", {
    p: {
      course_slug: course.slug,
      course_title: course.title,
      course_date: course.date,
      trainer: course.trainer,
      places,
      price_per_person: course.pricePerPerson,
      source: "admin",
      ...fields,
    },
    default_capacity: course.maxAttendees,
    enforce_closed: false,
  });
  if (error) throw error;
  if (!data.ok) done(slug, `Not added: only ${placesText(data.places_left)} left. Raise the capacity first if you want to overbook.`);

  await log(staff, slug, "Added a booking", `${data.reference}: ${placesText(places)} for ${fields.organisation}`, data.id);
  if (ticked(form, "send-email")) {
    const b = await loadBooking(data.id);
    await sendEmail(acknowledgementEmail(emailData(b, course), ukToday()));
  }
  done(slug, `Booking ${data.reference} added.`, data.id);
}

export async function confirmBooking(id: string, form: FormData) {
  const staff = await requireEditor();
  const b = await loadBooking(id);
  const course = courseOrThrow(b.course_slug);
  const { error } = await db()
    .from("bookings")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  const emailed = ticked(form, "send-email") && (await sendEmail(confirmationEmail(emailData(b, course), ukToday())));
  await log(staff, b.course_slug, "Confirmed a booking", `${b.reference}${emailed ? ", confirmation emailed" : ""}`, id);
  const invoiced =
    ticked(form, "raise-invoice") && (await isConnected())
      ? await invoiceGap(staff, { ...b, status: "confirmed" }, ticked(form, "email-invoice"))
      : "";
  done(b.course_slug, `${b.reference} confirmed${emailed ? " and the booker emailed" : ""}. ${invoiced}`.trim(), id);
}

/** Invoices places not yet invoiced: a whole booking, or places added. */
export async function invoiceBooking(id: string, form: FormData) {
  const staff = await requireEditor();
  const b = await loadBooking(id);
  if (!(await isConnected())) done(b.course_slug, "FreeAgent is not connected.", id);
  const said = await invoiceGap(staff, b, ticked(form, "email-invoice"));
  done(b.course_slug, said || "Nothing left to invoice on this booking.", id);
}

/** A credit note for places invoiced but no longer booked. */
export async function creditBooking(id: string, form: FormData) {
  const staff = await requireEditor();
  const b = await loadBooking(id);
  if (!(await isConnected())) done(b.course_slug, "FreeAgent is not connected.", id);
  const p = positionFor(b, await loadInvoices([id]));
  const places = Math.max(-p.difference, 0);
  if (places === 0) done(b.course_slug, "Nothing to credit on this booking.", id);
  let said: string;
  try {
    const r = await raiseCreditNote(b, places, ticked(form, "email-credit"));
    await log(staff, b.course_slug, "Raised a credit note", `${b.reference}: ${r.reference}, ${placesText(places)}`, id);
    said = raisedText("Credit note", r);
  } catch (e) {
    console.error("Credit note failed", e);
    said = `The credit note could not be raised: ${reason(e)}`;
  }
  done(b.course_slug, said, id);
}

/** Asks FreeAgent now rather than waiting for the morning check. */
export async function checkPayments(id: string) {
  await requireEditor();
  const b = await loadBooking(id);
  try {
    await refreshBooking(id);
  } catch (e) {
    done(b.course_slug, `Could not check FreeAgent: ${reason(e)}`, id);
  }
  done(b.course_slug, `${b.reference}: payment status brought up to date from FreeAgent.`, id);
}

/** Emails a reminder for one unpaid invoice. `back` is where to return:
 *  the course card or the Money owed page. */
export async function remindInvoice(invoiceId: string, back: "card" | "money") {
  const staff = await requireEditor();
  const { data, error } = await db().from("invoices").select("*").eq("id", invoiceId).single();
  if (error || !data) throw new Error("Invoice not found");
  const row = { ...(data as InvoiceRow), due_value: Number(data.due_value), paid_value: Number(data.paid_value) };
  const b = await loadBooking(row.booking_id);
  let said: string;
  try {
    await refreshBooking(b.id);
    const fresh = (await loadInvoices([b.id])).find((r) => r.id === row.id)!;
    if (fresh.due_value <= 0.004) {
      said = `Invoice ${fresh.reference} has been paid, so no reminder was sent.`;
    } else {
      await sendReminder(fresh, b);
      await log(staff, b.course_slug, "Sent a payment reminder", `${b.reference}: invoice ${fresh.reference}`, b.id);
      said = `Reminder for invoice ${fresh.reference} sent to ${b.invoice_email || b.email}.`;
    }
  } catch (e) {
    said = `The reminder could not be sent: ${reason(e)}`;
  }
  if (back === "money") {
    revalidatePath("/admin/money");
    redirect(`/admin/money?notice=${encodeURIComponent(said)}`);
  }
  done(b.course_slug, said, b.id);
}

export async function cancelBooking(id: string, form: FormData) {
  const staff = await requireEditor();
  const b = await loadBooking(id);
  const course = courseOrThrow(b.course_slug);
  const { data, error } = await db().rpc("change_booking_places", {
    booking: id,
    new_places: b.places,
    new_status: "cancelled",
    default_capacity: course.maxAttendees,
  });
  if (error || !data?.ok) throw error ?? new Error("Cancel failed");
  const emailed = ticked(form, "send-email") && (await sendEmail(cancellationEmail(emailData(b, course))));
  await log(staff, b.course_slug, "Cancelled a booking", `${b.reference}: ${placesText(b.places)} released`, id);

  // Cancelled in time: credit whatever was invoiced. Too late: the invoice
  // stands (the booking terms charge the full fee) unless Chris ticks it.
  let credited = "";
  if (ticked(form, "credit-note") && (await isConnected())) {
    const p = positionFor(b, await loadInvoices([id]));
    if (p.invoicedPlaces > 0) {
      try {
        const r = await raiseCreditNote({ ...b, status: "cancelled" }, p.invoicedPlaces, ticked(form, "send-email"));
        await log(staff, b.course_slug, "Raised a credit note", `${b.reference}: ${r.reference}, ${placesText(p.invoicedPlaces)}`, id);
        credited = raisedText("Credit note", r);
      } catch (e) {
        console.error("Credit note failed", e);
        credited = `The credit note could not be raised: ${reason(e)}`;
      }
    }
  }
  done(
    b.course_slug,
    `${b.reference} cancelled; ${placesText(b.places)} released${emailed ? " and the booker emailed" : ""}. ${credited}`.trim(),
    credited ? id : undefined,
  );
}

export async function reinstateBooking(id: string) {
  const staff = await requireEditor();
  const b = await loadBooking(id);
  const course = courseOrThrow(b.course_slug);
  const { data, error } = await db().rpc("change_booking_places", {
    booking: id,
    new_places: b.places,
    new_status: b.confirmed_at ? "confirmed" : "new",
    default_capacity: course.maxAttendees,
  });
  if (error) throw error;
  if (!data.ok) done(b.course_slug, `Not reinstated: only ${placesText(data.places_left)} left.`, id);
  await log(staff, b.course_slug, "Reinstated a booking", b.reference, id);
  done(b.course_slug, `${b.reference} reinstated.`, id);
}

const INVOICE_STATUSES: InvoiceStatus[] = ["to_invoice", "invoiced", "paid", "not_required"];

export async function updateBooking(id: string, form: FormData) {
  const staff = await requireEditor();
  const b = await loadBooking(id);
  const course = courseOrThrow(b.course_slug);

  const places = Number(text(form, "places"));
  if (!Number.isInteger(places) || places < 1) done(b.course_slug, "Places must be at least 1.", id);
  if (places !== b.places && b.status !== "cancelled") {
    const { data, error } = await db().rpc("change_booking_places", {
      booking: id,
      new_places: places,
      new_status: b.status,
      default_capacity: course.maxAttendees,
    });
    if (error) throw error;
    if (!data.ok) done(b.course_slug, `Not saved: only ${placesText(data.places_left)} left for this booking.`, id);
  }

  // With FreeAgent invoices, the status follows FreeAgent, not this form.
  const hasInvoices = (await loadInvoices([id])).length > 0;
  const chosen = text(form, "invoice-status") as InvoiceStatus;
  const invoiceStatus = hasInvoices || !INVOICE_STATUSES.includes(chosen) ? b.invoice_status : chosen;
  const { error } = await db()
    .from("bookings")
    .update({
      contact_name: text(form, "contact-name", 120) || b.contact_name,
      organisation: text(form, "organisation", 200) || b.organisation,
      email: text(form, "email", 200) || b.email,
      phone: text(form, "phone", 40),
      invoice_address: text(form, "invoice-address", 600),
      invoice_email: text(form, "invoice-email", 200),
      po_number: text(form, "po-number", 80),
      attendees: text(form, "attendees", 4000),
      admin_notes: text(form, "admin-notes", 4000),
      invoice_status: invoiceStatus,
    })
    .eq("id", id);
  if (error) throw error;

  const changes = [
    places !== b.places && `places ${b.places} → ${places}`,
    invoiceStatus !== b.invoice_status && `invoice: ${invoiceStatus.replace("_", " ")}`,
  ].filter(Boolean);
  await log(staff, b.course_slug, "Updated a booking", [b.reference, ...changes].join(", "), id);
  done(b.course_slug, `${b.reference} saved.`, id);
}
