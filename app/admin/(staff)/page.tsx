import Link from "next/link";
import { formatDate, formatPrice, formatTimeRange } from "@/lib/courses";
import { loadCourseCards, type CourseCardData } from "@/lib/admin-data";
import { requireStaff } from "@/lib/staff";
import { CourseStatusBadge } from "@/components/CourseCard";
import PlacesBar from "./PlacesBar";

type Props = { searchParams: Promise<{ show?: string }> };

export default async function AdminHome({ searchParams }: Props) {
  const staff = await requireStaff();
  const past = (await searchParams).show === "past";
  const cards = await loadCourseCards(staff, past);
  const newCount = cards.reduce((t, c) => t + c.stats.newBookings, 0);

  return (
    <>
      <div className="admin-title">
        <div>
          <h1>{past ? "Past courses" : "Upcoming courses"}</h1>
          {!past && (
            <p className="form-note">
              {newCount === 0
                ? "No new bookings waiting."
                : `${newCount} new ${newCount === 1 ? "booking" : "bookings"} waiting to be confirmed.`}
            </p>
          )}
        </div>
        <Link href={past ? "/admin" : "/admin?show=past"}>{past ? "Show upcoming courses" : "Show past courses"}</Link>
      </div>
      {cards.length === 0 ? (
        <p className="empty-state">No courses to show.</p>
      ) : (
        <div className="admin-cards">
          {cards.map((c) => <AdminCourseCard key={c.course.slug} card={c} />)}
        </div>
      )}
      <p className="form-note admin-footnote">
        New courses and dates are added by Claude through Peter. Each new date gets its card here automatically.
      </p>
    </>
  );
}

function AdminCourseCard({ card }: { card: CourseCardData }) {
  const { course, availability: a, stats: s } = card;
  return (
    <article className="admin-card">
      <div className="admin-card-head">
        <h2>
          <Link href={`/admin/courses/${course.slug}`}>{course.title}</Link>
        </h2>
        <CourseStatusBadge availability={a} />
      </div>
      <p className="admin-card-when">
        {formatDate(course.date)}, {formatTimeRange(course)} · {course.trainer}
      </p>
      <PlacesBar availability={a} />
      <ul className="admin-flags">
        {s.newBookings > 0 && (
          <li className="flag-new">{s.newBookings} new {s.newBookings === 1 ? "booking" : "bookings"} to confirm</li>
        )}
        {s.toInvoice > 0 && (
          <li>{s.toInvoice} to invoice ({formatPrice(s.toInvoiceValue)})</li>
        )}
        {s.overdue > 0 && (
          <li className="flag-warn">{s.overdue} overdue {s.overdue === 1 ? "invoice" : "invoices"}</li>
        )}
        {s.unpaidSoon > 0 && (
          <li className="flag-warn">{s.unpaidSoon} not fully paid, course within 2 weeks</li>
        )}
        {s.namesMissing > 0 && (
          <li>{s.namesMissing} {s.namesMissing === 1 ? "booking is" : "bookings are"} missing attendee names</li>
        )}
        {s.bookings === 0 && <li className="flag-quiet">No bookings yet</li>}
      </ul>
      <Link className="btn btn-secondary btn-small" href={`/admin/courses/${course.slug}`}>Open card</Link>
    </article>
  );
}
