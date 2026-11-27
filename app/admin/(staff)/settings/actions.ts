"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MIN_PASSWORD, requireOwner } from "@/lib/staff";
import { db } from "@/lib/supabase/admin";
import { disconnect } from "@/lib/freeagent";
import { runDaily } from "@/lib/daily";

function back(notice: string): never {
  revalidatePath("/admin/settings");
  redirect(`/admin/settings?notice=${encodeURIComponent(notice)}`);
}

export async function disconnectFreeAgent() {
  const staff = await requireOwner();
  await disconnect();
  await db().from("activity_log").insert({ actor_name: staff.name, action: "Disconnected FreeAgent" });
  back("FreeAgent disconnected. Invoices already raised stay in FreeAgent.");
}

export async function runMorningCheck() {
  await requireOwner();
  back(`Morning check: ${await runDaily()}`);
}

/** The owner sets a staff member's password directly, so nobody depends on
 *  reset emails (whose one-time links email scanners can use up). The
 *  password itself is never logged. */
export async function setStaffPassword(userId: string, name: string, form: FormData) {
  const staff = await requireOwner();
  const password = String(form.get("password") ?? "");
  if (password.length < MIN_PASSWORD) back(`Not changed: ${name}'s password needs at least ${MIN_PASSWORD} characters.`);
  const { error } = await db().auth.admin.updateUserById(userId, { password });
  if (error) {
    console.error("Set staff password failed", error);
    back(`Not changed: ${error.message}`);
  }
  await db().from("activity_log").insert({ actor_name: staff.name, action: "Set a new password", detail: name });
  back(`${name}'s password is changed. Let them know the new one; they sign in with their email and it.`);
}
