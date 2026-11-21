import Link from "next/link";
import { formatTimeRange } from "@/lib/courses";
import { addMonths, monthLabel, PLANNER_SPANS, type PlannerCourse, type PlannerMonth, type PlannerSpan } from "@/lib/planner";

type ViewProps = { months: PlannerMonth[]; span: PlannerSpan; from: string; thisMonth: string; today: string };

// The planner itself, kept apart from loading so it can be previewed with sample data.
export default function PlannerView({ months, span, from, thisMonth, today }: ViewProps) {
  const total = months.reduce((t, m) => t + m.courses.length, 0);
  const booked = months.reduce((t, m) => t + m.courses.reduce((s, c) => s + (c.availability.booked ?? 0), 0), 0);
  const capacity = months.reduce(
    (t, m) => t + m.courses.reduce((s, c) => s + (c.availability.capacity ?? 0), 0),
    0,
  );
  const href = (f: string, s: number) => `/admin/planner?months=${s}${f === thisMonth ? "" : `&from=${f}`}`;

  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Course planner</h1>
          <p className="form-note">
            {monthLabel(from)} to {monthLabel(addMonths(from, span - 1))}: {total}{" "}
            {total === 1 ? "course" : "courses"}
            {capacity > 0 && `, ${booked} of ${capacity} places booked`}.
          </p>
        </div>
        <div className="planner-controls">
          <div className="planner-toggle" role="group" aria-label="How many months to show">
            {PLANNER_SPANS.map((s) => (
              <Link key={s} href={href(from, s)} aria-current={s === span ? "page" : undefined}>
                {s} months
              </Link>
            ))}
          </div>
          <div className="planner-step">
            <Link href={href(addMonths(from, -span), span)}>← Earlier</Link>
            {from !== thisMonth && <Link href={href(thisMonth, span)}>From this month</Link>}
            <Link href={href(addMonths(from, span), span)}>Later →</Link>
          </div>
        </div>
      </div>

      <div className={`planner planner-${span}`}>
        {months.map((m) => (
          <section key={m.key} className={`planner-month${m.key === thisMonth ? " planner-now" : ""}`}>
            <h2>{m.label}</h2>
            {m.courses.length === 0 ? (
              <p className="planner-empty">No courses</p>
            ) : (
              <ul>
                {m.courses.map((c) => (
                  <PlannerEntry key={c.course.slug} entry={c} past={c.course.date < today} />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <p className="form-note admin-footnote">
        Places booked count new and confirmed bookings, not cancelled ones. Open a course to see its bookings.
      </p>
    </>
  );
}

function PlannerEntry({ entry: { course, availability: a }, past }: { entry: PlannerCourse; past: boolean }) {
  const d = new Date(`${course.date}T00:00:00Z`);
  const day = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(d);
  const capacity = a.capacity ?? course.maxAttendees;
  const booked = a.booked;
  const pct = booked === null || capacity === 0 ? 0 : Math.min(100, Math.round((booked / capacity) * 100));
  return (
    <li className={`planner-course${past ? " planner-past" : ""}`}>
      <span className="planner-date">
        <strong>{d.getUTCDate()}</strong>
        <span>{day}</span>
      </span>
      <span className="planner-body">
        <Link href={`/admin/courses/${course.slug}`}>{course.title}</Link>
        <span className="planner-meta">
          {course.trainer} · {formatTimeRange(course)}
        </span>
        <span className="planner-places">
          <span
            className={`places-bar places-bar-${a.state}`}
            role="img"
            aria-label={booked === null ? "Places booked not available" : `${booked} of ${capacity} places booked`}
          >
            <span style={{ width: `${pct}%` }} />
          </span>
          <span>
            <strong>{booked ?? "–"}</strong>/{capacity}
          </span>
        </span>
      </span>
    </li>
  );
}
