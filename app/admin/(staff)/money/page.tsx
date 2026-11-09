import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/courses";
import { ukToday } from "@/lib/availability";
import { db } from "@/lib/supabase/admin";
import { canEdit, requireStaff } from "@/lib/staff";
import { isConnected, loadConnection } from "@/lib/freeagent";
import { daysBetween, loadInvoices, placesToInvoice, positionFor, type InvoiceRow } from "@/lib/invoicing";
import type { Booking } from "@/lib/admin-data";
import { remindInvoice } from "../courses/[slug]/actions";
import { invoiceAllConfirmed } from "./actions";

type Props = { searchParams: Promise<{ notice?: string }> };

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );

type Owed = { booking: Booking; invoice: InvoiceRow | null; owed: number; dueOn: string | null };

export default async function MoneyPage({ searchParams }: Props) {
  const staff = await requireStaff();
  if (!canEdit(staff)) notFound();
  const { notice } = await searchParams;
  const today = ukToday();

  const { data, error } = await db().from("bookings").select("*").order("course_date");
  if (error) throw error;
  const bookings = data as Booking[];
  const [rows, connected, connection] = await Promise.all([
    loadInvoices(bookings.map((b) => b.id)),
    isConnected(),
    loadConnection(),
  ]);

  const owed: Owed[] = [];
  const toInvoice: { booking: Booking; places: number }[] = [];
  for (const b of bookings) {
    const p = positionFor(b, rows, today);
    for (const inv of p.invoices) {
      if (inv.due_value > 0.004) owed.push({ booking: b, invoice: inv, owed: inv.due_value, dueOn: inv.due_on });
    }
    if (p.invoices.length === 0 && b.status !== "cancelled" && b.invoice_status === "invoiced") {
      // Invoiced by hand, outside the site: no amounts or dates to show.
      owed.push({ booking: b, invoice: null, owed: b.places * Number(b.price_per_person), dueOn: null });
    }
    const places = placesToInvoice(b, rows, today);
    if (places > 0) toInvoice.push({ booking: b, places });
  }
  owed.sort((x, y) => (x.dueOn ?? "9999").localeCompare(y.dueOn ?? "9999"));
  const totalOwed = owed.reduce((t, o) => t + o.owed, 0);
  const totalOverdue = owed.filter((o) => o.dueOn && o.dueOn < today).reduce((t, o) => t + o.owed, 0);
  const confirmedWaiting = toInvoice.filter((t) => t.booking.status === "confirmed");

  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Money owed</h1>
          <p className="form-note">
            {formatPrice(totalOwed)} owed, {formatPrice(totalOverdue)} of it overdue.{" "}
            {connected
              ? `FreeAgent is checked every morning${connection?.last_sync_at ? "" : " (not yet checked)"}.`
              : "FreeAgent is not connected, so amounts here come from the status set on each booking."}
          </p>
        </div>
      </div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      <section className="admin-section">
        <h2>Unpaid invoices ({owed.length})</h2>
        {owed.length === 0 ? (
          <p className="form-note">Nothing owed.</p>
        ) : (
          <div className="admin-panel admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Due</th>
                  <th>Organisation</th>
                  <th>Course</th>
                  <th>Invoice</th>
                  <th className="num">Owed</th>
                  <th>Contact</th>
                  <th>Reminders</th>
                </tr>
              </thead>
              <tbody>
                {owed.map(({ booking: b, invoice: inv, owed: amount, dueOn }) => {
                  const late = dueOn ? daysBetween(dueOn, today) : 0;
                  return (
                    <tr key={inv?.id ?? b.id}>
                      <td>
                        {dueOn ? shortDate(dueOn) : "Not known"}
                        {late > 0 && <div className="admin-late">{late} {late === 1 ? "day" : "days"} overdue</div>}
                      </td>
                      <td>
                        <Link href={`/admin/courses/${b.course_slug}?open=${b.id}#b-${b.id}`}>{b.organisation}</Link>
                        <div className="form-note">{b.reference}</div>
                      </td>
                      <td>
                        {b.course_title}
                        <div className="form-note">{shortDate(b.course_date)}{b.status === "cancelled" ? " · cancelled" : ""}</div>
                      </td>
                      <td>{inv ? inv.reference : "Invoiced by hand"}</td>
                      <td className="num">{formatPrice(amount)}</td>
                      <td>
                        {b.contact_name}
                        <div className="form-note">
                          {b.phone && <>{b.phone}<br /></>}
                          <a href={`mailto:${b.invoice_email || b.email}`}>{b.invoice_email || b.email}</a>
                        </div>
                      </td>
                      <td>
                        {inv?.last_reminder_at && (
                          <div className="form-note">
                            {inv.reminders_sent} sent, last {shortDate(inv.last_reminder_at.slice(0, 10))}
                          </div>
                        )}
                        {inv && connected && (
                          <form action={remindInvoice.bind(null, inv.id, "money")}>
                            <button className="link-button" type="submit">Send reminder</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="form-note">
          FreeAgent also sends its own automatic reminders if they are switched on in FreeAgent (Settings → Invoice
          reminders). &quot;Send reminder&quot; emails one now, with the invoice attached. Record phone calls in the
          booking&apos;s admin notes.
        </p>
      </section>

      <section className="admin-section">
        <h2>To invoice ({toInvoice.length})</h2>
        {toInvoice.length === 0 ? (
          <p className="form-note">Every booking has been invoiced.</p>
        ) : (
          <>
            <div className="admin-panel admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Course date</th><th>Organisation</th><th>Course</th><th>Places</th><th className="num">Amount</th><th>Booking</th></tr>
                </thead>
                <tbody>
                  {toInvoice.map(({ booking: b, places }) => (
                    <tr key={b.id}>
                      <td>{shortDate(b.course_date)}</td>
                      <td>
                        <Link href={`/admin/courses/${b.course_slug}?open=${b.id}#b-${b.id}`}>{b.organisation}</Link>
                        <div className="form-note">{b.reference}</div>
                      </td>
                      <td>{b.course_title}</td>
                      <td>{places}</td>
                      <td className="num">{formatPrice(places * Number(b.price_per_person))}</td>
                      <td>{b.status === "new" ? "New: confirm first" : "Confirmed"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {connected && confirmedWaiting.length > 0 && (
              <form action={invoiceAllConfirmed} className="admin-inline-form">
                <label><input type="checkbox" name="email-invoice" defaultChecked /> Email each invoice</label>
                <button className="btn btn-primary btn-small" type="submit">
                  Invoice all {confirmedWaiting.length} confirmed {confirmedWaiting.length === 1 ? "booking" : "bookings"}
                </button>
              </form>
            )}
            {!connected && (
              <p className="form-note">Once FreeAgent is connected, these can be invoiced from here in one go.</p>
            )}
          </>
        )}
      </section>
    </>
  );
}
