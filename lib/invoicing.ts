// Invoicing for bookings: what has been invoiced or credited, raising
// invoices and credit notes in FreeAgent, refreshing payment status, and
// reminders. Server only.
import { findCourse, formatDate, formatPrice, formatTimeRange, type Course } from "./courses";
import { ukToday } from "./availability";
import { paymentDueDate } from "./booking";
import { db } from "./supabase/admin";
import { ADMIN_EMAIL, CONTACT_PHONE, SITE_NAME } from "./site";
import type { Booking, InvoiceStatus } from "./admin-data";
import {
  FREEAGENT_ENV,
  FreeAgentError,
  applyCreditNote,
  createCreditNote,
  createInvoice,
  emailCreditNote,
  emailInvoice,
  ensureContact,
  getCreditNote,
  getInvoice,
  markCreditNoteSent,
  markInvoiceSent,
  type InvoiceParty,
} from "./freeagent";

export type InvoiceRow = {
  id: string;
  booking_id: string;
  kind: "invoice" | "credit_note";
  environment: "sandbox" | "live";
  freeagent_url: string;
  reference: string;
  places: number;
  amount: number;
  dated_on: string;
  due_on: string | null;
  status: string;
  paid_value: number;
  due_value: number;
  emailed_at: string | null;
  last_reminder_at: string | null;
  reminders_sent: number;
  synced_at: string | null;
  created_at: string;
};

// FreeAgent statuses that will not change again on their own.
const SETTLED = new Set(["Paid", "Overpaid", "Refunded", "Written-off", "Zero Value", "Cancelled"]);

const num = (v: unknown) => Number(v ?? 0) || 0;

/** Whole days from a to b (ISO dates); negative if b is earlier. */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export async function loadInvoices(bookingIds: string[]): Promise<InvoiceRow[]> {
  if (bookingIds.length === 0) return [];
  const { data, error } = await db()
    .from("invoices")
    .select("*")
    .in("booking_id", bookingIds)
    .eq("environment", FREEAGENT_ENV)
    .order("created_at");
  if (error) {
    // Before migration 0002 has been run there is no invoices table yet;
    // the admin area then works as in Phase 1.
    if (error.code === "42P01" || error.code === "PGRST205") return [];
    throw error;
  }
  return (data as InvoiceRow[]).map((r) => ({
    ...r,
    amount: num(r.amount),
    paid_value: num(r.paid_value),
    due_value: num(r.due_value),
  }));
}

export type Position = {
  invoices: InvoiceRow[];
  creditNotes: InvoiceRow[];
  /** Places invoiced, less places credited. */
  invoicedPlaces: number;
  invoicedValue: number;
  creditedValue: number;
  paidValue: number;
  /** Still owed on this booking's invoices. */
  dueValue: number;
  /** Places to invoice (positive) or credit (negative) to match the booking. */
  difference: number;
  overdue: boolean;
};

export function positionFor(b: Booking, rows: InvoiceRow[], today = ukToday()): Position {
  const mine = rows.filter((r) => r.booking_id === b.id);
  const invoices = mine.filter((r) => r.kind === "invoice");
  const creditNotes = mine.filter((r) => r.kind === "credit_note");
  const sum = (list: InvoiceRow[], f: (r: InvoiceRow) => number) => list.reduce((t, r) => t + f(r), 0);
  const invoicedPlaces = sum(invoices, (r) => r.places) - sum(creditNotes, (r) => r.places);
  const wanted = b.status === "cancelled" ? 0 : b.places;
  const dueValue = sum(invoices, (r) => r.due_value);
  return {
    invoices,
    creditNotes,
    invoicedPlaces,
    invoicedValue: sum(invoices, (r) => r.amount),
    creditedValue: sum(creditNotes, (r) => r.amount),
    paidValue: sum(invoices, (r) => r.paid_value),
    dueValue,
    difference: invoices.length || creditNotes.length ? wanted - invoicedPlaces : 0,
    overdue: invoices.some((r) => r.due_value > 0 && r.due_on !== null && r.due_on < today),
  };
}

