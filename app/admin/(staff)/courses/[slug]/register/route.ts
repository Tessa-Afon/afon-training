// Register for one course date as a CSV file (opens in Excel): one row per
// attendee, with "Name to follow" rows for places still without a name.
import { notFound } from "next/navigation";
import { findCourse } from "@/lib/courses";
import { attendeeLines, emailsIn, loadCourseBookings } from "@/lib/admin-data";
import { canSee, requireStaff } from "@/lib/staff";

const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const staff = await requireStaff();
  const course = findCourse(slug);
  if (!course || !canSee(staff, course)) notFound();

  const { bookings } = await loadCourseBookings(slug);
  const rows: string[][] = [["Attendee", "Attendee email", "Organisation", "Booking reference", "Booked by", "Booker email", "Attended"]];
  for (const b of bookings.filter((x) => x.status !== "cancelled")) {
    const lines = attendeeLines(b);
    for (let i = 0; i < b.places; i++) {
      const line = lines.at(i);
      const email = line ? (emailsIn(line).at(0) ?? "") : "";
      const name = line ? line.replace(email, "").replace(/[,;<>()\s-]+$/, "").trim() : "Name to follow";
      rows.push([name, email, b.organisation, b.reference, b.contact_name, b.email, ""]);
    }
    // More names than places: list them too, so none are lost.
    for (const extra of lines.slice(b.places)) rows.push([extra, "", b.organisation, b.reference, b.contact_name, b.email, ""]);
  }

  const csv = "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="register-${slug}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
