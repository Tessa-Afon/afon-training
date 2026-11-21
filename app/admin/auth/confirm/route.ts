// Landing point for links in Supabase's invitation and password-reset
// emails. The email templates link here with the token hash (see
// docs/ADMIN_SETUP.md).
//
// Opening the link (GET) only shows a "Continue" button; the one-time
// token is used when the person presses it (POST). Email security scanners
// (Outlook Safe Links and similar) open every link in an email before the
// person does, and used to spend the token, so the real click then showed
// "That link has expired".
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_CONFIGURED } from "@/lib/staff";
import { authClient } from "@/lib/supabase/auth";

const TYPES: EmailOtpType[] = ["invite", "recovery", "magiclink", "email", "signup", "email_change"];

function go(request: NextRequest, pathname: string, search = "") {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  // 303 so a POST is followed by a GET.
  return NextResponse.redirect(url, 303);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  // Without the database settings there is nothing to verify against.
  if (!ADMIN_CONFIGURED) return go(request, "/admin/sign-in");
  if (!tokenHash || !type || !TYPES.includes(type as EmailOtpType)) return go(request, "/admin/link-expired");
  return go(request, "/admin/continue", `?${new URLSearchParams({ token_hash: tokenHash, type })}`);
}

export async function POST(request: NextRequest) {
  if (!ADMIN_CONFIGURED) return go(request, "/admin/sign-in");
  const form = await request.formData();
  const tokenHash = String(form.get("token_hash") ?? "");
  const type = String(form.get("type") ?? "") as EmailOtpType;
  if (tokenHash && TYPES.includes(type)) {
    const supabase = await authClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return go(request, type === "invite" || type === "recovery" ? "/admin/set-password" : "/admin");
    console.error("Email link failed", error);
  }
  return go(request, "/admin/link-expired");
}