/** Places still to invoice: the gap between the booking and its FreeAgent
 *  invoices, or the whole booking if it has none and is marked To invoice. */
export function placesToInvoice(b: Booking, rows: InvoiceRow[], today = ukToday()): number {
  const p = positionFor(b, rows, today);
  if (p.invoices.length === 0 && p.creditNotes.length === 0) {
    return b.status !== "cancelled" && b.invoice_status === "to_invoice" ? b.places : 0;
  }
  return Math.max(p.difference, 0);
}

/** The booking's summary invoice status, worked out from its invoices. */
export function summaryStatus(p: Position, fallback: InvoiceStatus): InvoiceStatus {
  if (p.invoices.length === 0) return fallback;
  if (p.dueValue > 0.004) return "invoiced";
  // Fully credited (a cancellation in time): nothing to collect.
  if (p.invoicedPlaces <= 0) return "not_required";
  return p.paidValue > 0.004 ? "paid" : "not_required";
}

export function partyOf(b: Booking): InvoiceParty {
  return {
    organisation: b.organisation,
    contactName: b.contact_name,
    email: b.email,
    invoiceEmail: b.invoice_email,
    phone: b.phone,
    invoiceAddress: b.invoice_address,
  };
}

const lineDescription = (b: Booking, course: Course | undefined) =>
  `${b.course_title}, ${formatDate(b.course_date)}${course ? `, ${formatTimeRange(course)}` : ""}. ` +
  `${course?.delivery ?? "Training course"}. Booking ${b.reference}.`;

const signOff = `${SITE_NAME}
${ADMIN_EMAIL} · ${CONTACT_PHONE}`;

const invoiceTo = (b: Booking) => b.invoice_email || b.email;

/** Payment terms: due 6 weeks before the course, or on receipt if sooner. */
export function paymentTermsDays(courseDate: string, today = ukToday()): number {
  return Math.max(0, daysBetween(today, paymentDueDate(courseDate)));
}

export type RaiseResult = {
  reference: string;
  emailed: boolean;
  emailError?: string;
  /** Credit notes: the part already paid, to refund from FreeAgent. */
  refundDue?: number;
};

/** Raises an invoice in FreeAgent for some of a booking's places, marks it
 *  sent and (optionally) has FreeAgent email it with the PDF. */
export async function raiseInvoice(b: Booking, places: number, sendByEmail: boolean): Promise<RaiseResult> {
  const course = findCourse(b.course_slug);
  const today = ukToday();
  const price = num(b.price_per_person);
  const contactUrl = await ensureContact(partyOf(b));
  const terms = paymentTermsDays(b.course_date, today);
  const invoice = await createInvoice({
    contactUrl,
    datedOn: today,
    paymentTermsDays: terms,
    poReference: b.po_number,
    comments: `Booking reference ${b.reference}.${b.po_number ? ` Purchase order ${b.po_number}.` : ""} Please quote the invoice number when paying.`,
    lines: [{ description: lineDescription(b, course), quantity: places, price }],
  });

  // Saved straight away so a later failure can't leave an invoice in
  // FreeAgent that the site doesn't know about.
  const { data: row, error } = await db()
    .from("invoices")
    .insert({
      booking_id: b.id,
      kind: "invoice",
      environment: FREEAGENT_ENV,
      freeagent_url: invoice.url,
      reference: invoice.reference ?? "",
      places,
      amount: places * price,
      dated_on: today,
      due_on: invoice.due_on ?? paymentDueDate(b.course_date),
      status: invoice.status ?? "Draft",
      due_value: places * price,
    })
    .select("id")
    .single();
  if (error) throw error;

  await markInvoiceSent(invoice.url);

  let emailed = false;
  let emailError: string | undefined;
  if (sendByEmail) {
    const due = invoice.due_on ?? paymentDueDate(b.course_date);
    try {
      await emailInvoice(invoice.url, {
        to: invoiceTo(b),
        subject: `Invoice ${invoice.reference}: ${b.course_title}, ${formatDate(b.course_date)} (${b.reference})`,
        body: `Dear ${b.contact_name},

Please find attached our invoice ${invoice.reference} for ${places} ${places === 1 ? "place" : "places"} on ${b.course_title}, ${formatDate(b.course_date)}: ${formatPrice(places * price)}.

Payment is due ${terms === 0 ? "on receipt" : `by ${formatDate(due)}`}. Our bank details are on the invoice; please quote the invoice number as the payment reference.${b.po_number ? `\n\nYour purchase order: ${b.po_number}.` : ""}

Thank you for booking with us.

${signOff}`,
      });
      emailed = true;
    } catch (e) {
      emailError = e instanceof Error ? e.message : String(e);
      console.error("Invoice email failed", e);
    }
  }

  await db()
    .from("invoices")
    .update({ emailed_at: emailed ? new Date().toISOString() : null })
    .eq("id", row.id);
  await refreshBooking(b.id);
  return { reference: invoice.reference, emailed, emailError };
}

