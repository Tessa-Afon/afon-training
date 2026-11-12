// FreeAgent sends the owner back here after they approve the connection.
import { NextResponse, type NextRequest } from "next/server";
import { STATE_COOKIE, completeConnection, FREEAGENT_ENV } from "@/lib/freeagent";
import { requireStaff } from "@/lib/staff";
import { db } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const staff = await requireStaff();
  const params = request.nextUrl.searchParams;
  const back = new URL("/admin/settings", request.nextUrl.origin);
  const say = (notice: string) => {
    back.searchParams.set("notice", notice);
    const res = NextResponse.redirect(back);
    res.cookies.delete({ name: STATE_COOKIE, path: "/admin/freeagent" });
    return res;
  };

  if (staff.role !== "owner") return say("Only the owner can connect FreeAgent.");
  const state = request.cookies.get(STATE_COOKIE)?.value;
  if (!state || state !== params.get("state")) return say("That FreeAgent link had expired. Please try connecting again.");
  const code = params.get("code");
  if (!code) return say(`FreeAgent was not connected${params.get("error") ? ` (${params.get("error")})` : ""}.`);

  try {
    const redirectUri = new URL("/admin/freeagent/callback", request.nextUrl.origin).toString();
    const company = await completeConnection(code, redirectUri, staff.name);
    await db()
      .from("activity_log")
      .insert({ actor_name: staff.name, action: "Connected FreeAgent", detail: `${company || "FreeAgent"} (${FREEAGENT_ENV})` });
    return say(`FreeAgent connected${company ? ` to ${company}` : ""}.`);
  } catch (e) {
    console.error("FreeAgent connection failed", e);
    return say(`FreeAgent could not be connected: ${e instanceof Error ? e.message : "unknown error"}`);
  }
}
