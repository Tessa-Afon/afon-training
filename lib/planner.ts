// The course planner: every course date the person may see, laid out
// month by month over 6 or 12 months, with trainer and places booked.
import { COURSES, type Course } from "./courses";
import { availabilityFor, loadCounts, ukToday, type Availability } from "./availability";
import { canSee, type Staff } from "./staff";

export const PLANNER_SPANS = [6, 12] as const;
export type PlannerSpan = (typeof PLANNER_SPANS)[number];

export type PlannerCourse = { course: Course; availability: Availability };
export type PlannerMonth = { key: string; label: string; courses: PlannerCourse[] };

/** "2026-11" plus n months. */
export function addMonths(key: string, n: number): string {
  const [y, m] = key.split("-").map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

export function monthLabel(key: string): string {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${key}-01T00:00:00Z`),
  );
}

/** Reads ?months= and ?from= safely; defaults to 6 months from this month. */
export function plannerWindow(params: { months?: string; from?: string }, today = ukToday()) {
  const span: PlannerSpan = params.months === "12" ? 12 : 6;
  const from = /^\d{4}-(0[1-9]|1[0-2])$/.test(params.from ?? "") ? params.from! : today.slice(0, 7);
  return { span, from, thisMonth: today.slice(0, 7) };
}

export async function loadPlanner(staff: Staff, from: string, span: PlannerSpan): Promise<PlannerMonth[]> {
  const keys = Array.from({ length: span }, (_, i) => addMonths(from, i));
  const end = addMonths(from, span);
  const today = ukToday();
  const courses = COURSES.filter((c) => canSee(staff, c) && c.date >= `${from}-01` && c.date < `${end}-01`).sort(
    (a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime),
  );
  const counts = courses.length > 0 ? await loadCounts() : null;
  return keys.map((key) => ({
    key,
    label: monthLabel(key),
    courses: courses
      .filter((c) => c.date.startsWith(key))
      .map((course) => ({ course, availability: availabilityFor(course, counts, today) })),
  }));
}
