// Reads for the admin area: course cards and the bookings behind them.
import { COURSES, type Course } from "./courses";
import { availabilityFor, loadCounts, ukToday, type Availability } from "./availability";
import { db } from "./supabase/admin";
import { canSee, type Staff } from "./staff";

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
  invoicedValue: number;
  paidValue: number;
  namesMissing: number;
};

export function statsFor(bookings: Booking[]): CardStats {
  const live = bookings.filter((b) => b.status !== "cancelled");
  const value = (b: Booking) => b.places * Number(b.price_per_person);
  const sum = (list: Booking[]) => list.reduce((t, b) => t + value(b), 0);
  const toInvoice = live.filter((b) => b.invoice_status === "to_invoice");
  return {
    bookings: live.length,
    newBookings: live.filter((b) => b.status === "new").length,
    toInvoice: toInvoice.length,
    toInvoiceValue: sum(toInvoice),
    invoicedValue: sum(live.filter((b) => b.invoice_status === "invoiced")),
    paidValue: sum(live.filter((b) => b.invoice_status === "paid")),
    namesMissing: live.filter((b) => attendeeLines(b).length < b.places).length,
  };
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
  const bySlug = new Map<string, Booking[]>();
  for (const b of rows.data as Booking[]) bySlug.set(b.course_slug, [...(bySlug.get(b.course_slug) ?? []), b]);
  return courses.map((course) => ({
    course,
    availability: availabilityFor(course, counts, today),
    stats: statsFor(bySlug.get(course.slug) ?? []),
  }));
}

export async function loadCourseBookings(slug: string): Promise<{ bookings: Booking[]; activity: Activity[] }> {
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
  return { bookings: bookings.data as Booking[], activity: activity.data as Activity[] };
}
