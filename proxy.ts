import { NextResponse, type NextRequest } from "next/server";
import { refreshSession } from "./lib/supabase/proxy";

// Admin pages get their sign-in session refreshed.
function pass(request: NextRequest) {
  return request.nextUrl.pathname.startsWith("/admin") ? refreshSession(request) : NextResponse.next();
}

export async function proxy(request: NextRequest) {
  // No site-wide password since 27 Nov 2026: the sandbox is open like the
  // live site, marked by its SANDBOX banner and hidden from search engines
  // (robots.ts). Staff still sign in to /admin; /tasks has its own password.
  return pass(request);
}

export const config = {
  matcher: [
    "/((?!gate|api/cron|__forms\\.html|_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
