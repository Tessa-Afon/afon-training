// Reads for the admin area: course cards and the bookings behind them.
import { COURSES, type Course } from "./courses";
import { availabilityFor, loadCounts, ukToday, type Availability } from "./availability";
import { db } from "./supabase/admin";
import { canSee, type Staff } from "./staff";
import { daysBetween, loadInvoices, positionFor, type InvoiceRow } from "./invoicing";

export type BookingStatus = "new" | "confirmed" | "cancelled";
export type InvoiceStatus = "to_invoice" | "invoiced" | "paid" | "not_required";

export type Booking = {
  id: string;
  reference: string;
  course_slug: string;
  course_title: string;
  course_date: string;
  trainer: string;
  places: number;
  price_per_person: number;
  status: BookingStatus;
  invoice_status: InvoiceStatus;
  source: "website" | "admin";
  contact_name: string;
  organisation: string;
  email: string;
  phone: string;
  invoice_address: string;
  invoice_email: string;
  po_number: string;
  attendees: string;
  notes: string;
  admin_notes: string;
  created_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  names_reminder_sent_at?: string | null;
};

export type Activity = { id: number; at: string; actor_name: string; action: string; detail: string };

export const INVOICE_LABELS: Record<InvoiceStatus, string> = {
  to_invoice: "To invoice",
  invoiced: "Invoiced",
  paid: "Paid",
  not_required: "No invoice needed",
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

/** Attendee lines as typed by the booker, one person per line. */
export function attendeeLines(b: Pick<Booking, "attendees">): string[] {
  return b.attendees
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function emailsIn(text: string): string[] {
  return text.match(/[^\s@,;<>()]+@[^\s@,;<>()]+\.[^\s@,;<>()]+/g) ?? [];
}

export type CardStats = {
  bookings: number;
  newBookings: number;
  toInvoice: number;
  toInvoiceValue: number;
  /** Invoiced and not yet paid (including late-cancellation charges). */
  invoicedValue: number;
  paidValue: number;
  namesMissing: number;
  /** Bookings with an invoice past its due date. */
  overdue: number;
  /** Bookings not fully paid when the course is 14 days away or less. */
  unpaidSoon: number;
};

/** Days before a course from which unpaid bookings are flagged. */
export const UNPAID_WARNING_DAYS = 14;

export function statsFor(bookings: Booking[], invoices: InvoiceRow[] = [], today = ukToday()): CardStats {
  const stats: CardStats = {
    bookings: 0,
    newBookings: 0,
    toInvoice: 0,
    toInvoiceValue: 0,
    invoicedValue: 0,
    paidValue: 0,
    namesMissing: 0,
    overdue: 0,
    unpaidSoon: 0,
  };
  for (const b of bookings) {
    const price = Number(b.price_per_person);
    const p = positionFor(b, invoices, today);
    const live = b.status !== "cancelled";
    if (live) {
      stats.bookings++;
      if (b.status === "new") stats.newBookings++;
      if (attendeeLines(b).length < b.places) stats.namesMissing++;
    }
    let owed = false;
    if (p.invoices.length > 0) {
      // Invoiced through FreeAgent: the figures come from its invoices.
      if (p.difference > 0) {
        stats.toInvoice++;
        stats.toInvoiceValue += p.difference * price;
        owed = true;
      }
      stats.invoicedValue += p.dueValue;
      stats.paidValue += p.paidValue;
      if (p.dueValue > 0.004) owed = true;
      if (p.overdue) stats.overdue++;
    } else if (live) {
      // Not invoiced through FreeAgent: the status Chris has set by hand.
      const value = b.places * price;
      if (b.invoice_status === "to_invoice") {
        stats.toInvoice++;
        stats.toInvoiceValue += value;
        owed = true;
      } else if (b.invoice_status === "invoiced") {
        stats.invoicedValue += value;
        owed = true;
      } else if (b.invoice_status === "paid") {
        stats.paidValue += value;
      }
    }
    const daysToGo = daysBetween(today, b.course_date);
    if (owed && daysToGo >= 0 && daysToGo <= UNPAID_WARNING_DAYS) stats.unpaidSoon++;
  }
  return stats;
}

export type CourseCardData = { course: Course; availability: Availability; stats: CardStats };

/** One card per course date the person may see, soonest first. */
export async function loadCourseCards(staff: Staff, past: boolean): Promise<CourseCardData[]> {
  const today = ukToday();
  const courses = COURSES.filter((c) => canSee(staff, c) && (past ? c.date < today : c.date >= today)).sort(
    (a, b) => (past ? -1 : 1) * (a.date + a.startTime).localeCompare(b.date + b.startTime),
  );
  const [counts, rows] = await Promise.all([
    loadCounts(),
    db()
      .from("bookings")
      .select("*")
      .in(
        "course_slug",
        courses.map((c) => c.slug),
      ),
  ]);
  if (rows.error) throw rows.error;
  const invoices = await loadInvoices((rows.data as Booking[]).map((b) => b.id));
  const bySlug = new Map<string, Booking[]>();
  for (const b of rows.data as Booking[]) bySlug.set(b.course_slug, [...(bySlug.get(b.course_slug) ?? []), b]);
  return courses.map((course) => ({
    course,
    availability: availabilityFor(course, counts, today),
    stats: statsFor(bySlug.get(course.slug) ?? [], invoices, today),
  }));
}

export async function loadCourseBookings(
  slug: string,
): Promise<{ bookings: Booking[]; invoices: InvoiceRow[]; activity: Activity[] }> {
  const [bookings, activity] = await Promise.all([
    db().from("bookings").select("*").eq("course_slug", slug).order("created_at"),
    db()
      .from("activity_log")
      .select("id, at, actor_name, action, detail")
      .eq("course_slug", slug)
      .order("at", { ascending: false })
      .limit(30),
  ]);
  if (bookings.error) throw bookings.error;
  if (activity.error) throw activity.error;
  const invoices = await loadInvoices((bookings.data as Booking[]).map((b) => b.id));
  return { bookings: bookings.data as Booking[], invoices, activity: activity.data as Activity[] };
}
