// The morning check, run once a day by a Netlify scheduled function (see
// netlify/functions/daily.mts) and on demand from Admin > Settings:
//   1. asks FreeAgent about every invoice not yet settled, and marks
//      bookings paid;
//   2. emails bookers whose course is 3 weeks away or less and who still
//      owe us attendee names (once per booking).
import { findCourse, formatTimeRange } from "./courses";
import { ukToday } from "./availability";
import { db } from "./supabase/admin";
import { attendeeLines, type Booking } from "./admin-data";
import { EMAIL_CONFIGURED, namesReminderEmail, sendEmail } from "./email";
import { isConnected, recordSync } from "./freeagent";
import { refreshAll } from "./invoicing";

export const NAMES_REMINDER_DAYS = 21;

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function namesReminders(today: string): Promise<number> {
  if (!EMAIL_CONFIGURED) return 0;
  const { data, error } = await db()
    .from("bookings")
    .select("*")
    .neq("status", "cancelled")
    .is("names_reminder_sent_at", null)
    .gt("course_date", today)
    .lte("course_date", addDays(today, NAMES_REMINDER_DAYS));
  if (error) throw error;
  let sent = 0;
  for (const b of data as Booking[]) {
    const names = attendeeLines(b).length;
    if (names >= b.places) continue;
    const course = findCourse(b.course_slug);
    const ok = await sendEmail(
      namesReminderEmail(
        {
          reference: b.reference,
          courseTitle: b.course_title,
          courseDate: b.course_date,
          timeLabel: course ? formatTimeRange(course) : "",
          delivery: course?.delivery ?? "",
          places: b.places,
          pricePerPerson: Number(b.price_per_person),
          contactName: b.contact_name,
          organisation: b.organisation,
          email: b.email,
          phone: b.phone,
          invoiceAddress: b.invoice_address,
          invoiceEmail: b.invoice_email,
          poNumber: b.po_number,
          attendees: b.attendees,
          notes: b.notes,
        },
        names,
      ),
    );
    if (!ok) continue;
    sent++;
    await db().from("bookings").update({ names_reminder_sent_at: new Date().toISOString() }).eq("id", b.id);
    await db().from("activity_log").insert({
      actor_name: "Morning check",
      course_slug: b.course_slug,
      booking_id: b.id,
      action: "Asked for attendee names",
      detail: `${b.reference}: ${names} of ${b.places} names given`,
    });
  }
  return sent;
}

export async function runDaily(): Promise<string> {
  const today = ukToday();
  const parts: string[] = [];
  if (await isConnected()) {
    try {
      const r = await refreshAll();
      parts.push(
        `${r.checked} open ${r.checked === 1 ? "invoice or credit note" : "invoices and credit notes"} checked` +
          (r.paid.length ? `, newly paid: ${r.paid.join(", ")}` : ", none newly paid") +
          (r.failed ? `, ${r.failed} could not be checked` : ""),
      );
    } catch (e) {
      parts.push(`FreeAgent check failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  } else {
    parts.push("FreeAgent not connected, payments not checked");
  }
  const names = await namesReminders(today);
  parts.push(`${names} attendee-names ${names === 1 ? "reminder" : "reminders"} sent`);
  const result = parts.join("; ") + ".";
  if (await isConnected()) await recordSync(result);
  console.log("Morning check:", result);
  return result;
}
