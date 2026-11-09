"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/supabase/admin";
import { requireEditor } from "@/lib/staff";
import { isConnected } from "@/lib/freeagent";
import { loadInvoices, placesToInvoice, raiseInvoice } from "@/lib/invoicing";
import type { Booking } from "@/lib/admin-data";

function back(notice: string): never {
  revalidatePath("/admin/money");
  revalidatePath("/admin");
  redirect(`/admin/money?notice=${encodeURIComponent(notice)}`);
}

/** Raises every waiting invoice for confirmed bookings, for example on the
 *  day FreeAgent goes live. Stops at the first failure so a problem (say,
 *  a FreeAgent setting) isn't repeated for every booking. */
export async function invoiceAllConfirmed(form: FormData) {
  const staff = await requireEditor();
  if (!(await isConnected())) back("FreeAgent is not connected.");
  const email = form.get("email-invoice") === "on";
  const { data, error } = await db().from("bookings").select("*").eq("status", "confirmed").order("course_date");
  if (error) throw error;
  const bookings = data as Booking[];
  const rows = await loadInvoices(bookings.map((b) => b.id));
  const raised: string[] = [];
  let problem = "";
  for (const b of bookings) {
    const places = placesToInvoice(b, rows);
    if (places <= 0) continue;
    try {
      const r = await raiseInvoice(b, places, email);
      raised.push(r.reference);
      await db().from("activity_log").insert({
        actor_name: staff.name,
        course_slug: b.course_slug,
        booking_id: b.id,
        action: "Raised an invoice",
        detail: `${b.reference}: ${r.reference}, ${places} ${places === 1 ? "place" : "places"}${r.emailed ? ", emailed" : ""}`,
      });
      if (r.emailError) {
        problem = `FreeAgent could not email ${r.reference} (${r.emailError}), so the rest were not raised.`;
        break;
      }
    } catch (e) {
      problem = `Stopped at ${b.reference} (${b.organisation}): ${e instanceof Error ? e.message : String(e)}`;
      break;
    }
  }
  back(
    `${raised.length} ${raised.length === 1 ? "invoice" : "invoices"} raised${raised.length ? ` (${raised.join(", ")})` : ""}.${problem ? ` ${problem}` : ""}`,
  );
}
