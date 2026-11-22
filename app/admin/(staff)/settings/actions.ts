"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/staff";
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