/** Raises a credit note for some places and sets it against this
 *  booking's unpaid invoices, newest first. */
export async function raiseCreditNote(b: Booking, places: number, sendByEmail: boolean): Promise<RaiseResult> {
  const course = findCourse(b.course_slug);
  const today = ukToday();
  const price = num(b.price_per_person);
  const amount = places * price;
  const contactUrl = await ensureContact(partyOf(b));
  const note = await createCreditNote({
    contactUrl,
    datedOn: today,
    comments: `Credit for booking ${b.reference}${b.status === "cancelled" ? " (cancelled)" : ""}.`,
    lines: [{ description: lineDescription(b, course), quantity: places, price }],
  });
  const { error } = await db().from("invoices").insert({
    booking_id: b.id,
    kind: "credit_note",
    environment: FREEAGENT_ENV,
    freeagent_url: note.url,
    reference: note.reference ?? "",
    places,
    amount,
    dated_on: today,
    status: note.status ?? "Draft",
  });
  if (error) throw error;

  await markCreditNoteSent(note.url);

  // Use the credit to settle unpaid invoices, so they stop being chased.
  let left = amount;
  const open = (await loadInvoices([b.id]))
    .filter((r) => r.kind === "invoice" && r.due_value > 0)
    .reverse();
  for (const inv of open) {
    if (left <= 0.004) break;
    const use = Math.min(left, inv.due_value);
    await applyCreditNote(note.url, inv.freeagent_url, use, today);
    left -= use;
  }

  let emailed = false;
  let emailError: string | undefined;
  if (sendByEmail) {
    try {
      await emailCreditNote(note.url, {
        to: invoiceTo(b),
        subject: `Credit note ${note.reference}: ${b.course_title}, ${formatDate(b.course_date)} (${b.reference})`,
        body: `Dear ${b.contact_name},

Please find attached credit note ${note.reference} for ${places} ${places === 1 ? "place" : "places"} on ${b.course_title}, ${formatDate(b.course_date)}: ${formatPrice(amount)}.
${left > 0.004 ? `\nAs you have already paid, we will refund ${formatPrice(left)} to you.\n` : "\nIt has been set against your invoice, so there is nothing more to pay for these places.\n"}
${signOff}`,
      });
      emailed = true;
    } catch (e) {
      emailError = e instanceof Error ? e.message : String(e);
      console.error("Credit note email failed", e);
    }
  }
  await refreshBooking(b.id);
  return { reference: note.reference, emailed, emailError, refundDue: left > 0.004 ? left : 0 };
}

/** Asks FreeAgent for the latest on one booking's invoices and credit
 *  notes, then updates the booking's summary status. */
export async function refreshBooking(bookingId: string): Promise<void> {
  const rows = await loadInvoices([bookingId]);
  for (const r of rows) await refreshRow(r);
  await updateSummary(bookingId);
}

