// Landing point for links in Supabase's invitation and password-reset
// emails. The email templates must link here with the token hash (see
// docs/ADMIN_SETUP.md). Signs the person in, then sends them on to choose
// a password.
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { authClient } from "@/lib/supabase/auth";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const url = request.nextUrl.clone();
  url.search = "";

  if (tokenHash && type) {
    const supabase = await authClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      url.pathname = type === "invite" || type === "recovery" ? "/admin/set-password" : "/admin";
      return NextResponse.redirect(url);
    }
    console.error("Email link failed", error);
  }
  url.pathname = "/admin/link-expired";
  return NextResponse.redirect(url);
}
