"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/supabase/admin";
import { requireEditor, type Staff } from "@/lib/staff";
import { cleanBespoke, findBespoke, type Bespoke } from "@/lib/bespoke";

/** Back to the planner, on the bespoke course's month, with a message. */
function toPlanner(notice: string, date?: string): never {
  revalidatePath("/admin/planner");
  const from = date ? `&from=${date.slice(0, 7)}` : "";
  redirect(`/admin/planner?notice=${encodeURIComponent(notice)}${from}`);
}

/** Back to the form with a message (the form keeps nothing typed, so
 *  checks are kept to what the browser can't catch). */
function toForm(path: string, notice: string): never {
  redirect(`${path}?notice=${encodeURIComponent(notice)}`);
}

const NOT_SET_UP =
  "Bespoke bookings aren't set up in the database yet. Ask Peter to run supabase/migrations/0005_bespoke_courses.sql (see docs/ADMIN_SETUP.md).";

/** Missing table: PostgREST says PGRST205, Postgres says 42P01. */
const tableMissing = (e: { code?: string } | null) => e?.code === "PGRST205" || e?.code === "42P01";

async function log(staff: Staff, b: Pick<Bespoke, "organisation" | "title" | "date">, action: string) {
  const { error } = await db()
    .from("activity_log")
    .insert({ actor_name: staff.name, action, detail: `${b.title} for ${b.organisation} on ${b.date}` });
  if (error) console.error("Activity log failed", error);
}

export async function addBespoke(form: FormData) {
  const staff = await requireEditor();
  const v = cleanBespoke(form);
  if (typeof v === "string") toForm("/admin/planner/bespoke", v);
  const { error } = await db().from("bespoke_courses").insert({ ...v, created_by: staff.name });
  if (tableMissing(error)) toForm("/admin/planner/bespoke", NOT_SET_UP);
  if (error) throw error;
  await log(staff, v, "Bespoke course added");
  toPlanner(`Bespoke course added: ${v.title} for ${v.organisation}.`, v.date);
}

export async function updateBespoke(id: string, form: FormData) {
  const staff = await requireEditor();
  if (!(await findBespoke(id))) throw new Error("Bespoke course not found");
  const v = cleanBespoke(form);
  if (typeof v === "string") toForm(`/admin/planner/bespoke/${id}`, v);
  const { error } = await db()
    .from("bespoke_courses")
    .update({ ...v, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  await log(staff, v, "Bespoke course changed");
  toPlanner(`Saved: ${v.title} for ${v.organisation}.`, v.date);
}

export async function deleteBespoke(id: string) {
  const staff = await requireEditor();
  const b = await findBespoke(id);
  if (!b) throw new Error("Bespoke course not found");
  const { error } = await db().from("bespoke_courses").delete().eq("id", id);
  if (error) throw error;
  await log(staff, b, "Bespoke course deleted");
  toPlanner(`Deleted: ${b.title} for ${b.organisation}.`, b.date);
}
