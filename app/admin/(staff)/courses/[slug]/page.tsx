import Link from "next/link";
import { notFound } from "next/navigation";
import { findCourse, formatDate, formatPrice, formatTimeRange } from "@/lib/courses";
import { availabilityFor, loadCounts } from "@/lib/availability";
import {
  INVOICE_LABELS,
  STATUS_LABELS,
  attendeeLines,
  emailsIn,
  loadCourseBookings,
  statsFor,
  type Activity,
  type Booking,
} from "@/lib/admin-data";
import { canEdit, canSee, requireStaff } from "@/lib/staff";
import { CourseStatusBadge } from "@/components/CourseCard";
import PlacesBar from "../../PlacesBar";
import {
  addBooking,
  cancelBooking,
  confirmBooking,
  reinstateBooking,
  updateBooking,
  updateSettings,
} from "./actions";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ notice?: string; open?: string }>;
};

const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date(iso));

export default async function AdminCoursePage({ params, searchParams }: Props) {
  const [{ slug }, { notice, open }] = await Promise.all([params, searchParams]);
  const course = findCourse(slug);
  const staff = await requireStaff();
  if (!course || !canSee(staff, course)) notFound();

  const editor = canEdit(staff);
  const [{ bookings, activity }, counts] = await Promise.all([loadCourseBookings(slug), loadCounts()]);
  const a = availabilityFor(course, counts);
  const s = statsFor(bookings);
  const live = bookings.filter((b) => b.status !== "cancelled");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  const bookerEmails = [...new Set(live.map((b) => b.email))];
  const attendeeEmails = [...new Set(live.flatMap((b) => emailsIn(b.attendees)))];
  const subject = encodeURIComponent(`${course.title}, ${formatDate(course.date)}`);

  return (
    <>
      <p className="admin-back"><Link href="/admin">← All courses</Link></p>
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      <section className="admin-panel admin-course-head">
        <div className="admin-card-head">
          <h1>{course.title}</h1>
          <CourseStatusBadge availability={a} />
        </div>
        <p className="admin-card-when">
          {formatDate(course.date)}, {formatTimeRange(course)} · {course.trainer} · {course.delivery} ·{" "}
          {formatPrice(course.pricePerPerson)} per person
        </p>
        <PlacesBar availability={a} />
        <dl className="admin-money">
          <div><dt>To invoice</dt><dd>{formatPrice(s.toInvoiceValue)}</dd></div>
          <div><dt>Invoiced, unpaid</dt><dd>{formatPrice(s.invoicedValue)}</dd></div>
          <div><dt>Paid</dt><dd>{formatPrice(s.paidValue)}</dd></div>
        </dl>
        <div className="admin-actions">
          <a className="btn btn-secondary btn-small" href={`/admin/courses/${slug}/register`}>Download register</a>
          {bookerEmails.length > 0 && (
            <a className="btn btn-secondary btn-small" href={`mailto:?bcc=${bookerEmails.join(",")}&subject=${subject}`}>
              Email bookers ({bookerEmails.length})
            </a>
          )}
          {attendeeEmails.length > 0 && (
            <a className="btn btn-secondary btn-small" href={`mailto:?bcc=${attendeeEmails.join(",")}&subject=${subject}`}>
              Email attendees ({attendeeEmails.length})
            </a>
          )}
          <Link className="btn btn-secondary btn-small" href={`/courses/${slug}`} target="_blank">Public page</Link>
        </div>
      </section>

      <section className="admin-section">
        <h2>Bookings ({live.length})</h2>
        {live.length === 0 && <p className="form-note">No bookings yet.</p>}
        <div className="admin-bookings">
          {live.map((b) => <BookingItem key={b.id} booking={b} editor={editor} open={b.id === open} />)}
        </div>
        {cancelled.length > 0 && (
          <details className="admin-cancelled" open={cancelled.some((b) => b.id === open)}>
            <summary>Cancelled bookings ({cancelled.length})</summary>
            <div className="admin-bookings">
              {cancelled.map((b) => <BookingItem key={b.id} booking={b} editor={editor} open={b.id === open} />)}
            </div>
          </details>
        )}
      </section>

      {editor && (
        <section className="admin-section admin-two-col">
          <details className="admin-panel">
            <summary>Add a booking taken by phone or email</summary>
            <AddBookingForm slug={slug} />
          </details>
          <details className="admin-panel">
            <summary>Card settings: capacity and bookings open or closed</summary>
            <form action={updateSettings.bind(null, slug)} className="site-form">
              <div className="field field-narrow">
                <label htmlFor="capacity">Capacity</label>
                <input id="capacity" name="capacity" type="number" min={0} max={500} defaultValue={a.capacity ?? course.maxAttendees} />
              </div>
              <p className="form-note">The site&apos;s default for this course is {course.maxAttendees}.</p>
              <div className="choice">
                <input id="closed" name="closed" type="checkbox" defaultChecked={a.closedByAdmin} />
                <label htmlFor="closed">Close website bookings for this date now</label>
              </div>
              <p className="form-note">Website bookings close automatically 2 days before the course either way.</p>
              <button className="btn btn-primary btn-small" type="submit">Save settings</button>
            </form>
          </details>
        </section>
      )}

      <section className="admin-section">
        <h2>Activity</h2>
        <ActivityList activity={activity} />
      </section>
    </>
  );
}

