// Places left and the banner each course date shows. Bookings live in
// Supabase; capacity comes from lib/courses.ts unless Chris changes it on
// the admin card. Without a database, the status set in lib/courses.ts is
// shown as before.
import type { Course } from "./courses";
import { DATABASE_CONFIGURED, db } from "./supabase/admin";

// Website bookings close this many days before the course date.
export const BOOKING_CUTOFF_DAYS = 2;

// "Only 3 places left" shows from this many places down.
export const FEW_PLACES = 5;

export type AvailabilityState = "open" | "few" | "full" | "closed";

export type Availability = {
  state: AvailabilityState;
  label: string;
  /** Null when there is no database to count bookings. */
  capacity: number | null;
  booked: number | null;
  left: number | null;
  closedByAdmin: boolean;
  pastCutoff: boolean;
};

export type CourseSettings = { capacity_override: number | null; bookings_closed: boolean };

/** Today's date in the UK, as YYYY-MM-DD. */
export function ukToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(now);
}

/** The first day on which website bookings are closed. */
export function cutoffDate(courseDateIso: string): string {
  const d = new Date(`${courseDateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - BOOKING_CUTOFF_DAYS);
  return d.toISOString().slice(0, 10);
}

export function placesLabel(left: number): string {
  return `Only ${left} ${left === 1 ? "place" : "places"} left`;
}

export function describe(
  course: Course,
  booked: number | null,
  settings: CourseSettings | undefined,
  today = ukToday(),
): Availability {
  const pastCutoff = today >= cutoffDate(course.date);
  const closedByAdmin = settings?.bookings_closed ?? false;

  if (booked === null) {
    // No database: keep the hand-set status from lib/courses.ts.
    const full = course.status === "Fully booked";
    return {
      state: full ? "full" : pastCutoff ? "closed" : "open",
      label: full ? "Course full" : pastCutoff ? "Bookings closed" : course.status,
      capacity: null,
      booked: null,
      left: null,
      closedByAdmin: false,
      pastCutoff,
    };
  }

  const capacity = settings?.capacity_override ?? course.maxAttendees;
  const left = Math.max(capacity - booked, 0);
  const base = { capacity, booked, left, closedByAdmin, pastCutoff };

  if (left === 0 || course.status === "Fully booked") return { ...base, state: "full", label: "Course full" };
  if (closedByAdmin || pastCutoff) return { ...base, state: "closed", label: "Bookings closed" };
  if (left <= FEW_PLACES) return { ...base, state: "few", label: placesLabel(left) };
  return { ...base, state: "open", label: "Places available" };
}

export type CourseCounts = { booked: Map<string, number>; settings: Map<string, CourseSettings> };

/** Places booked and settings for every course date, read fresh. Null if
 *  there is no database, or it can't be reached (the site then shows the
 *  hand-set status rather than failing). */
export async function loadCounts(): Promise<CourseCounts | null> {
  if (!DATABASE_CONFIGURED) return null;
  const [places, settings] = await Promise.all([
    db().from("course_places").select("course_slug, places_booked"),
    db().from("course_settings").select("slug, capacity_override, bookings_closed"),
  ]);
  if (places.error || settings.error) {
    console.error("Could not load place counts", places.error ?? settings.error);
    return null;
  }
  return {
    booked: new Map(places.data.map((r) => [r.course_slug as string, r.places_booked as number])),
    settings: new Map(
      settings.data.map((r) => [
        r.slug as string,
        { capacity_override: r.capacity_override, bookings_closed: r.bookings_closed } as CourseSettings,
      ]),
    ),
  };
}

export function availabilityFor(course: Course, counts: CourseCounts | null, today = ukToday()): Availability {
  if (!counts) return describe(course, null, undefined, today);
  return describe(course, counts.booked.get(course.slug) ?? 0, counts.settings.get(course.slug), today);
}

export const isBookable = (a: Availability) => a.state === "open" || a.state === "few";
