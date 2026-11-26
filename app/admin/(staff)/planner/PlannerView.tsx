import Link from "next/link";
import { formatTimeRange } from "@/lib/courses";
import type { Bespoke } from "@/lib/bespoke";
import { addMonths, monthLabel, PLANNER_SPANS, type PlannerCourse, type PlannerMonth, type PlannerSpan } from "@/lib/planner";

type ViewProps = {
  months: PlannerMonth[];
  span: PlannerSpan;
  from: string;
  thisMonth: string;
  today: string;
  /** Owner or admin: may add bespoke bookings. */
  editor?: boolean;
  notice?: string;
};

// The planner itself, kept apart from loading so it can be previewed with sample data.
export default function PlannerView({ months, span, from, thisMonth, today, editor = false, notice }: ViewProps) {
  const entries = months.flatMap((m) => m.courses);
  const pub = entries.flatMap((e) => (e.kind === "public" ? [e.availability] : []));
  const total = pub.length;
  const bespoke = entries.length - total;
  const booked = pub.reduce((s, a) => s + (a.booked ?? 0), 0);
  const capacity = pub.reduce((s, a) => s + (a.capacity ?? 0), 0);
  const href = (f: string, s: number) => `/admin/planner?months=${s}${f === thisMonth ? "" : `&from=${f}`}`;

  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Course planner</h1>
          <p className="form-note">
            {monthLabel(from)} to {monthLabel(addMonths(from, span - 1))}: {total}{" "}
            {total === 1 ? "course" : "courses"}
            {capacity > 0 && `, ${booked} of ${capacity} places booked`}
            {bespoke > 0 && `, plus ${bespoke} bespoke`}.
          </p>
        </div>
        <div className="planner-controls">
          {editor && (
            <Link className="btn btn-primary btn-small" href="/admin/planner/bespoke">
              Bespoke Booking
            </Link>
          )}
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

      {notice && <p className="admin-notice" role="status">{notice}</p>}

      <div className={`planner planner-${span}`}>
        {months.map((m) => (
          <section key={m.key} className={`planner-month${m.key === thisMonth ? " planner-now" : ""}`}>
            <h2>{m.label}</h2>
            {m.courses.length === 0 ? (
              <p className="planner-empty">No courses</p>
            ) : (
              <ul>
                {m.courses.map((c) => (
                  c.kind === "public" ? (
                    <PlannerEntry key={c.course.slug} entry={c} past={c.course.date < today} />
                  ) : (
                    <BespokeEntry key={c.bespoke.id} bespoke={c.bespoke} past={c.bespoke.date < today} editor={editor} />
                  )
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <p className="form-note admin-footnote">
        Places booked count new and confirmed bookings, not cancelled ones. Open a course to see its bookings.
        Bespoke courses are private to one organisation and are not shown on the website.
      </p>
    </>
  );
}

function DateBox({ date }: { date: string }) {
  const d = new Date(`${date}T00:00:00Z`);
  const day = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(d);
  return (
    <span className="planner-date">
      <strong>{d.getUTCDate()}</strong>
      <span>{day}</span>
    </span>
  );
}

function BespokeEntry({ bespoke: b, past, editor }: { bespoke: Bespoke; past: boolean; editor: boolean }) {
  const times = b.start_time && b.end_time ? ` · ${formatTimeRange({ startTime: b.start_time, endTime: b.end_time })}` : "";
  return (
    <li className={`planner-course planner-bespoke${past ? " planner-past" : ""}`}>
      <DateBox date={b.date} />
      <span className="planner-body">
        {editor ? <Link href={`/admin/planner/bespoke/${b.id}`}>{b.title}</Link> : <strong>{b.title}</strong>}
        <span className="planner-meta">
          <span className="planner-tag">Bespoke</span> {b.organisation}
        </span>
        <span className="planner-meta">
          {b.trainer}
          {times} · {b.places} {b.places === 1 ? "place" : "places"}
        </span>
      </span>
    </li>
  );
}

function PlannerEntry({
  entry: { course, availability: a },
  past,
}: {
  entry: Extract<PlannerCourse, { kind: "public" }>;
  past: boolean;
}) {
  const capacity = a.capacity ?? course.maxAttendees;
  const booked = a.booked;
  const pct = booked === null || capacity === 0 ? 0 : Math.min(100, Math.round((booked / capacity) * 100));
  return (
    <li className={`planner-course${past ? " planner-past" : ""}`}>
      <DateBox date={course.date} />
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