function BookingItem({ booking: b, editor, open }: { booking: Booking; editor: boolean; open: boolean }) {
  const names = attendeeLines(b);
  const value = formatPrice(b.places * Number(b.price_per_person));
  return (
    <details id={`b-${b.id}`} className={`admin-booking admin-booking-${b.status}`} open={open}>
      <summary>
        <span className="admin-booking-org">{b.organisation}</span>
        <span>{b.places} {b.places === 1 ? "place" : "places"} · {value}</span>
        <span className={`pill pill-${b.status}`}>{STATUS_LABELS[b.status]}</span>
        <span className={`pill pill-${b.invoice_status}`}>{INVOICE_LABELS[b.invoice_status]}</span>
        <span className="admin-booking-ref">{b.reference}</span>
        {b.status !== "cancelled" && names.length < b.places && (
          <span className="pill pill-warn">{names.length}/{b.places} names</span>
        )}
      </summary>

      <div className="admin-booking-body">
        <dl className="admin-details">
          <div><dt>Booked by</dt><dd>{b.contact_name}</dd></div>
          <div><dt>Email</dt><dd><a href={`mailto:${b.email}`}>{b.email}</a></dd></div>
          <div><dt>Telephone</dt><dd>{b.phone || "Not given"}</dd></div>
          <div><dt>Booked</dt><dd>{dateTime(b.created_at)} ({b.source === "admin" ? "added by admin" : "website"})</dd></div>
          {b.confirmed_at && <div><dt>Confirmed</dt><dd>{dateTime(b.confirmed_at)}</dd></div>}
          {b.cancelled_at && <div><dt>Cancelled</dt><dd>{dateTime(b.cancelled_at)}</dd></div>}
          <div><dt>Invoice to</dt><dd className="pre">{b.invoice_address || "Not given"}{b.invoice_email && `\n${b.invoice_email}`}</dd></div>
          {b.po_number && <div><dt>PO number</dt><dd>{b.po_number}</dd></div>}
          <div><dt>Attendees</dt><dd className="pre">{names.length ? names.join("\n") : "Names to follow"}</dd></div>
          {b.notes && <div><dt>Booker&apos;s notes</dt><dd className="pre">{b.notes}</dd></div>}
          {b.admin_notes && <div><dt>Admin notes</dt><dd className="pre">{b.admin_notes}</dd></div>}
        </dl>

        {editor && (
          <>
            <div className="admin-actions">
              {b.status === "new" && (
                <form action={confirmBooking.bind(null, b.id)} className="admin-inline-form">
                  <label><input type="checkbox" name="send-email" defaultChecked /> Email the booker</label>
                  <button className="btn btn-primary btn-small" type="submit">Confirm booking</button>
                </form>
              )}
              {b.status !== "cancelled" ? (
                <form action={cancelBooking.bind(null, b.id)} className="admin-inline-form">
                  <label><input type="checkbox" name="send-email" /> Email the booker</label>
                  <button className="btn btn-secondary btn-small btn-danger" type="submit">Cancel booking</button>
                </form>
              ) : (
                <form action={reinstateBooking.bind(null, b.id)}>
                  <button className="btn btn-secondary btn-small" type="submit">Reinstate booking</button>
                </form>
              )}
            </div>

            <details className="admin-edit">
              <summary>Edit booking</summary>
              <form action={updateBooking.bind(null, b.id)} className="site-form">
                <div className="field-row">
                  <div className="field field-narrow">
                    <label htmlFor={`places-${b.id}`}>Places</label>
                    <input id={`places-${b.id}`} name="places" type="number" min={1} defaultValue={b.places} />
                  </div>
                  <div className="field">
                    <label htmlFor={`inv-${b.id}`}>Invoice</label>
                    <select id={`inv-${b.id}`} name="invoice-status" defaultValue={b.invoice_status}>
                      {Object.entries(INVOICE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field-row">
                  <Field id={`cn-${b.id}`} name="contact-name" label="Booked by" value={b.contact_name} />
                  <Field id={`org-${b.id}`} name="organisation" label="Organisation" value={b.organisation} />
                </div>
                <div className="field-row">
                  <Field id={`em-${b.id}`} name="email" label="Email" value={b.email} type="email" />
                  <Field id={`ph-${b.id}`} name="phone" label="Telephone" value={b.phone} />
                </div>
                <Field id={`ia-${b.id}`} name="invoice-address" label="Invoice address" value={b.invoice_address} rows={3} />
                <div className="field-row">
                  <Field id={`ie-${b.id}`} name="invoice-email" label="Send invoice to" value={b.invoice_email} type="email" />
                  <Field id={`po-${b.id}`} name="po-number" label="PO number" value={b.po_number} />
                </div>
                <Field id={`at-${b.id}`} name="attendees" label="Attendees, one per line (name and email)" value={b.attendees} rows={Math.max(3, b.places)} />
                <Field id={`an-${b.id}`} name="admin-notes" label="Admin notes (not shown to the customer)" value={b.admin_notes} rows={3} />
                <button className="btn btn-primary btn-small" type="submit">Save changes</button>
              </form>
            </details>
          </>
        )}
      </div>
    </details>
  );
}

function Field(props: { id: string; name: string; label: string; value: string; type?: string; rows?: number }) {
  return (
    <div className="field">
      <label htmlFor={props.id}>{props.label}</label>
      {props.rows ? (
        <textarea id={props.id} name={props.name} rows={props.rows} defaultValue={props.value} />
      ) : (
        <input id={props.id} name={props.name} type={props.type ?? "text"} defaultValue={props.value} />
      )}
    </div>
  );
}

function AddBookingForm({ slug }: { slug: string }) {
  return (
    <form action={addBooking.bind(null, slug)} className="site-form">
      <div className="field field-narrow">
        <label htmlFor="add-places">Places</label>
        <input id="add-places" name="places" type="number" min={1} defaultValue={1} required />
      </div>
      <div className="field-row">
        <Field id="add-name" name="contact-name" label="Booked by" value="" />
        <Field id="add-org" name="organisation" label="Organisation" value="" />
      </div>
      <div className="field-row">
        <Field id="add-email" name="email" label="Email" value="" type="email" />
        <Field id="add-phone" name="phone" label="Telephone" value="" />
      </div>
      <Field id="add-address" name="invoice-address" label="Invoice address" value="" rows={3} />
      <div className="field-row">
        <Field id="add-inv-email" name="invoice-email" label="Send invoice to (if different)" value="" type="email" />
        <Field id="add-po" name="po-number" label="PO number" value="" />
      </div>
      <Field id="add-attendees" name="attendees" label="Attendees, one per line (optional)" value="" rows={3} />
      <div className="choice">
        <input id="add-send" name="send-email" type="checkbox" defaultChecked />
        <label htmlFor="add-send">Email the booker the usual booking acknowledgement</label>
      </div>
      <button className="btn btn-primary btn-small" type="submit">Add booking</button>
    </form>
  );
}

function ActivityList({ activity }: { activity: Activity[] }) {
  if (activity.length === 0) return <p className="form-note">Nothing yet.</p>;
  return (
    <ul className="admin-activity">
      {activity.map((x) => (
        <li key={x.id}>
          <time dateTime={x.at}>{dateTime(x.at)}</time> <strong>{x.actor_name}</strong>: {x.action}
          {x.detail && <span className="form-note"> ({x.detail})</span>}
        </li>
      ))}
    </ul>
  );
}
