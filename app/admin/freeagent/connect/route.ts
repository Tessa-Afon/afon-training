// Starts connecting the site to FreeAgent (owner only). FreeAgent asks the
// owner to sign in and approve, then sends them back to ../callback.
import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { FREEAGENT_CONFIGURED, STATE_COOKIE, authoriseUrl } from "@/lib/freeagent";
import { requireStaff } from "@/lib/staff";



export async function GET(request: NextRequest) {
  const staff = await requireStaff();
  const back = new URL("/admin/settings", request.nextUrl.origin);
  if (staff.role !== "owner" || !FREEAGENT_CONFIGURED) {
    back.searchParams.set("notice", "Only the owner can connect FreeAgent, once its keys are set in Netlify.");
    return NextResponse.redirect(back);
  }
  const state = randomBytes(16).toString("hex");
  const redirectUri = new URL("/admin/freeagent/callback", request.nextUrl.origin).toString();
  const res = NextResponse.redirect(authoriseUrl(redirectUri, state));
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin/freeagent",
    maxAge: 15 * 60,
  });
  return res;
}