async function refreshRow(r: InvoiceRow): Promise<boolean> {
  if (r.kind === "invoice") {
    const inv = await getInvoice(r.freeagent_url);
    const update = {
      reference: inv.reference ?? r.reference,
      status: inv.status,
      due_on: inv.due_on ?? r.due_on,
      paid_value: num(inv.paid_value),
      due_value: num(inv.due_value),
      synced_at: new Date().toISOString(),
    };
    const changed = update.status !== r.status || update.paid_value !== r.paid_value || update.due_value !== r.due_value;
    const { error } = await db().from("invoices").update(update).eq("id", r.id);
    if (error) throw error;
    return changed;
  }
  const note = await getCreditNote(r.freeagent_url);
  const { error } = await db()
    .from("invoices")
    .update({ reference: note.reference ?? r.reference, status: note.status, synced_at: new Date().toISOString() })
    .eq("id", r.id);
  if (error) throw error;
  return note.status !== r.status;
}

async function updateSummary(bookingId: string): Promise<void> {
  const { data: b, error } = await db().from("bookings").select("*").eq("id", bookingId).single();
  if (error) throw error;
  const p = positionFor(b as Booking, await loadInvoices([bookingId]));
  const status = summaryStatus(p, (b as Booking).invoice_status);
  if (status !== (b as Booking).invoice_status) {
    await db().from("bookings").update({ invoice_status: status }).eq("id", bookingId);
  }
}

/** The morning check: every invoice not yet settled. Returns a summary
 *  such as "12 checked, 2 newly paid". */
export async function refreshAll(): Promise<{ checked: number; paid: string[]; failed: number }> {
  const { data, error } = await db()
    .from("invoices")
    .select("*")
    .eq("environment", FREEAGENT_ENV)
    .not("status", "in", `(${[...SETTLED].map((s) => `"${s}"`).join(",")})`);
  if (error) throw error;
  const rows = data as InvoiceRow[];
  const touched = new Set<string>();
  const paid: string[] = [];
  let failed = 0;
  for (const r of rows) {
    try {
      const before = r.status;
      if (await refreshRow({ ...r, paid_value: num(r.paid_value), due_value: num(r.due_value) })) {
        touched.add(r.booking_id);
        const after = await db().from("invoices").select("status").eq("id", r.id).single();
        if (before !== "Paid" && after.data?.status === "Paid") paid.push(r.reference);
      }
    } catch (e) {
      failed++;
      console.error(`Could not refresh ${r.reference || r.freeagent_url}`, e);
      if (e instanceof FreeAgentError && e.status === 401) throw e;
    }
  }
  for (const id of touched) await updateSummary(id);
  return { checked: rows.length, paid, failed };
}

/** A reminder for one unpaid invoice, sent by FreeAgent with the PDF. */
export async function sendReminder(row: InvoiceRow, b: Booking): Promise<void> {
  const today = ukToday();
  const late = row.due_on && row.due_on < today ? daysBetween(row.due_on, today) : 0;
  await emailInvoice(row.freeagent_url, {
    to: invoiceTo(b),
    subject: `Reminder: invoice ${row.reference} ${late > 0 ? "is overdue" : "is due"} (${b.course_title}, ${formatDate(b.course_date)})`,
    body: `Dear ${b.contact_name},

A reminder that invoice ${row.reference} for ${b.course_title} on ${formatDate(b.course_date)} ${late > 0 ? `was due on ${formatDate(row.due_on!)}` : row.due_on ? `is due on ${formatDate(row.due_on)}` : "is due"}. The amount outstanding is ${formatPrice(row.due_value)}. A copy is attached.

If you have already paid, thank you, and please ignore this email. If there is a problem, just reply and let us know.

${signOff}`,
  });
  const { error } = await db()
    .from("invoices")
    .update({ last_reminder_at: new Date().toISOString(), reminders_sent: row.reminders_sent + 1 })
    .eq("id", row.id);
  if (error) throw error;
}
